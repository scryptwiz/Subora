import type { Subscription } from "@/lib/subscriptions";
import { Feather } from "@expo/vector-icons";
import React, { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SubscriptionRow } from "./subscription-row";

type Variant = "history" | "list";

type Props = {
  subscription: Subscription;
  variant?: Variant;
  onPress: () => void;
  onToggleActive?: (next: boolean) => void;
  onDelete: (cancel: () => void) => void;
};

const DELETE_THRESHOLD = 220;

const SNAP_BACK_SPRING = {
  damping: 18,
  stiffness: 180,
  mass: 0.5,
  overshootClamping: true,
};

const FLY_OUT_TIMING = { duration: 260 };

export function SwipeableSubscriptionRow({
  subscription,
  variant = "list",
  onPress,
  onToggleActive,
  onDelete,
}: Props) {
  const translateX = useSharedValue(0);
  const isFlyingOut = useSharedValue(false);

  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;

  const notifyDelete = useCallback(() => {
    const cancel = () => {
      isFlyingOut.value = false;
      translateX.value = withSpring(0, SNAP_BACK_SPRING);
    };
    onDeleteRef.current(cancel);
  }, [isFlyingOut, translateX]);

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      if (isFlyingOut.value) return;
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (isFlyingOut.value) return;

      const shouldDelete =
        e.translationX < -DELETE_THRESHOLD ||
        (e.velocityX < -800 && e.translationX < -80);

      if (shouldDelete) {
        isFlyingOut.value = true;
        translateX.value = withTiming(-800, FLY_OUT_TIMING, (finished) => {
          if (finished) {
            runOnJS(notifyDelete)();
          }
        });
      } else {
        translateX.value = withSpring(0, SNAP_BACK_SPRING);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const drag = Math.abs(Math.min(0, translateX.value));
    return {
      width: drag,
      opacity: drag > 0.5 ? 1 : 0,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const drag = Math.abs(Math.min(0, translateX.value));
    const progress = Math.min(drag / DELETE_THRESHOLD, 1);
    const opacity = interpolate(drag, [20, 80], [0, 1]);
    const scale = interpolate(progress, [0, 0.3, 1], [0.7, 0.9, 1.1]);
    return { opacity, transform: [{ scale }] };
  });

  const backdropColorStyle = useAnimatedStyle(() => {
    const drag = Math.abs(Math.min(0, translateX.value));
    return {
      backgroundColor: drag >= DELETE_THRESHOLD ? "#E84040" : "#FF6B6B",
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.backdrop, backdropColorStyle, backdropStyle]}>
        <Animated.View style={[styles.iconWrap, iconStyle]}>
          <Feather name="trash-2" size={22} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.rowWrapper, rowStyle]}>
          <SubscriptionRow
            subscription={subscription}
            variant={variant}
            onPress={onPress}
            onToggleActive={onToggleActive}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  rowWrapper: {
    zIndex: 1,
  },
});
