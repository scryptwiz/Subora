import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const REMINDER_OPTIONS = [
  { label: "Same day", value: 0 },
  { label: "2 days before", value: 2 },
  { label: "5 days before", value: 5 },
] as const;

type ReminderOffsetChipsProps = {
  reminderOffsets: number[];
  onChange: React.Dispatch<React.SetStateAction<number[]>>;
};

export function ReminderOffsetChips({
  reminderOffsets,
  onChange,
}: ReminderOffsetChipsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reminders (up to 3)</Text>
      <View style={styles.chipsContainer}>
        {REMINDER_OPTIONS.map((opt) => {
          const active = reminderOffsets.includes(opt.value);
          const disabled = !active && reminderOffsets.length >= 3;
          return (
            <Pressable
              key={opt.value}
              onPress={() =>
                onChange((prev) =>
                  active
                    ? prev.filter((v) => v !== opt.value)
                    : [...prev, opt.value].slice(0, 3),
                )
              }
              disabled={disabled}
              style={[
                styles.chip,
                active ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  active
                    ? styles.chipTextActive
                    : disabled
                      ? styles.chipTextDisabled
                      : styles.chipTextInactive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  header: {
    ...Typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: getNativeDefault("secondaryText"),
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipActive: {
    borderColor: getNativeDefault("text"),
    backgroundColor: getNativeDefault("text"),
  },
  chipInactive: {
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("tertiaryBackground"),
  },
  chipText: {
    ...Typography.caption,
  },
  chipTextActive: {
    color: getNativeDefault("background"),
  },
  chipTextInactive: {
    color: getNativeDefault("text"),
  },
  chipTextDisabled: {
    color: getNativeDefault("secondaryText"),
    opacity: 0.5,
  },
});
