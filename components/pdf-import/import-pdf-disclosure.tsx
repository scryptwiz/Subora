import React from "react";
import { Text, View } from "react-native";

export function ImportPdfDisclosure() {
  return (
    <View className="rounded-2xl border border-[#27272A] bg-[#16161A] px-4 py-3">
      <Text className="font-inter text-xs leading-5 text-[#A1A1AA]">
        Subora does not store the file. Only upload statements you are
        comfortable sharing.
      </Text>
    </View>
  );
}
