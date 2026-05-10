import { usePreferences } from '@/contexts/preferences-context'
import { useSubscriptions } from '@/contexts/subscriptions-context'
import { getRates, type RatesSnapshot } from '@/lib/exchange-rates'
import {
    formatMultiCurrencyBreakdown,
    sumMonthlyInDisplayCurrency,
} from '@/lib/subscription-totals'
import { formatCurrency } from '@/lib/subscriptions'
import { useEffect, useMemo, useState } from 'react'

export type ConvertedTotals = {
    snapshot: RatesSnapshot | null
    /** Monthly equivalent sum in display currency, or null if FX incomplete */
    monthlyNumber: number | null
    yearlyNumber: number | null
    weeklyNumber: number | null
    /** Single-line formatted total when FX ok */
    monthlyLabel: string
    yearlyLabel: string
    weeklyLabel: string
    /** Multi-currency fallback copy when monthlyNumber is null */
    fallbackLabel: string
    fxIncomplete: boolean
    /** True once the first FX fetch resolved (success or failure). */
    fxAttempted: boolean
}

export function useConvertedSpendTotals(): ConvertedTotals {
    const { subscriptions } = useSubscriptions()
    const { displayCurrency } = usePreferences()

    const [snapshot, setSnapshot] = useState<RatesSnapshot | null>(null)
    const [fxAttempted, setFxAttempted] = useState(false)

    useEffect(() => {
        let cancelled = false
        setFxAttempted(false)
        void getRates(displayCurrency)
            .then(s => {
                if (cancelled) return
                setSnapshot(s)
            })
            .catch(() => {
                if (cancelled) return
                setSnapshot(null)
            })
            .finally(() => {
                if (cancelled) return
                setFxAttempted(true)
            })
        return () => {
            cancelled = true
        }
    }, [displayCurrency])

    const aggregated = useMemo(
        () => sumMonthlyInDisplayCurrency(subscriptions, displayCurrency, snapshot),
        [subscriptions, displayCurrency, snapshot]
    )

    const monthlyNumber = aggregated.totalInDisplay
    const yearlyNumber =
        monthlyNumber === null ? null : monthlyNumber === 0 ? 0 : monthlyNumber * 12
    const weeklyNumber =
        monthlyNumber === null ? null : monthlyNumber === 0 ? 0 : (monthlyNumber * 12) / 52

    const fallbackLabel = formatMultiCurrencyBreakdown(aggregated.byCurrency)

    const monthlyLabel =
        monthlyNumber !== null
            ? formatCurrency(monthlyNumber, displayCurrency)
            : fallbackLabel || '—'

    const yearlyLabel =
        yearlyNumber !== null
            ? formatCurrency(yearlyNumber, displayCurrency)
            : fallbackLabel || '—'

    const weeklyLabel =
        weeklyNumber !== null
            ? formatCurrency(weeklyNumber, displayCurrency)
            : fallbackLabel || '—'

    const fxIncomplete = monthlyNumber === null && Object.keys(aggregated.byCurrency).length > 0

    return {
        snapshot,
        monthlyNumber,
        yearlyNumber,
        weeklyNumber,
        monthlyLabel,
        yearlyLabel,
        weeklyLabel,
        fallbackLabel,
        fxIncomplete,
        fxAttempted,
    }
}
