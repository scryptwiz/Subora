import type { RatesSnapshot } from "@/lib/exchange-rates";
import { convertAmount } from "@/lib/exchange-rates";
import {
    formatCurrency,
    toMonthly,
    type Subscription,
} from "@/lib/subscriptions";

export type MonthlyTotalsResult = {
  /** Sum in `displayCurrency` when FX conversion succeeded for every active sub. */
  totalInDisplay: number | null;
  /** Grouped monthly amounts in each subscription's native currency (active only). */
  byCurrency: Record<string, number>;
};

export function monthlyAmountsByCurrency(
  subs: Subscription[],
  now: Date = new Date(),
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of subs) {
    if (!s.active) continue;
    const m = toMonthly(s, now);
    const code = s.currency.toUpperCase();
    out[code] = (out[code] ?? 0) + m;
  }
  return out;
}

/**
 * Converts every active subscription's monthly amount into `displayCurrency`
 * using a Frankfurter snapshot whose base matches `displayCurrency`.
 * Returns `totalInDisplay: null` if any currency pair is missing from the snapshot.
 */
export function sumMonthlyInDisplayCurrency(
  subs: Subscription[],
  displayCurrency: string,
  snapshot: RatesSnapshot | null,
  now: Date = new Date(),
): MonthlyTotalsResult {
  const byCurrency = monthlyAmountsByCurrency(subs, now);
  const codes = Object.keys(byCurrency);

  if (codes.length === 0) {
    return { totalInDisplay: 0, byCurrency };
  }

  if (
    !snapshot ||
    snapshot.base.toUpperCase() !== displayCurrency.toUpperCase()
  ) {
    return { totalInDisplay: null, byCurrency };
  }

  let sum = 0;
  for (const code of codes) {
    const amount = byCurrency[code] ?? 0;
    const conv =
      code === displayCurrency.toUpperCase()
        ? amount
        : convertAmount(amount, code, displayCurrency, snapshot);
    if (conv === null) {
      return { totalInDisplay: null, byCurrency };
    }
    sum += conv;
  }

  return { totalInDisplay: sum, byCurrency };
}

/** Sum of monthly equivalents for subs already priced in `currency` (no FX). */
export function monthlyTotalSameCurrencyOnly(
  subs: Subscription[],
  currency: string,
  now: Date = new Date(),
): number {
  const u = currency.toUpperCase();
  let sum = 0;
  for (const s of subs) {
    if (!s.active || s.currency.toUpperCase() !== u) continue;
    sum += toMonthly(s, now);
  }
  return sum;
}

/** Human-readable fallback when FX is unavailable: "€12.00 · $45.00" */
export function formatMultiCurrencyBreakdown(
  byCurrency: Record<string, number>,
): string {
  const parts = Object.entries(byCurrency)
    .filter(([, v]) => v > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, v]) => formatCurrency(v, code));
  return parts.join(" · ");
}
