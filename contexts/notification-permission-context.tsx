import * as Notifications from 'expo-notifications'
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { AppState, Linking, Platform } from 'react-native'

export type OsNotificationPermission = 'undetermined' | 'denied' | 'granted'

type NotificationPermissionContextValue = {
    /** System notification permission; null until first read completes. */
    permissionStatus: OsNotificationPermission | null
    /** True when OS permission is not granted (show profile tab badge). Web is always false. */
    showEnableNotificationsCue: boolean
    refresh: () => Promise<void>
    /** Ask OS again (no-op if already denied until user changes Settings). */
    requestPermission: () => Promise<OsNotificationPermission>
    openSystemSettings: () => void
}

const NotificationPermissionContext = createContext<NotificationPermissionContextValue | null>(null)

export function NotificationPermissionProvider({ children }: { children: ReactNode }) {
    const [permissionStatus, setPermissionStatus] = useState<OsNotificationPermission | null>(null)

    const refresh = useCallback(async () => {
        if (Platform.OS === 'web') {
            setPermissionStatus('granted')
            return
        }
        const { status } = await Notifications.getPermissionsAsync()
        setPermissionStatus(status as OsNotificationPermission)
    }, [])

    useEffect(() => {
        if (Platform.OS === 'web') {
            setPermissionStatus('granted')
            return
        }

        let cancelled = false

        void (async () => {
            const { status } = await Notifications.getPermissionsAsync()
            if (cancelled) return

            if (status === 'undetermined') {
                const { status: next } = await Notifications.requestPermissionsAsync()
                if (!cancelled) setPermissionStatus(next as OsNotificationPermission)
            } else if (!cancelled) {
                setPermissionStatus(status as OsNotificationPermission)
            }
        })()

        const sub = AppState.addEventListener('change', s => {
            if (s === 'active') void refresh()
        })

        return () => {
            cancelled = true
            sub.remove()
        }
    }, [refresh])

    const requestPermission = useCallback(async () => {
        if (Platform.OS === 'web') return 'granted' as OsNotificationPermission
        const { status } = await Notifications.requestPermissionsAsync()
        setPermissionStatus(status as OsNotificationPermission)
        return status as OsNotificationPermission
    }, [])

    const openSystemSettings = useCallback(() => {
        void Linking.openSettings()
    }, [])

    const showEnableNotificationsCue =
        Platform.OS !== 'web' && permissionStatus !== null && permissionStatus !== 'granted'

    const value = useMemo(
        () => ({
            permissionStatus,
            showEnableNotificationsCue,
            refresh,
            requestPermission,
            openSystemSettings,
        }),
        [permissionStatus, showEnableNotificationsCue, refresh, requestPermission, openSystemSettings]
    )

    return (
        <NotificationPermissionContext.Provider value={value}>
            {children}
        </NotificationPermissionContext.Provider>
    )
}

export function useNotificationPermission(): NotificationPermissionContextValue {
    const ctx = useContext(NotificationPermissionContext)
    if (!ctx) {
        throw new Error('useNotificationPermission must be used within NotificationPermissionProvider.')
    }
    return ctx
}
