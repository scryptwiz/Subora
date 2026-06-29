import { getNativeDefault } from "@/theme/colors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export default function NotificationBellBtn({ size = 18 }: { size?: number }) {
  return (
    <Pressable
      onPress={() => router.push("/(home)/Notifications")}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      style={styles.button}
      hitSlop={8}
    >
      <Feather
        name="bell"
        size={size}
        color={getNativeDefault("text") as string}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
});
