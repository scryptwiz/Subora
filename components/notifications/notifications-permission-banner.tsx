import * as Notifications from 'expo-notifications'
import React, { useEffect, useState } from 'react'
import { Platform, Text, View } from 'react-native'

export function NotificationsPermissionBanner() {
    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        if (Platform.OS === 'web') {
            setStatus('unavailable')
            return
        }
        void Notifications.getPermissionsAsync().then(({ status: s }) => setStatus(s))
    }, [])

    if (Platform.OS === 'web') {
        return (
            <View className='rounded-2xl border border-[#27272A] bg-[#16161A] px-4 py-3'>
                <Text className='font-inter text-sm text-neutral-400'>
                    Push notifications are not available on web. Use the iOS or Android app for renewal
                    alerts.
                </Text>
            </View>
        )
    }

    if (status !== 'denied') return null

    return (
        <View className='rounded-2xl border border-amber-900/40 bg-amber-950/30 px-4 py-3'>
            <Text className='font-inter-medium text-sm text-amber-200'>Notifications are off</Text>
            <Text className='mt-1 font-inter text-xs text-amber-200/80'>
                Enable alerts in system Settings so Subora can remind you before renewals.
            </Text>
        </View>
    )
}
