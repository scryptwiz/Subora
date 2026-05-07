import React from 'react'
import { Text, View } from 'react-native'

export type ChartBar = {
    label: string
    value: number
    /** When true, this bar is highlighted with the accent fill. */
    active?: boolean
}

type Props = {
    bars: ChartBar[]
    height?: number
}

/**
 * Lightweight vertical bar chart implemented with plain views — no chart
 * library required. Tuned for the dashboard's "spending over time" panel.
 */
export function SpendingChart({ bars, height = 120 }: Props) {
    const max = Math.max(...bars.map(b => b.value), 1)

    return (
        <View>
            <View className='flex-row items-end justify-between gap-2' style={{ height }}>
                {bars.map(bar => {
                    const ratio = bar.value / max
                    const barHeight = Math.max(ratio * height, 8)
                    return (
                        <View key={bar.label} className='flex-1 items-center'>
                            <View
                                className={`w-full rounded-md ${bar.active
                                    ? 'border border-lime-400/60 bg-lime-400/20'
                                    : 'border border-[#27272A] bg-[#1A1A1F]'
                                    }`}
                                style={{ height: barHeight }}
                            />
                        </View>
                    )
                })}
            </View>
            <View className='mt-3 flex-row justify-between'>
                {bars.map(bar => (
                    <View key={`${bar.label}-label`} className='flex-1 items-center'>
                        <Text
                            className={`text-xs font-inter ${bar.active ? 'text-white' : 'text-neutral-500'
                                }`}
                        >
                            {bar.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    )
}
