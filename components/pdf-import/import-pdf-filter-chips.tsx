import type { ImportFilter } from "@/types/pdf-import";
import React from "react";
import { Pressable, Text, View } from "react-native";

const FILTERS: { id: ImportFilter; label: string }[] = [
  { id: "suggested", label: "Suggested" },
  { id: "all", label: "All" },
  { id: "not", label: "Other" },
];

type ImportPdfFilterChipsProps = {
  value: ImportFilter;
  onChange: (f: ImportFilter) => void;
};

export function ImportPdfFilterChips({
  value,
  onChange,
}: ImportPdfFilterChipsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = value === f.id;
        return (
          <Pressable
            key={f.id}
            onPress={() => onChange(f.id)}
            className={`rounded-full px-3 py-1.5 ${active ? "bg-white" : "bg-[#27272A]"}`}
          >
            <Text
              className={`font-inter text-xs font-medium ${active ? "text-black" : "text-[#A1A1AA]"}`}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
