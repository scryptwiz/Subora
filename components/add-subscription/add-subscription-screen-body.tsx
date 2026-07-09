import { AddSubscriptionHeader } from "@/components/add-subscription/add-subscription-header";
import { BillingAndRemindersCard } from "@/components/add-subscription/billing-and-reminders-card";
import {
  BrandPreviewCard,
  useBrandPreview,
} from "@/components/add-subscription/brand-preview-card";
import { FieldLabel } from "@/components/add-subscription/form-fields";
import { PresetChips } from "@/components/add-subscription/preset-chips";
import { PriceAndCycleFields } from "@/components/add-subscription/price-and-cycle-fields";
import { SaveSubscriptionButton } from "@/components/add-subscription/save-subscription-button";
import { formatBillingDate } from "@/lib/billing-date";
import { searchPresets } from "@/lib/subscriptions";
import { getNativeDefault } from "@/theme/colors";
import { FontFamilies } from "@/theme/typography";
import { useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type AddSubscriptionScreenBodyProps = {
  setEmojiPickerOpen: (v: boolean) => void;
};

export function AddSubscriptionScreenBody({
  setEmojiPickerOpen,
}: AddSubscriptionScreenBodyProps) {
  const router = useRouter();
  const priceRef = useRef<TextInput>(null);

  const {
    name,
    domainInput,
    effectiveDomain,
    iconSlug,
    setDomainInput,
    clearLogoIfNameEdited,
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

  const minRenewalDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const suggestions = useMemo(() => searchPresets(name, 5), [name]);

  return (
    <ScrollView
      style={styles.scrollView}
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
        onSave={handleSave}
      />
      {!isEditing ? (
        <Pressable
          onPress={() => router.push("/(home)/import-subscriptions-from-pdf")}
          style={styles.pdfButton}
        >
          <Text style={styles.pdfButtonText}>
            Import from PDF (receipt or statement)
          </Text>
          <Text style={styles.pdfButtonSubtitle}>
            Subora does not store the file.
          </Text>
        </Pressable>
      ) : null}

      <BrandPreviewCard onPressLogo={() => setEmojiPickerOpen(true)} />

      <View style={styles.inputGroup}>
        <FieldLabel icon="tag" label="Service" />
        <TextInput
          value={name}
          onChangeText={clearLogoIfNameEdited}
          placeholder="e.g. Netflix"
          placeholderTextColor="#52525B"
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => priceRef.current?.focus()}
        />

        <PresetChips
          suggestions={suggestions}
          onSelect={applyPreset}
          show={!iconSlug}
        />
      </View>

      <View style={styles.inputGroup}>
        <FieldLabel
          icon="globe"
          label="Website (optional, used for the logo)"
        />
        <TextInput
          value={domainInput}
          onChangeText={setDomainInput}
          placeholder={effectiveDomain ?? "netflix.com"}
          placeholderTextColor="#52525B"
          keyboardType={Platform.OS === "ios" ? "url" : "default"}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
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
        onPress={handleSave}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  pdfButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pdfButtonText: {
    fontFamily: FontFamilies.medium,
    fontSize: 14,
    color: getNativeDefault("text"),
  },
  pdfButtonSubtitle: {
    marginTop: 4,
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    color: getNativeDefault("secondaryText"),
    lineHeight: 16,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 16,
    fontFamily: FontFamilies.regular,
    fontSize: 16,
    lineHeight: 18,
    color: getNativeDefault("text"),
  },
});
