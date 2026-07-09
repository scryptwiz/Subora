import { getNativeDefault } from "@/theme/colors";
import { FontFamilies } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export default function AddSubscriptionBtn() {
  return (
    <Pressable
      onPress={() => router.push("/(home)/NewSubscription")}
      style={({ pressed }) => [
        styles.button,
        pressed ? { opacity: 0.85 } : undefined,
      ]}
      accessibilityLabel="Add subscription"
    >
      <Feather name="plus" size={20} color={getNativeDefault("background")} />
    </Pressable>
  );
}

export function LargeAddSubscriptionBtn({ onAdd }: { onAdd: () => void }) {
  return (
    <Pressable onPress={onAdd} style={styles.largeButton}>
      <Feather name="plus" size={16} color={getNativeDefault("background")} />
      <Text style={styles.buttonText}>Add subscription</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: getNativeDefault("text"),
  },
  largeButton: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    backgroundColor: getNativeDefault("text"),
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    fontFamily: FontFamilies.medium,
    fontSize: 14,
    color: getNativeDefault("background"),
  },
});
