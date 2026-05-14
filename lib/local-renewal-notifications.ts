import type { Subscription } from '@/lib/subscriptions'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const CHANNEL = 'renewals'
const DATA_TYPE = 'renewal_local'

async function ensureChannel(): Promise<void> {
    if (Platform.OS !== 'android') return
    await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Renewal reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
    })
}

async function cancelRenewalLocals(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync()
    for (const req of scheduled) {
        const t = req.content.data?.type
        if (t === DATA_TYPE) {
            await Notifications.cancelScheduledNotificationAsync(req.identifier)
        }
    }
}

function triggerDateForReminder(renewalIso: string, daysBefore: number): Date {
    const renewal = new Date(renewalIso)
    const d = new Date(renewal.getTime())
    d.setDate(d.getDate() - daysBefore)
    d.setHours(9, 0, 0, 0)
    return d
}

export type LocalRenewalPrefs = {
    enabled: boolean
    /** Up to 3 UTC-aligned offsets (days before renewal at 09:00 local). */
    reminderOffsets: number[]
}

/**
 * Reschedules local renewal notifications from the current subscription list.
 * Cancels prior `renewal_local` schedules first. No-op on web.
 */
export async function syncLocalRenewalNotifications(
    subs: Subscription[],
    prefs: LocalRenewalPrefs
): Promise<void> {
    if (Platform.OS === 'web') return

    await ensureChannel()
    await cancelRenewalLocals()

    if (!prefs.enabled) return

    const offsets = [...new Set(prefs.reminderOffsets)].filter(n => n >= 0 && n <= 30).sort((a, b) => a - b).slice(0, 3)
    if (offsets.length === 0) return

    const now = Date.now()
    const active = subs.filter(s => s.active)
    let scheduled = 0
    const cap = 48

    for (const s of active) {
        for (const daysBefore of offsets) {
            if (scheduled >= cap) return
            const when = triggerDateForReminder(s.nextRenewal, daysBefore)
            if (when.getTime() <= now) continue
            const dateLabel = s.nextRenewal.slice(0, 10)
            const body =
                daysBefore === 0
                    ? `${s.name} renews today (${dateLabel})`
                    : `${s.name} renews in ${daysBefore} day${daysBefore === 1 ? '' : 's'} (${dateLabel})`
            await Notifications.scheduleNotificationAsync({
                identifier: `subora-renewal-${s.id}-${daysBefore}`,
                content: {
                    title: daysBefore === 0 ? 'Renewal today' : 'Upcoming renewal',
                    body,
                    sound: 'default',
                    data: { type: DATA_TYPE, subscriptionId: s.id, offsetDays: String(daysBefore) },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: when,
                    channelId: Platform.OS === 'android' ? CHANNEL : undefined,
                },
            })
            scheduled += 1
        }
    }
}
