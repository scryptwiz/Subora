import { isClerkAPIResponseError, useAuth, useSignIn, useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import Animated, {
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight,
} from 'react-native-reanimated'
import { EmailStep } from '../../components/auth/email-step'
import { OtpStep } from '../../components/auth/otp-step'

type Step = 'email' | 'otp'
type AuthFlow = 'sign-in' | 'sign-up'

const IDENTIFIER_NOT_FOUND = 'form_identifier_not_found'
const CAPTCHA_INVALID = 'captcha_invalid'

function formatClerkError(error: unknown): string {
    if (isClerkAPIResponseError(error)) {
        const first = error.errors[0]
        if (first?.code === CAPTCHA_INVALID) {
            return "We couldn't complete sign-in right now. Please try again later or contact your administrator."
        }
        return first?.longMessage ?? first?.message ?? 'Something went wrong. Please try again.'
    }
    if (error instanceof Error) return error.message
    return 'Something went wrong. Please try again.'
}

function firstErrorCode(error: unknown): string | undefined {
    if (isClerkAPIResponseError(error)) {
        return error.errors[0]?.code
    }
    return undefined
}

export default function EmailSignInScreen() {
    const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false })
    const { signIn } = useSignIn()
    const { signUp } = useSignUp()
    const router = useRouter()

    const [step, setStep] = useState<Step>('email')
    const [authFlow, setAuthFlow] = useState<AuthFlow>('sign-in')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const hasSignResources = signIn != null && signUp != null

    useEffect(() => {
        if (isSignedIn) router.replace('/')
    }, [isSignedIn, router])

    const handleEmailSubmit = useCallback(
        async (enteredEmail: string) => {
            if (!hasSignResources) return
            setLoading(true)
            setError(null)

            try {
                const { error: createSignInError } = await signIn.create({
                    identifier: enteredEmail,
                })

                if (!createSignInError) {
                    const { error: sendError } = await signIn.emailCode.sendCode({
                        emailAddress: enteredEmail,
                    })
                    if (sendError) {
                        setError(formatClerkError(sendError))
                        return
                    }
                    setEmail(enteredEmail)
                    setAuthFlow('sign-in')
                    setStep('otp')
                    return
                }

                const code = firstErrorCode(createSignInError)
                if (code === IDENTIFIER_NOT_FOUND) {
                    await signIn.reset()
                    const { error: createSignUpError } = await signUp.create({
                        emailAddress: enteredEmail,
                    })
                    if (createSignUpError) {
                        setError(formatClerkError(createSignUpError))
                        return
                    }
                    const { error: sendSignUpError } = await signUp.verifications.sendEmailCode()
                    if (sendSignUpError) {
                        setError(formatClerkError(sendSignUpError))
                        return
                    }
                    setEmail(enteredEmail)
                    setAuthFlow('sign-up')
                    setStep('otp')
                    return
                }

                setError(formatClerkError(createSignInError))
            } catch (err) {
                setError(formatClerkError(err))
            } finally {
                setLoading(false)
            }
        },
        [hasSignResources, signIn, signUp]
    )

    const handleVerify = useCallback(
        async (code: string) => {
            if (!hasSignResources) return
            setLoading(true)
            setError(null)

            try {
                if (authFlow === 'sign-in') {
                    const { error: verifyError } = await signIn.emailCode.verifyCode({ code })
                    if (verifyError) {
                        setError(formatClerkError(verifyError))
                        return
                    }
                    const { error: finalizeError } = await signIn.finalize({
                        navigate: () => router.replace('/'),
                    })
                    if (finalizeError) {
                        setError(formatClerkError(finalizeError))
                        return
                    }
                } else {
                    const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code })
                    if (verifyError) {
                        setError(formatClerkError(verifyError))
                        return
                    }
                    const { error: finalizeError } = await signUp.finalize({
                        navigate: () => router.replace('/'),
                    })
                    if (finalizeError) {
                        setError(formatClerkError(finalizeError))
                        return
                    }
                }
            } catch (err) {
                setError(formatClerkError(err))
            } finally {
                setLoading(false)
            }
        },
        [authFlow, hasSignResources, signIn, signUp, router]
    )

    const handleResend = useCallback(async () => {
        if (!hasSignResources) return
        setError(null)

        try {
            if (authFlow === 'sign-in') {
                const { error: sendError } = await signIn.emailCode.sendCode({ emailAddress: email })
                if (sendError) setError(formatClerkError(sendError))
            } else {
                const { error: sendError } = await signUp.verifications.sendEmailCode()
                if (sendError) setError(formatClerkError(sendError))
            }
        } catch (err) {
            setError(formatClerkError(err))
        }
    }, [authFlow, email, hasSignResources, signIn, signUp])

    if (Platform.OS === 'web') {
        return (
            <View className='flex-1 items-center justify-center gap-4 bg-[#111111] px-6'>
                <Text className='text-center font-inter text-neutral-300'>
                    Email sign-in works best in the app. Use Google or open Subora on iOS/Android.
                </Text>
                <Link href='/sign-in' className='font-inter-medium text-white underline'>
                    Back to sign in
                </Link>
            </View>
        )
    }

    if (!hasSignResources) {
        return (
            <View className='flex-1 items-center justify-center gap-3 bg-[#111111] px-8'>
                <ActivityIndicator color='#ffffff' size='large' />
                <Text className='text-center text-sm text-neutral-400 font-inter'>Loading...</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            className='flex-1 bg-[#111111]'
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {step === 'email' && (
                <Animated.View
                    className='flex-1'
                    entering={SlideInLeft.duration(300)}
                    exiting={SlideOutLeft.duration(200)}
                >
                    <EmailStep onSubmit={handleEmailSubmit} loading={loading} error={error} />
                </Animated.View>
            )}

            {step === 'otp' && (
                <Animated.View
                    className='flex-1'
                    entering={SlideInRight.duration(300)}
                    exiting={SlideOutRight.duration(200)}
                >
                    <OtpStep
                        email={email}
                        onVerify={handleVerify}
                        onResend={handleResend}
                        loading={loading}
                        error={error}
                    />
                </Animated.View>
            )}
        </KeyboardAvoidingView>
    )
}
