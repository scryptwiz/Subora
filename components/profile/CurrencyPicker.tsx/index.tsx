import { SUPPORTED_CURRENCIES } from "@/constants/currencies";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  selectedCode: string;
  onClose: () => void;
  onSelect: (code: string) => void;
};

export function CurrencyPickerModal({
  visible,
  selectedCode,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.modalContainer,
            {
              paddingBottom: insets.bottom + 16,
              maxHeight: height * 0.72,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Display currency</Text>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 8,
            }}
          >
            {SUPPORTED_CURRENCIES.map((c) => {
              const active = c.code === selectedCode;
              return (
                <Pressable
                  key={c.code}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    onSelect(c.code);
                    onClose();
                  }}
                  style={[
                    styles.rowItem,
                    active ? styles.rowItemActive : styles.rowItemDefault,
                  ]}
                >
                  <View>
                    <Text style={styles.rowTitle}>{c.code}</Text>
                    <Text style={styles.rowSubtitle}>{c.label}</Text>
                  </View>
                  {active ? (
                    <Feather
                      name="check"
                      size={20}
                      color={getNativeDefault("text")}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: getNativeDefault("separator"),
    padding: 20,
  },
  headerTitle: {
    ...Typography.subheadingBold,
    color: getNativeDefault("text"),
  },
  rowItem: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowItemDefault: {
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("background"),
  },
  rowItemActive: {
    borderColor: getNativeDefault("text"),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  rowTitle: {
    ...Typography.bodyMedium,
    color: getNativeDefault("text"),
  },
  rowSubtitle: {
    marginTop: 2,
    ...Typography.xs,
    color: getNativeDefault("secondaryText"),
  },
});
