import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DetailRow } from "./form-fields";

type Props = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  value: Date;
  onChange: (date: Date) => void;
  formatValue: (date: Date) => string;
  minimumDate?: Date;
  maximumDate?: Date;
};

/**
 * Native date picker styled to match the billing details rows. Android uses
 * the imperative OS dialog. iOS uses a custom slide-up sheet implemented as a
 * full-screen <Modal presentationStyle='overFullScreen'> so it stacks above
 * the Expo Router modal screen this component is rendered inside.
 */
export function DatePickerRow({
  icon,
  title,
  value,
  onChange,
  formatValue,
  minimumDate,
  maximumDate,
}: Props) {
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value);

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode: "date",
        minimumDate,
        maximumDate,
        onChange: (event, selected) => {
          if (event.type === "set" && selected) {
            onChange(selected);
          }
        },
      });
      return;
    }

    setDraft(value);
    setIosOpen(true);
  };

  const confirm = () => {
    onChange(draft);
    setIosOpen(false);
  };

  return (
    <>
      <DetailRow
        icon={icon}
        title={title}
        value={formatValue(value)}
        onPress={openPicker}
      />

      <Modal
        visible={iosOpen}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setIosOpen(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setIosOpen(false)}
          />
          <View style={styles.pickerWrapper}>
            <View style={styles.header}>
              <Pressable hitSlop={8} onPress={() => setIosOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Text style={styles.titleText}>{title}</Text>
              <Pressable hitSlop={8} onPress={confirm}>
                <Text style={styles.confirmText}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={draft}
              mode="date"
              display="spinner"
              themeVariant="dark"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={(_, selected) => {
                if (selected) setDraft(selected);
              }}
              style={styles.datePicker}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  pickerWrapper: {
    borderTopWidth: 1,
    borderTopColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingBottom: 32,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  cancelText: {
    ...Typography.smallMedium,
    color: getNativeDefault("secondaryText"),
  },
  titleText: {
    ...Typography.smallMedium,
    color: getNativeDefault("text"),
  },
  confirmText: {
    ...Typography.smallMedium,
    color: getNativeDefault("link"),
  },
  datePicker: {
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
});
