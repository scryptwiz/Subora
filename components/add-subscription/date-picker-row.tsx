import { Feather } from '@expo/vector-icons'
import DateTimePicker, {
    DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import React, { useState } from 'react'
import { Modal, Platform, Pressable, Text, View } from 'react-native'
import { DetailRow } from './form-fields'

type Props = {
    icon: React.ComponentProps<typeof Feather>['name']
    title: string
    value: Date
    onChange: (date: Date) => void
    formatValue: (date: Date) => string
    minimumDate?: Date
    maximumDate?: Date
}

/**
 * Native date picker styled to match the billing details rows. Android uses
 * the imperative OS dialog. iOS uses a custom slide-up sheet implemented as a
 * full-screen <Modal presentationStyle='overFullScreen'> so it stacks above
 * the Expo Router modal screen this component is rendered inside.
 */
export function DatePickerRow({
    icon,
    title,
    value,
    onChange,
    formatValue,
    minimumDate,
    maximumDate,
}: Props) {
    const [iosOpen, setIosOpen] = useState(false)
    const [draft, setDraft] = useState<Date>(value)

    const openPicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value,
                mode: 'date',
                minimumDate,
                maximumDate,
                onChange: (event, selected) => {
                    if (event.type === 'set' && selected) {
                        onChange(selected)
                    }
                },
            })
            return
        }

        setDraft(value)
        setIosOpen(true)
    }

    const confirm = () => {
        onChange(draft)
        setIosOpen(false)
    }

    return (
        <>
            <DetailRow
                icon={icon}
                title={title}
                value={formatValue(value)}
                onPress={openPicker}
            />

            <Modal
                visible={iosOpen}
                transparent
                animationType='fade'
                presentationStyle='overFullScreen'
                statusBarTranslucent
                onRequestClose={() => setIosOpen(false)}
            >
                <View className='flex-1 justify-end'>
                    <Pressable
                        className='absolute inset-0 bg-black/55'
                        onPress={() => setIosOpen(false)}
                    />
                    <View className='border-t border-[#27272A] bg-[#16161A] pb-8 pt-3'>
                        <View className='flex-row items-center justify-between px-5 pb-2'>
                            <Pressable hitSlop={8} onPress={() => setIosOpen(false)}>
                                <Text className='font-inter-medium text-sm text-neutral-400'>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Text className='font-inter-medium text-sm text-white'>
                                {title}
                            </Text>
                            <Pressable hitSlop={8} onPress={confirm}>
                                <Text className='font-inter-medium text-sm text-lime-400'>
                                    Done
                                </Text>
                            </Pressable>
                        </View>
                        <DateTimePicker
                            value={draft}
                            mode='date'
                            display='spinner'
                            themeVariant='dark'
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                            onChange={(_, selected) => {
                                if (selected) setDraft(selected)
                            }}
                            className='bg-[#16161A]'
                        />
                    </View>
                </View>
            </Modal>
        </>
    )
}
