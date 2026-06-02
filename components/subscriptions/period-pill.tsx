import { Feather } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import {
    Modal,
    Platform,
    Pressable,
    Text,
    useWindowDimensions,
    View,
    type View as RNView,
} from 'react-native'

export type Period = 'month' | 'year' | 'all'

const LABELS: Record<Period, string> = {
    month: 'Month',
    year: 'Year',
    all: 'All time',
}

type Props = {
    value: Period
    options?: Period[]
    onChange: (next: Period) => void
}

type Anchor = { x: number; y: number; width: number; height: number }

const MENU_WIDTH = 160
const MENU_GAP = 6

/**
 * Pill-shaped select that opens a small dropdown menu anchored beneath it.
 */
export function PeriodPill({ value, options = ['month', 'year', 'all'], onChange }: Props) {
    const [open, setOpen] = useState(false)
    const [anchor, setAnchor] = useState<Anchor | null>(null)
    const triggerRef = useRef<RNView>(null)
    const { width: windowWidth } = useWindowDimensions()

    const openMenu = () => {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x, y, width, height })
            setOpen(true)
        })
    }

    const handleSelect = (next: Period) => {
        setOpen(false)
        onChange(next)
    }

    return (
        <>
            <Pressable
                ref={triggerRef}
                onPress={openMenu}
                className='flex-row items-center gap-1.5 rounded-full border border-[#27272A] bg-[#16161A] py-2 pl-3.5 pr-3'
                style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                accessibilityRole='button'
                accessibilityLabel={`Period: ${LABELS[value]}`}
            >
                <Text className='font-inter-medium text-sm text-white'>{LABELS[value]}</Text>
                <Feather name='chevron-down' size={14} color='#A3A3A3' />
            </Pressable>

            <Modal
                visible={open}
                transparent
                animationType='fade'
                statusBarTranslucent
                onRequestClose={() => setOpen(false)}
            >
                <Pressable className='flex-1' onPress={() => setOpen(false)}>
                    {anchor ? (
                        <View
                            className='absolute rounded-2xl border border-[#27272A] bg-[#1A1A1F] py-1'
                            style={[
                                {
                                    top: anchor.y + anchor.height + MENU_GAP,
                                    right: Math.max(windowWidth - (anchor.x + anchor.width), 8),
                                    width: MENU_WIDTH,
                                },
                                Platform.select({
                                    ios: {
                                        shadowColor: '#000',
                                        shadowOpacity: 0.45,
                                        shadowRadius: 16,
                                        shadowOffset: { width: 0, height: 8 },
                                    },
                                    android: { elevation: 12 },
                                }),
                            ]}
                        >
                            {options.map(opt => {
                                const active = opt === value
                                return (
                                    <Pressable
                                        key={opt}
                                        onPress={() => handleSelect(opt)}
                                        className='flex-row items-center justify-between px-4 py-2.5'
                                        style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
                                    >
                                        <Text
                                            className={`font-inter-medium text-sm ${active ? 'text-white' : 'text-neutral-400'
                                                }`}
                                        >
                                            {LABELS[opt]}
                                        </Text>
                                        {active ? (
                                            <Feather name='check' size={14} color='#FFFFFF' />
                                        ) : null}
                                    </Pressable>
                                )
                            })}
                        </View>
                    ) : null}
                </Pressable>
            </Modal>
        </>
    )
}
