import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import {
  billingCycleLabel,
  formatCurrency,
  renewalCountdownLabel,
  type Subscription,
} from "../../lib/subscriptions";
import { SubscriptionLogo } from "./subscription-logo";

type Variant = "history" | "list";

type Props = {
  subscription: Subscription;
  variant?: Variant;
  onToggleActive?: (next: boolean) => void;
  onPress: () => void;
};

export function SubscriptionRow({
  subscription,
  variant = "list",
  onToggleActive,
  onPress,
}: Props) {
  const renewalLabel = renewalCountdownLabel(subscription.nextRenewal);
  const cycleLabel = billingCycleLabel(subscription.billingCycle);

  const rowBody = (
    <>
      <SubscriptionLogo
        name={subscription.name}
        domain={subscription.domain}
        iconSlug={subscription.iconSlug}
        emoji={subscription.emoji}
        size={44}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.subscriptionName}>{subscription.name}</Text>
        <Text style={styles.renewalLabel}>{renewalLabel}</Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.priceLabel}>
          {formatCurrency(subscription.price, subscription.currency)}
        </Text>
        <Text style={styles.cycleLabel}>{cycleLabel}</Text>
      </View>
    </>
  );

  if (variant === "list") {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={onPress}
          style={styles.pressable}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${subscription.name}`}
        >
          {rowBody}
        </Pressable>
        <View style={styles.switchContainer}>
          {onToggleActive ? (
            <Switch
              value={subscription.active}
              onValueChange={onToggleActive}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#27272A"
            />
          ) : (
            <Feather name="chevron-right" size={18} color="#52525B" />
          )}
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${subscription.name}`}
    >
      {rowBody}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  switchContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  pressable: {
    flex: 1,
    gap: 16,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  subscriptionName: {
    ...Typography.bodyMedium,
    color: getNativeDefault("text"),
  },
  renewalLabel: {
    marginTop: 0.5,
    color: getNativeDefault("secondaryText"),
    ...Typography.caption,
  },
  priceLabel: {
    color: getNativeDefault("text"),
    ...Typography.bodyMedium,
  },
  cycleLabel: {
    marginTop: 0.5,
    color: getNativeDefault("secondaryText"),
    ...Typography.caption,
  },
});
