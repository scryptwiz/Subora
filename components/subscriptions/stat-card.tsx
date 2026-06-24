import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
  caption?: string;
};

export function StatCard({ label, value, caption }: Props) {
  return (
    <View style={[styles.card]}>
      <Text style={[styles.label]}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  label: {
    ...Typography.caption,
    textTransform: "uppercase",
    color: getNativeDefault("secondaryText"),
  },
  value: {
    marginTop: 8,
    ...Typography.titleBold,
    color: getNativeDefault("text"),
  },
  caption: {
    marginTop: 4,
    ...Typography.caption,
    color: getNativeDefault("secondaryText"),
  },
});
