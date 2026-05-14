import { formatMultiCurrencyBreakdown, monthlyAmountsByCurrency } from '@/lib/subscription-totals'
import { formatCurrency, toMonthly, type Subscription } from '@/lib/subscriptions'

function csvCell(v: unknown): string {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
}

function csvRow(cells: unknown[]) {
    return cells.map(csvCell).join(',')
}

export function buildSubscriptionsExportCsv(
    subscriptions: Subscription[],
    budget: {
        displayCurrency: string
        monthlyTotalDisplay: number | null
        yearlyTotalDisplay: number | null
    }
): string {
    const generated = new Date().toISOString()
    const active = subscriptions.filter(s => s.active)
    const inactive = subscriptions.filter(s => !s.active)
    const activeNative = monthlyAmountsByCurrency(active)
    const inactiveNative = monthlyAmountsByCurrency(inactive)
    const activeNativeLine = formatMultiCurrencyBreakdown(activeNative) || '—'
    const inactiveNativeLine = formatMultiCurrencyBreakdown(inactiveNative) || '—'

    const monthlyDisplay =
        budget.monthlyTotalDisplay !== null
            ? formatCurrency(budget.monthlyTotalDisplay, budget.displayCurrency)
            : activeNativeLine
    const yearlyDisplay =
        budget.yearlyTotalDisplay !== null
            ? formatCurrency(budget.yearlyTotalDisplay, budget.displayCurrency)
            : '—'

    const lines: string[] = []

    lines.push(csvRow(['Subora subscription export']))
    lines.push(csvRow([]))
    lines.push(csvRow(['Budget overview', 'Value', 'Notes']))
    lines.push(
        csvRow([
            'Display currency (app Settings)',
            budget.displayCurrency,
            'Totals below use this currency when exchange rates loaded successfully.',
        ])
    )
    lines.push(csvRow(['Generated at (UTC)', generated, '']))
    lines.push(csvRow(['Active subscriptions', String(active.length), 'Counted in spend totals']))
    lines.push(csvRow(['Inactive / paused', String(inactive.length), 'Still listed for your records']))
    lines.push(
        csvRow([
            'Active — monthly equivalent (native currencies)',
            activeNativeLine,
            'Sum of per-subscription monthly equivalents in original currencies.',
        ])
    )
    lines.push(
        csvRow([
            'Active — monthly total (display currency)',
            monthlyDisplay,
            budget.monthlyTotalDisplay !== null
                ? 'Converted with latest rates in app.'
                : 'FX incomplete in app; see native breakdown column.',
        ])
    )
    lines.push(
        csvRow([
            'Active — annual projection (display currency)',
            yearlyDisplay,
            'Approximate yearly cost if prices stay the same (monthly × 12).',
        ])
    )
    lines.push(
        csvRow([
            'Inactive — monthly equivalent (native)',
            inactiveNativeLine,
            'What paused items would cost per month if reactivated.',
        ])
    )
    lines.push(csvRow([]))
    lines.push(
        csvRow([
            'Budget tips',
            'Review inactive rows before deleting',
            'Export is a snapshot; open Subora to update live totals.',
        ])
    )
    lines.push(csvRow([]))

    lines.push(
        csvRow([
            'name',
            'plan',
            'active',
            'price',
            'currency',
            'billing_cycle',
            'monthly_equivalent_native',
            'next_renewal_iso',
            'payment_method',
            'domain',
            'created_at',
        ])
    )

    const sorted = [...subscriptions].sort(
        (a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime()
    )

    for (const s of sorted) {
        lines.push(
            csvRow([
                s.name,
                s.plan ?? '',
                s.active ? 'yes' : 'no',
                s.price,
                s.currency.toUpperCase(),
                s.billingCycle,
                roundMoney(toMonthly(s)),
                s.nextRenewal,
                s.paymentMethod ?? '',
                s.domain ?? '',
                s.createdAt ?? '',
            ])
        )
    }

    // Excel-friendly UTF-8
    return '\ufeff' + lines.join('\n')
}

function roundMoney(n: number) {
    return Math.round(n * 100) / 100
}
