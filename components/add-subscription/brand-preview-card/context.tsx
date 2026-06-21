import { DEFAULT_CURRENCY } from "@/constants/currencies";
import { usePreferences } from "@/contexts/preferences-context";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import { useSupabase } from "@/hooks/use-supabase";
import { saveSubscriptionReminders } from "@/lib/add-subscription/save-reminders";
import { dateToBillingIso } from "@/lib/billing-date";
import { useAuth } from "@clerk/expo";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useSubscriptionFormStore } from "./store";

export const useBrandPreview = () => {
  const store = useSubscriptionFormStore();
  const supabase = useSupabase();
  const { userId } = useAuth();
  const router = useRouter();
  const { insertSubscription, updateSubscription } = useSubscriptions();

  const priceNumber = useMemo(() => {
    return parseFloat(store.price.replace(",", "."));
  }, [store.price]);

  const isValid = useMemo(() => {
    return (
      store.name.trim().length > 0 &&
      Number.isFinite(priceNumber) &&
      priceNumber > 0
    );
  }, [store.name, priceNumber]);

  const handleSave = useCallback(async () => {
    if (!isValid || store.saving) return;

    const domain = store.effectiveDomain?.trim() || undefined;

    store.setSaving(true);
    try {
      if (store.isEditing && store.editingId) {
        await updateSubscription(store.editingId, {
          name: store.name.trim(),
          domain: domain ?? "",
          iconSlug: store.iconSlug ?? undefined,
          brandColor: store.brandColor ?? undefined,
          emoji: store.emoji ?? undefined,
          price: priceNumber,
          currency: store.currency.toUpperCase(),
          billingCycle: store.cycle,
          nextRenewal: dateToBillingIso(store.renewalDate),
          active: store.active,
        });
        if (supabase && userId) {
          await saveSubscriptionReminders(
            supabase,
            userId,
            store.editingId,
            store.reminderOffsets,
          );
        }
      } else {
        const newId = await insertSubscription({
          name: store.name.trim(),
          domain,
          plan: undefined,
          iconSlug: store.iconSlug,
          brandColor: store.brandColor,
          emoji: store.emoji,
          price: priceNumber,
          currency: store.currency.toUpperCase(),
          billingCycle: store.cycle,
          nextRenewal: dateToBillingIso(store.renewalDate),
          active: true,
        });
        if (supabase && userId) {
          await saveSubscriptionReminders(
            supabase,
            userId,
            newId,
            store.reminderOffsets,
          );
        }
      }
      router.back();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not save subscription.";
      Alert.alert("Save failed", message);
    } finally {
      store.setSaving(false);
    }
  }, [
    isValid,
    store.saving,
    store.isEditing,
    store.editingId,
    store.name,
    store.effectiveDomain,
    store.iconSlug,
    store.brandColor,
    store.emoji,
    store.currency,
    store.cycle,
    store.renewalDate,
    store.active,
    store.reminderOffsets,
    priceNumber,
    supabase,
    userId,
    insertSubscription,
    updateSubscription,
    router,
  ]);

  return {
    ...store,
    priceNumber,
    isValid,
    handleSave,
  };
};

export function BrandPreviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useLocalSearchParams<{
    id?: string;
    prefillName?: string;
    prefillPrice?: string;
    prefillCurrency?: string;
    prefillDomain?: string;
    prefillCycle?: string;
    prefillRenewal?: string;
    prefillIconSlug?: string;
    prefillBrandColor?: string;
  }>();

  const editingId =
    typeof params.id === "string" && params.id.length > 0
      ? params.id
      : undefined;
  const isEditing = Boolean(editingId);

  const supabase = useSupabase();
  const { userId } = useAuth();
  const { subscriptions } = useSubscriptions();
  const { displayCurrency, loading: prefsLoading } = usePreferences();

  const store = useSubscriptionFormStore();

  const editingSubscription = useMemo(
    () =>
      editingId ? subscriptions.find((s) => s.id === editingId) : undefined,
    [editingId, subscriptions],
  );

  // Automatically reset the form state when this provider unmounts
  useEffect(() => {
    return () => {
      store.resetForm();
    };
  }, []);

  // Hydrate display currency for new subscription
  useEffect(() => {
    if (isEditing) return;
    if (prefsLoading) return;
    store.hydrateForm({ currency: displayCurrency });
  }, [prefsLoading, displayCurrency, isEditing]);

  // Hydrate editing subscription details
  useEffect(() => {
    if (!isEditing || !editingSubscription) return;

    const next = new Date(editingSubscription.nextRenewal);
    const nextRenewal = !Number.isNaN(next.getTime()) ? next : new Date();

    store.hydrateForm({
      name: editingSubscription.name,
      domainInput: editingSubscription.domain ?? "",
      iconSlug: editingSubscription.iconSlug,
      brandColor: editingSubscription.brandColor ?? "",
      emoji: editingSubscription.emoji ?? undefined,
      price: String(editingSubscription.price),
      cycle: editingSubscription.billingCycle,
      currency: editingSubscription.currency.toUpperCase() || DEFAULT_CURRENCY,
      renewalDate: nextRenewal,
      active: editingSubscription.active,
      isEditing: true,
      editingId,
    });
  }, [isEditing, editingSubscription, editingId]);

  // Hydrate URL pre-fills
  useEffect(() => {
    if (isEditing) return;
    const pn = params.prefillName;
    if (typeof pn !== "string" || !pn.trim()) return;

    const partial: Partial<typeof store> = {
      name: pn.trim(),
    };

    if (
      typeof params.prefillDomain === "string" &&
      params.prefillDomain.trim()
    ) {
      partial.domainInput = params.prefillDomain.trim();
    }
    if (typeof params.prefillPrice === "string" && params.prefillPrice.trim()) {
      partial.price = params.prefillPrice.trim();
    }
    if (
      typeof params.prefillCurrency === "string" &&
      params.prefillCurrency.trim()
    ) {
      partial.currency = params.prefillCurrency.trim().toUpperCase();
    }
    if (params.prefillCycle === "month" || params.prefillCycle === "year") {
      partial.cycle = params.prefillCycle;
    }
    if (
      typeof params.prefillRenewal === "string" &&
      params.prefillRenewal.trim()
    ) {
      const d = new Date(params.prefillRenewal.trim());
      if (!Number.isNaN(d.getTime())) partial.renewalDate = d;
    }
    if (
      typeof params.prefillIconSlug === "string" &&
      params.prefillIconSlug.trim()
    ) {
      partial.iconSlug = params.prefillIconSlug.trim();
      partial.brandColor =
        (params.prefillBrandColor as string | undefined)?.trim() ?? "";
    }

    store.hydrateForm(partial);
  }, [isEditing, params]);

  // Hydrate reminders from DB
  useEffect(() => {
    if (!isEditing || !editingId || !supabase || !userId) return;
    void supabase
      .from("subscription_reminders")
      .select("offset_days")
      .eq("subscription_id", editingId)
      .eq("user_id", userId)
      .then(({ data }) => {
        const offsets = ((data ?? []) as { offset_days: number }[]).map(
          (r) => r.offset_days,
        );
        store.hydrateForm({ reminderOffsets: offsets.length ? offsets : [0] });
      });
  }, [isEditing, editingId, supabase, userId]);

  return <>{children}</>;
}
