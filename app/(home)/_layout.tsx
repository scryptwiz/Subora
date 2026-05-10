import { useAuth } from '@clerk/expo'
import { Redirect, Stack } from 'expo-router'
import { PreferencesProvider } from '@/contexts/preferences-context'
import { SubscriptionsProvider } from '@/contexts/subscriptions-context'

export default function Layout() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return null
    }

    if (!isSignedIn) {
        return <Redirect href='/(auth)/sign-in' />
    }

    return (
        <PreferencesProvider>
            <SubscriptionsProvider>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111111' } }}>
                    <Stack.Screen name='(tabs)' />
                    <Stack.Screen
                        name='add-subscription'
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_bottom',
                            contentStyle: { backgroundColor: '#111111' },
                        }}
                    />
                </Stack>
            </SubscriptionsProvider>
        </PreferencesProvider>
    )
}
