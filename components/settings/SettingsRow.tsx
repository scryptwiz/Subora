import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RowProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
};

export function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: RowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View
        style={[
          styles.iconContainer,
          danger ? styles.iconContainerDanger : styles.iconContainerDefault,
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={danger ? "#F87171" : getNativeDefault("text")}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, danger && styles.titleDanger]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {!danger ? (
        <Feather
          name="chevron-right"
          size={18}
          color={getNativeDefault("secondaryText")}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconContainer: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  iconContainerDefault: {
    backgroundColor: getNativeDefault("tertiaryBackground"),
  },
  iconContainerDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    color: getNativeDefault("text"),
  },
  titleDanger: {
    color: "#F87171",
  },
  subtitle: {
    marginTop: 2,
    ...Typography.xs,
    color: getNativeDefault("secondaryText"),
  },
});
