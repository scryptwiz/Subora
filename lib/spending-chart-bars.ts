import type { ChartBar } from '@/components/subscriptions/spending-chart'
import { convertAmount, type RatesSnapshot } from '@/lib/exchange-rates'
import { toMonthly, type Subscription } from '@/lib/subscriptions'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type BuildOptions = {
    /** Display currency for bar values; falls back to per-sub currency sum when omitted. */
    displayCurrency?: string
    /** FX snapshot whose `base === displayCurrency`. */
    snapshot?: RatesSnapshot | null
}

/**
 * Rolling six calendar months ending in `now`. Each bar sums the monthly
 * equivalent of every active subscription that already existed by the end of
 * that month (using `createdAt` when available), converted into the user's
 * display currency when an FX snapshot is provided.
 */
export function buildRollingSpendChartBars(
    subs: Subscription[],
    now = new Date(),
    options: BuildOptions = {}
): ChartBar[] {
    const display = options.displayCurrency?.toUpperCase()
    const snapshot = options.snapshot ?? null
    const bars: ChartBar[] = []

    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEndMs = new Date(
            now.getFullYear(),
            now.getMonth() - i + 1,
            0,
            23,
            59,
            59,
            999
        ).getTime()
        const label = MONTH_SHORT[monthStart.getMonth()] ?? '—'
        const isCurrent = i === 0

        let value = 0
        for (const sub of subs) {
            if (!sub.active) continue
            if (sub.createdAt) {
                const createdMs = new Date(sub.createdAt).getTime()
                if (Number.isFinite(createdMs) && createdMs > monthEndMs) continue
            }

            const monthly = toMonthly(sub)
            if (!display) {
                value += monthly
                continue
            }

            const converted = convertAmount(monthly, sub.currency, display, snapshot)
            if (converted !== null) {
                value += converted
            } else if (sub.currency.toUpperCase() === display) {
                value += monthly
            }
        }

        bars.push({ label, value, active: isCurrent })
    }

    return bars
}
