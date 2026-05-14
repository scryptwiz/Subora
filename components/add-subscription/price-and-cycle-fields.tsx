import { FieldLabel } from '@/components/add-subscription/form-fields'
import { BILLING_CYCLES } from '@/constants/add-subscription-cycles'
import { formatCurrencySymbol, SUPPORTED_CURRENCIES } from '@/constants/currencies'
import type { BillingCycle } from '@/lib/subscriptions'
import React, { forwardRef } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'

type Props = {
    price: string
    onPriceChange: (v: string) => void
    cycle: BillingCycle
    onCycleChange: (c: BillingCycle) => void
    currency: string
    onCurrencyChange: (code: string) => void
}

export const PriceAndCycleFields = forwardRef<TextInput, Props>(
    ({ price, onPriceChange, cycle, onCycleChange, currency, onCurrencyChange }, ref) => {
        const symbol = formatCurrencySymbol(currency)
        return (
            <View className='gap-3'>
                <FieldLabel icon='dollar-sign' label='Price' />
                <View className='flex-row items-stretch gap-3'>
                    <View className='min-w-[52px] max-w-[72px] items-center justify-center rounded-2xl border border-[#27272A] bg-[#16161A] px-1'>
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.65}
                            className='font-inter-medium text-base text-neutral-300'
                        >
                            {symbol}
                        </Text>
                    </View>
                    <TextInput
                        ref={ref}
                        value={price}
                        onChangeText={onPriceChange}
                        placeholder='0.00'
                        placeholderTextColor='#52525B'
                        keyboardType='decimal-pad'
                        className='flex-1 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 py-3.5 font-inter-bold text-2xl leading-7 text-white'
                    />
                </View>

                <Text className='font-inter text-xs text-neutral-500'>Billing currency</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                    contentContainerStyle={{ gap: 8 }}
                >
                    {SUPPORTED_CURRENCIES.map(opt => {
                        const active = opt.code === currency
                        return (
                            <Pressable
                                key={opt.code}
                                onPress={() => onCurrencyChange(opt.code)}
                                className={`rounded-2xl border px-3 py-2 ${
                                    active ? 'border-white bg-white' : 'border-[#27272A] bg-[#16161A]'
                                }`}
                                style={({ pressed }) =>
                                    pressed && !active ? { opacity: 0.85 } : undefined
                                }
                            >
                                <Text
                                    className={`font-inter-medium text-xs ${active ? 'text-[#111111]' : 'text-neutral-300'
                                        }`}
                                >
                                    {opt.code}
                                </Text>
                            </Pressable>
                        )
                    })}
                </ScrollView>

                <View className='flex-row gap-2'>
                    {BILLING_CYCLES.map(c => {
                        const active = c.id === cycle
                        return (
                            <Pressable
                                key={c.id}
                                onPress={() => onCycleChange(c.id)}
                                className={`flex-1 items-center rounded-2xl border py-3 ${active ? 'border-white bg-white' : 'border-[#27272A] bg-[#16161A]'
                                    }`}
                                style={({ pressed }) =>
                                    pressed && !active ? { opacity: 0.85 } : undefined
                                }
                            >
                                <Text
                                    className={`font-inter-medium text-sm ${active ? 'text-[#111111]' : 'text-neutral-300'
                                        }`}
                                >
                                    {c.label}
                                </Text>
                            </Pressable>
                        )
                    })}
                </View>
            </View>
        )
    }
)

PriceAndCycleFields.displayName = 'PriceAndCycleFields'
