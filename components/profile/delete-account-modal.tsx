import { Feather } from '@expo/vector-icons'
import React, { useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CONFIRM_PHRASE = 'DELETE'

const ERASURE_BULLETS = [
    'All subscriptions and renewal history',
    'Your currency preference and settings',
    'Your name, photo and sign-in identity',
]

type Props = {
    visible: boolean
    email?: string
    deleting: boolean
    error?: string | null
    onClose: () => void
    onConfirm: () => void
}

export function DeleteAccountModal({
    visible,
    email,
    deleting,
    error,
    onClose,
    onConfirm,
}: Props) {
    const insets = useSafeAreaInsets()
    const [phrase, setPhrase] = useState('')

    useEffect(() => {
        if (!visible) setPhrase('')
    }, [visible])

    const matches = useMemo(() => phrase.trim().toUpperCase() === CONFIRM_PHRASE, [phrase])
    const canConfirm = matches && !deleting

    return (
        <Modal
            visible={visible}
            animationType='slide'
            presentationStyle='pageSheet'
            onRequestClose={deleting ? undefined : onClose}
        >
            <KeyboardAvoidingView
                className='flex-1 bg-[#111111]'
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View
                    className='flex-row items-center justify-between border-b border-[#1F1F22] px-4 py-3'
                    style={{ paddingTop: (Platform.OS === 'ios' ? 0 : insets.top) + 24 }}
                >
                    <Pressable
                        hitSlop={12}
                        onPress={onClose}
                        disabled={deleting}
                        accessibilityLabel='Close'
                    >
                        <Text
                            className={`font-inter-medium text-base ${deleting ? 'text-neutral-700' : 'text-neutral-400'}`}
                        >
                            Cancel
                        </Text>
                    </Pressable>
                    <Text className='font-inter-medium text-base text-white'>Delete account</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView
                    className='flex-1 px-5'
                    keyboardShouldPersistTaps='handled'
                    contentContainerStyle={{
                        paddingTop: 24,
                        paddingBottom: insets.bottom + 24,
                        gap: 24,
                    }}
                >
                    <View className='items-center gap-4'>
                        <View className='h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10'>
                            <Feather name='alert-triangle' size={26} color='#F87171' />
                        </View>
                        <Text className='text-center font-inter-bold text-2xl text-white'>
                            This is permanent
                        </Text>
                        <Text className='text-center font-inter text-sm  leading-5 text-neutral-400'>
                            Deleting your account is irreversible. We cannot recover your data after
                            this. {email ? `\nSigned in as ${email}.` : ''}
                        </Text>
                    </View>

                    <View className='gap-3 rounded-2xl border border-[#1F1F22] bg-[#16161A] p-4'>
                        <Text className='font-inter-medium text-sm text-white'>
                            What gets erased
                        </Text>
                        <View className='gap-2'>
                            {ERASURE_BULLETS.map(b => (
                                <View key={b} className='flex-row items-start gap-3'>
                                    <View className='mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400' />
                                    <Text className='flex-1 font-inter text-sm text-neutral-300'>
                                        {b}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className='gap-2'>
                        <Text className='px-1 font-inter text-sm tracking-wider text-neutral-500'>
                            Type{' '}
                            <Text className='font-inter-bold text-white uppercase'>{CONFIRM_PHRASE}</Text>
                            {' '}to confirm
                        </Text>
                        <TextInput
                            value={phrase}
                            onChangeText={setPhrase}
                            placeholder={CONFIRM_PHRASE}
                            placeholderTextColor='#52525B'
                            autoCapitalize='characters'
                            autoCorrect={false}
                            editable={!deleting}
                            className={`h-14 rounded-2xl border px-4 font-inter-medium text-base text-white ${matches
                                    ? 'border-red-500/60 bg-red-500/10'
                                    : 'border-[#27272A] bg-[#16161A]'
                                }`}
                        />
                    </View>

                    {error ? (
                        <View className='rounded-2xl border border-red-500/40 bg-red-500/10 p-3'>
                            <Text className='font-inter text-xs text-red-300'>{error}</Text>
                        </View>
                    ) : null}

                    <Pressable
                        accessibilityRole='button'
                        accessibilityLabel='Delete my account'
                        onPress={onConfirm}
                        disabled={!canConfirm}
                        className={`h-16 items-center justify-center rounded-2xl ${canConfirm ? 'bg-red-500' : 'bg-red-500/20'
                            }`}
                        style={({ pressed }) =>
                            pressed && canConfirm ? { opacity: 0.85 } : undefined
                        }
                    >
                        {deleting ? (
                            <ActivityIndicator color='#FFFFFF' />
                        ) : (
                            <Text
                                className={`font-inter-bold text-base ${canConfirm ? 'text-white' : 'text-red-200/60'
                                    }`}
                            >
                                Delete my account
                            </Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    )
}
