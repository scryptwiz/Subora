import React from 'react'
import { Pressable, Text, View } from 'react-native'

const REMINDER_OPTIONS = [
    { label: 'Same day', value: 0 },
    { label: '2 days before', value: 2 },
    { label: '5 days before', value: 5 },
] as const

type ReminderOffsetChipsProps = {
    reminderOffsets: number[]
    onChange: React.Dispatch<React.SetStateAction<number[]>>
}

export function ReminderOffsetChips({ reminderOffsets, onChange }: ReminderOffsetChipsProps) {
    return (
        <View className='px-4 py-3 gap-2'>
            <Text className='font-inter text-xs uppercase tracking-wider text-neutral-500'>
                Reminders (up to 3)
            </Text>
            <View className='flex-row flex-wrap gap-2'>
                {REMINDER_OPTIONS.map(opt => {
                    const active = reminderOffsets.includes(opt.value)
                    const disabled = !active && reminderOffsets.length >= 3
                    return (
                        <Pressable
                            key={opt.value}
                            onPress={() =>
                                onChange(prev =>
                                    active ? prev.filter(v => v !== opt.value) : [...prev, opt.value].slice(0, 3)
                                )
                            }
                            disabled={disabled}
                            className={`rounded-full border px-3 py-1 ${
                                active ? 'border-white bg-white' : 'border-[#27272A] bg-[#16161A]'
                            }`}
                        >
                            <Text
                                className={`font-inter text-xs ${
                                    active ? 'text-[#111111]' : disabled ? 'text-neutral-600' : 'text-white'
                                }`}
                            >
                                {opt.label}
                            </Text>
                        </Pressable>
                    )
                })}
            </View>
        </View>
    )
}
