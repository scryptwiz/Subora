import { AddSubscriptionHeader } from "@/components/add-subscription/add-subscription-header";
import { BillingAndRemindersCard } from "@/components/add-subscription/billing-and-reminders-card";
import {
  BrandPreviewCard,
  BrandPreviewProvider,
  useBrandPreview,
} from "@/components/add-subscription/brand-preview-card";
import { FieldLabel } from "@/components/add-subscription/form-fields";
import { PresetChips } from "@/components/add-subscription/preset-chips";
import { PriceAndCycleFields } from "@/components/add-subscription/price-and-cycle-fields";
import { SaveSubscriptionButton } from "@/components/add-subscription/save-subscription-button";
import { formatBillingDate } from "@/lib/billing-date";
import { searchPresets } from "@/lib/subscriptions";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function AddSubscriptionScreenInner() {
  const router = useRouter();
  const {
    name,
    domainInput,
    iconSlug,
    effectiveDomain,
    clearLogoIfNameEdited,
    setDomainInput,
    applyPreset,
    price,
    setPrice,
    cycle,
    setCycle,
    currency,
    setCurrency,
    renewalDate,
    setRenewalDate,
    reminderOffsets,
    setReminderOffsets,
    saving,
    isEditing,
    priceNumber,
    isValid,
    handleSave,
  } = useBrandPreview();

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const minRenewalDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const suggestions = useMemo(() => searchPresets(name, 5), [name]);
  const priceRef = useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 24,
          paddingHorizontal: 20,
          paddingBottom: 40,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AddSubscriptionHeader
          isEditing={isEditing}
          isValid={isValid}
          saving={saving}
          onClose={() => router.back()}
          onSave={() => void handleSave()}
        />
        {!isEditing ? (
          <Pressable
            onPress={() => router.push("/(home)/import-subscriptions-from-pdf")}
            style={styles.importButton}
          >
            <Text style={styles.importTitle}>
              Import from PDF (receipt or statement)
            </Text>
            <Text style={styles.importSubtitle}>
              Subora does not store the file.
            </Text>
          </Pressable>
        ) : null}
        <BrandPreviewCard onPressLogo={() => setEmojiPickerOpen(true)} />
        <View style={{ gap: 12 }}>
          <FieldLabel icon="tag" label="Service" />
          <TextInput
            value={name}
            onChangeText={clearLogoIfNameEdited}
            placeholder="e.g. Netflix"
            placeholderTextColor={getNativeDefault("secondaryText")}
            autoCapitalize="words"
            autoCorrect={false}
            style={styles.textInput}
            returnKeyType="next"
            onSubmitEditing={() => priceRef.current?.focus()}
          />

          <PresetChips
            suggestions={suggestions}
            onSelect={applyPreset}
            show={!iconSlug}
          />
        </View>

        <View className="gap-3">
          <FieldLabel
            icon="globe"
            label="Website (optional, used for the logo)"
          />
          <TextInput
            value={domainInput}
            onChangeText={setDomainInput}
            placeholder={effectiveDomain ?? "netflix.com"}
            placeholderTextColor={getNativeDefault("secondaryText")}
            keyboardType={Platform.OS === "ios" ? "url" : "default"}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.textInput}
          />
        </View>

        <PriceAndCycleFields
          ref={priceRef}
          price={price}
          onPriceChange={setPrice}
          cycle={cycle}
          onCycleChange={setCycle}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        <BillingAndRemindersCard
          renewalDate={renewalDate}
          minRenewalDate={minRenewalDate}
          onRenewalDateChange={setRenewalDate}
          formatRenewalDate={formatBillingDate}
          reminderOffsets={reminderOffsets}
          onReminderOffsetsChange={setReminderOffsets}
        />

        <SaveSubscriptionButton
          isValid={isValid}
          saving={saving}
          isEditing={isEditing}
          priceNumber={priceNumber}
          currency={currency}
          cycle={cycle}
          onPress={() => void handleSave()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AddSubscriptionScreen() {
  return (
    <BrandPreviewProvider>
      <AddSubscriptionScreenInner />
    </BrandPreviewProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getNativeDefault("background"),
  },
  importButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  importTitle: {
    ...Typography.smallBold,
    color: getNativeDefault("text"),
  },
  importSubtitle: {
    ...Typography.caption,
    marginTop: 4,
    color: getNativeDefault("secondaryText"),
  },
  textInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 16,
    color: getNativeDefault("text"),
    ...Typography.body,
  },
});
