import { EMOJI_CATEGORIES, type EmojiCategory } from '@/constants/emoji-categories'
import { Feather } from '@expo/vector-icons'
import React, { useMemo, useState } from 'react'
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
    visible: boolean
    selected?: string
    onClose: () => void
    onSelect: (emoji: string) => void
    onClear?: () => void
}

const COLUMNS = 6

export function EmojiPickerModal({ visible, selected, onClose, onSelect, onClear }: Props) {
    const insets = useSafeAreaInsets()
    const { height } = useWindowDimensions()
    const [activeId, setActiveId] = useState<string>(EMOJI_CATEGORIES[0]?.id ?? 'media')

    const active: EmojiCategory =
        useMemo(
            () => EMOJI_CATEGORIES.find(c => c.id === activeId) ?? EMOJI_CATEGORIES[0]!,
            [activeId]
        )

    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
            <Pressable
                accessibilityRole='button'
                accessibilityLabel='Dismiss'
                className='flex-1 justify-end bg-black/60'
                onPress={onClose}
            >
                <Pressable
                    className='rounded-t-3xl border border-[#27272A] bg-[#16161A]'
                    style={{ paddingBottom: insets.bottom + 16, maxHeight: height * 0.78 }}
                    onPress={e => e.stopPropagation()}
                >
                    <View className='flex-row items-center justify-between border-b border-[#1F1F22] px-5 py-4'>
                        <Text className='font-inter-bold text-lg text-white'>Choose an emoji</Text>
                        <View className='flex-row items-center gap-2'>
                            {selected && onClear ? (
                                <Pressable
                                    accessibilityRole='button'
                                    accessibilityLabel='Remove emoji'
                                    onPress={() => {
                                        onClear()
                                        onClose()
                                    }}
                                    hitSlop={8}
                                    className='rounded-full bg-[#1F1F22] px-3 py-1.5'
                                >
                                    <Text className='font-inter-medium text-xs text-neutral-300'>Remove</Text>
                                </Pressable>
                            ) : null}
                            <Pressable
                                accessibilityRole='button'
                                accessibilityLabel='Close'
                                hitSlop={12}
                                onPress={onClose}
                                className='h-10 w-10 items-center justify-center rounded-full bg-[#1F1F22]'
                            >
                                <Feather name='x' size={18} color='#FFFFFF' />
                            </Pressable>
                        </View>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, gap: 8 }}
                    >
                        {EMOJI_CATEGORIES.map(c => {
                            const isActive = c.id === activeId
                            return (
                                <Pressable
                                    key={c.id}
                                    onPress={() => setActiveId(c.id)}
                                    className={`rounded-full px-3 py-1.5 ${
                                        isActive ? 'bg-white' : 'bg-[#1F1F22]'
                                    }`}
                                    style={({ pressed }) =>
                                        pressed && !isActive ? { opacity: 0.85 } : undefined
                                    }
                                >
                                    <Text
                                        className={`font-inter-medium text-xs ${
                                            isActive ? 'text-[#111111]' : 'text-neutral-300'
                                        }`}
                                    >
                                        {c.label}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>

                    <ScrollView
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 12,
                            paddingTop: 12,
                            paddingBottom: 16,
                        }}
                    >
                        <View className='flex-row flex-wrap'>
                            {active.emojis.map((e, idx) => {
                                const isSelected = selected === e
                                return (
                                    <Pressable
                                        key={`${active.id}-${idx}-${e}`}
                                        accessibilityRole='button'
                                        accessibilityLabel={`Pick emoji ${e}`}
                                        onPress={() => {
                                            onSelect(e)
                                            onClose()
                                        }}
                                        style={{ width: `${100 / COLUMNS}%` }}
                                        className='items-center justify-center py-2'
                                    >
                                        <View
                                            className={`h-12 w-12 items-center justify-center rounded-2xl ${
                                                isSelected
                                                    ? 'border border-white bg-white/15'
                                                    : 'bg-[#111111]'
                                            }`}
                                        >
                                            <Text style={{ fontSize: 26, lineHeight: 32 }}>{e}</Text>
                                        </View>
                                    </Pressable>
                                )
                            })}
                        </View>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    )
}
