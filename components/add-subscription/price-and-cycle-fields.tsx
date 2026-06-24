import { FieldLabel } from "@/components/add-subscription/form-fields";
import { BILLING_CYCLES } from "@/constants/add-subscription-cycles";
import {
  formatCurrencySymbol,
  SUPPORTED_CURRENCIES,
} from "@/constants/currencies";
import type { BillingCycle } from "@/lib/subscriptions";
import { getNativeDefault } from "@/theme/colors";
import {
  FontFamilies,
  FontSizes,
  LineHeights,
  Typography,
} from "@/theme/typography";
import { forwardRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  price: string;
  onPriceChange: (v: string) => void;
  cycle: BillingCycle;
  onCycleChange: (c: BillingCycle) => void;
  currency: string;
  onCurrencyChange: (code: string) => void;
};

export const PriceAndCycleFields = forwardRef<TextInput, Props>(
  (
    { price, onPriceChange, cycle, onCycleChange, currency, onCurrencyChange },
    ref,
  ) => {
    const symbol = formatCurrencySymbol(currency);
    return (
      <View style={styles.container}>
        <FieldLabel icon="dollar-sign" label="Price" />
        <View style={styles.priceRow}>
          <View style={styles.currencySymbolContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={styles.currencySymbolText}
            >
              {symbol}
            </Text>
          </View>
          <TextInput
            ref={ref}
            value={price}
            onChangeText={onPriceChange}
            placeholder="0.00"
            placeholderTextColor={getNativeDefault("secondaryText")}
            keyboardType="decimal-pad"
            style={styles.priceInput}
          />
        </View>

        <Text style={styles.sectionLabel}>Billing currency</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}
        >
          {SUPPORTED_CURRENCIES.map((opt) => {
            const active = opt.code === currency;
            return (
              <Pressable
                key={opt.code}
                onPress={() => onCurrencyChange(opt.code)}
                style={active ? styles.pillActive : styles.pillInactive}
              >
                <Text
                  style={
                    active ? styles.pillTextActive : styles.pillTextInactive
                  }
                >
                  {opt.code}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.cycleRow}>
          {BILLING_CYCLES.map((c) => {
            const active = c.id === cycle;
            return (
              <Pressable
                key={c.id}
                onPress={() => onCycleChange(c.id)}
                style={
                  active ? styles.cyclePillActive : styles.cyclePillInactive
                }
              >
                <Text
                  style={
                    active ? styles.cycleTextActive : styles.cycleTextInactive
                  }
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  },
);

PriceAndCycleFields.displayName = "PriceAndCycleFields";

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  currencySymbolContainer: {
    minWidth: 52,
    maxWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 4,
  },
  currencySymbolText: {
    ...Typography.bodyMedium,
    color: getNativeDefault("secondaryText"),
  },
  priceInput: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: getNativeDefault("text"),
    ...Typography.body,
  },
  sectionLabel: {
    ...Typography.caption,
    color: getNativeDefault("secondaryText"),
  },
  scrollContainer: {
    gap: 8,
  },
  pillActive: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: getNativeDefault("text"),
    backgroundColor: getNativeDefault("text"),
  },
  pillInactive: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  pillTextActive: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: getNativeDefault("background"),
  },
  pillTextInactive: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: getNativeDefault("secondaryText"),
  },
  cycleRow: {
    flexDirection: "row",
    gap: 8,
  },
  cyclePillActive: {
    flex: 1,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    borderColor: getNativeDefault("text"),
    backgroundColor: getNativeDefault("text"),
  },
  cyclePillInactive: {
    flex: 1,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  cycleTextActive: {
    ...Typography.smallMedium,
    color: getNativeDefault("background"),
  },
  cycleTextInactive: {
    ...Typography.smallMedium,
    color: getNativeDefault("secondaryText"),
  },
});
