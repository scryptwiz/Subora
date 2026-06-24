import { DatePickerRow } from "@/components/add-subscription/date-picker-row";
import {
  FieldLabel,
  RowDivider,
} from "@/components/add-subscription/form-fields";
import { ReminderNotificationsNudge } from "@/components/add-subscription/reminder-notifications-nudge";
import { ReminderOffsetChips } from "@/components/add-subscription/reminder-offset-chips";
import { getNativeDefault } from "@/theme/colors";
import React from "react";
import { StyleSheet, View } from "react-native";

type BillingAndRemindersCardProps = {
  renewalDate: Date;
  minRenewalDate: Date;
  onRenewalDateChange: (value: Date) => void;
  formatRenewalDate: (value: Date) => string;
  reminderOffsets: number[];
  onReminderOffsetsChange: React.Dispatch<React.SetStateAction<number[]>>;
};

export function BillingAndRemindersCard({
  renewalDate,
  minRenewalDate,
  onRenewalDateChange,
  formatRenewalDate,
  reminderOffsets,
  onReminderOffsetsChange,
}: BillingAndRemindersCardProps) {
  return (
    <View style={styles.container}>
      <FieldLabel icon="calendar" label="Billing" />
      <View style={styles.card}>
        <DatePickerRow
          icon="calendar"
          title="Renewal date"
          value={renewalDate}
          onChange={onRenewalDateChange}
          formatValue={formatRenewalDate}
          minimumDate={minRenewalDate}
        />
        <RowDivider />
        <ReminderNotificationsNudge />
        <ReminderOffsetChips
          reminderOffsets={reminderOffsets}
          onChange={onReminderOffsetsChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
});
