import { useClerk, useUser } from '@clerk/expo'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { Alert, Animated, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollRevealTopChrome } from '../../../components/scroll-reveal-top-chrome'
import { avatarColor, initials } from '../../../lib/logo'
import {
    DEMO_SUBSCRIPTIONS,
    formatCurrency,
    totalMonthly,
    totalYearly,
} from '../../../lib/subscriptions'

type RowProps = {
    icon: React.ComponentProps<typeof Feather>['name']
    title: string
    subtitle?: string
    onPress?: () => void
    danger?: boolean
}

function SettingsRow({ icon, title, subtitle, onPress, danger }: RowProps) {
    return (
        <Pressable
            onPress={onPress}
            className='flex-row items-center gap-4 px-4 py-4'
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
        >
            <View
                className={`h-10 w-10 items-center justify-center rounded-xl ${danger ? 'bg-red-500/10' : 'bg-[#1F1F22]'}`}
            >
                <Feather name={icon} size={18} color={danger ? '#F87171' : '#FFFFFF'} />
            </View>
            <View className='flex-1'>
                <Text className={`font-inter-medium text-base ${danger ? 'text-red-400' : 'text-white'}`}>
                    {title}
                </Text>
                {subtitle ? (
                    <Text className='mt-0.5 font-inter text-xs text-neutral-500'>{subtitle}</Text>
                ) : null}
            </View>
            <Feather name='chevron-right' size={18} color='#52525B' />
        </Pressable>
    )
}

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <View className='overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#16161A]'>
            {React.Children.toArray(children).map((child, idx, arr) => (
                <View key={idx}>
                    {child}
                    {idx < arr.length - 1 ? (
                        <View className='ml-[68px] h-px bg-[#1F1F22]' />
                    ) : null}
                </View>
            ))}
        </View>
    )
}

export default function ProfileScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const { user } = useUser()
    const { signOut } = useClerk()
    const scrollY = useRef(new Animated.Value(0)).current

    const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
    })

    const displayName = user?.fullName ?? user?.firstName ?? user?.username ?? 'Subora user'
    const email = user?.primaryEmailAddress?.emailAddress ?? '—'

    const monthly = totalMonthly(DEMO_SUBSCRIPTIONS)
    const yearly = totalYearly(DEMO_SUBSCRIPTIONS)
    const activeCount = DEMO_SUBSCRIPTIONS.filter(s => s.active).length

    const confirmSignOut = () => {
        Alert.alert(
            'Sign out',
            'You can sign back in anytime.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut()
                        router.replace('/(auth)/sign-in')
                    },
                },
            ]
        )
    }

    return (
        <View className='flex-1 bg-[#111111]'>
            <Animated.ScrollView
                className='flex-1'
                contentContainerStyle={{
                    paddingTop: insets.top + 16,
                    paddingHorizontal: 20,
                    paddingBottom: insets.bottom + 126,
                    gap: 24,
                }}
                scrollEventThrottle={16}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                <View className='flex-row items-center justify-between gap-3'>
                    <Text className='min-w-0 flex-1 font-inter-bold text-2xl text-white'>Profile</Text>
                    <Pressable
                        accessibilityRole='button'
                        accessibilityLabel='Settings'
                        className='h-11 w-11 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]'
                        hitSlop={8}
                        onPress={() => void Haptics.selectionAsync()}
                        style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                    >
                        <Feather name='settings' size={18} color='#FFFFFF' />
                    </Pressable>
                </View>

                {/* Profile card */}
            <View className='items-center gap-3 rounded-3xl border border-[#1F1F22] bg-[#16161A] p-6'>
                {user?.imageUrl ? (
                    <Image
                        source={{ uri: user.imageUrl }}
                        style={{ width: 88, height: 88, borderRadius: 44 }}
                        contentFit='cover'
                    />
                ) : (
                    <View
                        className='h-[88px] w-[88px] items-center justify-center rounded-full'
                        style={{ backgroundColor: avatarColor(displayName) }}
                    >
                        <Text className='font-inter-bold text-3xl text-white'>
                            {initials(displayName)}
                        </Text>
                    </View>
                )}
                <View className='items-center'>
                    <Text className='font-inter-bold text-xl text-white'>{displayName}</Text>
                    <Text className='mt-1 font-inter text-sm text-neutral-500'>{email}</Text>
                </View>
            </View>

            {/* Stats summary */}
            <View className='flex-row gap-3'>
                <View className='flex-1 rounded-2xl border border-[#1F1F22] bg-[#16161A] p-4'>
                    <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                        Active
                    </Text>
                    <Text className='mt-2 font-inter-bold text-2xl text-white'>{activeCount}</Text>
                </View>
                <View className='flex-1 rounded-2xl border border-[#1F1F22] bg-[#16161A] p-4'>
                    <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                        Monthly
                    </Text>
                    <Text className='mt-2 font-inter-bold text-2xl text-white'>
                        {formatCurrency(monthly)}
                    </Text>
                </View>
                <View className='flex-1 rounded-2xl border border-lime-400/40 bg-lime-400/10 p-4'>
                    <Text className='font-inter text-xs uppercase tracking-wider text-lime-300'>
                        Yearly
                    </Text>
                    <Text className='mt-2 font-inter-bold text-2xl text-white'>
                        {formatCurrency(yearly)}
                    </Text>
                </View>
            </View>

            {/* Account section */}
            <View className='gap-3'>
                <Text className='px-1 font-inter text-xs uppercase tracking-wider text-neutral-500'>
                    Account
                </Text>
                <SectionCard>
                    <SettingsRow icon='user' title='Edit profile' subtitle='Name, email, photo' />
                    <SettingsRow icon='credit-card' title='Payment methods' subtitle='Cards, Apple Pay' />
                    <SettingsRow icon='bell' title='Reminders' subtitle='Renewal alerts' />
                </SectionCard>
            </View>

            {/* Preferences section */}
            <View className='gap-3'>
                <Text className='px-1 font-inter text-xs uppercase tracking-wider text-neutral-500'>
                    Preferences
                </Text>
                <SectionCard>
                    <SettingsRow icon='dollar-sign' title='Currency' subtitle='USD' />
                    <SettingsRow icon='moon' title='Appearance' subtitle='Dark' />
                    <SettingsRow icon='download' title='Export data' />
                </SectionCard>
            </View>

            {/* Support */}
            <View className='gap-3'>
                <Text className='px-1 font-inter text-xs uppercase tracking-wider text-neutral-500'>
                    Support
                </Text>
                <SectionCard>
                    <SettingsRow icon='help-circle' title='Help center' />
                    <SettingsRow icon='shield' title='Privacy policy' />
                    <SettingsRow icon='file-text' title='Terms of service' />
                </SectionCard>
            </View>

            {/* Sign out */}
            <SectionCard>
                <SettingsRow icon='log-out' title='Sign out' onPress={confirmSignOut} danger />
            </SectionCard>

                <Text className='text-center font-inter text-xs text-neutral-600'>Subora · v1.0.0</Text>
            </Animated.ScrollView>

            <ScrollRevealTopChrome scrollY={scrollY} topInset={insets.top} />
        </View>
    )
}
