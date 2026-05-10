import { SubscriptionLogo } from '@/components/subscriptions/subscription-logo'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

type Props = {
    name: string
    effectiveDomain?: string
    iconSlug?: string
    brandColor?: string
    emoji?: string
    onPressLogo?: () => void
}

export function BrandPreviewCard({
    name,
    effectiveDomain,
    iconSlug,
    brandColor,
    emoji,
    onPressLogo,
}: Props) {
    const subtitle = emoji
        ? 'Custom emoji'
        : effectiveDomain ?? 'Tap the icon to pick an emoji'

    return (
        <View className='items-center gap-4 rounded-3xl border border-[#1F1F22] bg-[#16161A] p-6'>
            <Pressable
                accessibilityRole='button'
                accessibilityLabel='Change icon'
                onPress={onPressLogo}
                disabled={!onPressLogo}
                hitSlop={8}
                style={({ pressed }) => (pressed && onPressLogo ? { opacity: 0.85 } : undefined)}
            >
                <View>
                    <SubscriptionLogo
                        name={name || 'New service'}
                        domain={effectiveDomain}
                        iconSlug={iconSlug}
                        emoji={emoji}
                        tint={brandColor}
                        size={84}
                    />
                    {onPressLogo ? (
                        <View className='absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full border border-[#16161A] bg-white'>
                            <Feather name='edit-2' size={12} color='#111111' />
                        </View>
                    ) : null}
                </View>
            </Pressable>
            <View className='items-center'>
                <Text className='font-inter-bold text-xl text-white'>
                    {name.trim() || 'Service name'}
                </Text>
                <Text className='mt-1 font-inter text-xs text-neutral-500'>{subtitle}</Text>
            </View>
        </View>
    )
}
