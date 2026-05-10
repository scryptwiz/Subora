import type { BillingCycle, Subscription } from '@/lib/subscriptions'

/** Row shape returned by PostgREST for `public.subscriptions`. */
export type SubscriptionRow = {
    id: string
    user_id: string
    name: string
    plan: string | null
    domain: string | null
    icon_slug: string | null
    brand_color: string | null
    price: string | number
    currency: string
    billing_cycle: BillingCycle
    next_renewal: string
    active: boolean
    payment_method: string | null
    created_at?: string | null
}

export function rowToSubscription(row: SubscriptionRow): Subscription {
    return {
        id: row.id,
        name: row.name,
        plan: row.plan ?? undefined,
        domain: row.domain ?? undefined,
        iconSlug: row.icon_slug ?? undefined,
        brandColor: row.brand_color ?? undefined,
        price: typeof row.price === 'number' ? row.price : Number(row.price),
        currency: row.currency,
        billingCycle: row.billing_cycle,
        nextRenewal: row.next_renewal,
        active: row.active,
        paymentMethod: row.payment_method ?? undefined,
        createdAt: row.created_at ?? undefined,
    }
}
