import { SUPPORTED_CURRENCIES } from '@/constants/currencies'
import { Feather } from '@expo/vector-icons'
import React from 'react'
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
    selectedCode: string
    onClose: () => void
    onSelect: (code: string) => void
}

export function CurrencyPickerModal({ visible, selectedCode, onClose, onSelect }: Props) {
    const insets = useSafeAreaInsets()
    const { height } = useWindowDimensions()

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
                    style={{
                        paddingBottom: insets.bottom + 16,
                        maxHeight: height * 0.72,
                    }}
                    onPress={e => e.stopPropagation()}
                >
                    <View className='flex-row items-center justify-between border-b border-[#1F1F22] px-5 py-4'>
                        <Text className='font-inter-bold text-lg text-white'>Display currency</Text>
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
                    <ScrollView
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}
                    >
                        {SUPPORTED_CURRENCIES.map(c => {
                            const active = c.code === selectedCode
                            return (
                                <Pressable
                                    key={c.code}
                                    accessibilityRole='button'
                                    accessibilityState={{ selected: active }}
                                    onPress={() => {
                                        onSelect(c.code)
                                        onClose()
                                    }}
                                    className={`mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                                        active ? 'border-white bg-white/10' : 'border-[#27272A] bg-[#111111]'
                                    }`}
                                    style={({ pressed }) =>
                                        pressed && !active ? { opacity: 0.85 } : undefined
                                    }
                                >
                                    <View>
                                        <Text className='font-inter-medium text-base text-white'>
                                            {c.code}
                                        </Text>
                                        <Text className='mt-0.5 font-inter text-xs text-neutral-500'>
                                            {c.label}
                                        </Text>
                                    </View>
                                    {active ? (
                                        <Feather name='check' size={20} color='#FFFFFF' />
                                    ) : null}
                                </Pressable>
                            )
                        })}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    )
}
