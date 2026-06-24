/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-bold": ["Inter_700Bold"],
      },
      fontSize: {
        xs: ["10px", "14px"],
        sm: ["12px", "16px"],
        legal: ["13px", "19px"],
        base: ["14px", "20px"],
        lg: ["16px", "24px"],
        xl: ["18px", "28px"],
        "2xl": ["20px", "32px"],
        "3xl": ["24px", "36px"],
        "4xl": ["30px", "44px"],
        "5xl": ["38px", "52px"],
        "6xl": ["60px", "60px"],
        "7xl": ["72px", "72px"],
        "8xl": ["96px", "96px"],
        "9xl": ["128px", "128px"],
        "10xl": ["160px", "160px"],
      },
    },
  },
  plugins: [],
};
