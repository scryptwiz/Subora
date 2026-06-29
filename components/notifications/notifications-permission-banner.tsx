import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function NotificationsPermissionBanner() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void Notifications.getPermissionsAsync().then(({ status: s }) =>
      setStatus(s),
    );
  }, []);

  if (status !== "denied") return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications are off</Text>
      <Text style={styles.description}>
        Enable alerts in system Settings so Subora can remind you before
        renewals.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  header: {
    ...Typography.smallMedium,
    color: "#d97706",
  },
  description: {
    marginTop: 1,
    ...Typography.caption,
    color: "#d97706",
  },
});
