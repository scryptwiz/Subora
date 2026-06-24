import { formatCurrency } from "@/lib/subscriptions";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type SaveSubscriptionButtonProps = {
  isValid: boolean;
  saving: boolean;
  isEditing: boolean;
  priceNumber: number;
  currency: string;
  cycle: string;
  onPress: () => void;
};

export function SaveSubscriptionButton({
  isValid,
  saving,
  isEditing,
  priceNumber,
  currency,
  cycle,
  onPress,
}: SaveSubscriptionButtonProps) {
  const active = isValid && !saving;

  return (
    <Pressable
      onPress={onPress}
      disabled={!active}
      style={[
        styles.button,
        active ? styles.buttonValid : styles.buttonInvalid,
      ]}
    >
      {saving ? (
        <ActivityIndicator color={getNativeDefault("background")} />
      ) : (
        <Text style={active ? styles.textActive : styles.textInactive}>
          {isValid
            ? isEditing
              ? `Save · ${formatCurrency(priceNumber, currency)} / ${cycle}`
              : `Add ${formatCurrency(priceNumber, currency)} / ${cycle}`
            : isEditing
              ? "Save changes"
              : "Add subscription"}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  buttonValid: {
    backgroundColor: getNativeDefault("text"),
  },
  buttonInvalid: {
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  textActive: {
    ...Typography.subheadingMedium,
    color: getNativeDefault("background"),
  },
  textInactive: {
    ...Typography.subheadingMedium,
    color: getNativeDefault("secondaryText"),
  },
});
