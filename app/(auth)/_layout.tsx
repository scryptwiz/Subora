import { useAuth } from '@clerk/expo'
import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return null
    }

    if (isSignedIn) {
        return <Redirect href={'/'} />
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name='email-sign-in'
                options={{
                    headerShown: true,
                    headerBackTitle: 'Back',
                    headerTintColor: '#ffffff',
                    headerStyle: { backgroundColor: '#111111' },
                    headerShadowVisible: false,
                    title: '',
                }}
            />
        </Stack>
    )
}