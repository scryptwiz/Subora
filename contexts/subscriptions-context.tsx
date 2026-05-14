import { isSupabaseConfigured, useSupabase } from '@/hooks/use-supabase'
import { useSyncLocalRenewalNotifications } from '@/hooks/use-sync-local-renewal-notifications'
import { rowToSubscription, type SubscriptionRow } from '@/lib/subscription-db'
import type { BillingCycle, Subscription } from '@/lib/subscriptions'
import { useAuth } from '@clerk/expo'
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

export type InsertSubscriptionInput = {
    name: string
    plan?: string
    domain?: string
    iconSlug?: string
    brandColor?: string
    emoji?: string
    price: number
    currency?: string
    billingCycle: BillingCycle
    nextRenewal: string
    active?: boolean
    paymentMethod?: string
}
export type UpdateSubscriptionInput = Partial<InsertSubscriptionInput>

type SubscriptionsContextValue = {
    subscriptions: Subscription[]
    loading: boolean
    error: string | null
    configured: boolean
    refetch: () => Promise<void>
    insertSubscription: (input: InsertSubscriptionInput) => Promise<string>
    updateSubscription: (id: string, input: UpdateSubscriptionInput) => Promise<void>
    setSubscriptionActive: (id: string, active: boolean) => Promise<void>
    deleteSubscription: (id: string) => Promise<void>
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null)
export function SubscriptionsProvider({ children }: { children: ReactNode }) {
    const supabase = useSupabase()
    const { userId, isLoaded } = useAuth()
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const configured = isSupabaseConfigured()

    const fetchSubscriptions = useCallback(
        async (options: { silent?: boolean } = {}) => {
            if (!configured) {
                setSubscriptions([])
                setLoading(false)
                setError(null)
                return
            }

            if (!supabase || !userId) {
                setSubscriptions([])
                setLoading(false)
                return
            }

            if (!options.silent) setLoading(true)
            setError(null)

            const { data, error: qError } = await supabase
                .from('subscriptions')
                .select('*')
                .order('next_renewal', { ascending: true })

            if (qError) {
                setError(qError.message)
                if (!options.silent) setSubscriptions([])
            } else {
                const rows = (data ?? []) as SubscriptionRow[]
                setSubscriptions(rows.map(rowToSubscription))
            }

            if (!options.silent) setLoading(false)
        },
        [configured, supabase, userId]
    )

    useEffect(() => {
        if (!isLoaded) return
        void fetchSubscriptions()
    }, [isLoaded, fetchSubscriptions])

    useSyncLocalRenewalNotifications(configured, subscriptions)

    const applyLocalPatch = useCallback(
        (id: string, patch: UpdateSubscriptionInput) => {
            setSubscriptions(prev => {
                const next = prev.map(sub => {
                    if (sub.id !== id) return sub
                    return {
                        ...sub,
                        ...(patch.name !== undefined ? { name: patch.name } : null),
                        ...(patch.plan !== undefined ? { plan: patch.plan ?? undefined } : null),
                        ...(patch.domain !== undefined
                            ? {
                                  domain: patch.domain.trim() ? patch.domain.trim() : undefined,
                              }
                            : null),
                        ...(patch.iconSlug !== undefined
                            ? { iconSlug: patch.iconSlug ?? undefined }
                            : null),
                        ...(patch.brandColor !== undefined
                            ? { brandColor: patch.brandColor ?? undefined }
                            : null),
                        ...(patch.emoji !== undefined
                            ? { emoji: patch.emoji ?? undefined }
                            : null),
                        ...(patch.price !== undefined ? { price: patch.price } : null),
                        ...(patch.currency !== undefined
                            ? { currency: patch.currency }
                            : null),
                        ...(patch.billingCycle !== undefined
                            ? { billingCycle: patch.billingCycle }
                            : null),
                        ...(patch.nextRenewal !== undefined
                            ? { nextRenewal: patch.nextRenewal }
                            : null),
                        ...(patch.active !== undefined ? { active: patch.active } : null),
                        ...(patch.paymentMethod !== undefined
                            ? { paymentMethod: patch.paymentMethod ?? undefined }
                            : null),
                    }
                })
                next.sort(
                    (a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime()
                )
                return next
            })
        },
        []
    )

    const insertSubscription = useCallback(
        async (input: InsertSubscriptionInput) => {
            if (!supabase || !userId) throw new Error('Sign in required.')

            const payload = {
                user_id: userId,
                name: input.name,
                plan: input.plan ?? null,
                domain: input.domain?.trim() ? input.domain.trim() : null,
                icon_slug: input.iconSlug ?? null,
                brand_color: input.brandColor ?? null,
                emoji: input.emoji ?? null,
                price: input.price,
                currency: input.currency ?? 'USD',
                billing_cycle: input.billingCycle,
                next_renewal: input.nextRenewal,
                active: input.active ?? true,
                payment_method: input.paymentMethod ?? null,
            }

            const { data, error: insertError } = await supabase
                .from('subscriptions')
                .insert(payload)
                .select('id')
                .single()
            if (insertError) throw insertError
            await fetchSubscriptions({ silent: true })
            return data.id as string
        },
        [supabase, userId, fetchSubscriptions]
    )

    const updateSubscription = useCallback(
        async (id: string, input: UpdateSubscriptionInput) => {
            if (!supabase || !userId) throw new Error('Sign in required.')

            const payload: Record<string, unknown> = {}
            if (input.name !== undefined) payload.name = input.name
            if (input.plan !== undefined) payload.plan = input.plan ?? null
            if (input.domain !== undefined) {
                payload.domain = input.domain.trim() ? input.domain.trim() : null
            }
            if (input.iconSlug !== undefined) payload.icon_slug = input.iconSlug ?? null
            if (input.brandColor !== undefined) payload.brand_color = input.brandColor ?? null
            if (input.emoji !== undefined) payload.emoji = input.emoji ?? null
            if (input.price !== undefined) payload.price = input.price
            if (input.currency !== undefined) payload.currency = input.currency
            if (input.billingCycle !== undefined) payload.billing_cycle = input.billingCycle
            if (input.nextRenewal !== undefined) payload.next_renewal = input.nextRenewal
            if (input.active !== undefined) payload.active = input.active
            if (input.paymentMethod !== undefined) {
                payload.payment_method = input.paymentMethod ?? null
            }

            if (Object.keys(payload).length === 0) return

            applyLocalPatch(id, input)

            const { error: updateError } = await supabase
                .from('subscriptions')
                .update(payload)
                .eq('id', id)
                .eq('user_id', userId)

            if (updateError) {
                await fetchSubscriptions()
                throw updateError
            }
            await fetchSubscriptions({ silent: true })
        },
        [supabase, userId, fetchSubscriptions, applyLocalPatch]
    )

    const setSubscriptionActive = useCallback(
        async (id: string, active: boolean) => {
            if (!supabase) throw new Error('Sign in required.')

            applyLocalPatch(id, { active })

            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({ active })
                .eq('id', id)

            if (updateError) {
                await fetchSubscriptions()
                throw updateError
            }
            await fetchSubscriptions({ silent: true })
        },
        [supabase, fetchSubscriptions, applyLocalPatch]
    )

    const deleteSubscription = useCallback(
        async (id: string) => {
            if (!supabase || !userId) throw new Error('Sign in required.')

            setSubscriptions(prev => prev.filter(s => s.id !== id))

            const { data, error: deleteError } = await supabase
                .from('subscriptions')
                .delete()
                .eq('id', id)
                .eq('user_id', userId)
                .select('id')

            if (deleteError) {
                await fetchSubscriptions()
                throw deleteError
            }

            if (!data || data.length === 0) {
                await fetchSubscriptions()
                throw new Error('Subscription could not be deleted.')
            }
        },
        [supabase, userId, fetchSubscriptions]
    )

    const refetch = useCallback(() => fetchSubscriptions({ silent: true }), [fetchSubscriptions])

    const value = useMemo(
        () => ({
            subscriptions,
            loading,
            error,
            configured,
            refetch,
            insertSubscription,
            updateSubscription,
            setSubscriptionActive,
            deleteSubscription,
        }),
        [
            subscriptions,
            loading,
            error,
            configured,
            refetch,
            insertSubscription,
            updateSubscription,
            setSubscriptionActive,
            deleteSubscription,
        ]
    )

    return <SubscriptionsContext.Provider value={value}>{children}</SubscriptionsContext.Provider>
}

export function useSubscriptions(): SubscriptionsContextValue {
    const ctx = useContext(SubscriptionsContext)
    if (!ctx) {
        throw new Error('useSubscriptions must be used within SubscriptionsProvider.')
    }
    return ctx
}
