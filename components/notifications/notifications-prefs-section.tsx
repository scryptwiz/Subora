import { NotificationsReminderOffsetsChips } from "@/components/notifications/notifications-reminder-offsets-chips";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, View } from "react-native";

type Props = {
  notificationsEnabled: boolean;
  reminderOffsets: number[];
  saving: boolean;
  onToggleMaster: (value: boolean) => void;
  onChangeOffsets: (next: number[]) => void;
};

export function NotificationsPrefsSection({
  notificationsEnabled,
  reminderOffsets,
  saving,
  onToggleMaster,
  onChangeOffsets,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Reminders</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>Push and local alerts</Text>
            <Text style={styles.rowDescription}>
              We also send a server reminder when your device is online.
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={onToggleMaster}
            disabled={saving}
            trackColor={{ false: "#27272A", true: "#3F3F46" }}
            thumbColor={notificationsEnabled ? "#FAFAFA" : "#A1A1AA"}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <View style={styles.subHeader}>
              <Feather
                name="clock"
                size={16}
                color={getNativeDefault("secondaryText")}
              />
              <Text style={styles.rowTitle}>Days before renewal</Text>
            </View>
            <Text style={styles.rowDescription}>
              Default for subscriptions without their own reminder pattern. Pick
              up to 3. Server matching uses UTC; local alerts use device time.
            </Text>
          </View>
          <NotificationsReminderOffsetsChips
            selected={reminderOffsets}
            disabled={saving}
            onChange={onChangeOffsets}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    ...Typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: getNativeDefault("secondaryText"),
  },
  card: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1,
  },
  rowTitle: {
    ...Typography.bodyMedium,
    color: getNativeDefault("text"),
  },
  rowDescription: {
    marginTop: 2,
    ...Typography.caption,
    color: getNativeDefault("secondaryText"),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: getNativeDefault("separator"),
  },
  detailsContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRow: {
    gap: 8,
  },
  headerTextContainer: {
    minWidth: 0,
    flex: 1,
  },
});
