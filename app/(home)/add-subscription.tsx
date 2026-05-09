import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useMemo, useRef, useState } from 'react'
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SubscriptionLogo } from '../../components/subscriptions/subscription-logo'
import { type BrandPreset } from '../../lib/brand-presets'
import { deriveDomain } from '../../lib/logo'
import {
    formatCurrency,
    searchPresets,
    type BillingCycle,
} from '../../lib/subscriptions'

type Cycle = BillingCycle
const CYCLES: { id: Cycle; label: string }[] = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
]

export default function AddSubscriptionScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()

    const [name, setName] = useState('')
    const [domainInput, setDomainInput] = useState('')
    const [iconSlug, setIconSlug] = useState<string | undefined>(undefined)
    const [brandColor, setBrandColor] = useState<string | undefined>(undefined)
    const [price, setPrice] = useState('')
    const [cycle, setCycle] = useState<Cycle>('month')
    const [firstPayment, setFirstPayment] = useState('Today')
    const [reminders, setReminders] = useState(true)

    const priceRef = useRef<TextInput>(null)

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
    }

    const clearLogoIfNameEdited = (next: string) => {
        if (next !== name && iconSlug) {
            setIconSlug(undefined)
            setBrandColor(undefined)
        }
        setName(next)
    }

    const handleSave = () => {
        if (!isValid) return
        // Demo: just close. Wire to persistence later.
        router.back()
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
                {/* Modal header */}
                <View className='flex-row items-center justify-between'>
                    <Pressable
                        onPress={() => router.back()}
                        accessibilityLabel='Close'
                        className='h-10 w-10 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]'
                        style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
                    >
                        <Feather name='x' size={18} color='#FFFFFF' />
                    </Pressable>
                    <Text className='font-inter-medium text-base text-white'>New subscription</Text>
                    <Pressable
                        onPress={handleSave}
                        disabled={!isValid}
                        hitSlop={8}
                    >
                        <Text
                            className={`font-inter-medium text-sm ${isValid ? 'text-white' : 'text-neutral-600'}`}
                        >
                            Save
                        </Text>
                    </Pressable>
                </View>

                {/* Brand preview */}
                <View className='items-center gap-4 rounded-3xl border border-[#1F1F22] bg-[#16161A] p-6'>
                    <SubscriptionLogo
                        name={name || 'New service'}
                        domain={effectiveDomain}
                        iconSlug={iconSlug}
                        tint={brandColor}
                        size={84}
                    />
                    <View className='items-center'>
                        <Text className='font-inter-bold text-xl text-white'>
                            {name.trim() || 'Service name'}
                        </Text>
                        <Text className='mt-1 font-inter text-xs text-neutral-500'>
                            {effectiveDomain ?? 'No website'}
                        </Text>
                    </View>
                </View>

                {/* Service input */}
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

                    {suggestions.length > 0 && !iconSlug ? (
                        <View className='gap-2'>
                            <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                                Suggestions
                            </Text>
                            <View className='flex-row flex-wrap gap-2'>
                                {suggestions.map(preset => (
                                    <Pressable
                                        key={preset.domain}
                                        onPress={() => applyPreset(preset)}
                                        className='flex-row items-center gap-2 rounded-full border border-[#27272A] bg-[#16161A] py-1.5 pl-1.5 pr-3'
                                        style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                                    >
                                        <SubscriptionLogo
                                            name={preset.name}
                                            domain={preset.domain}
                                            iconSlug={preset.iconSlug}
                                            tint={preset.brandColor}
                                            size={26}
                                        />
                                        <Text className='font-inter-medium text-sm text-white'>
                                            {preset.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    ) : null}
                </View>

                {/* Domain (advanced) */}
                <View className='gap-3'>
                    <FieldLabel icon='globe' label='Website (used for the logo)' />
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

                {/* Price (manual entry only — never auto-populated) */}
                <View className='gap-3'>
                    <FieldLabel icon='dollar-sign' label='Price' />
                    <View className='flex-row items-center gap-3'>
                        <View className='h-14 w-14 items-center justify-center rounded-2xl border border-[#27272A] bg-[#16161A]'>
                            <Text className='font-inter-medium text-lg text-neutral-400'>$</Text>
                        </View>
                        <TextInput
                            ref={priceRef}
                            value={price}
                            onChangeText={setPrice}
                            placeholder='0.00'
                            placeholderTextColor='#52525B'
                            keyboardType='decimal-pad'
                            className='h-14 flex-1 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter-bold text-2xl text-white'
                        />
                    </View>

                    <View className='flex-row gap-2'>
                        {CYCLES.map(c => {
                            const active = c.id === cycle
                            return (
                                <Pressable
                                    key={c.id}
                                    onPress={() => setCycle(c.id)}
                                    className={`flex-1 items-center rounded-2xl border py-3 ${active ? 'border-white bg-white' : 'border-[#27272A] bg-[#16161A]'
                                        }`}
                                    style={({ pressed }) =>
                                        pressed && !active ? { opacity: 0.85 } : undefined
                                    }
                                >
                                    <Text
                                        className={`font-inter-medium text-sm ${active ? 'text-[#111111]' : 'text-neutral-300'
                                            }`}
                                    >
                                        {c.label}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>
                </View>

                {/* Billing details */}
                <View className='gap-3'>
                    <FieldLabel icon='calendar' label='Billing' />
                    <View className='overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#16161A]'>
                        <DetailRow
                            icon='calendar'
                            title='First payment'
                            value={firstPayment}
                            onPress={() =>
                                setFirstPayment(prev => (prev === 'Today' ? 'Tomorrow' : 'Today'))
                            }
                        />
                        <Divider />
                        <DetailRow
                            icon='credit-card'
                            title='Payment method'
                            value='Apple Pay'
                            onPress={() => undefined}
                        />
                        <Divider />
                        <DetailRow
                            icon='bell'
                            title='Renewal reminder'
                            value={reminders ? 'On' : 'Off'}
                            onPress={() => setReminders(prev => !prev)}
                        />
                    </View>
                </View>

                {/* Save button */}
                <Pressable
                    onPress={handleSave}
                    disabled={!isValid}
                    className={`h-16 items-center justify-center rounded-2xl ${isValid ? 'bg-white' : 'bg-white/20'
                        }`}
                    style={({ pressed }) =>
                        pressed && isValid ? { opacity: 0.85 } : undefined
                    }
                >
                    <Text
                        className={`font-inter-medium text-lg ${isValid ? 'text-[#111111]' : 'text-neutral-500'
                            }`}
                    >
                        {isValid
                            ? `Add ${formatCurrency(priceNumber)} / ${cycle}`
                            : 'Add subscription'}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

function FieldLabel({
    icon,
    label,
}: {
    icon: React.ComponentProps<typeof Feather>['name']
    label: string
}) {
    return (
        <View className='flex-row items-center gap-2'>
            <Feather name={icon} size={14} color='#71717A' />
            <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                {label}
            </Text>
        </View>
    )
}

function DetailRow({
    icon,
    title,
    value,
    onPress,
}: {
    icon: React.ComponentProps<typeof Feather>['name']
    title: string
    value: string
    onPress: () => void
}) {
    return (
        <Pressable
            onPress={onPress}
            className='flex-row items-center gap-3 px-4 py-4'
            style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
        >
            <View className='h-9 w-9 items-center justify-center rounded-xl bg-[#1F1F22]'>
                <Feather name={icon} size={16} color='#FFFFFF' />
            </View>
            <Text className='flex-1 font-inter-medium text-base text-white'>{title}</Text>
            <Text className='font-inter text-sm text-neutral-400'>{value}</Text>
            <Feather name='chevron-right' size={16} color='#52525B' />
        </Pressable>
    )
}

function Divider() {
    return <View className='ml-[64px] h-px bg-[#1F1F22]' />
}
