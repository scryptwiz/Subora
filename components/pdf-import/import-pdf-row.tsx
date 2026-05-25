import {
  likelihoodBadgeClass,
  likelihoodLabel,
} from "@/lib/pdf-import/likelihood-style";
import { formatCurrency } from "@/lib/subscriptions";
import type { ImportRowState } from "@/types/pdf-import";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type ImportPdfRowProps = {
  row: ImportRowState;
  onToggleSelected: () => void;
  onEdit: () => void;
  onRemove: () => void;
};

export function ImportPdfRow({
  row,
  onToggleSelected,
  onEdit,
  onRemove,
}: ImportPdfRowProps) {
  const { line, selected } = row;
  const title = line.suggestedName ?? line.merchantGuess ?? line.rawDescription;
  const dateLabel = line.transactionDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(line.transactionDate))
    : null;

  return (
    <View className="flex-row items-start gap-3 rounded-2xl border border-[#27272A] bg-[#16161A] p-3">
      <Pressable
        onPress={onToggleSelected}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        className={`mt-0.5 h-6 w-6 items-center justify-center rounded-md border ${
          selected ? "border-white bg-white" : "border-[#52525B] bg-transparent"
        }`}
      >
        {selected ? <Feather name="check" size={14} color="#111111" /> : null}
      </Pressable>

      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text
            className="shrink font-inter text-sm font-semibold text-white"
            numberOfLines={2}
          >
            {title}
          </Text>
          <View
            className={`rounded-full px-2 py-0.5 ${likelihoodBadgeClass(line.subscriptionLikelihood)}`}
          >
            <Text className="font-inter text-[10px] font-medium">
              {likelihoodLabel(line.subscriptionLikelihood)}
            </Text>
          </View>
        </View>
        <Text className="font-inter text-xs text-[#71717A]" numberOfLines={1}>
          {line.rawDescription}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="font-inter text-sm text-white">
            {formatCurrency(line.amount, line.currency)}
            {dateLabel ? ` · ${dateLabel}` : ""}
          </Text>
        </View>
        {line.rationale ? (
          <Text
            className="font-inter text-[11px] leading-4 text-[#52525B]"
            numberOfLines={2}
          >
            {line.rationale}
          </Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Pressable
          onPress={onEdit}
          accessibilityLabel="Edit before import"
          className="h-8 w-8 items-center justify-center rounded-lg border border-[#27272A]"
        >
          <Feather name="edit-2" size={14} color="#A1A1AA" />
        </Pressable>
        <Pressable
          onPress={onRemove}
          accessibilityLabel="Remove from list"
          className="h-8 w-8 items-center justify-center rounded-lg border border-[#27272A]"
        >
          <Feather name="trash-2" size={14} color="#A1A1AA" />
        </Pressable>
      </View>
    </View>
  );
}
