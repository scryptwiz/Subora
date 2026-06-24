import type { Subscription } from "@/lib/subscriptions";
import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { SubscriptionRow } from "./subscription-row";

type Variant = "history" | "list";

type Props = {
  subscription: Subscription;
  variant?: Variant;
  onPress: () => void;
  onToggleActive?: (next: boolean) => void;
  onDelete: () => void;
};

const ACTION_WIDTH = 64;

export function SwipeableSubscriptionRow({
  subscription,
  variant = "list",
  onPress,
  onToggleActive,
  onDelete,
}: Props) {
  const ref = useRef<SwipeableMethods | null>(null);

  const close = () => ref.current?.close();

  const renderRightActions = () => (
    <ActionButton
      accessibilityLabel="Delete"
      icon="trash-2"
      onPress={() => {
        close();
        onDelete();
      }}
    />
  );

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={1.6}
      rightThreshold={ACTION_WIDTH * 0.6}
      overshootRight={false}
      renderRightActions={renderRightActions}
      containerStyle={{ borderRadius: 16, overflow: "hidden" }}
    >
      <SubscriptionRow
        subscription={subscription}
        variant={variant}
        onPress={onPress}
        onToggleActive={onToggleActive}
      />
    </ReanimatedSwipeable>
  );
}

function ActionButton({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress: () => void;
}) {
  return (
    <View style={styles.actionContainer}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={styles.actionButton}
      >
        <Feather name={icon} size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingLeft: 8,
  },
  actionButton: {
    width: ACTION_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
  },
});
