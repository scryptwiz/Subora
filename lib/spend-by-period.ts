import type { RatesSnapshot } from '@/lib/exchange-rates'
import {
    formatMultiCurrencyBreakdown,
    sumMonthlyInDisplayCurrency,
    type MonthlyTotalsResult,
} from '@/lib/subscription-totals'
import { formatCurrency, type Subscription } from '@/lib/subscriptions'

/** Matches dashboard period selector (week / month / year / all). */
export type SpendPeriod = 'week' | 'month' | 'year' | 'all'

function isSameUtcDay(a: Date, b: Date): boolean {
    return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate()
}

function isSameUtcMonth(a: Date, b: Date): boolean {
    return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()
}

/**
 * Raw amount attributed to a calendar period for one subscription.
 * Yearly plans use full price only when renewal falls in that window (never ÷12 for month view).
 */
export function periodAmountForSubscription(sub: Subscription, period: SpendPeriod, now: Date): number {
    if (!sub.active) return 0
    const effectivePeriod = period === 'all' ? 'year' : period
    if (sub.billingCycle === 'year') {
        const renewal = new Date(sub.nextRenewal)
        if (Number.isNaN(renewal.getTime())) return 0
        if (effectivePeriod === 'year') return sub.price
        if (effectivePeriod === 'month') return isSameUtcMonth(renewal, now) ? sub.price : 0
        return isSameUtcDay(renewal, now) ? sub.price : 0
    }
    if (sub.billingCycle === 'month') {
        if (effectivePeriod === 'year') return sub.price * 12
        if (effectivePeriod === 'week') return (sub.price * 12) / 52
        return sub.price
    }
    if (effectivePeriod === 'year') return sub.price * 52
    if (effectivePeriod === 'month') return (sub.price * 52) / 12
    return sub.price
}

function normalizedActiveRows(subs: Subscription[], period: SpendPeriod, now: Date): Subscription[] {
    return subs
        .map(sub => {
            const amount = periodAmountForSubscription(sub, period, now)
            return { ...sub, billingCycle: 'month' as const, price: amount, active: amount > 0 }
        })
        .filter(s => s.active)
}

export function sumPeriodSpendInDisplayCurrency(
    subs: Subscription[],
    period: SpendPeriod,
    displayCurrency: string,
    snapshot: RatesSnapshot | null,
    now: Date = new Date()
): MonthlyTotalsResult {
    return sumMonthlyInDisplayCurrency(
        normalizedActiveRows(subs, period, now),
        displayCurrency,
        snapshot
    )
}

export function formatSpendLabelForPeriod(
    subs: Subscription[],
    period: SpendPeriod,
    displayCurrency: string,
    snapshot: RatesSnapshot | null,
    now: Date = new Date()
): string {
    const agg = sumPeriodSpendInDisplayCurrency(subs, period, displayCurrency, snapshot, now)
    const fallback = formatMultiCurrencyBreakdown(agg.byCurrency) || '—'
    return agg.totalInDisplay !== null ? formatCurrency(agg.totalInDisplay, displayCurrency) : fallback
}
