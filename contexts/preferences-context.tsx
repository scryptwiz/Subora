import { DEFAULT_CURRENCY, isSupportedCurrency } from "@/constants/currencies";
import { isSupabaseConfigured, useSupabase } from "@/hooks/use-supabase";
import {
  clampUserReminderOffsets,
  normalizeDefaultReminderOffsets,
} from "@/lib/reminder-default-offsets";
import { useAuth } from "@clerk/expo";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PreferencesContextValue = {
  displayCurrency: string;
  notificationsEnabled: boolean;
  reminderOffsets: number[];
  loading: boolean;
  error: string | null;
  setDisplayCurrency: (code: string) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setReminderOffsets: (offsets: number[]) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function isReminderOffsetsSchemaError(
  err: { message?: string; details?: string } | null,
): boolean {
  const blob = `${err?.message ?? ""} ${err?.details ?? ""}`.toLowerCase();
  return blob.includes("reminder_default_offsets");
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const { userId, isLoaded } = useAuth();
  const configured = isSupabaseConfigured();

  const [displayCurrency, setDisplayCurrencyState] =
    useState<string>(DEFAULT_CURRENCY);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [reminderOffsets, setReminderOffsetsState] = useState<number[]>([1]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ensureRow = useCallback(async () => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    type UserSettingsLoad = {
      display_currency?: string;
      notifications_enabled?: boolean | null;
      reminder_days_before?: number | null;
      reminder_default_offsets?: number[] | null;
    };

    const selectFull = await supabase
      .from("user_settings")
      .select(
        "display_currency, notifications_enabled, reminder_days_before, reminder_default_offsets",
      )
      .eq("user_id", userId)
      .maybeSingle();

    let data: UserSettingsLoad | null =
      selectFull.data as UserSettingsLoad | null;
    let selectError = selectFull.error;
    if (selectError && isReminderOffsetsSchemaError(selectError)) {
      const r2 = await supabase
        .from("user_settings")
        .select("display_currency, notifications_enabled, reminder_days_before")
        .eq("user_id", userId)
        .maybeSingle();
      data = r2.data as UserSettingsLoad | null;
      selectError = r2.error;
    }

    if (selectError) {
      setError(selectError.message);
      setLoading(false);
      return;
    }

    if (data?.display_currency) {
      setDisplayCurrencyState(data.display_currency);
      setNotificationsEnabledState(data.notifications_enabled ?? true);
      const legacy =
        typeof data.reminder_days_before === "number"
          ? data.reminder_days_before
          : 1;
      setReminderOffsetsState(
        normalizeDefaultReminderOffsets(data.reminder_default_offsets, legacy),
      );
      setLoading(false);
      return;
    }

    let insertError = (
      await supabase.from("user_settings").insert({
        user_id: userId,
        display_currency: DEFAULT_CURRENCY,
        notifications_enabled: true,
        reminder_days_before: 1,
        reminder_default_offsets: [1],
      })
    ).error;

    if (
      insertError &&
      insertError.code !== "23505" &&
      isReminderOffsetsSchemaError(insertError)
    ) {
      insertError = (
        await supabase.from("user_settings").insert({
          user_id: userId,
          display_currency: DEFAULT_CURRENCY,
          notifications_enabled: true,
          reminder_days_before: 1,
        })
      ).error;
    }

    if (insertError && insertError.code !== "23505") {
      setError(insertError.message);
    } else {
      setDisplayCurrencyState(DEFAULT_CURRENCY);
      setNotificationsEnabledState(true);
      setReminderOffsetsState([1]);
    }
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!configured || !userId) {
      setLoading(false);
      return;
    }
    void ensureRow();
  }, [isLoaded, configured, userId, ensureRow]);

  const persistPrefs = useCallback(
    async (patch: {
      display_currency?: string;
      notifications_enabled?: boolean;
      reminder_default_offsets?: number[];
      reminder_days_before?: number;
    }) => {
      if (!supabase || !userId) throw new Error("Sign in required.");
      const row = { user_id: userId, ...patch };
      const { error: e1 } = await supabase
        .from("user_settings")
        .upsert(row, { onConflict: "user_id" });
      if (!e1) return;
      if (
        patch.reminder_default_offsets !== undefined &&
        isReminderOffsetsSchemaError(e1)
      ) {
        const { reminder_default_offsets: _drop, ...legacy } = row as {
          user_id: string;
          reminder_default_offsets?: number[];
          display_currency?: string;
          notifications_enabled?: boolean;
          reminder_days_before?: number;
        };
        const { error: e2 } = await supabase
          .from("user_settings")
          .upsert(legacy, { onConflict: "user_id" });
        if (e2) throw e2;
        return;
      }
      throw e1;
    },
    [supabase, userId],
  );

  const setDisplayCurrency = useCallback(
    async (code: string) => {
      if (!isSupportedCurrency(code)) {
        throw new Error(`Unsupported currency: ${code}`);
      }
      if (!supabase || !userId) {
        throw new Error("Sign in required.");
      }

      const previous = displayCurrency;
      setDisplayCurrencyState(code);
      setError(null);

      try {
        await persistPrefs({
          display_currency: code,
          notifications_enabled: notificationsEnabled,
          reminder_default_offsets: reminderOffsets,
          reminder_days_before: reminderOffsets[0] ?? 1,
        });
      } catch (upsertError) {
        setDisplayCurrencyState(previous);
        const msg =
          upsertError instanceof Error ? upsertError.message : "Save failed";
        setError(msg);
        throw upsertError;
      }
    },
    [
      supabase,
      userId,
      displayCurrency,
      notificationsEnabled,
      reminderOffsets,
      persistPrefs,
    ],
  );

  const setNotificationsEnabled = useCallback(
    async (enabled: boolean) => {
      if (!supabase || !userId) throw new Error("Sign in required.");
      const previous = notificationsEnabled;
      setNotificationsEnabledState(enabled);
      setError(null);
      try {
        await persistPrefs({
          display_currency: displayCurrency,
          notifications_enabled: enabled,
          reminder_default_offsets: reminderOffsets,
          reminder_days_before: reminderOffsets[0] ?? 1,
        });
      } catch (upError) {
        setNotificationsEnabledState(previous);
        const msg = upError instanceof Error ? upError.message : "Save failed";
        setError(msg);
        throw upError;
      }
    },
    [
      supabase,
      userId,
      notificationsEnabled,
      reminderOffsets,
      displayCurrency,
      persistPrefs,
    ],
  );

  const setReminderOffsets = useCallback(
    async (offsets: number[]) => {
      if (!supabase || !userId) throw new Error("Sign in required.");
      const next = clampUserReminderOffsets(offsets);
      const previous = reminderOffsets;
      setReminderOffsetsState(next);
      setError(null);
      try {
        await persistPrefs({
          display_currency: displayCurrency,
          notifications_enabled: notificationsEnabled,
          reminder_default_offsets: next,
          reminder_days_before: next[0] ?? 1,
        });
      } catch (upError) {
        setReminderOffsetsState(previous);
        const msg = upError instanceof Error ? upError.message : "Save failed";
        setError(msg);
        throw upError;
      }
    },
    [
      supabase,
      userId,
      reminderOffsets,
      displayCurrency,
      notificationsEnabled,
      persistPrefs,
    ],
  );

  const value = useMemo(
    () => ({
      displayCurrency,
      notificationsEnabled,
      reminderOffsets,
      loading,
      error,
      setDisplayCurrency,
      setNotificationsEnabled,
      setReminderOffsets,
    }),
    [
      displayCurrency,
      notificationsEnabled,
      reminderOffsets,
      loading,
      error,
      setDisplayCurrency,
      setNotificationsEnabled,
      setReminderOffsets,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider.");
  }
  return ctx;
}
