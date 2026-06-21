import { useNotificationPermission } from "@/contexts/notification-permission-context";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#16161A]">
      {children}
    </View>
  );
}

/**
 * Profile-only callout when OS notification permission is off; includes recovery after “Don’t allow”.
 */
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

  if (Platform.OS === "web" || !showEnableNotificationsCue) {
    return null;
  }

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
    <View className="gap-3">
      <Text className="px-1 font-inter text-xs uppercase tracking-wider text-amber-500/90">
        Push notifications
      </Text>
      <SectionCard>
        <View className="gap-3 px-4 py-4">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <Feather name="bell" size={18} color="#FBBF24" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-inter-medium text-base text-white">
                Enable notifications
              </Text>
              <Text className="mt-1 font-inter text-xs leading-5 text-neutral-400">
                {subtitle}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => void onPrimaryPress()}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-white py-3.5"
            style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
          >
            {busy ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <Text className="font-inter-medium text-base text-[#111111]">
                {primaryLabel}
              </Text>
            )}
          </Pressable>
        </View>
      </SectionCard>
    </View>
  );
}
