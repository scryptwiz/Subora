import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Switch, Text, View } from "react-native";
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
  /** When provided, shows a switch for toggling the active state. */
  onToggleActive?: (next: boolean) => void;
  onPress: () => void;
};

/**
 * A single subscription row used on the dashboard history list and the
 * "all subscriptions" screen.
 */
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

      <View className="flex-1">
        <Text className="font-inter-medium text-base text-white">
          {subscription.name}
        </Text>
        <Text className="mt-0.5 text-sm text-neutral-500 font-inter">
          {renewalLabel}
        </Text>
      </View>

      {variant === "list" ? (
        <View className="items-end">
          <Text className="font-inter-bold text-base text-white">
            {formatCurrency(subscription.price, subscription.currency)}
          </Text>
          <Text className="mt-0.5 font-inter text-xs text-neutral-500">
            {cycleLabel}
          </Text>
        </View>
      ) : (
        <View className="items-end">
          <Text className="font-inter-bold text-base text-white">
            -{formatCurrency(subscription.price, subscription.currency)}
          </Text>
          <Text className="mt-0.5 text-xs text-neutral-500 font-inter">
            {cycleLabel}
          </Text>
        </View>
      )}
    </>
  );

  if (variant === "list") {
    return (
      <View className="flex-row items-center gap-4 rounded-2xl border border-[#1F1F22] bg-[#16161A] px-4 py-4">
        <Pressable
          onPress={onPress}
          className="min-w-0 flex-1 flex-row items-center gap-4"
          style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${subscription.name}`}
        >
          {rowBody}
        </Pressable>
        <View className="ml-3 items-end justify-center">
          {onToggleActive ? (
            <Switch
              value={subscription.active}
              onValueChange={onToggleActive}
              trackColor={{ true: "#A3E635", false: "#27272A" }}
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
      className="flex-row items-center gap-4 rounded-2xl border border-[#1F1F22] bg-[#16161A] px-4 py-4"
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${subscription.name}`}
    >
      {rowBody}
    </Pressable>
  );
}
