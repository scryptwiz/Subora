import { AddSubscriptionScreenBody } from "@/components/add-subscription/add-subscription-screen-body";
import {
  BrandPreviewProvider,
  useBrandPreview,
} from "@/components/add-subscription/brand-preview-card/context";
import { EmojiPickerModal } from "@/components/add-subscription/emoji-picker-modal";
import { searchPresets } from "@/lib/subscriptions";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

function AddSubscriptionScreenInner() {
  const {
    name,
    emoji,
    iconSlug,
    effectiveDomain,
    handleEmojiSelect,
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#111111]"
    >
      <View className="flex-1">
        <AddSubscriptionScreenBody
          isEditing={isEditing}
          isValid={isValid}
          saving={saving}
          setEmojiPickerOpen={setEmojiPickerOpen}
          suggestions={suggestions}
          price={price}
          setPrice={setPrice}
          cycle={cycle}
          setCycle={setCycle}
          currency={currency}
          setCurrency={setCurrency}
          renewalDate={renewalDate}
          minRenewalDate={minRenewalDate}
          setRenewalDate={setRenewalDate}
          reminderOffsets={reminderOffsets}
          setReminderOffsets={setReminderOffsets}
          priceNumber={priceNumber}
          onSave={() => void handleSave()}
        />
      </View>

      <EmojiPickerModal
        visible={emojiPickerOpen}
        selected={emoji}
        onClose={() => setEmojiPickerOpen(false)}
        onSelect={handleEmojiSelect}
        onClear={() => handleEmojiSelect("")}
      />
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
