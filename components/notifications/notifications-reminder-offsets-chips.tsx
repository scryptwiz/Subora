import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Pressable, StyleSheet, Text, View } from "react-native";

const OPTIONS = [
  { label: "Same day", value: 0 },
  { label: "1 day", value: 1 },
  { label: "2 days", value: 2 },
  { label: "3 days", value: 3 },
  { label: "5 days", value: 5 },
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
] as const;

type Props = {
  selected: number[];
  disabled?: boolean;
  onChange: (next: number[]) => void;
};

export function NotificationsReminderOffsetsChips({
  selected,
  disabled,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const active = selected.includes(opt.value);
        const chipDisabled = disabled || (!active && selected.length >= 3);
        return (
          <Pressable
            key={opt.value}
            onPress={() =>
              onChange(
                active
                  ? selected.filter((v) => v !== opt.value)
                  : [...selected, opt.value].slice(0, 3),
              )
            }
            disabled={chipDisabled}
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
                  : chipDisabled
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
