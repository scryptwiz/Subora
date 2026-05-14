import { useNotificationPermission } from '@/contexts/notification-permission-context'
import { usePreferences } from '@/contexts/preferences-context'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native'

export function ReminderNotificationsNudge() {
    const router = useRouter()
    const { notificationsEnabled, loading: prefsLoading } = usePreferences()
    const {
        permissionStatus,
        refresh,
        requestPermission,
        openSystemSettings,
        showEnableNotificationsCue,
    } = useNotificationPermission()
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        void refresh()
    }, [refresh])

    if (Platform.OS === 'web') return null

    const showPrefsNudge =
        !prefsLoading && !notificationsEnabled && permissionStatus === 'granted'

    if (!showEnableNotificationsCue && !showPrefsNudge) return null

    const onOsPrimary = async () => {
        setBusy(true)
        try {
            if (permissionStatus === 'denied') openSystemSettings()
            else await requestPermission()
        } finally {
            setBusy(false)
        }
    }

    const osLabel = permissionStatus === 'denied' ? 'Open Settings' : 'Allow'

    return (
        <View className='gap-2 border-t border-[#27272A] px-4 py-3'>
            {showEnableNotificationsCue ? (
                <View className='flex-row items-start gap-2'>
                    <Feather name='bell-off' size={16} color='#FBBF24' style={{ marginTop: 2 }} />
                    <View className='min-w-0 flex-1'>
                        <Text className='font-inter-medium text-xs text-amber-200'>
                            Turn on notifications
                        </Text>
                        <Text className='mt-0.5 font-inter text-[11px] leading-4 text-amber-200/75'>
                            {permissionStatus === 'denied'
                                ? 'Enable alerts in system Settings so renewal reminders can reach this device.'
                                : 'Allow alerts so we can remind you before renewals.'}
                        </Text>
                        <Pressable
                            onPress={() => void onOsPrimary()}
                            disabled={busy}
                            className='mt-2 self-start rounded-lg bg-amber-500/20 px-3 py-1.5'
                            accessibilityRole='button'
                            accessibilityLabel={osLabel}
                        >
                            {busy ? (
                                <ActivityIndicator color='#FBBF24' size='small' />
                            ) : (
                                <Text className='font-inter-medium text-xs text-amber-100'>{osLabel}</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            ) : null}
            {showPrefsNudge ? (
                <Pressable
                    onPress={() => router.push('/(home)/notifications')}
                    className='flex-row items-start gap-2 rounded-xl bg-[#1F1F22] px-3 py-2.5'
                    accessibilityRole='button'
                    accessibilityLabel='Open notification settings'
                >
                    <Feather name='settings' size={16} color='#A1A1AA' style={{ marginTop: 2 }} />
                    <View className='min-w-0 flex-1'>
                        <Text className='font-inter-medium text-xs text-neutral-200'>
                            Renewal alerts are off in Subora
                        </Text>
                        <Text className='mt-0.5 font-inter text-[11px] leading-4 text-neutral-500'>
                            Tap to open Notifications and turn renewal reminders on.
                        </Text>
                    </View>
                    <Feather name='chevron-right' size={16} color='#71717A' style={{ marginTop: 2 }} />
                </Pressable>
            ) : null}
        </View>
    )
}
