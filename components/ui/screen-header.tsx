import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

type Props = {
    title?: string
    subtitle?: string
    onBack?: () => void
    /** Hide the back affordance (e.g. for tab roots). */
    hideBack?: boolean
    rightSlot?: React.ReactNode
    leftSlot?: React.ReactNode
}

/**
 * Consistent top header used across non-tab screens. Sits inline with the
 * scrollable content rather than as a fixed nav bar so it scrolls naturally.
 */
export function ScreenHeader({ title, subtitle, onBack, hideBack, rightSlot, leftSlot }: Props) {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) return onBack()
        if (router.canGoBack()) router.back()
    }

    return (
        <View>
            <View className='flex-row items-center justify-between'>
                <View className='flex-row items-center gap-3'>
                    {!hideBack && (
                        <Pressable
                            onPress={handleBack}
                            className='h-10 w-10 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]'
                            style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
                        >
                            <Feather name='arrow-left' size={18} color='#FFFFFF' />
                        </Pressable>
                    )}
                    {leftSlot}
                </View>
                {rightSlot}
            </View>

            {(title || subtitle) && (
                <View className='mt-6'>
                    {title && (
                        <Text className='font-inter-bold text-3xl text-white'>{title}</Text>
                    )}
                    {subtitle && (
                        <Text className='mt-1 font-inter text-sm text-neutral-500'>{subtitle}</Text>
                    )}
                </View>
            )}
        </View>
    )
}
