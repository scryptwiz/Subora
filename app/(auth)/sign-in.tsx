import { useSSO } from '@clerk/expo'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { Alert, ImageBackground, Platform, Text, View } from 'react-native'
import { AuthOptionButton } from '../../components/auth-option-button'

WebBrowser.maybeCompleteAuthSession()

export default function SignInPage() {
    const { startSSOFlow } = useSSO()
    const router = useRouter()
    const [loadingProvider, setLoadingProvider] = React.useState<'oauth_google' | 'oauth_apple' | null>(null)

    React.useEffect(() => {
        void WebBrowser.warmUpAsync()
        return () => {
            void WebBrowser.coolDownAsync()
        }
    }, [])

    const handleSSOSignIn = async (strategy: 'oauth_google' | 'oauth_apple') => {
        setLoadingProvider(strategy)
        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy,
                redirectUrl: Linking.createURL('/(tabs)', { scheme: 'subora' }),
            })

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId })
                router.replace('/')
                return
            }

            Alert.alert('Sign-in incomplete', 'Please try again.')
        } catch (error) {
            console.error('SSO sign-in error', error)
            Alert.alert('Unable to sign in', 'Please try again in a moment.')
        } finally {
            setLoadingProvider(null)
        }
    }

    const handleEmailContinue = () => {
        router.push('/email-sign-in')
    }

    return (
        <ImageBackground source={require('../../assets/images/abstract2.jpg')} resizeMode='cover' className='flex-1'>
            <View className='absolute inset-0 bg-black/60' />
            <View className='flex-1 justify-end px-6 pb-11'>
                <View className='mb-11 items-center'>
                    <Text className='text-white text-5xl font-inter-bold'>Subora</Text>
                    <Text className='mt-2 text-neutral-300 text-base font-inter'>All your subscriptions, one view.</Text>
                </View>

                <View className='gap-4'>
                    <AuthOptionButton
                        label='Continue with Google'
                        iconName='google'
                        onPress={() => void handleSSOSignIn('oauth_google')}
                        disabled={loadingProvider !== null}
                        loading={loadingProvider === 'oauth_google'}
                    />

                    {Platform.OS === 'ios' && (
                        <AuthOptionButton
                            label='Sign in with Apple'
                            iconName='apple'
                            iconSize={22}
                            onPress={() => void handleSSOSignIn('oauth_apple')}
                            disabled={loadingProvider !== null}
                            loading={loadingProvider === 'oauth_apple'}
                        />
                    )}

                    <AuthOptionButton
                        label='Continue with Email'
                        iconName='envelope'
                        iconSize={18}
                        onPress={handleEmailContinue}
                        disabled={loadingProvider !== null}
                    />
                </View>

                <Text className='mt-7 text-center text-neutral-400 tracking-wide text-xs font-inter'>
                    By continuing you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </ImageBackground>
    )
}