import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SubscriptionRow } from '../../../components/subscriptions/subscription-row'
import {
    DEMO_SUBSCRIPTIONS,
    formatCurrency,
    totalMonthly,
    type Subscription,
} from '../../../lib/subscriptions'

type Filter = 'all' | 'active' | 'paused'

const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'paused', label: 'Paused' },
]

export default function SubscriptionsScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()

    const [subs, setSubs] = useState<Subscription[]>(DEMO_SUBSCRIPTIONS)
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState<Filter>('all')

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return subs.filter(s => {
            if (filter === 'active' && !s.active) return false
            if (filter === 'paused' && s.active) return false
            if (q && !s.name.toLowerCase().includes(q) && !(s.plan ?? '').toLowerCase().includes(q)) {
                return false
            }
            return true
        })
    }, [subs, filter, query])

    const monthlyTotal = useMemo(() => totalMonthly(subs), [subs])

    const handleToggle = (id: string, next: boolean) => {
        setSubs(prev => prev.map(s => (s.id === id ? { ...s, active: next } : s)))
    }

    return (
        <View className='flex-1 bg-[#111111]'>
            <View
                className='px-5 pb-2'
                style={{ paddingTop: insets.top + 16 }}
            >
                <View className='flex-row items-center justify-between'>
                    <View>
                        <Text className='font-inter text-sm text-neutral-500'>Services</Text>
                        <Text className='font-inter-bold text-2xl text-white'>
                            {formatCurrency(monthlyTotal)}
                            <Text className='font-inter text-sm text-neutral-500'>  / month</Text>
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(home)/add-subscription')}
                        className='h-11 w-11 items-center justify-center rounded-full bg-white'
                        style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                        accessibilityLabel='Add subscription'
                    >
                        <Feather name='plus' size={20} color='#111111' />
                    </Pressable>
                </View>

                {/* Search */}
                <View className='mt-5 flex-row items-center gap-3 rounded-2xl border border-[#27272A] bg-[#16161A] px-4'>
                    <Feather name='search' size={18} color='#52525B' />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder='Search service...'
                        placeholderTextColor='#52525B'
                        className='h-12 flex-1 font-inter text-base text-white'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <Pressable hitSlop={8} onPress={() => setQuery('')}>
                            <Feather name='x' size={16} color='#52525B' />
                        </Pressable>
                    )}
                </View>

                {/* Filters */}
                <View className='mt-4 flex-row gap-2'>
                    {FILTERS.map(f => {
                        const active = filter === f.id
                        return (
                            <Pressable
                                key={f.id}
                                onPress={() => setFilter(f.id)}
                                className={`rounded-full border px-4 py-2 ${active ? 'border-white bg-white' : 'border-[#27272A] bg-[#16161A]'
                                    }`}
                                style={({ pressed }) => (pressed && !active ? { opacity: 0.8 } : undefined)}
                            >
                                <Text className={`font-inter-medium text-sm ${active ? 'text-[#111111]' : 'text-neutral-400'}`}>
                                    {f.label}
                                </Text>
                            </Pressable>
                        )
                    })}
                </View>
            </View>

            <ScrollView
                className='flex-1'
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    paddingBottom: 140,
                    gap: 10,
                }}
                showsVerticalScrollIndicator={false}
            >
                {filtered.length === 0 ? (
                    <EmptyState
                        onAdd={() => router.push('/(home)/add-subscription')}
                        searchActive={query.length > 0}
                    />
                ) : (
                    filtered.map(sub => (
                        <SubscriptionRow
                            key={sub.id}
                            subscription={sub}
                            variant='list'
                            onToggleActive={next => handleToggle(sub.id, next)}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    )
}

function EmptyState({ onAdd, searchActive }: { onAdd: () => void; searchActive: boolean }) {
    return (
        <View className='mt-16 items-center px-6'>
            <View className='h-16 w-16 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]'>
                <Feather name={searchActive ? 'search' : 'inbox'} size={22} color='#52525B' />
            </View>
            <Text className='mt-5 text-center font-inter-bold text-lg text-white'>
                {searchActive ? 'No matches' : 'No subscriptions yet'}
            </Text>
            <Text className='mt-2 text-center font-inter text-sm text-neutral-500'>
                {searchActive
                    ? 'Try a different name or clear the search.'
                    : 'Track every recurring charge in one place.'}
            </Text>
            {!searchActive && (
                <Pressable
                    onPress={onAdd}
                    className='mt-6 flex-row items-center gap-2 rounded-2xl bg-white px-5 py-3'
                    style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                >
                    <Feather name='plus' size={16} color='#111111' />
                    <Text className='font-inter-medium text-sm text-[#111111]'>Add subscription</Text>
                </Pressable>
            )}
        </View>
    )
}
