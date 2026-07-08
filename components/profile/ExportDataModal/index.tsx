import { usePreferences } from "@/contexts/preferences-context";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import { useConvertedSpendTotals } from "@/hooks/use-converted-totals";
import { shareCsvContents } from "@/lib/share-csv";
import { buildSubscriptionsExportCsv } from "@/lib/subscriptions-export-csv";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  onClose: () => void;
};

export function ExportDataModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { subscriptions, configured } = useSubscriptions();
  const { displayCurrency } = usePreferences();
  const converted = useConvertedSpendTotals();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    if (!configured) {
      Alert.alert(
        "Not connected",
        "Add your Supabase keys in the app environment to export saved data.",
      );
      return;
    }
    setExporting(true);
    try {
      const csv = buildSubscriptionsExportCsv(subscriptions, {
        displayCurrency,
        monthlyTotalDisplay: converted.monthlyNumber,
        yearlyTotalDisplay: converted.yearlyNumber,
      });
      await shareCsvContents(csv);
      onClose();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not create the export.";
      Alert.alert("Export failed", msg);
    } finally {
      setExporting(false);
    }
  };

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
            <Text style={styles.headerTitle}>Export data</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              onPress={onClose}
              disabled={exporting}
              style={styles.closeButton}
            >
              <Feather name="x" size={18} color={getNativeDefault("text")} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 12,
              gap: 16,
            }}
          >
            <Text style={styles.descriptionText}>
              Download a CSV snapshot of your subscriptions plus a budget
              overview (active vs inactive, monthly and yearly estimates in your
              display currency when rates are available).
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Included in the file</Text>
              <Text style={styles.infoBoxText}>
                • Budget summary rows for planning{"\n"}• One row per
                subscription with price, cycle, renewal date, and status{"\n"}•
                UTF-8 with BOM for Excel compatibility
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Export CSV"
              disabled={exporting}
              onPress={() => void handleExport()}
              style={[styles.button, exporting && { opacity: 0.6 }]}
            >
              {exporting ? (
                <ActivityIndicator color={getNativeDefault("background")} />
              ) : (
                <Feather
                  name="download"
                  size={20}
                  color={getNativeDefault("background")}
                />
              )}
              <Text style={styles.buttonText}>
                {exporting ? "Preparing…" : "Export CSV"}
              </Text>
            </Pressable>
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
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: getNativeDefault("separator"),
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    ...Typography.subheadingBold,
    color: getNativeDefault("text"),
  },
  closeButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: getNativeDefault("separator"),
  },
  descriptionText: {
    ...Typography.small,
    color: getNativeDefault("secondaryText"),
    lineHeight: 20,
  },
  infoBox: {
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("background"),
    padding: 16,
  },
  infoBoxTitle: {
    ...Typography.smallMedium,
    color: getNativeDefault("text"),
  },
  infoBoxText: {
    ...Typography.xs,
    color: getNativeDefault("secondaryText"),
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    backgroundColor: getNativeDefault("text"),
    paddingVertical: 16,
  },
  buttonText: {
    ...Typography.bodyBold,
    color: getNativeDefault("background"),
  },
});
