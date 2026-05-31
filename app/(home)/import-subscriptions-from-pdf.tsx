import { ImportPdfDisclosure } from "@/components/pdf-import/import-pdf-disclosure";
import { ImportPdfFilterChips } from "@/components/pdf-import/import-pdf-filter-chips";
import { ImportPdfRow } from "@/components/pdf-import/import-pdf-row";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import { useSupabase } from "@/hooks/use-supabase";
import { saveSubscriptionReminders } from "@/lib/add-subscription/save-reminders";
import { transactionDateToNextRenewalIso } from "@/lib/billing-date";
import { MAX_PDF_MB } from "@/lib/constants/pdf-import";
import {
  countSelected,
  filterImportRows,
  toImportRows,
} from "@/lib/pdf-import/import-rows";
import { parseSubscriptionPdf } from "@/lib/pdf-import/parse-subscription-pdf";
import type { ImportFilter, ImportRowState } from "@/types/pdf-import";
import { useAuth } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenPhase = "pick" | "parsing" | "review";

export default function ImportSubscriptionsFromPdfScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId } = useAuth();
  const supabase = useSupabase();
  const { insertSubscription, configured } = useSubscriptions();

  const [phase, setPhase] = useState<ScreenPhase>("pick");
  const [rows, setRows] = useState<ImportRowState[]>([]);
  const [filter, setFilter] = useState<ImportFilter>("suggested");
  const [truncated, setTruncated] = useState(false);
  const [omittedLineCount, setOmittedLineCount] = useState<
    number | undefined
  >();
  const [saving, setSaving] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseBusy, setParseBusy] = useState(false);
  const parseBusyRef = useRef(false);

  const visibleRows = useMemo(
    () => filterImportRows(rows, filter),
    [rows, filter],
  );
  const selectedCount = useMemo(() => countSelected(rows), [rows]);

  const pickAndParse = useCallback(async () => {
    if (parseBusyRef.current) return;
    parseBusyRef.current = true;
    setParseBusy(true);
    setParseError(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (!supabase) {
        Alert.alert("Sign in required", "Please sign in to import from PDF.");
        return;
      }

      setPhase("parsing");
      const parsed = await parseSubscriptionPdf(supabase, asset.uri);
      setRows(toImportRows(parsed.lines));
      setTruncated(parsed.truncated);
      setOmittedLineCount(parsed.omittedLineCount);
      setPhase("review");
      setFilter("suggested");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not parse PDF.";
      setParseError(message);
      setPhase("pick");
      Alert.alert("Couldn't import PDF", message);
    } finally {
      parseBusyRef.current = false;
      setParseBusy(false);
    }
  }, [supabase]);

  const updateRow = useCallback(
    (id: string, patch: Partial<ImportRowState>) => {
      setRows((prev) =>
        prev.map((r) => (r.line.id === id ? { ...r, ...patch } : r)),
      );
    },
    [],
  );

  const openEdit = useCallback(
    (row: ImportRowState) => {
      const line = row.line;
      const renewal = transactionDateToNextRenewalIso(
        line.transactionDate,
        line.inferredBillingCycle,
      );
      router.push({
        pathname: "/(home)/add-subscription",
        params: {
          prefillName:
            line.suggestedName ?? line.merchantGuess ?? line.rawDescription,
          prefillPrice: String(line.amount),
          prefillCurrency: line.currency,
          prefillDomain: line.suggestedDomain ?? "",
          prefillCycle: line.inferredBillingCycle ?? "month",
          prefillRenewal: renewal,
          prefillIconSlug: line.iconSlug ?? "",
          prefillBrandColor: line.brandColor ?? "",
        },
      });
    },
    [router],
  );

  const handleImportSelected = async () => {
    if (!configured || saving || selectedCount === 0) return;
    if (!supabase || !userId) {
      Alert.alert(
        "Sign in required",
        "Please sign in to import subscriptions.",
      );
      return;
    }

    const toImport = rows.filter((r) => !r.removed && r.selected);
    setSaving(true);
    try {
      for (const row of toImport) {
        const line = row.line;
        const renewal = transactionDateToNextRenewalIso(
          line.transactionDate,
          line.inferredBillingCycle,
        );
        const newId = await insertSubscription({
          name: (
            line.suggestedName ??
            line.merchantGuess ??
            line.rawDescription
          ).slice(0, 120),
          domain: line.suggestedDomain,
          iconSlug: line.iconSlug,
          brandColor: line.brandColor,
          price: line.amount,
          currency: line.currency,
          billingCycle: line.inferredBillingCycle ?? "month",
          nextRenewal: renewal,
          active: true,
        });
        await saveSubscriptionReminders(supabase, userId, newId, [0]);
      }
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Import failed.";
      Alert.alert("Import failed", message);
    } finally {
      setSaving(false);
    }
  };

  const paddingTop = (Platform.OS === "ios" ? 0 : insets.top) + 16;

  return (
    <View
      className="flex-1 bg-[#111111]"
      style={{ paddingTop, paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center justify-between px-5 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-[#27272A] bg-[#16161A]"
        >
          <Feather name="x" size={18} color="#FFFFFF" />
        </Pressable>
        <Text className="font-inter-medium text-base text-white">
          Import from PDF
        </Text>
        <View className="w-10" />
      </View>

      {phase === "pick" ? (
        <View className="flex-1 gap-4 px-5">
          <ImportPdfDisclosure />
          {parseError ? (
            <Text className="font-inter text-sm text-red-400">
              {parseError}
            </Text>
          ) : null}
          <Pressable
            onPress={() => void pickAndParse()}
            disabled={parseBusy}
            className="items-center justify-center rounded-2xl border border-dashed border-[#3F3F46] bg-[#18181B] py-12 active:opacity-80 disabled:opacity-50"
          >
            <Feather name="file-text" size={32} color="#A1A1AA" />
            <Text className="mt-3 font-inter text-sm font-semibold text-white">
              Choose PDF
            </Text>
            <Text className="mt-1 px-6 text-center font-inter text-xs text-[#71717A]">
              Receipt or bank/card statement (max {MAX_PDF_MB} MB)
            </Text>
          </Pressable>
        </View>
      ) : null}

      {phase === "parsing" ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#FFFFFF" size="large" />
          <Text className="font-inter text-sm text-[#A1A1AA]">
            Processing PDF…
          </Text>
        </View>
      ) : null}

      {phase === "review" ? (
        <View className="min-h-0 flex-1">
          <View className="gap-3 px-5 pb-3">
            {truncated ? (
              <View className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <Text className="font-inter text-xs text-amber-200">
                  Statement partially parsed
                  {omittedLineCount != null && omittedLineCount > 0
                    ? ` (~${omittedLineCount} lines omitted). `
                    : ". "}
                  Try a shorter period if something is missing.
                </Text>
              </View>
            ) : null}
            <ImportPdfFilterChips value={filter} onChange={setFilter} />
            <Text className="font-inter text-xs text-[#A1A1AA]">
              {selectedCount} selected for import · {visibleRows.length} shown
            </Text>
          </View>

          <FlatList
            data={visibleRows}
            keyExtractor={(item) => item.line.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 100,
              gap: 10,
            }}
            renderItem={({ item }) => (
              <ImportPdfRow
                row={item}
                onToggleSelected={() =>
                  updateRow(item.line.id, { selected: !item.selected })
                }
                onEdit={() => openEdit(item)}
                onRemove={() => updateRow(item.line.id, { removed: true })}
              />
            )}
            ListEmptyComponent={
              <Text className="py-8 text-center font-inter text-sm text-[#71717A]">
                No transactions in this filter.
              </Text>
            }
          />

          <View
            className="absolute bottom-0 left-0 right-0 border-t border-[#27272A] bg-[#111111] px-5 py-4"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Pressable
              onPress={() => void handleImportSelected()}
              disabled={selectedCount === 0 || saving}
              className={`h-14 items-center justify-center rounded-2xl ${
                selectedCount > 0 && !saving ? "bg-white" : "bg-[#27272A]"
              }`}
            >
              {saving ? (
                <ActivityIndicator color="#111111" />
              ) : (
                <Text
                  className={`font-inter text-base font-semibold ${
                    selectedCount > 0 ? "text-black" : "text-[#52525B]"
                  }`}
                >
                  Import {selectedCount} subscription
                  {selectedCount === 1 ? "" : "s"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
