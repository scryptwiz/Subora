import { useSubscriptions } from '@/contexts/subscriptions-context'
import { useConvertedSpendTotals } from '@/hooks/use-converted-totals'
import { usePreferences } from '@/contexts/preferences-context'
import { buildRollingSpendChartBars } from '@/lib/spending-chart-bars'
import { useUser } from '@clerk/expo'
import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useMemo, useRef, useState } from 'react'
import { Alert, Animated, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollRevealTopChrome } from '../../../components/scroll-reveal-top-chrome'
import { DashboardSkeleton } from '../../../components/skeletons/dashboard-skeleton'
import { PeriodPill, type Period } from '../../../components/subscriptions/period-pill'
import { SpendingChart } from '../../../components/subscriptions/spending-chart'
import { StatCard } from '../../../components/subscriptions/stat-card'
import { SwipeableSubscriptionRow } from '../../../components/subscriptions/swipeable-subscription-row'
import {
    nextRenewalLabel,
    type Subscription,
} from '../../../lib/subscriptions'

const TODAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
})

export default function DashboardScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const { user } = useUser()
    const {
        subscriptions: subs,
        loading: subsLoading,
        error,
        configured,
        deleteSubscription,
    } = useSubscriptions()
    const { displayCurrency, loading: prefsLoading } = usePreferences()
    const converted = useConvertedSpendTotals()
    const initializing = subsLoading || prefsLoading || !converted.fxAttempted
    const [period, setPeriod] = useState<Period>('month')
    const scrollY = useRef(new Animated.Value(0)).current

    const todayLabel = useMemo(() => TODAY_FORMATTER.format(new Date()), [])

    const bellButton = ({ size = 18 }: { size?: number }) => (
        <Pressable
            onPress={() => router.push('/(home)/(tabs)/profile')}
            accessibilityRole='button'
            accessibilityLabel='Notifications'
            className='h-11 w-11 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]'
            style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
            hitSlop={8}
        >
            <Feather name='bell' size={size} color='#FFFFFF' />
        </Pressable>
    )

    const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
    })

    const spendingHeadline = useMemo(() => {
        switch (period) {
            case 'week':
                return converted.weeklyLabel
            case 'year':
                return converted.yearlyLabel
            case 'all':
                return converted.yearlyLabel
            case 'month':
            default:
                return converted.monthlyLabel
        }
    }, [period, converted])

    const upcoming = useMemo(
        () =>
            [...subs]
                .filter(s => s.active)
                .sort((a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime())
                .slice(0, 5),
        [subs]
    )

    const activeCount = subs.filter(s => s.active).length

    const chartBars = useMemo(
        () =>
            buildRollingSpendChartBars(subs, new Date(), {
                displayCurrency,
                snapshot: converted.snapshot,
            }),
        [subs, displayCurrency, converted.snapshot]
    )

    const greeting = user?.firstName ?? user?.username ?? 'there'

    const handleDelete = (sub: Subscription) => {
        Alert.alert(
            `Delete ${sub.name}?`,
            'This will remove the subscription from your tracker. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSubscription(sub.id)
                        } catch (e) {
                            const message = e instanceof Error ? e.message : 'Could not delete.'
                            Alert.alert('Delete failed', message)
                        }
                    },
                },
            ]
        )
    }

    const handleEdit = (sub: Subscription) => {
        router.push({
            pathname: '/(home)/add-subscription',
            params: { id: sub.id },
        })
    }

    if (initializing) {
        return <DashboardSkeleton />
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
                    <View className='min-w-0 flex-1'>
                        <Text className='font-inter text-sm text-neutral-500'>{todayLabel}</Text>
                        <Text className='mt-1 font-inter-bold text-2xl text-white'>
                            Hi, {greeting}
                        </Text>
                    </View>
                    {bellButton({})}
                </View>

                {!configured ? (
                    <Text className='rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 font-inter text-sm text-amber-200'>
                        Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment,
                        then apply the SQL migration in Supabase.
                    </Text>
                ) : null}

                {error ? (
                    <Text className='rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-inter text-sm text-red-300'>
                        {error}
                    </Text>
                ) : null}

                <View className='gap-5 rounded-3xl border border-[#1F1F22] bg-[#16161A] p-5'>
                    <View className='flex-row items-start justify-between'>
                        <View>
                            <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                                Your spendings
                            </Text>
                            <Text className='mt-2 font-inter-bold text-5xl text-white'>
                                {spendingHeadline}
                            </Text>
                        </View>
                        <PeriodPill value={period} onChange={setPeriod} />
                    </View>
                    <SpendingChart bars={chartBars} />
                </View>

                <View className='flex-row gap-3'>
                    <StatCard label='Active' value={String(activeCount)} caption='services' />
                    <StatCard
                        label='Per year'
                        value={converted.yearlyLabel}
                        caption='at this pace'
                        accent='highlight'
                    />
                </View>

                <View className='gap-3'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='font-inter-bold text-lg text-white'>Upcoming</Text>
                        <Link href='/(home)/subscriptions' asChild>
                            <Pressable hitSlop={8}>
                                <Text className='font-inter-medium text-sm text-neutral-400'>Show all</Text>
                            </Pressable>
                        </Link>
                    </View>
                    <View className='gap-2.5'>
                        {upcoming.length === 0 ? (
                            <Text className='rounded-2xl border border-[#1F1F22] bg-[#16161A] px-4 py-6 text-center font-inter text-sm text-neutral-500'>
                                No upcoming renewals. Add a subscription to see it here.
                            </Text>
                        ) : (
                            upcoming.map(sub => (
                                <SwipeableSubscriptionRow
                                    key={sub.id}
                                    subscription={sub}
                                    variant='history'
                                    rightLabel={nextRenewalLabel(sub.nextRenewal)}
                                    onEdit={() => handleEdit(sub)}
                                    onDelete={() => handleDelete(sub)}
                                />
                            ))
                        )}
                    </View>
                </View>

                <Pressable
                    onPress={() => router.push('/(home)/add-subscription')}
                    className='flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-[#3F3F46] bg-[#16161A] py-4'
                    style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                >
                    <Feather name='plus' size={18} color='#A3A3A3' />
                    <Text className='font-inter-medium text-sm text-neutral-400'>
                        Add a subscription
                    </Text>
                </Pressable>
            </Animated.ScrollView>

            <ScrollRevealTopChrome scrollY={scrollY} topInset={insets.top} />
        </View>
    )
}
