import { usePreferences } from "@/contexts/preferences-context";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import { useConvertedSpendTotals } from "@/hooks/use-converted-totals";
import { shareCsvContents } from "@/lib/share-csv";
import { buildSubscriptionsExportCsv } from "@/lib/subscriptions-export-csv";
import { getNativeDefault } from "@/theme/colors";
import {
  BottomSheet,
  Button,
  Group,
  HStack,
  Spacer,
  Image as SwiftUIImage,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  cornerRadius,
  fixedSize,
  font,
  foregroundStyle,
  padding,
  presentationDetents,
  presentationDragIndicator,
} from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useState } from "react";
import { Alert } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ExportDataModal({ visible, onClose }: Props) {
  const { subscriptions, configured } = useSubscriptions();
  const { displayCurrency } = usePreferences();
  const converted = useConvertedSpendTotals();
  const [exporting, setExporting] = useState(false);
  const isGlassAvailable = isLiquidGlassAvailable();

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
    <BottomSheet
      isPresented={visible}
      onIsPresentedChange={(val) => {
        if (!val) onClose();
      }}
      fitToContents
    >
      <Group
        modifiers={[
          padding({ top: 24, bottom: 0, horizontal: 24 }),
          presentationDragIndicator("visible"),
          presentationDetents(["medium"]),
        ]}
      >
        <VStack spacing={16} alignment="leading">
          <Text
            modifiers={[
              font({ size: 20, weight: "bold" }),
              foregroundStyle(getNativeDefault("text")),
            ]}
          >
            Export data
          </Text>

          <Text
            modifiers={[
              font({ size: 14 }),
              foregroundStyle(getNativeDefault("secondaryText")),
            ]}
          >
            Download a CSV snapshot of your subscriptions plus a budget overview
            (active vs inactive, monthly and yearly estimates in your display
            currency when rates are available).
          </Text>

          <VStack
            spacing={6}
            alignment="leading"
            modifiers={[
              padding({ all: 16 }),
              background(getNativeDefault("secondaryBackground")),
              cornerRadius(16),
            ]}
          >
            <HStack>
              <Text
                modifiers={[
                  font({ size: 14, weight: "medium" }),
                  foregroundStyle(getNativeDefault("text")),
                ]}
              >
                Included in the file
              </Text>
              <Spacer />
            </HStack>
            <Text
              modifiers={[
                font({ size: 14 }),
                foregroundStyle(getNativeDefault("secondaryText")),
                fixedSize({ horizontal: false, vertical: true }),
                padding({ leading: 8 }),
              ]}
            >
              • Budget summary rows for planning{"\n"}• One row per subscription
              with price, cycle, renewal date, and status{"\n"}• UTF-8 with BOM
              for Excel compatibility
            </Text>
          </VStack>

          <Button
            onPress={() => (exporting ? undefined : handleExport())}
            modifiers={[
              buttonStyle(
                isGlassAvailable ? "glassProminent" : "borderedProminent",
              ),
              cornerRadius(16),
            ]}
          >
            <HStack
              spacing={8}
              alignment="center"
              modifiers={[padding({ vertical: 8 })]}
            >
              <Spacer />
              <SwiftUIImage systemName="square.and.arrow.down" size={18} />
              <Text modifiers={[font({ size: 16, weight: "bold" })]}>
                {exporting ? "Preparing…" : "Export CSV"}
              </Text>
              <Spacer />
            </HStack>
          </Button>
        </VStack>
      </Group>
    </BottomSheet>
  );
}
