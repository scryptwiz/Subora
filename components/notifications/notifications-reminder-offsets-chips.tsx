import React from 'react'
import { Pressable, Text, View } from 'react-native'

const OPTIONS = [
    { label: 'Same day', value: 0 },
    { label: '1 day', value: 1 },
    { label: '2 days', value: 2 },
    { label: '3 days', value: 3 },
    { label: '5 days', value: 5 },
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
] as const

type Props = {
    selected: number[]
    disabled?: boolean
    onChange: (next: number[]) => void
}

export function NotificationsReminderOffsetsChips({ selected, disabled, onChange }: Props) {
    return (
        <View className='flex-row flex-wrap gap-2'>
            {OPTIONS.map(opt => {
                const active = selected.includes(opt.value)
                const chipDisabled = disabled || (!active && selected.length >= 3)
                return (
                    <Pressable
                        key={opt.value}
                        onPress={() =>
                            onChange(
                                active ? selected.filter(v => v !== opt.value) : [...selected, opt.value].slice(0, 3)
                            )
                        }
                        disabled={chipDisabled}
                        className={`rounded-full border px-3 py-1.5 ${
                            active ? 'border-white bg-white' : 'border-[#27272A] bg-[#1F1F22]'
                        }`}
                    >
                        <Text
                            className={`font-inter text-xs ${
                                active ? 'text-[#111111]' : chipDisabled ? 'text-neutral-600' : 'text-white'
                            }`}
                        >
                            {opt.label}
                        </Text>
                    </Pressable>
                )
            })}
        </View>
    )
}
