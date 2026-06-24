export const FontFamilies = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  bold: "Inter_700Bold",
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,

  // Semantic aliases
  caption: 12, // xs
  small: 14, // sm
  body: 16, // base
  subheading: 18, // lg
  title: 20, // xl
  h1: 30, // 3xl
} as const;

export const LineHeights = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  "2xl": 32,
  "3xl": 36,
  "4xl": 40,
  "5xl": 48,

  // Semantic aliases
  caption: 16,
  small: 20,
  body: 24,
  subheading: 28,
  title: 28,
  h1: 36,
} as const;

export const Typography = {
  // Standard size presets
  xs: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    lineHeight: LineHeights.xs,
  },
  sm: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.sm,
  },
  base: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.base,
    lineHeight: LineHeights.base,
  },
  lg: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.lg,
    lineHeight: LineHeights.lg,
  },
  xl: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xl,
    lineHeight: LineHeights.xl,
  },
  "2xl": {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes["2xl"],
    lineHeight: LineHeights["2xl"],
  },
  "3xl": {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes["3xl"],
    lineHeight: LineHeights["3xl"],
  },
  "4xl": {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes["4xl"],
    lineHeight: LineHeights["4xl"],
  },
  "5xl": {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes["5xl"],
    lineHeight: LineHeights["5xl"],
  },

  // Semantic aliases (Regular)
  caption: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  small: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.small,
    lineHeight: LineHeights.small,
  },
  body: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
  },
  input: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.sm,
  },
  subheading: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.subheading,
    lineHeight: LineHeights.subheading,
  },

  // Medium weights
  smallMedium: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.small,
    lineHeight: LineHeights.small,
  },
  bodyMedium: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
  },
  subheadingMedium: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.subheading,
    lineHeight: LineHeights.subheading,
  },

  // Bold weights
  smallBold: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.small,
    lineHeight: LineHeights.small,
  },
  bodyBold: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
  },
  subheadingBold: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.subheading,
    lineHeight: LineHeights.subheading,
  },
  titleBold: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.title,
    lineHeight: LineHeights.title,
  },
  h1Bold: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
  },
} as const;
