import React from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SkeletonBlock } from './skeleton-block'

export function SubscriptionsSkeleton() {
    const insets = useSafeAreaInsets()

    return (
        <View className='flex-1 bg-[#111111]'>
            <View
                className='px-5 pb-2'
                style={{ paddingTop: insets.top + 16 }}
            >
                <View className='flex-row items-center justify-between'>
                    <View className='gap-2'>
                        <SkeletonBlock className='h-3 w-20 rounded-full' />
                        <SkeletonBlock className='h-7 w-44 rounded-md' />
                    </View>
                    <SkeletonBlock className='h-11 w-11 rounded-full' />
                </View>

                <SkeletonBlock className='mt-5 h-12 w-full rounded-2xl' />

                <View className='mt-4 flex-row gap-2'>
                    <SkeletonBlock className='h-9 w-16 rounded-full' />
                    <SkeletonBlock className='h-9 w-20 rounded-full' />
                    <SkeletonBlock className='h-9 w-20 rounded-full' />
                </View>
            </View>

            <ScrollView
                className='flex-1'
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    paddingBottom: 40,
                    gap: 10,
                }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
            >
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <SubscriptionRowSkeleton key={i} />
                ))}
            </ScrollView>
        </View>
    )
}

function SubscriptionRowSkeleton() {
    return (
        <View className='flex-row items-center gap-3 rounded-2xl border border-[#1F1F22] bg-[#16161A] px-4 py-4'>
            <SkeletonBlock className='h-12 w-12 rounded-2xl' />
            <View className='flex-1 gap-2'>
                <SkeletonBlock className='h-4 w-36 rounded-md' />
                <SkeletonBlock className='h-3 w-24 rounded-full' />
            </View>
            <View className='items-end gap-2'>
                <SkeletonBlock className='h-4 w-16 rounded-md' />
                <SkeletonBlock className='h-3 w-12 rounded-full' />
            </View>
        </View>
    )
}
