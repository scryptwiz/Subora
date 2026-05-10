import { SubscriptionLogo } from '@/components/subscriptions/subscription-logo'
import type { BrandPreset } from '@/lib/brand-presets'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

type Props = {
    suggestions: BrandPreset[]
    onSelect: (preset: BrandPreset) => void
    show: boolean
}

export function PresetChips({ suggestions, onSelect, show }: Props) {
    if (!show || suggestions.length === 0) return null

    return (
        <View className='gap-2'>
            <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                Suggestions
            </Text>
            <View className='flex-row flex-wrap gap-2'>
                {suggestions.map(preset => (
                    <Pressable
                        key={`${preset.name}-${preset.domain}`}
                        onPress={() => onSelect(preset)}
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
                        <Text className='font-inter-medium text-sm text-white'>{preset.name}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    )
}
