import { usePreferences } from '@/contexts/preferences-context'
import { syncLocalRenewalNotifications } from '@/lib/local-renewal-notifications'
import type { Subscription } from '@/lib/subscriptions'
import { useEffect } from 'react'

/**
 * Keeps scheduled local renewal notifications aligned with Supabase subscription rows and user prefs.
 */
export function useSyncLocalRenewalNotifications(
    configured: boolean,
    subscriptions: Subscription[]
): void {
    const { notificationsEnabled, reminderOffsets } = usePreferences()

    useEffect(() => {
        if (!configured) return
        void syncLocalRenewalNotifications(subscriptions, {
            enabled: notificationsEnabled,
            reminderOffsets,
        })
    }, [configured, subscriptions, notificationsEnabled, reminderOffsets])
}
