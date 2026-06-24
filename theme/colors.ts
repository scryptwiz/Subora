import { Color } from "expo-router";
import { ColorValue, Platform } from "react-native";

export type SystemColorKey =
  | "background"
  | "secondaryBackground"
  | "tertiaryBackground"
  | "text"
  | "secondaryText"
  | "separator"
  | "link";

export function getNativeDefault(key: SystemColorKey): ColorValue {
  return Platform.select({
    ios: {
      background: Color.ios.systemBackground,
      secondaryBackground: Color.ios.secondarySystemBackground,
      tertiaryBackground: Color.ios.tertiarySystemBackground,
      text: Color.ios.label,
      secondaryText: Color.ios.secondaryLabel,
      separator: Color.ios.separator,
      link: Color.ios.link,
    },
    android: {
      background: Color.android.dynamic.surfaceContainer,
      secondaryBackground: Color.android.dynamic.surfaceContainerHigh,
      tertiaryBackground: Color.android.dynamic.surfaceContainerLow,
      text: Color.android.dynamic.onSurface,
      secondaryText: Color.android.dynamic.onSurfaceVariant,
      separator: Color.android.dynamic.outlineVariant,
      link: Color.android.dynamic.primary,
    },
    default: {
      background: "#111111",
      secondaryBackground: "#111111",
      tertiaryBackground: "#111111",
      text: "#FFFFFF",
      secondaryText: "#CCCCCC",
      separator: "#333333",
      link: "#FFFFFF",
    },
  })[key];
}

export const Colors = {
  background: "#111111",
  secondaryBackground: "#111111",
  text: "#FFFFFF",
  secondaryText: "#CCCCCC",
  separator: "#333333",
  link: "#FFFFFF",
};
