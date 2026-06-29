import { FilterOption } from "@/app/(home)/(tabs)/subscriptions";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Pressable, StyleSheet, Text } from "react-native";

export type Filter = "all" | "active" | "paused";

export interface FilterPillProps {
  active: Filter;
  options: FilterOption[];
  onFilter: (filter: Filter) => void;
}

export default function FilterPill({
  active,
  options,
  onFilter,
}: FilterPillProps) {
  return (
    <>
      {options.map((f) => {
        const activeOption = active === f.id;
        return (
          <Pressable
            key={f.id}
            onPress={() => onFilter(f.id)}
            style={[
              styles.pill,
              activeOption ? styles.activePill : styles.inactivePill,
            ]}
          >
            <Text
              style={[
                styles.text,
                activeOption ? styles.activeText : styles.inactiveText,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activePill: {
    borderColor: getNativeDefault("text"),
    backgroundColor: getNativeDefault("text"),
  },
  inactivePill: {
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  text: {
    ...Typography.caption,
  },
  activeText: {
    color: getNativeDefault("background"),
  },
  inactiveText: {
    color: getNativeDefault("secondaryText"),
  },
});
