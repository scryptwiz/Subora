import { NotificationsPermissionBanner } from "@/components/notifications/notifications-permission-banner";
import { NotificationsPrefsSection } from "@/components/notifications/notifications-prefs-section";
import { NotificationsPrefsSkeleton } from "@/components/skeletons/notifications-prefs-skeleton";
import { usePreferences } from "@/contexts/preferences-context";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    notificationsEnabled,
    reminderOffsets,
    setNotificationsEnabled,
    setReminderOffsets,
    loading,
  } = usePreferences();
  const [saving, setSaving] = useState(false);

  const onToggleMaster = useCallback(
    async (value: boolean) => {
      setSaving(true);
      try {
        await setNotificationsEnabled(value);
      } catch {
        Alert.alert("Could not save", "Try again in a moment.");
      } finally {
        setSaving(false);
      }
    },
    [setNotificationsEnabled],
  );

  const onChangeOffsets = useCallback(
    async (next: number[]) => {
      setSaving(true);
      try {
        await setReminderOffsets(next);
      } catch {
        Alert.alert("Could not save", "Try again in a moment.");
      } finally {
        setSaving(false);
      }
    },
    [setReminderOffsets],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={styles.backButton}
        >
          <Feather
            name="arrow-left"
            size={22}
            color={getNativeDefault("text")}
          />
        </Pressable>
        <Text style={styles.headerText}>Notifications</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={styles.descriptionText}
          className="font-inter text-sm leading-5 text-neutral-400"
        >
          Subora reminds you before your subscriptions renew based on the
          renewal dates you save. Reminders are sent once per day (UTC) using
          your default lead times below (up to three).
        </Text>

        <NotificationsPermissionBanner />

        {loading ? (
          <NotificationsPrefsSkeleton />
        ) : (
          <NotificationsPrefsSection
            notificationsEnabled={notificationsEnabled}
            reminderOffsets={reminderOffsets}
            saving={saving}
            onToggleMaster={onToggleMaster}
            onChangeOffsets={onChangeOffsets}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getNativeDefault("background"),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    ...Typography.titleBold,
    color: getNativeDefault("text"),
  },
  descriptionText: {
    ...Typography.small,
    color: getNativeDefault("secondaryText"),
  },
});
