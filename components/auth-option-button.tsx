import { FontAwesome } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'

type AuthOptionButtonProps = {
    label: string
    iconName: React.ComponentProps<typeof FontAwesome>['name']
    iconSize?: number
    onPress: () => void
    disabled?: boolean
    loading?: boolean
}

export function AuthOptionButton({
    label,
    iconName,
    iconSize = 20,
    onPress,
    disabled = false,
    loading = false,
}: AuthOptionButtonProps) {
    return (
        <Pressable
            className='h-16 flex-row items-center justify-center gap-3 rounded-2xl border border-[#27272A] bg-[#14141A]'
            style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
            onPress={onPress}
            disabled={disabled}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <>
                    <FontAwesome name={iconName} size={iconSize} color="#FFFFFF" />
                    <Text className='font-inter-medium text-xl text-white'>{label}</Text>
                </>
            )}
        </Pressable>
    )
}
