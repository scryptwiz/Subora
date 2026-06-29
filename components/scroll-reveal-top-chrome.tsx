import { BlurView } from "expo-blur";
import { Animated, Platform, StyleSheet, View } from "react-native";

export const SCROLL_REVEAL_START = 40;
export const SCROLL_REVEAL_END = 96;

const styles = StyleSheet.create({
  chrome: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  stickyTint: {
    backgroundColor: "rgba(17, 17, 17, 0.35)",
  },
  androidStickyBg: {
    backgroundColor: "rgba(23, 23, 28, 0.94)",
  },
});

type Props = {
  scrollY: Animated.Value;
  topInset: number;
  horizontalPadding?: number;
};

/** Frosted / solid strip that fades in while scrolling; never captures touches. */
export function ScrollRevealTopChrome({
  scrollY,
  topInset,
  horizontalPadding = 20,
}: Props) {
  const opacity = scrollY.interpolate({
    inputRange: [SCROLL_REVEAL_START, SCROLL_REVEAL_END],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.chrome,
        {
          paddingTop: topInset + 10,
          paddingBottom: 10,
          paddingHorizontal: horizontalPadding,
          opacity,
        },
      ]}
    >
      {Platform.OS === "ios" ? (
        <>
          <BlurView
            intensity={55}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.stickyTint, StyleSheet.absoluteFill]} />
        </>
      ) : (
        <View style={[styles.androidStickyBg, StyleSheet.absoluteFill]} />
      )}
    </Animated.View>
  );
}
