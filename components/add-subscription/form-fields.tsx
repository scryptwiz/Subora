import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function FieldLabel({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
}) {
  return (
    <View style={styles.labelContainer}>
      <Feather
        name={icon}
        size={14}
        color={getNativeDefault("secondaryText")}
      />
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
}

export function DetailRow({
  icon,
  title,
  value,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.rowContainer}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={16} color={getNativeDefault("text")} />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      <Feather
        name="chevron-right"
        size={16}
        color={getNativeDefault("secondaryText")}
      />
    </Pressable>
  );
}

export function RowDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelText: {
    ...Typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: getNativeDefault("secondaryText"),
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconContainer: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  rowTitle: {
    flex: 1,
    ...Typography.bodyMedium,
    color: getNativeDefault("text"),
  },
  rowValue: {
    ...Typography.small,
    color: getNativeDefault("secondaryText"),
  },
  divider: {
    marginLeft: 64,
    height: StyleSheet.hairlineWidth,
    backgroundColor: getNativeDefault("separator"),
  },
});
