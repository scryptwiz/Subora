/// <reference types="nativewind/types" />

declare module '@expo-google-fonts/inter' {
  export const Inter_400Regular: number
  export const Inter_500Medium: number
  export const Inter_700Bold: number
  export function useFonts(map: Record<string, number>): [boolean, Error | null]
}