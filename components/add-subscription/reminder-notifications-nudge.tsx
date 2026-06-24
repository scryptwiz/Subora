import { useNotificationPermission } from "@/contexts/notification-permission-context";
import { usePreferences } from "@/contexts/preferences-context";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export function ReminderNotificationsNudge() {
  const router = useRouter();
  const { notificationsEnabled, loading: prefsLoading } = usePreferences();
  const {
    permissionStatus,
    refresh,
    requestPermission,
    openSystemSettings,
    showEnableNotificationsCue,
  } = useNotificationPermission();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (Platform.OS === "web") return null;

  const showPrefsNudge =
    !prefsLoading && !notificationsEnabled && permissionStatus === "granted";

  if (!showEnableNotificationsCue && !showPrefsNudge) return null;

  const onOsPrimary = async () => {
    setBusy(true);
    try {
      if (permissionStatus === "denied") openSystemSettings();
      else await requestPermission();
    } finally {
      setBusy(false);
    }
  };

  const isDark = useColorScheme() !== "light";
  const amberColor = isDark ? "#FBBF24" : "#D97706";
  const osLabel = permissionStatus === "denied" ? "Open Settings" : "Allow";

  return (
    <View style={styles.container}>
      {showEnableNotificationsCue ? (
        <View style={styles.row}>
          <Feather
            name="bell-off"
            size={16}
            color={amberColor}
            style={styles.bellIcon}
          />
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.amberTitle,
                { color: isDark ? "#FDE68A" : "#B45309" },
              ]}
            >
              Turn on notifications
            </Text>
            <Text
              style={[
                styles.amberDescription,
                {
                  color: isDark
                    ? "rgba(253, 230, 138, 0.75)"
                    : "rgba(180, 83, 9, 0.85)",
                },
              ]}
            >
              {permissionStatus === "denied"
                ? "Enable alerts in system Settings so renewal reminders can reach this device."
                : "Allow alerts so we can remind you before renewals."}
            </Text>
            <Pressable
              onPress={() => void onOsPrimary()}
              disabled={busy}
              style={[
                styles.amberButton,
                {
                  backgroundColor: isDark
                    ? "rgba(245, 158, 11, 0.2)"
                    : "rgba(217, 119, 6, 0.12)",
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={osLabel}
            >
              {busy ? (
                <ActivityIndicator color={amberColor} size="small" />
              ) : (
                <Text
                  style={[
                    styles.amberButtonText,
                    { color: isDark ? "#FEF3C7" : "#B45309" },
                  ]}
                >
                  {osLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}
      {showPrefsNudge ? (
        <Pressable
          onPress={() => router.push("/(home)/notifications")}
          style={styles.prefsNudge}
          accessibilityRole="button"
          accessibilityLabel="Open notification settings"
        >
          <Feather
            name="settings"
            size={16}
            color={getNativeDefault("secondaryText")}
            style={styles.settingsIcon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.prefsTitle}>
              Renewal alerts are off in Subora
            </Text>
            <Text style={styles.prefsDescription}>
              Tap to open Notifications and turn renewal reminders on.
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={16}
            color={getNativeDefault("secondaryText")}
            style={styles.chevronIcon}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: getNativeDefault("separator"),
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bellIcon: {
    marginTop: 2,
  },
  settingsIcon: {
    marginTop: 2,
  },
  chevronIcon: {
    marginTop: 2,
  },
  textContainer: {
    minWidth: 0,
    flex: 1,
  },
  amberTitle: {
    ...Typography.captionMedium,
  },
  amberDescription: {
    marginTop: 2,
    ...Typography.caption,
  },
  amberButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  amberButtonText: {
    ...Typography.caption,
  },
  prefsNudge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  prefsTitle: {
    ...Typography.captionMedium,
    color: getNativeDefault("text"),
  },
  prefsDescription: {
    marginTop: 2,
    ...Typography.caption,
    color: getNativeDefault("secondaryText"),
  },
});
