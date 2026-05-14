import { useNotificationPermission } from '@/contexts/notification-permission-context'
import { isSupabaseConfigured, useSupabase } from '@/hooks/use-supabase'
import { useAuth } from '@clerk/expo'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
})

function platformLabel(): 'ios' | 'android' | 'web' | 'unknown' {
    if (Platform.OS === 'ios') return 'ios'
    if (Platform.OS === 'android') return 'android'
    if (Platform.OS === 'web') return 'web'
    return 'unknown'
}

/**
 * Registers for push notifications and stores the Expo push token in Supabase (RLS).
 */
export function usePushRegistration(): void {
    const supabase = useSupabase()
    const { userId, isLoaded } = useAuth()
    const { permissionStatus } = useNotificationPermission()
    const configured = isSupabaseConfigured()
    const lastTokenRef = useRef<string | null>(null)

    useEffect(() => {
        if (!isLoaded || !configured || !supabase || !userId) return
        if (Platform.OS === 'web') return
        if (permissionStatus !== 'granted') return

        let cancelled = false

        void (async () => {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined
            if (!projectId) return

            const tokenRes = await Notifications.getExpoPushTokenAsync({ projectId })
            if (cancelled) return

            const expoPushToken = tokenRes.data
            if (!expoPushToken || lastTokenRef.current === expoPushToken) return
            lastTokenRef.current = expoPushToken

            const { error } = await supabase.from('push_tokens').upsert(
                {
                    user_id: userId,
                    expo_push_token: expoPushToken,
                    platform: platformLabel(),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,expo_push_token' }
            )

            if (error) {
                lastTokenRef.current = null
            }
        })()

        return () => {
            cancelled = true
        }
    }, [isLoaded, configured, supabase, userId, permissionStatus])
}
