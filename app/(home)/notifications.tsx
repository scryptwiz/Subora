import { NotificationsPermissionBanner } from '@/components/notifications/notifications-permission-banner'
import { NotificationsPrefsSection } from '@/components/notifications/notifications-prefs-section'
import { usePreferences } from '@/contexts/preferences-context'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const {
        notificationsEnabled,
        reminderOffsets,
        setNotificationsEnabled,
        setReminderOffsets,
        loading,
    } = usePreferences()
    const [saving, setSaving] = useState(false)

    const onToggleMaster = useCallback(
        async (value: boolean) => {
            setSaving(true)
            try {
                await setNotificationsEnabled(value)
            } catch {
                Alert.alert('Could not save', 'Try again in a moment.')
            } finally {
                setSaving(false)
            }
        },
        [setNotificationsEnabled]
    )

    const onChangeOffsets = useCallback(
        async (next: number[]) => {
            setSaving(true)
            try {
                await setReminderOffsets(next)
            } catch {
                Alert.alert('Could not save', 'Try again in a moment.')
            } finally {
                setSaving(false)
            }
        },
        [setReminderOffsets]
    )

    return (
        <View className='flex-1 bg-[#111111]' style={{ paddingTop: insets.top }}>
            <View className='flex-row items-center gap-2 border-b border-[#1F1F22] px-2 py-2'>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole='button'
                    accessibilityLabel='Back'
                    hitSlop={12}
                    className='h-11 w-11 items-center justify-center rounded-full'
                    style={({ pressed }) => (pressed ? { opacity: 0.75 } : undefined)}
                >
                    <Feather name='arrow-left' size={22} color='#FFFFFF' />
                </Pressable>
                <Text className='font-inter-bold text-lg text-white'>Notifications</Text>
            </View>

            <ScrollView
                className='flex-1 px-4 pt-4'
                contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 20 }}
                keyboardShouldPersistTaps='handled'
            >
                <Text className='font-inter text-sm leading-5 text-neutral-400'>
                    Subora reminds you before subscription renewals based on the renewal dates you save. Server
                    reminders run once per day (UTC) and respect your default lead times below (up to three).
                </Text>

                <NotificationsPermissionBanner />

                {loading ? (
                    <Text className='font-inter text-sm text-neutral-500'>Loading preferences…</Text>
                ) : (
                    <NotificationsPrefsSection
                        notificationsEnabled={notificationsEnabled}
                        reminderOffsets={reminderOffsets}
                        saving={saving}
                        onToggleMaster={onToggleMaster}
                        onChangeOffsets={onChangeOffsets}
                    />
                )}
            </ScrollView>
        </View>
    )
}
