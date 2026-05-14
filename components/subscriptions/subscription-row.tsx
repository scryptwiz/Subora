import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Switch, Text, View } from 'react-native'
import { formatCurrency, type Subscription } from '../../lib/subscriptions'
import { SubscriptionLogo } from './subscription-logo'

type Variant = 'history' | 'list'

type Props = {
    subscription: Subscription
    variant?: Variant
    /** When provided, shows a switch for toggling the active state. */
    onToggleActive?: (next: boolean) => void
    onPress?: () => void
    rightLabel?: string
}

function renewalDateLabel(nextRenewalIso: string, billingCycle: Subscription['billingCycle']): string {
    const date = new Date(nextRenewalIso)
    if (Number.isNaN(date.getTime())) return 'No renewal date'
    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        ...(billingCycle === 'year' ? { year: 'numeric' as const } : {}),
    })
    return formatter.format(date)
}

/**
 * A single subscription row used on the dashboard history list and the
 * "all subscriptions" screen.
 */
export function SubscriptionRow({
    subscription,
    variant = 'list',
    onToggleActive,
    onPress,
    rightLabel,
}: Props) {
    const renewalLabel = renewalDateLabel(subscription.nextRenewal, subscription.billingCycle)

    return (
        <Pressable
            onPress={onPress}
            className='flex-row items-center gap-4 rounded-2xl border border-[#1F1F22] bg-[#16161A] px-4 py-4'
            style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
        >
            <SubscriptionLogo
                name={subscription.name}
                domain={subscription.domain}
                iconSlug={subscription.iconSlug}
                emoji={subscription.emoji}
                size={44}
            />

            <View className='flex-1'>
                <Text className='font-inter-medium text-base text-white'>{subscription.name}</Text>
                <Text className='mt-0.5 text-sm text-neutral-500 font-inter'>
                    {subscription.plan ?? 'Standard'}
                </Text>
            </View>

            {variant === 'list' ? (
                <>
                    <View className='items-end'>
                        <Text className='font-inter-bold text-base text-white'>
                            {formatCurrency(subscription.price, subscription.currency)}
                        </Text>
                        <Text className='mt-0.5 font-inter text-xs text-neutral-500'>
                            {renewalLabel}
                        </Text>
                    </View>
                    <View className='ml-3 items-end justify-center'>
                        {onToggleActive ? (
                            <Switch
                                value={subscription.active}
                                onValueChange={onToggleActive}
                                trackColor={{ true: '#A3E635', false: '#27272A' }}
                                thumbColor='#FFFFFF'
                                ios_backgroundColor='#27272A'
                            />
                        ) : (
                            <Feather name='chevron-right' size={18} color='#52525B' />
                        )}
                    </View>
                </>
            ) : (
                <View className='items-end'>
                    <Text className='font-inter-bold text-base text-white'>
                        -{formatCurrency(subscription.price, subscription.currency)}
                    </Text>
                    {rightLabel ? (
                        <Text className='mt-0.5 text-xs text-neutral-500 font-inter'>{rightLabel}</Text>
                    ) : null}
                </View>
            )}
        </Pressable>
    )
}
