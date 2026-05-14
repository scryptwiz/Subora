import { AddSubscriptionHeader } from '@/components/add-subscription/add-subscription-header'
import { BillingAndRemindersCard } from '@/components/add-subscription/billing-and-reminders-card'
import { BrandPreviewCard } from '@/components/add-subscription/brand-preview-card'
import { EmojiPickerModal } from '@/components/add-subscription/emoji-picker-modal'
import { FieldLabel } from '@/components/add-subscription/form-fields'
import { PresetChips } from '@/components/add-subscription/preset-chips'
import { PriceAndCycleFields } from '@/components/add-subscription/price-and-cycle-fields'
import { SaveSubscriptionButton } from '@/components/add-subscription/save-subscription-button'
import { DEFAULT_CURRENCY } from '@/constants/currencies'
import { usePreferences } from '@/contexts/preferences-context'
import { useSubscriptions } from '@/contexts/subscriptions-context'
import { useSupabase } from '@/hooks/use-supabase'
import { dateToBillingIso, formatBillingDate } from '@/lib/billing-date'
import { useAuth } from '@clerk/expo'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { type BrandPreset } from '../../lib/brand-presets'
import { deriveDomain } from '../../lib/logo'
import { searchPresets, type BillingCycle } from '../../lib/subscriptions'

export default function AddSubscriptionScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const params = useLocalSearchParams<{ id?: string }>()
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

    const priceRef = useRef<TextInput>(null)

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

    const saveReminders = async (subscriptionId: string, offsets: number[]) => {
        if (!supabase || !userId) return
        const unique = [...new Set(offsets)].filter(v => v >= 0 && v <= 30).slice(0, 3)
        await supabase.from('subscription_reminders').delete().eq('subscription_id', subscriptionId).eq('user_id', userId)
        if (!unique.length) return
        const rows = unique.map(offset => ({
            user_id: userId,
            subscription_id: subscriptionId,
            offset_days: offset,
        }))
        const { error } = await supabase.from('subscription_reminders').insert(rows)
        if (error) throw error
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
                await saveReminders(editingId, reminderOffsets)
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
                await saveReminders(newId, reminderOffsets)
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
            <ScrollView
                className='flex-1'
                contentContainerStyle={{
                    paddingTop: (Platform.OS === 'ios' ? 0 : insets.top) + 24,
                    paddingHorizontal: 20,
                    paddingBottom: 40,
                    gap: 24,
                }}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
                <AddSubscriptionHeader
                    isEditing={isEditing}
                    isValid={isValid}
                    saving={saving}
                    onClose={() => router.back()}
                    onSave={() => void handleSave()}
                />
                <BrandPreviewCard
                    name={name}
                    effectiveDomain={effectiveDomain}
                    iconSlug={iconSlug}
                    brandColor={brandColor}
                    emoji={emoji}
                    onPressLogo={() => setEmojiPickerOpen(true)}
                />
                <View className='gap-3'>
                    <FieldLabel icon='tag' label='Service' />
                    <TextInput
                        value={name}
                        onChangeText={clearLogoIfNameEdited}
                        placeholder='e.g. Netflix'
                        placeholderTextColor='#52525B'
                        autoCapitalize='words'
                        autoCorrect={false}
                        className='h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base leading-[18px] text-white'
                        returnKeyType='next'
                        onSubmitEditing={() => priceRef.current?.focus()}
                    />

                    <PresetChips
                        suggestions={suggestions}
                        onSelect={applyPreset}
                        show={!iconSlug}
                    />
                </View>

                <View className='gap-3'>
                    <FieldLabel icon='globe' label='Website (optional, used for the logo)' />
                    <TextInput
                        value={domainInput}
                        onChangeText={setDomainInput}
                        placeholder={effectiveDomain ?? 'netflix.com'}
                        placeholderTextColor='#52525B'
                        keyboardType={Platform.OS === 'ios' ? 'url' : 'default'}
                        autoCapitalize='none'
                        autoCorrect={false}
                        className='h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base leading-[18px] text-white'
                    />
                </View>

                <PriceAndCycleFields
                    ref={priceRef}
                    price={price}
                    onPriceChange={setPrice}
                    cycle={cycle}
                    onCycleChange={setCycle}
                    currency={currency}
                    onCurrencyChange={setCurrency}
                />

                <BillingAndRemindersCard
                    renewalDate={renewalDate}
                    minRenewalDate={minRenewalDate}
                    onRenewalDateChange={setRenewalDate}
                    formatRenewalDate={formatBillingDate}
                    reminderOffsets={reminderOffsets}
                    onReminderOffsetsChange={setReminderOffsets}
                />

                <SaveSubscriptionButton
                    isValid={isValid}
                    saving={saving}
                    isEditing={isEditing}
                    priceNumber={priceNumber}
                    currency={currency}
                    cycle={cycle}
                    onPress={() => void handleSave()}
                />
            </ScrollView>

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
