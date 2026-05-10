import React, { useEffect, useRef } from 'react'
import { Animated, type ViewStyle } from 'react-native'

type Props = {
    className?: string
    style?: ViewStyle | ViewStyle[]
}

export function SkeletonBlock({ className, style }: Props) {
    const opacity = useRef(new Animated.Value(0.4)).current

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.4,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        )
        animation.start()
        return () => animation.stop()
    }, [opacity])

    return (
        <Animated.View
            className={`bg-[#1F1F22] ${className ?? ''}`}
            style={[{ opacity }, style as ViewStyle]}
        />
    )
}
