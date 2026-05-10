import { SubscriptionLogo } from '@/components/subscriptions/subscription-logo'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
    name: string
    effectiveDomain?: string
    iconSlug?: string
    brandColor?: string
}

export function BrandPreviewCard({ name, effectiveDomain, iconSlug, brandColor }: Props) {
    return (
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
    )
}
