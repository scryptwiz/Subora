import { AddSubscriptionScreenBody } from "@/components/add-subscription/add-subscription-screen-body";
import {
  BrandPreviewProvider,
  useBrandPreview,
} from "@/components/add-subscription/brand-preview-card/context";
import { EmojiPickerModal } from "@/components/add-subscription/emoji-picker-modal";
import { getNativeDefault } from "@/theme/colors";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AddSubscriptionScreenInner() {
  const insets = useSafeAreaInsets();
  const { emoji, handleEmojiSelect } = useBrandPreview();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={"padding"}
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? insets.top : 0 },
      ]}
    >
      <View style={styles.content}>
        <AddSubscriptionScreenBody setEmojiPickerOpen={setEmojiPickerOpen} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getNativeDefault("background"),
  },
  content: {
    flex: 1,
  },
});
