import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Keyboard,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native'

type OtpStepProps = {
    email: string
    onVerify: (code: string) => void
    onResend: () => void
    loading: boolean
    error: string | null
}

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 30

export function OtpStep({
    email,
    onVerify,
    onResend,
    loading,
    error,
}: OtpStepProps) {
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
    const hiddenInputRef = useRef<TextInput>(null)

    // Masked email: ke***@gmail.com
    const maskedEmail = (() => {
        const [local, domain] = email.split('@')
        if (!local || !domain) return email
        const visible = local.slice(0, 2)
        return `${visible}${'•'.repeat(Math.max(local.length - 2, 3))}@${domain}`
    })()

    const code = digits.join('')
    const isFilled = code.length === CODE_LENGTH

    // ── Cooldown timer ──────────────────────────────────────
    useEffect(() => {
        if (cooldown <= 0) return
        const id = setInterval(() => setCooldown((c) => c - 1), 1000)
        return () => clearInterval(id)
    }, [cooldown])

    // ── Handle hidden input change (supports paste) ─────────
    const handleHiddenChange = useCallback(
        (text: string) => {
            // Only keep digits
            const cleaned = text.replace(/\D/g, '').slice(0, CODE_LENGTH)
            const next = Array(CODE_LENGTH).fill('')
            cleaned.split('').forEach((d, i) => (next[i] = d))
            setDigits(next)

            // Auto-submit when fully pasted
            if (cleaned.length === CODE_LENGTH && !loading) {
                Keyboard.dismiss()
                onVerify(cleaned)
            }
        },
        [loading, onVerify]
    )

    const handleVerify = () => {
        if (!isFilled || loading) return
        Keyboard.dismiss()
        onVerify(code)
    }

    const handleResend = () => {
        if (cooldown > 0) return
        setCooldown(RESEND_COOLDOWN_SECONDS)
        setDigits(Array(CODE_LENGTH).fill(''))
        onResend()
    }

    const focusInput = () => hiddenInputRef.current?.focus()

    return (
        <View className="flex-1 px-6 pt-8">
            {/* Heading */}
            <Text className="text-3xl text-white font-inter-bold">
                Check your inbox
            </Text>
            <Text className="mt-2 text-base text-neutral-400 font-inter">
                We sent a code to{' '}
                <Text className="text-neutral-200 font-inter-medium">
                    {maskedEmail}
                </Text>
            </Text>

            {/* OTP cells ── tap anywhere to focus the hidden input */}
            <Pressable
                className="mt-8 flex-row items-center justify-between"
                onPress={focusInput}
            >
                {digits.map((digit, index) => {
                    const isActive = code.length === index
                    return (
                        <View
                            key={index}
                            className={`h-16 w-[48px] items-center justify-center rounded-2xl border ${
                                isActive
                                    ? 'border-white/40 bg-[#1a1a24]'
                                    : digit
                                      ? 'border-[#27272A] bg-[#14141A]'
                                      : 'border-[#27272A] bg-[#14141A]'
                            }`}
                        >
                            <Text className="text-2xl text-white font-inter-bold">
                                {digit}
                            </Text>
                            {/* Cursor blink for active cell */}
                            {isActive && !digit && (
                                <View className="absolute h-6 w-[2px] rounded-full bg-white/50" />
                            )}
                        </View>
                    )
                })}
            </Pressable>

            {/* Hidden TextInput that captures keyboard + paste */}
            <TextInput
                ref={hiddenInputRef}
                className="absolute -top-[9999px]"
                value={code}
                onChangeText={handleHiddenChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoFocus
                maxLength={CODE_LENGTH}
                caretHidden
            />

            {/* Error message */}
            {error && (
                <View className="mt-3 rounded-xl bg-red-500/10 px-4 py-3">
                    <Text className="text-sm text-red-400 font-inter-medium">
                        {error}
                    </Text>
                </View>
            )}

            {/* Verify button */}
            <Pressable
                className={`mt-6 h-16 items-center justify-center rounded-2xl ${
                    isFilled && !loading ? 'bg-white' : 'bg-white/20'
                }`}
                style={({ pressed }) =>
                    pressed && isFilled ? { opacity: 0.85 } : undefined
                }
                onPress={handleVerify}
                disabled={!isFilled || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#111111" />
                ) : (
                    <Text
                        className={`text-xl font-inter-medium ${
                            isFilled ? 'text-[#111111]' : 'text-neutral-500'
                        }`}
                    >
                        Verify
                    </Text>
                )}
            </Pressable>

            {/* Resend */}
            <View className="mt-6 flex-row items-center justify-center gap-1">
                <Text className="text-sm text-neutral-500 font-inter">
                    Didn’t get a code?
                </Text>
                <Pressable onPress={handleResend} disabled={cooldown > 0}>
                    <Text
                        className={`text-sm font-inter-medium ${
                            cooldown > 0 ? 'text-neutral-600' : 'text-white'
                        }`}
                    >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}
