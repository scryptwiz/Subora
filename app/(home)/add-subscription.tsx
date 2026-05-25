import { AddSubscriptionScreenBody } from '@/components/add-subscription/add-subscription-screen-body'
import { EmojiPickerModal } from '@/components/add-subscription/emoji-picker-modal'
import { DEFAULT_CURRENCY } from '@/constants/currencies'
import { usePreferences } from '@/contexts/preferences-context'
import { useSubscriptions } from '@/contexts/subscriptions-context'
import { useSupabase } from '@/hooks/use-supabase'
import { saveSubscriptionReminders } from '@/lib/add-subscription/save-reminders'
import { dateToBillingIso } from '@/lib/billing-date'
import { type BrandPreset } from '@/lib/brand-presets'
import { deriveDomain } from '@/lib/logo'
import { searchPresets, type BillingCycle } from '@/lib/subscriptions'
import { useAuth } from '@clerk/expo'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function parseBillingCycle(v: unknown): BillingCycle | undefined {
    if (v === 'week' || v === 'month' || v === 'year') return v
    return undefined
}

export default function AddSubscriptionScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const params = useLocalSearchParams<{
        id?: string
        prefillName?: string
        prefillPrice?: string
        prefillCurrency?: string
        prefillDomain?: string
        prefillCycle?: string
        prefillRenewal?: string
        prefillIconSlug?: string
        prefillBrandColor?: string
    }>()
    const editingId = typeof params.id === 'string' && params.id.length > 0 ? params.id : undefined
    const supabase = useSupabase()
    const { userId } = useAuth()
    const { subscriptions, insertSubscription, updateSubscription, configured } = useSubscriptions()
    const editingSubscription = useMemo(
        () => (editingId ? subscriptions.find(s => s.id === editingId) : undefined),
        [editingId, subscriptions]
    )
    const isEditing = Boolean(editingId)
    const { displayCurrency, loading: prefsLoading } = usePreferences()
    const seededCurrency = useRef(false)
    const hydratedFromExistingRef = useRef(false)
    const hydratedFromPrefillRef = useRef(false)

    const [name, setName] = useState('')
    const [domainInput, setDomainInput] = useState('')
    const [iconSlug, setIconSlug] = useState<string | undefined>(undefined)
    const [brandColor, setBrandColor] = useState<string | undefined>(undefined)
    const [emoji, setEmoji] = useState<string | undefined>(undefined)
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const [price, setPrice] = useState('')
    const [cycle, setCycle] = useState<BillingCycle>('month')
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
    const [renewalDate, setRenewalDate] = useState<Date>(() => new Date())
    const [active, setActive] = useState(true)

    const minRenewalDate = useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])
    const [reminderOffsets, setReminderOffsets] = useState<number[]>([0])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isEditing) return
        if (prefsLoading || seededCurrency.current) return
        setCurrency(displayCurrency)
        seededCurrency.current = true
    }, [prefsLoading, displayCurrency, isEditing])

    useEffect(() => {
        if (!isEditing || hydratedFromExistingRef.current) return
        if (!editingSubscription) return
        setName(editingSubscription.name)
        setDomainInput(editingSubscription.domain ?? '')
        setIconSlug(editingSubscription.iconSlug)
        setBrandColor(editingSubscription.brandColor)
        setEmoji(editingSubscription.emoji)
        setPrice(String(editingSubscription.price))
        setCycle(editingSubscription.billingCycle)
        setCurrency(editingSubscription.currency.toUpperCase() || DEFAULT_CURRENCY)
        const next = new Date(editingSubscription.nextRenewal)
        if (!Number.isNaN(next.getTime())) setRenewalDate(next)
        setActive(editingSubscription.active)
        hydratedFromExistingRef.current = true
    }, [isEditing, editingSubscription])

    useEffect(() => {
        if (isEditing || hydratedFromPrefillRef.current) return
        const pn = params.prefillName
        if (typeof pn !== 'string' || !pn.trim()) return
        hydratedFromPrefillRef.current = true
        setName(pn.trim())
        if (typeof params.prefillDomain === 'string' && params.prefillDomain.trim()) {
            setDomainInput(params.prefillDomain.trim())
        }
        if (typeof params.prefillPrice === 'string' && params.prefillPrice.trim()) {
            setPrice(params.prefillPrice.trim())
        }
        if (typeof params.prefillCurrency === 'string' && params.prefillCurrency.trim()) {
            setCurrency(params.prefillCurrency.trim().toUpperCase())
        }
        const c = parseBillingCycle(params.prefillCycle)
        if (c) setCycle(c)
        if (typeof params.prefillRenewal === 'string' && params.prefillRenewal.trim()) {
            const d = new Date(params.prefillRenewal.trim())
            if (!Number.isNaN(d.getTime())) setRenewalDate(d)
        }
        if (typeof params.prefillIconSlug === 'string' && params.prefillIconSlug.trim()) {
            setIconSlug(params.prefillIconSlug.trim())
        }
        if (typeof params.prefillBrandColor === 'string' && params.prefillBrandColor.trim()) {
            setBrandColor(params.prefillBrandColor.trim())
        }
    }, [isEditing, params])

    useEffect(() => {
        if (!isEditing || !editingId || !supabase || !userId) return
        void supabase
            .from('subscription_reminders')
            .select('offset_days')
            .eq('subscription_id', editingId)
            .eq('user_id', userId)
            .then(({ data }) => {
                const offsets = ((data ?? []) as { offset_days: number }[]).map(r => r.offset_days)
                setReminderOffsets(offsets.length ? offsets : [0])
            })
    }, [isEditing, editingId, supabase, userId])

    const suggestions = useMemo(() => searchPresets(name, 5), [name])
    const effectiveDomain = useMemo(
        () => domainInput.trim() || deriveDomain(name) || undefined,
        [domainInput, name]
    )
    const priceNumber = parseFloat(price.replace(',', '.'))
    const isValid = name.trim().length > 0 && Number.isFinite(priceNumber) && priceNumber > 0
    const applyPreset = (preset: BrandPreset) => {
        setName(preset.name)
        setDomainInput(preset.domain)
        setIconSlug(preset.iconSlug)
        setBrandColor(preset.brandColor)
        setEmoji(undefined)
    }

    const clearLogoIfNameEdited = (next: string) => {
        if (next !== name && iconSlug) {
            setIconSlug(undefined)
            setBrandColor(undefined)
        }
        setName(next)
    }

    const handleEmojiSelect = (next: string) => {
        setEmoji(next)
        setIconSlug(undefined)
        setBrandColor(undefined)
    }

    const handleSave = async () => {
        if (!isValid || saving) return
        if (!configured) {
            Alert.alert(
                'Supabase not configured',
                'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.'
            )
            return
        }

        const domain = effectiveDomain?.trim() || undefined

        setSaving(true)
        try {
            if (isEditing && editingId) {
                await updateSubscription(editingId, {
                    name: name.trim(),
                    domain: domain ?? '',
                    iconSlug: iconSlug ?? undefined,
                    brandColor: brandColor ?? undefined,
                    emoji: emoji ?? undefined,
                    price: priceNumber,
                    currency: currency.toUpperCase(),
                    billingCycle: cycle,
                    nextRenewal: dateToBillingIso(renewalDate),
                    active,
                })
                if (supabase && userId) {
                    await saveSubscriptionReminders(supabase, userId, editingId, reminderOffsets)
                }
            } else {
                const newId = await insertSubscription({
                    name: name.trim(),
                    domain,
                    plan: undefined,
                    iconSlug,
                    brandColor,
                    emoji,
                    price: priceNumber,
                    currency: currency.toUpperCase(),
                    billingCycle: cycle,
                    nextRenewal: dateToBillingIso(renewalDate),
                    active: true,
                })
                if (supabase && userId) {
                    await saveSubscriptionReminders(supabase, userId, newId, reminderOffsets)
                }
            }
            router.back()
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not save subscription.'
            Alert.alert('Save failed', message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className='flex-1 bg-[#111111]'
        >
            <View className='flex-1'>
                <AddSubscriptionScreenBody
                    insetsTop={insets.top}
                    isEditing={isEditing}
                    isValid={isValid}
                    saving={saving}
                    name={name}
                    setName={setName}
                    clearLogoIfNameEdited={clearLogoIfNameEdited}
                    domainInput={domainInput}
                    setDomainInput={setDomainInput}
                    effectiveDomain={effectiveDomain}
                    iconSlug={iconSlug}
                    brandColor={brandColor}
                    emoji={emoji}
                    setEmojiPickerOpen={setEmojiPickerOpen}
                    suggestions={suggestions}
                    applyPreset={applyPreset}
                    price={price}
                    setPrice={setPrice}
                    cycle={cycle}
                    setCycle={setCycle}
                    currency={currency}
                    setCurrency={setCurrency}
                    renewalDate={renewalDate}
                    minRenewalDate={minRenewalDate}
                    setRenewalDate={setRenewalDate}
                    reminderOffsets={reminderOffsets}
                    setReminderOffsets={setReminderOffsets}
                    priceNumber={priceNumber}
                    onSave={() => void handleSave()}
                />
            </View>

            <EmojiPickerModal
                visible={emojiPickerOpen}
                selected={emoji}
                onClose={() => setEmojiPickerOpen(false)}
                onSelect={handleEmojiSelect}
                onClear={() => setEmoji(undefined)}
            />
        </KeyboardAvoidingView>
    )
}
