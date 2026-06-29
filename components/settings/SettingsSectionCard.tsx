import { getNativeDefault } from "@/theme/colors";
import React from "react";
import { StyleSheet, View } from "react-native";

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      {React.Children.toArray(children).map((child, idx, arr) => (
        <View key={idx}>
          {child}
          {idx < arr.length - 1 ? <View style={styles.separator} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  separator: {
    marginLeft: 68,
    height: 1,
    backgroundColor: getNativeDefault("separator"),
  },
});
