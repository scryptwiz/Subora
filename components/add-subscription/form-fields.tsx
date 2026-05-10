import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

export function FieldLabel({
    icon,
    label,
}: {
    icon: React.ComponentProps<typeof Feather>['name']
    label: string
}) {
    return (
        <View className='flex-row items-center gap-2'>
            <Feather name={icon} size={14} color='#71717A' />
            <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                {label}
            </Text>
        </View>
    )
}

export function DetailRow({
    icon,
    title,
    value,
    onPress,
}: {
    icon: React.ComponentProps<typeof Feather>['name']
    title: string
    value: string
    onPress: () => void
}) {
    return (
        <Pressable
            onPress={onPress}
            className='flex-row items-center gap-3 px-4 py-4'
            style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
        >
            <View className='h-9 w-9 items-center justify-center rounded-xl bg-[#1F1F22]'>
                <Feather name={icon} size={16} color='#FFFFFF' />
            </View>
            <Text className='flex-1 font-inter-medium text-base text-white'>{title}</Text>
            <Text className='font-inter text-sm text-neutral-400'>{value}</Text>
            <Feather name='chevron-right' size={16} color='#52525B' />
        </Pressable>
    )
}

export function RowDivider() {
    return <View className='ml-[64px] h-px bg-[#1F1F22]' />
}
