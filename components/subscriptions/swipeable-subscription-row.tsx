import type { Subscription } from '@/lib/subscriptions'
import { Feather } from '@expo/vector-icons'
import React, { useRef } from 'react'
import { Pressable, View } from 'react-native'
import ReanimatedSwipeable, {
    type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable'
import { SubscriptionRow } from './subscription-row'

type Variant = 'history' | 'list'

type Props = {
    subscription: Subscription
    variant?: Variant
    onPress: () => void
    onToggleActive?: (next: boolean) => void
    onDelete: () => void
}

const ACTION_WIDTH = 64

export function SwipeableSubscriptionRow({
    subscription,
    variant = 'list',
    onPress,
    onToggleActive,
    onDelete,
}: Props) {
    const ref = useRef<SwipeableMethods | null>(null)

    const close = () => ref.current?.close()

    const renderRightActions = () => (
        <View className='flex-row items-stretch pl-2'>
            <ActionButton
                accessibilityLabel='Delete'
                icon='trash-2'
                onPress={() => {
                    close()
                    onDelete()
                }}
            />
        </View>
    )

    return (
        <ReanimatedSwipeable
            ref={ref}
            friction={1.6}
            rightThreshold={ACTION_WIDTH * 0.6}
            overshootRight={false}
            renderRightActions={renderRightActions}
            containerStyle={{ borderRadius: 16, overflow: 'hidden' }}
        >
            <SubscriptionRow
                subscription={subscription}
                variant={variant}
                onPress={onPress}
                onToggleActive={onToggleActive}
            />
        </ReanimatedSwipeable>
    )
}

function ActionButton({
    accessibilityLabel,
    icon,
    onPress,
}: {
    accessibilityLabel: string
    icon: React.ComponentProps<typeof Feather>['name']
    onPress: () => void
}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole='button'
            accessibilityLabel={accessibilityLabel}
            className='items-center justify-center rounded-2xl bg-red-500 px-5'
            style={({ pressed }) => [
                { width: ACTION_WIDTH },
                pressed ? { opacity: 0.85 } : null,
            ]}
        >
            <Feather name={icon} size={24} color='#FFFFFF' />
        </Pressable>
    )
}
