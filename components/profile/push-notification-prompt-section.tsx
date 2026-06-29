import { useNotificationPermission } from "@/contexts/notification-permission-context";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function PushNotificationPromptSection() {
  const {
    permissionStatus,
    refresh,
    requestPermission,
    openSystemSettings,
    showEnableNotificationsCue,
  } = useNotificationPermission();
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const onPrimaryPress = async () => {
    setBusy(true);
    try {
      if (permissionStatus === "denied") {
        openSystemSettings();
      } else {
        await requestPermission();
      }
    } finally {
      setBusy(false);
    }
  };

  const primaryLabel =
    permissionStatus === "denied"
      ? "Open system settings"
      : "Allow notifications";
  const subtitle =
    permissionStatus === "denied"
      ? "Notifications were turned off. Open Settings, tap Notifications, and turn them on for Subora."
      : "Get renewal reminders on this device. You can change this anytime in Settings.";

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Push notifications</Text>
      <SectionCard>
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Feather name="bell" size={18} color="#FBBF24" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Enable notifications</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => void onPrimaryPress()}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            style={styles.button}
          >
            {busy ? (
              <ActivityIndicator color={getNativeDefault("text")} />
            ) : (
              <Text style={styles.buttonText}>{primaryLabel}</Text>
            )}
          </Pressable>
        </View>
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    paddingHorizontal: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "rgba(245, 158, 11, 0.9)",
  },
  card: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  cardContent: {
    gap: 12,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  textContainer: {
    minWidth: 0,
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    color: getNativeDefault("text"),
  },
  subtitle: {
    marginTop: 4,
    ...Typography.small,
    color: getNativeDefault("secondaryText"),
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: getNativeDefault("tertiaryBackground"),
    paddingVertical: 14,
  },
  buttonText: {
    ...Typography.bodyMedium,
    color: getNativeDefault("text"),
  },
});
