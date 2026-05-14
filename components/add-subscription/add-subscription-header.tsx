import { Feather } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

type AddSubscriptionHeaderProps = {
    isEditing: boolean
    isValid: boolean
    saving: boolean
    onClose: () => void
    onSave: () => void
}

export function AddSubscriptionHeader({
    isEditing,
    isValid,
    saving,
    onClose,
    onSave,
}: AddSubscriptionHeaderProps) {
    return (
        <View className='flex-row items-center justify-between'>
            <Pressable
                onPress={onClose}
                accessibilityLabel='Close'
                className='h-10 w-10 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]'
                style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
            >
                <Feather name='x' size={18} color='#FFFFFF' />
            </Pressable>
            <Text className='font-inter-medium text-base text-white'>
                {isEditing ? 'Edit subscription' : 'New subscription'}
            </Text>
            <Pressable onPress={onSave} disabled={!isValid || saving} hitSlop={8}>
                {saving ? (
                    <ActivityIndicator color='#FFFFFF' size='small' />
                ) : (
                    <Text className={`font-inter-medium text-sm ${isValid ? 'text-white' : 'text-neutral-600'}`}>
                        Save
                    </Text>
                )}
            </Pressable>
        </View>
    )
}
