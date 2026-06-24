import { getNativeDefault } from "@/theme/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

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
});
