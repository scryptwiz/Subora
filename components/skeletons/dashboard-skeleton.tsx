import React from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SkeletonBlock } from './skeleton-block'

export function DashboardSkeleton() {
    const insets = useSafeAreaInsets()

    return (
        <View className='flex-1 bg-[#111111]'>
            <ScrollView
                className='flex-1'
                contentContainerStyle={{
                    paddingTop: insets.top + 16,
                    paddingHorizontal: 20,
                    paddingBottom: insets.bottom + 126,
                    gap: 24,
                }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
            >
                <View className='flex-row items-center justify-between gap-3'>
                    <View className='gap-2'>
                        <SkeletonBlock className='h-3 w-32 rounded-full' />
                        <SkeletonBlock className='h-6 w-40 rounded-md' />
                    </View>
                    <SkeletonBlock className='h-11 w-11 rounded-full' />
                </View>

                <View className='rounded-3xl border border-[#1F1F22] bg-[#16161A] p-5'>
                    <View className='gap-3'>
                        <SkeletonBlock className='h-3 w-28 rounded-full' />
                        <SkeletonBlock className='h-12 w-48 rounded-lg' />
                    </View>
                </View>

                <View className='flex-row gap-3'>
                    <View className='flex-1 gap-2 rounded-2xl border border-[#1F1F22] bg-[#16161A] p-4'>
                        <SkeletonBlock className='h-3 w-16 rounded-full' />
                        <SkeletonBlock className='h-7 w-20 rounded-md' />
                        <SkeletonBlock className='h-3 w-24 rounded-full' />
                    </View>
                    <View className='flex-1 gap-2 rounded-2xl border border-lime-400/40 bg-lime-400/10 p-4'>
                        <SkeletonBlock className='h-3 w-20 rounded-full' />
                        <SkeletonBlock className='h-7 w-24 rounded-md' />
                        <SkeletonBlock className='h-3 w-20 rounded-full' />
                    </View>
                </View>

                <View className='gap-3'>
                    <View className='flex-row items-center justify-between'>
                        <SkeletonBlock className='h-5 w-28 rounded-md' />
                        <SkeletonBlock className='h-3 w-16 rounded-full' />
                    </View>
                    <View className='gap-2.5'>
                        {[0, 1, 2, 3, 4].map(i => (
                            <UpcomingRowSkeleton key={i} />
                        ))}
                    </View>
                </View>

                <SkeletonBlock className='h-14 rounded-2xl' />
            </ScrollView>
        </View>
    )
}

function UpcomingRowSkeleton() {
    return (
        <View className='flex-row items-center gap-3 rounded-2xl border border-[#1F1F22] bg-[#16161A] px-4 py-4'>
            <SkeletonBlock className='h-12 w-12 rounded-2xl' />
            <View className='flex-1 gap-2'>
                <SkeletonBlock className='h-4 w-32 rounded-md' />
                <SkeletonBlock className='h-3 w-20 rounded-full' />
            </View>
            <SkeletonBlock className='h-3 w-16 rounded-full' />
        </View>
    )
}
