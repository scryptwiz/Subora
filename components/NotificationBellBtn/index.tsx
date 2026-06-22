import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";

export default function NotificationBellBtn({ size = 18 }: { size?: number }) {
  return (
    <Pressable
      onPress={() => router.push("/(home)/notifications")}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      className="h-11 w-11 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]"
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
      hitSlop={8}
    >
      <Feather name="bell" size={size} color="#FFFFFF" />
    </Pressable>
  );
}
