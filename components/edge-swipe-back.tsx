import { useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'

const MIN_TRANSLATION = 64
const MIN_VELOCITY = 380

/**
 * Full-screen root wrapper with a narrow left-edge pan gesture that calls
 * `router.back()` when the user swipes right from the edge (similar to iOS back).
 */
export function EdgeSwipeBack({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    const goBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back()
        }
    }, [router])

    const pan = Gesture.Pan()
        .minDistance(12)
        .onEnd(e => {
            'worklet'
            const dominantHorizontal =
                Math.abs(e.translationX) >= Math.abs(e.translationY)
            const longEnough = e.translationX > MIN_TRANSLATION
            const fastEnough = e.velocityX > MIN_VELOCITY

            if (dominantHorizontal && (longEnough || fastEnough)) {
                runOnJS(goBack)()
            }
        })

    return (
        <View className='flex-1'>
            {children}
            <GestureDetector gesture={pan}>
                <View
                    className='absolute bottom-0 left-0 top-0 z-[100] w-8'
                    pointerEvents='box-only'
                    collapsable={false}
                />
            </GestureDetector>
        </View>
    )
}
