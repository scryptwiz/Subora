import { usePreferences } from "@/contexts/preferences-context";
import { useSubscriptions } from "@/contexts/subscriptions-context";
import { getRates, type RatesSnapshot } from "@/lib/exchange-rates";
import { sumPeriodSpendInDisplayCurrency } from "@/lib/spend-by-period";
import { formatMultiCurrencyBreakdown } from "@/lib/subscription-totals";
import { formatCurrency } from "@/lib/subscriptions";
import { useEffect, useMemo, useState } from "react";

export type ConvertedTotals = {
  snapshot: RatesSnapshot | null;
  monthlyNumber: number | null;
  yearlyNumber: number | null;
  monthlyLabel: string;
  yearlyLabel: string;
  fallbackLabel: string;
  fxIncomplete: boolean;
  fxAttempted: boolean;
};

export function useConvertedSpendTotals(): ConvertedTotals {
  const { subscriptions } = useSubscriptions();
  const { displayCurrency } = usePreferences();

  const [snapshot, setSnapshot] = useState<RatesSnapshot | null>(null);
  const [fxAttempted, setFxAttempted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFxAttempted(false);
    void getRates(displayCurrency)
      .then((s) => {
        if (cancelled) return;
        setSnapshot(s);
      })
      .catch(() => {
        if (cancelled) return;
        setSnapshot(null);
      })
      .finally(() => {
        if (cancelled) return;
        setFxAttempted(true);
      });
    return () => {
      cancelled = true;
    };
  }, [displayCurrency]);

  const aggregated = useMemo(() => {
    const now = new Date();
    return {
      month: sumPeriodSpendInDisplayCurrency(
        subscriptions,
        "month",
        displayCurrency,
        snapshot,
        now,
      ),
      year: sumPeriodSpendInDisplayCurrency(
        subscriptions,
        "year",
        displayCurrency,
        snapshot,
        now,
      ),
    };
  }, [subscriptions, displayCurrency, snapshot]);

  const monthlyNumber = aggregated.month.totalInDisplay;
  const yearlyNumber = aggregated.year.totalInDisplay;

  const fallbackLabel = formatMultiCurrencyBreakdown(
    aggregated.month.byCurrency,
  );

  const monthlyLabel =
    monthlyNumber !== null
      ? formatCurrency(monthlyNumber, displayCurrency)
      : fallbackLabel || "—";

  const yearlyLabel =
    yearlyNumber !== null
      ? formatCurrency(yearlyNumber, displayCurrency)
      : formatMultiCurrencyBreakdown(aggregated.year.byCurrency) ||
        fallbackLabel ||
        "—";

  const fxIncomplete =
    monthlyNumber === null &&
    Object.keys(aggregated.month.byCurrency).length > 0;

  return {
    snapshot,
    monthlyNumber,
    yearlyNumber,
    monthlyLabel,
    yearlyLabel,
    fallbackLabel,
    fxIncomplete,
    fxAttempted,
  };
}
