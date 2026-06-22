import React from "react";
import { View } from "react-native";

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#16161A]">
      {React.Children.toArray(children).map((child, idx, arr) => (
        <View key={idx}>
          {child}
          {idx < arr.length - 1 ? (
            <View className="ml-[68px] h-px bg-[#1F1F22]" />
          ) : null}
        </View>
      ))}
    </View>
  );
}
