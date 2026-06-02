import type { BillingCycle } from '@/lib/subscriptions'

export const BILLING_CYCLES: { id: BillingCycle; label: string }[] = [
    { id: 'month', label: 'Monthly' },
    { id: 'year', label: 'Yearly' },
]
