import type { RatesSnapshot } from '@/lib/exchange-rates'
import { formatMultiCurrencyBreakdown } from '@/lib/subscription-totals'
import { sumPeriodSpendInDisplayCurrency, type SpendPeriod } from '@/lib/spend-by-period'
import { formatCurrency, type Subscription } from '@/lib/subscriptions'

export type ServicesSpendPeriod = SpendPeriod

const SUFFIX: Record<ServicesSpendPeriod, string> = {
    week: '/ week',
    month: '/ month',
    year: '/ year',
    all: '/ all',
}

export function servicesSpendHeadline(
    subs: Subscription[],
    billing: SpendPeriod,
    displayCurrency: string,
    snapshot: RatesSnapshot | null,
    now: Date = new Date()
): { amount: string; suffix: string } {
    const rows = billing === 'all' ? subs : subs.filter(s => s.billingCycle === billing)
    const agg = sumPeriodSpendInDisplayCurrency(rows, billing, displayCurrency, snapshot, now)
    const fallback = formatMultiCurrencyBreakdown(agg.byCurrency) || '—'
    const amount = agg.totalInDisplay !== null ? formatCurrency(agg.totalInDisplay, displayCurrency) : fallback
    return { amount, suffix: SUFFIX[billing] }
}
