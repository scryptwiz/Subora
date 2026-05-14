import { formatCurrency } from '@/lib/subscriptions'
import React from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'

type SaveSubscriptionButtonProps = {
    isValid: boolean
    saving: boolean
    isEditing: boolean
    priceNumber: number
    currency: string
    cycle: string
    onPress: () => void
}

export function SaveSubscriptionButton({
    isValid,
    saving,
    isEditing,
    priceNumber,
    currency,
    cycle,
    onPress,
}: SaveSubscriptionButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={!isValid || saving}
            className={`h-16 items-center justify-center rounded-2xl ${isValid && !saving ? 'bg-white' : 'bg-white/20'}`}
            style={({ pressed }) => (pressed && isValid && !saving ? { opacity: 0.85 } : undefined)}
        >
            {saving ? (
                <ActivityIndicator color='#111111' />
            ) : (
                <Text className={`font-inter-medium text-lg ${isValid ? 'text-[#111111]' : 'text-neutral-500'}`}>
                    {isValid
                        ? isEditing
                            ? `Save · ${formatCurrency(priceNumber, currency)} / ${cycle}`
                            : `Add ${formatCurrency(priceNumber, currency)} / ${cycle}`
                        : isEditing
                          ? 'Save changes'
                          : 'Add subscription'}
                </Text>
            )}
        </Pressable>
    )
}
