import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AddSubscriptionHeaderProps = {
  isEditing: boolean;
  isValid: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
};

export function AddSubscriptionHeader({
  isEditing,
  isValid,
  saving,
  onClose,
  onSave,
}: AddSubscriptionHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <Pressable
        onPress={onClose}
        accessibilityLabel="Close"
        style={styles.backButton}
      >
        <Feather name="x" size={18} color={getNativeDefault("secondaryText")} />
      </Pressable>
      <Text style={styles.headerTitle}>
        {isEditing ? "Edit subscription" : "New subscription"}
      </Text>
      <Pressable onPress={onSave} disabled={!isValid || saving} hitSlop={8}>
        {saving ? (
          <ActivityIndicator
            color={getNativeDefault("secondaryText")}
            size="small"
          />
        ) : (
          <Text
            style={{
              color: isValid
                ? getNativeDefault("text")
                : getNativeDefault("secondaryText"),
              ...Typography.smallMedium,
            }}
          >
            Save
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  headerTitle: {
    ...Typography.bodyBold,
    color: getNativeDefault("text"),
  },
});
