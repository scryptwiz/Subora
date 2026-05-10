import { Image, type ImageSource } from 'expo-image'
import React, { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { avatarColor, initials, logoSources } from '../../lib/logo'

type SubscriptionLogoProps = {
    name: string
    domain?: string
    iconSlug?: string
    /** When set, takes priority over every other logo source. */
    emoji?: string
    /** Override colour for the surrounding tile. Defaults to a neutral chip. */
    tint?: string
    size?: number
    /** When true, use the brand colour as the tile background instead of a neutral chip. */
    bleed?: boolean
}

/**
 * Renders the best available logo for a subscription with a graceful fallback chain:
 * 1. user-picked emoji
 * 2. simpleicons CDN (crisp coloured brand SVG)
 * 3. favicon for the given domain
 * 4. deterministic letter tile
 */
export function SubscriptionLogo({
    name,
    domain,
    iconSlug,
    emoji,
    tint,
    size = 44,
    bleed = false,
}: SubscriptionLogoProps) {
    const sources = useMemo<ImageSource[]>(() => logoSources({ iconSlug, domain }), [iconSlug, domain])
    const [failed, setFailed] = useState(false)

    const radius = Math.round(size * 0.28)

    if (emoji) {
        return (
            <View
                className='items-center justify-center overflow-hidden'
                style={{
                    width: size,
                    height: size,
                    borderRadius: radius,
                    backgroundColor: bleed ? (tint ?? avatarColor(name)) : '#1F1F22',
                }}
            >
                <Text style={{ fontSize: Math.round(size * 0.55), lineHeight: Math.round(size * 0.7) }}>
                    {emoji}
                </Text>
            </View>
        )
    }

    const bg = bleed ? (tint ?? avatarColor(name)) : '#1F1F22'
    const showFallback = failed || sources.length === 0

    return (
        <View
            className='items-center justify-center overflow-hidden'
            style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg }}
        >
            {showFallback ? (
                <View
                    className='h-full w-full items-center justify-center'
                    style={{ backgroundColor: tint ?? avatarColor(name) }}
                >
                    <Text className='font-inter-bold text-white' style={{ fontSize: Math.round(size * 0.4) }}>
                        {initials(name)}
                    </Text>
                </View>
            ) : (
                <Image
                    source={sources}
                    contentFit='contain'
                    transition={120}
                    cachePolicy='memory-disk'
                    onError={() => setFailed(true)}
                    style={{ width: size * 0.62, height: size * 0.62 }}
                />
            )}
        </View>
    )
}
