import React from 'react'
import { Text, View } from 'react-native'

type Props = {
    label: string
    value: string
    caption?: string
    accent?: 'default' | 'highlight'
}

export function StatCard({ label, value, caption, accent = 'default' }: Props) {
    const isHighlight = accent === 'highlight'
    return (
        <View
            className={`flex-1 rounded-2xl border px-4 py-4 ${isHighlight
                ? 'border-lime-400/40 bg-lime-400/10'
                : 'border-[#1F1F22] bg-[#16161A]'
                }`}
        >
            <Text className={`font-inter text-xs uppercase tracking-wider ${isHighlight ? 'text-lime-300' : 'text-neutral-500'}`}>
                {label}
            </Text>
            <Text className='mt-2 font-inter-bold text-2xl text-white'>{value}</Text>
            {caption ? (
                <Text className='mt-1 font-inter text-xs text-neutral-500'>{caption}</Text>
            ) : null}
        </View>
    )
}
