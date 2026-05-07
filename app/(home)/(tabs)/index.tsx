import { useUser } from '@clerk/expo'
import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PeriodPill, type Period } from '../../../components/subscriptions/period-pill'
import { SpendingChart, type ChartBar } from '../../../components/subscriptions/spending-chart'
import { StatCard } from '../../../components/subscriptions/stat-card'
import { SubscriptionRow } from '../../../components/subscriptions/subscription-row'
import {
    DEMO_SUBSCRIPTIONS,
    formatCurrency,
    nextRenewalLabel,
    totalMonthly,
    totalWeekly,
    totalYearly,
} from '../../../lib/subscriptions'

const TODAY_LABEL = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
}).format(new Date('2026-05-08T00:00:00Z'))

export default function DashboardScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const { user } = useUser()
    const [period, setPeriod] = useState<Period>('month')

    const subs = DEMO_SUBSCRIPTIONS

    const total = useMemo(() => {
        switch (period) {
            case 'week':
                return totalWeekly(subs)
            case 'year':
                return totalYearly(subs)
            case 'all':
                return totalYearly(subs)
            case 'month':
            default:
                return totalMonthly(subs)
        }
    }, [subs, period])

    const upcoming = useMemo(
        () =>
            [...subs]
                .filter(s => s.active)
                .sort((a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime())
                .slice(0, 4),
        [subs]
    )

    const activeCount = subs.filter(s => s.active).length
    const annualSpend = totalYearly(subs)

    const chartBars: ChartBar[] = useMemo(() => {
        const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
        const monthly = totalMonthly(subs)
        return months.map((m, i) => ({
            label: m,
            value: monthly * (0.6 + ((i * 31) % 60) / 100),
            active: m === 'May',
        }))
    }, [subs])

    const greeting = user?.firstName ?? user?.username ?? 'there'

    return (
        <ScrollView
            className='flex-1 bg-[#111111]'
            contentContainerStyle={{
                paddingTop: insets.top + 16,
                paddingHorizontal: 20,
                paddingBottom: 20,
                gap: 24,
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View className='flex-row items-center justify-between'>
                <View>
                    <Text className='font-inter text-sm text-neutral-500'>{TODAY_LABEL}</Text>
                    <Text className='mt-1 font-inter-bold text-2xl text-white'>Hi, {greeting}</Text>
                </View>
                <Pressable
                    onPress={() => router.push('/(home)/(tabs)/profile')}
                    accessibilityLabel='Open notifications'
                    className='h-11 w-11 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]'
                    style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                >
                    <Feather name='bell' size={18} color='#FFFFFF' />
                </Pressable>
            </View>

            {/* Spending hero */}
            <View className='gap-5 rounded-3xl border border-[#1F1F22] bg-[#16161A] p-5'>
                <View className='flex-row items-start justify-between'>
                    <View>
                        <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                            Your spendings
                        </Text>
                        <Text className='mt-2 font-inter-bold text-5xl text-white'>
                            {formatCurrency(total)}
                        </Text>
                    </View>
                    <PeriodPill value={period} onChange={setPeriod} />
                </View>
                <SpendingChart bars={chartBars} />
            </View>

            {/* Stats */}
            <View className='flex-row gap-3'>
                <StatCard
                    label='Active'
                    value={String(activeCount)}
                    caption='services'
                />
                <StatCard
                    label='Per year'
                    value={formatCurrency(annualSpend)}
                    caption='at this pace'
                    accent='highlight'
                />
            </View>

            {/* Upcoming renewals */}
            <View className='gap-3'>
                <View className='flex-row items-center justify-between'>
                    <Text className='font-inter-bold text-lg text-white'>Upcoming</Text>
                    <Link href='/(home)/(tabs)/subscriptions' asChild>
                        <Pressable hitSlop={8}>
                            <Text className='font-inter-medium text-sm text-neutral-400'>See all</Text>
                        </Pressable>
                    </Link>
                </View>
                <View className='gap-2.5'>
                    {upcoming.map(sub => (
                        <SubscriptionRow
                            key={sub.id}
                            subscription={sub}
                            variant='history'
                            rightLabel={nextRenewalLabel(sub.nextRenewal)}
                        />
                    ))}
                </View>
            </View>

            {/* Add CTA */}
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
        </ScrollView>
    )
}
