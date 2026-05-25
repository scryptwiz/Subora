import { AddSubscriptionHeader } from "@/components/add-subscription/add-subscription-header";
import { BillingAndRemindersCard } from "@/components/add-subscription/billing-and-reminders-card";
import { BrandPreviewCard } from "@/components/add-subscription/brand-preview-card";
import { FieldLabel } from "@/components/add-subscription/form-fields";
import { PresetChips } from "@/components/add-subscription/preset-chips";
import { PriceAndCycleFields } from "@/components/add-subscription/price-and-cycle-fields";
import { SaveSubscriptionButton } from "@/components/add-subscription/save-subscription-button";
import { formatBillingDate } from "@/lib/billing-date";
import type { BrandPreset } from "@/lib/brand-presets";
import type { BillingCycle } from "@/lib/subscriptions";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type AddSubscriptionScreenBodyProps = {
  insetsTop: number;
  isEditing: boolean;
  isValid: boolean;
  saving: boolean;
  name: string;
  setName: (v: string) => void;
  clearLogoIfNameEdited: (v: string) => void;
  domainInput: string;
  setDomainInput: (v: string) => void;
  effectiveDomain?: string;
  iconSlug?: string;
  brandColor?: string;
  emoji?: string;
  setEmojiPickerOpen: (v: boolean) => void;
  suggestions: BrandPreset[];
  applyPreset: (p: BrandPreset) => void;
  price: string;
  setPrice: (v: string) => void;
  cycle: BillingCycle;
  setCycle: (v: BillingCycle) => void;
  currency: string;
  setCurrency: (v: string) => void;
  renewalDate: Date;
  minRenewalDate: Date;
  setRenewalDate: (d: Date) => void;
  reminderOffsets: number[];
  setReminderOffsets: React.Dispatch<React.SetStateAction<number[]>>;
  priceNumber: number;
  onSave: () => void;
};

export function AddSubscriptionScreenBody({
  insetsTop,
  isEditing,
  isValid,
  saving,
  name,
  setName,
  clearLogoIfNameEdited,
  domainInput,
  setDomainInput,
  effectiveDomain,
  iconSlug,
  brandColor,
  emoji,
  setEmojiPickerOpen,
  suggestions,
  applyPreset,
  price,
  setPrice,
  cycle,
  setCycle,
  currency,
  setCurrency,
  renewalDate,
  minRenewalDate,
  setRenewalDate,
  reminderOffsets,
  setReminderOffsets,
  priceNumber,
  onSave,
}: AddSubscriptionScreenBodyProps) {
  const router = useRouter();
  const priceRef = useRef<TextInput>(null);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingTop: (Platform.OS === "ios" ? 0 : insetsTop) + 24,
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
        onSave={onSave}
      />
      {!isEditing ? (
        <Pressable
          onPress={() => router.push("/(home)/import-subscriptions-from-pdf")}
          className="rounded-2xl border border-[#3F3F46] bg-[#18181B] px-4 py-3 active:opacity-80"
        >
          <Text className="font-inter text-sm font-semibold text-white">
            Import from PDF (receipt or statement)
          </Text>
          <Text className="mt-1 font-inter text-xs leading-4 text-[#A1A1AA]">
            Subora does not store the file.
          </Text>
        </Pressable>
      ) : null}
      <BrandPreviewCard
        name={name}
        effectiveDomain={effectiveDomain}
        iconSlug={iconSlug}
        brandColor={brandColor}
        emoji={emoji}
        onPressLogo={() => setEmojiPickerOpen(true)}
      />
      <View className="gap-3">
        <FieldLabel icon="tag" label="Service" />
        <TextInput
          value={name}
          onChangeText={clearLogoIfNameEdited}
          placeholder="e.g. Netflix"
          placeholderTextColor="#52525B"
          autoCapitalize="words"
          autoCorrect={false}
          className="h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base leading-[18px] text-white"
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
          placeholderTextColor="#52525B"
          keyboardType={Platform.OS === "ios" ? "url" : "default"}
          autoCapitalize="none"
          autoCorrect={false}
          className="h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base leading-[18px] text-white"
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
        onPress={onSave}
      />
    </ScrollView>
  );
}
