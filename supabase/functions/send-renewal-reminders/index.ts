import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

function utcDateOnlyMs(d: Date): number {
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function addUtcCalendarDays(fromMs: number, days: number): number {
    const d = new Date(fromMs)
    d.setUTCDate(d.getUTCDate() + days)
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let out = 0
    for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
    return out === 0
}

type SubscriptionRow = {
    id: string
    user_id: string
    name: string
    next_renewal: string
    active: boolean
}

type SettingsRow = {
    user_id: string
    notifications_enabled: boolean
    reminder_days_before: number
    reminder_default_offsets: number[] | null
}

type PushTokenRow = { user_id: string; expo_push_token: string }

type LogRow = { subscription_id: string; renewal_at: string; offset_days: number }
type ReminderRow = { subscription_id: string; offset_days: number }

function normRenewalIso(iso: string): string {
    return new Date(iso).toISOString()
}

Deno.serve(async (req: Request): Promise<Response> => {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 })
    }

    // Supabase Cron + pg_net: use `apikey` (service role) for the gateway and `X-Cron-Secret` for this check.
    // Manual tests can still use `Authorization: Bearer <CRON_SECRET>`.
    const cronSecret = Deno.env.get('CRON_SECRET') ?? ''
    const fromHeader = req.headers.get('x-cron-secret')?.trim() ?? ''
    const fromBearer = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim() ?? ''
    const provided = fromHeader.length > 0 ? fromHeader : fromBearer
    if (!cronSecret || !timingSafeEqual(provided, cronSecret)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN')
    if (!expoToken) {
        return new Response(JSON.stringify({ error: 'EXPO_ACCESS_TOKEN not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const [
        { data: subs, error: subsError },
        { data: settingsRows },
        { data: tokens },
        { data: logs },
        { data: reminderRows },
    ] = await Promise.all([
            supabase.from('subscriptions').select('id, user_id, name, next_renewal, active').eq('active', true),
            supabase.from('user_settings').select('user_id, notifications_enabled, reminder_days_before, reminder_default_offsets'),
            supabase.from('push_tokens').select('user_id, expo_push_token, updated_at'),
            supabase.from('renewal_notification_log').select('subscription_id, renewal_at, offset_days'),
            supabase.from('subscription_reminders').select('subscription_id, offset_days'),
        ])

    if (subsError || !subs) {
        return new Response(JSON.stringify({ error: subsError?.message ?? 'subscriptions query failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const settingsMap = new Map<string, SettingsRow>()
    for (const row of (settingsRows ?? []) as SettingsRow[]) {
        settingsMap.set(row.user_id, row)
    }

    const remindersBySub = new Map<string, number[]>()
    for (const r of (reminderRows ?? []) as ReminderRow[]) {
        const list = remindersBySub.get(r.subscription_id) ?? []
        if (!Number.isInteger(r.offset_days)) continue
        list.push(r.offset_days)
        remindersBySub.set(r.subscription_id, list)
    }
    const defaultOffsets = (userId: string) => {
        const st = settingsMap.get(userId)
        const raw = st?.reminder_default_offsets
        if (Array.isArray(raw) && raw.length > 0) {
            const u = [...new Set(raw.map(n => Math.min(30, Math.max(0, Math.round(Number(n))))))]
                .filter(n => Number.isFinite(n))
                .sort((a, b) => a - b)
                .slice(0, 3)
            if (u.length > 0) return u
        }
        const base = st?.reminder_days_before ?? 1
        return [Math.min(30, Math.max(0, base))]
    }
    const logKey = (sid: string, renewal: string, offset: number) =>
        `${sid}\0${normRenewalIso(renewal)}\0${offset}`
    const sentSet = new Set(
        ((logs as LogRow[] | null) ?? []).map(l => logKey(l.subscription_id, l.renewal_at, l.offset_days ?? 0))
    )

    const todayUtc = utcDateOnlyMs(new Date())

    const tokenByUser = new Map<string, string[]>()
    const tokenRows = (tokens as PushTokenRow[] | null) ?? []
    for (const t of tokenRows) {
        const list = tokenByUser.get(t.user_id) ?? []
        list.push(t.expo_push_token)
        tokenByUser.set(t.user_id, list)
    }

    type Job = { to: string; title: string; body: string; data: Record<string, string> }
    const jobs: Job[] = []
    const logInserts: { subscription_id: string; renewal_at: string; offset_days: number }[] = []

    for (const sub of subs as SubscriptionRow[]) {
        const st = settingsMap.get(sub.user_id)
        const enabled = st ? st.notifications_enabled : true
        if (!enabled) continue

        const renewalUtc = utcDateOnlyMs(new Date(sub.next_renewal))
        const offsetsRaw = remindersBySub.get(sub.id) ?? defaultOffsets(sub.user_id)
        const offsets = [...new Set(offsetsRaw)].sort((a, b) => a - b).slice(0, 3)
        const expoTokens = tokenByUser.get(sub.user_id) ?? []
        if (!expoTokens.length) continue
        const dateLabel = new Date(sub.next_renewal).toISOString().slice(0, 10)
        for (const offset of offsets) {
            const targetDay = addUtcCalendarDays(todayUtc, offset)
            if (renewalUtc !== targetDay) continue
            if (sentSet.has(logKey(sub.id, sub.next_renewal, offset))) continue
            const body =
                offset === 0
                    ? `${sub.name} renews today (${dateLabel})`
                    : `${sub.name} renews in ${offset} day${offset === 1 ? '' : 's'} on ${dateLabel}`
            for (const to of expoTokens) {
                jobs.push({
                    to,
                    title: offset === 0 ? 'Renewal today' : 'Upcoming renewal',
                    body,
                    data: {
                        subscriptionId: sub.id,
                        type: 'renewal_reminder',
                        offsetDays: String(offset),
                    },
                })
            }
            logInserts.push({
                subscription_id: sub.id,
                renewal_at: normRenewalIso(sub.next_renewal),
                offset_days: offset,
            })
        }
    }

    let expoOk = 0
    const chunkSize = 99
    for (let i = 0; i < jobs.length; i += chunkSize) {
        const chunk = jobs.slice(i, i + chunkSize)
        const res = await fetch(EXPO_PUSH_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${expoToken}`,
            },
            body: JSON.stringify(chunk),
        })
        if (!res.ok) {
            const text = await res.text()
            return new Response(JSON.stringify({ error: 'Expo push failed', detail: text }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            })
        }
        const json = (await res.json()) as { data?: { status?: string }[] }
        const results = json.data ?? []
        expoOk += results.filter(r => r.status === 'ok').length
    }

    if (logInserts.length > 0) {
        const { error: logError } = await supabase.from('renewal_notification_log').insert(logInserts)
        if (logError) {
            return new Response(JSON.stringify({ error: 'Failed to write dedupe log', detail: logError.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        }
    }

    return new Response(
        JSON.stringify({
            candidates: logInserts.length,
            messagesSent: jobs.length,
            expoTicketsOk: expoOk,
        }),
        { headers: { 'Content-Type': 'application/json' } }
    )
})
