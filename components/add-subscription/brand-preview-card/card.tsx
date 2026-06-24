import { SubscriptionLogo } from "@/components/subscriptions/subscription-logo";
import { getNativeDefault } from "@/theme/colors";
import { Typography } from "@/theme/typography";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useBrandPreview } from "./context";

type Props = {
  onPressLogo?: () => void;
  plain?: boolean;
};

export function BrandPreviewCard({ onPressLogo, plain }: Props) {
  const { name, effectiveDomain, iconSlug, brandColor, emoji } =
    useBrandPreview();

  const subtitle = emoji
    ? "Custom emoji"
    : (effectiveDomain ?? "Tap the icon to pick an emoji");

  return (
    <View style={plain ? styles.cardContainerPlain : styles.cardContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change icon"
        onPress={onPressLogo}
        disabled={!onPressLogo}
        hitSlop={8}
        style={({ pressed }) =>
          pressed && onPressLogo ? { opacity: 0.85 } : undefined
        }
      >
        <View>
          <SubscriptionLogo
            name={name || "New service"}
            domain={effectiveDomain}
            iconSlug={iconSlug}
            emoji={emoji}
            tint={brandColor}
            size={84}
          />
          {onPressLogo ? (
            <View style={styles.editBtn}>
              <Feather
                name="edit-2"
                size={12}
                color={getNativeDefault("secondaryBackground")}
              />
            </View>
          ) : null}
        </View>
      </Pressable>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.serviceName}>{name.trim() || "Service name"}</Text>
        <Text style={styles.serviceSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    gap: 16,
    padding: 24,
    borderWidth: 1,
    borderRadius: 24,
    backgroundColor: getNativeDefault("secondaryBackground"),
    borderColor: getNativeDefault("secondaryBackground"),
  },
  cardContainerPlain: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
  },
  serviceName: {
    ...Typography.titleBold,
    color: getNativeDefault("text"),
  },
  serviceSubtitle: {
    ...Typography.caption,
    marginTop: 1,
    color: getNativeDefault("secondaryText"),
  },
  editBtn: {
    position: "absolute",
    bottom: -1,
    right: -1,
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: getNativeDefault("secondaryBackground"),
    backgroundColor: getNativeDefault("text"),
    borderRadius: 99,
  },
});
