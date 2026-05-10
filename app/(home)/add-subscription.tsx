import { BrandPreviewCard } from '@/components/add-subscription/brand-preview-card'
import { DatePickerRow } from '@/components/add-subscription/date-picker-row'
import { EmojiPickerModal } from '@/components/add-subscription/emoji-picker-modal'
import { DetailRow, FieldLabel, RowDivider } from '@/components/add-subscription/form-fields'
import { PresetChips } from '@/components/add-subscription/preset-chips'
import { PriceAndCycleFields } from '@/components/add-subscription/price-and-cycle-fields'
import { DEFAULT_CURRENCY } from '@/constants/currencies'
import { usePreferences } from '@/contexts/preferences-context'
import { useSubscriptions } from '@/contexts/subscriptions-context'
import { dateToBillingIso, formatBillingDate } from '@/lib/billing-date'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { type BrandPreset } from '../../lib/brand-presets'
import { deriveDomain } from '../../lib/logo'
import {
    formatCurrency,
    searchPresets,
    type BillingCycle,
} from '../../lib/subscriptions'

export default function AddSubscriptionScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const params = useLocalSearchParams<{ id?: string }>()
    const editingId = typeof params.id === 'string' && params.id.length > 0 ? params.id : undefined
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
    const [reminders, setReminders] = useState(true)
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
            } else {
                await insertSubscription({
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
                <View className='flex-row items-center justify-between'>
                    <Pressable
                        onPress={() => router.back()}
                        accessibilityLabel='Close'
                        className='h-10 w-10 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]'
                        style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
                    >
                        <Feather name='x' size={18} color='#FFFFFF' />
                    </Pressable>
                    <Text className='font-inter-medium text-base text-white'>
                        {isEditing ? 'Edit subscription' : 'New subscription'}
                    </Text>
                    <Pressable
                        onPress={() => void handleSave()}
                        disabled={!isValid || saving}
                        hitSlop={8}
                    >
                        {saving ? (
                            <ActivityIndicator color='#FFFFFF' size='small' />
                        ) : (
                            <Text
                                className={`font-inter-medium text-sm ${isValid ? 'text-white' : 'text-neutral-600'}`}
                            >
                                Save
                            </Text>
                        )}
                    </Pressable>
                </View>

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
                        className='h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base text-white'
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
                        className='h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base text-white'
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

                <View className='gap-3'>
                    <FieldLabel icon='calendar' label='Billing' />
                    <View className='overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#16161A]'>
                        <DatePickerRow
                            icon='calendar'
                            title='Renewal date'
                            value={renewalDate}
                            onChange={setRenewalDate}
                            formatValue={formatBillingDate}
                            minimumDate={minRenewalDate}
                        />
                        <RowDivider />
                        <DetailRow
                            icon='bell'
                            title='Renewal reminder'
                            value={reminders ? 'On' : 'Off'}
                            onPress={() => setReminders(prev => !prev)}
                        />
                    </View>
                </View>

                <Pressable
                    onPress={() => void handleSave()}
                    disabled={!isValid || saving}
                    className={`h-16 items-center justify-center rounded-2xl ${isValid && !saving ? 'bg-white' : 'bg-white/20'
                        }`}
                    style={({ pressed }) =>
                        pressed && isValid && !saving ? { opacity: 0.85 } : undefined
                    }
                >
                    {saving ? (
                        <ActivityIndicator color='#111111' />
                    ) : (
                        <Text
                            className={`font-inter-medium text-lg ${isValid ? 'text-[#111111]' : 'text-neutral-500'
                                }`}
                        >
                            {isValid
                                ? isEditing
                                    ? `Save · ${formatCurrency(priceNumber, currency)} / ${cycle}`
                                    : `Add ${formatCurrency(priceNumber, currency)} / ${cycle}`
                                : isEditing
                                    ? 'Save changes'
                                    : 'Add subscription'}
                        </Text>
                    )}
                </Pressable>
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
