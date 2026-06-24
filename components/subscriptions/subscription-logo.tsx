import { avatarColor, initials, logoSources } from "@/lib/logo";
import { getNativeDefault } from "@/theme/colors";
import { FontFamilies } from "@/theme/typography";
import { Image, type ImageSource } from "expo-image";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type SubscriptionLogoProps = {
  name: string;
  domain?: string;
  iconSlug?: string;
  emoji?: string;
  tint?: string;
  size?: number;
  bleed?: boolean;
};

/**
 * Renders the best available logo for a subscription with a graceful fallback chain:
 * 1. user-picked emoji
 * 2. simpleicons CDN (crisp coloured brand SVG)
 * 3. favicon for the given domain
 * 4. deterministic letter tile
 */
export function SubscriptionLogo({
  name,
  domain,
  iconSlug,
  emoji,
  tint,
  size = 44,
  bleed = false,
}: SubscriptionLogoProps) {
  const sources = useMemo<ImageSource[]>(
    () => logoSources({ iconSlug, domain }),
    [iconSlug, domain],
  );
  const [failed, setFailed] = useState(false);

  const radius = Math.round(size * 0.28);
  const bg = bleed
    ? (tint ?? avatarColor(name))
    : getNativeDefault("tertiaryBackground");
  const showFallback = failed || sources.length === 0;

  if (emoji) {
    return (
      <View
        style={[
          styles.logoContainer,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: bg,
          },
        ]}
      >
        <Text
          style={{
            fontSize: Math.round(size * 0.55),
            lineHeight: Math.round(size * 0.7),
          }}
        >
          {emoji}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.logoContainer,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
        },
      ]}
    >
      {showFallback ? (
        <View
          style={[
            styles.logoBg,
            { backgroundColor: tint ?? avatarColor(name) },
          ]}
        >
          <Text style={[styles.textLogo, { fontSize: Math.round(size * 0.4) }]}>
            {initials(name)}
          </Text>
        </View>
      ) : (
        <Image
          source={sources}
          contentFit="contain"
          transition={120}
          cachePolicy="memory-disk"
          onError={() => setFailed(true)}
          style={{ width: size * 0.62, height: size * 0.62 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoBg: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  textLogo: {
    fontFamily: FontFamilies.bold,
    color: getNativeDefault("text"),
  },
});
