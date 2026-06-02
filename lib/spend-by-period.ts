import type { RatesSnapshot } from "@/lib/exchange-rates";
import {
    formatMultiCurrencyBreakdown,
    sumMonthlyInDisplayCurrency,
    type MonthlyTotalsResult,
} from "@/lib/subscription-totals";
import { formatCurrency, type Subscription } from "@/lib/subscriptions";


export type SpendPeriod = "month" | "year" | "all";

export function isAnnualPaymentMonth(
  nextRenewalIso: string,
  now: Date,
): boolean {
  const renewal = new Date(nextRenewalIso);
  if (Number.isNaN(renewal.getTime())) return false;
  return renewal.getMonth() === now.getMonth();
}

export function calendarMonthCharge(
  sub: Subscription,
  now: Date = new Date(),
): number {
  return periodAmountForSubscription(sub, "month", now);
}

export function periodAmountForSubscription(
  sub: Subscription,
  period: SpendPeriod,
  now: Date,
): number {
  if (!sub.active) return 0;
  const effectivePeriod = period === "all" ? "year" : period;
  if (sub.billingCycle === "year") {
    if (Number.isNaN(new Date(sub.nextRenewal).getTime())) return 0;
    if (effectivePeriod === "year") return sub.price;
    if (effectivePeriod === "month") {
      return isAnnualPaymentMonth(sub.nextRenewal, now) ? sub.price : 0;
    }
    return sub.price;
  }
  if (effectivePeriod === "year") return sub.price * 12;
  return sub.price;
}

function normalizedActiveRows(
  subs: Subscription[],
  period: SpendPeriod,
  now: Date,
): Subscription[] {
  return subs
    .map((sub) => {
      const amount = periodAmountForSubscription(sub, period, now);
      return {
        ...sub,
        billingCycle: "month" as const,
        price: amount,
        active: amount > 0,
      };
    })
    .filter((s) => s.active);
}

export function sumPeriodSpendInDisplayCurrency(
  subs: Subscription[],
  period: SpendPeriod,
  displayCurrency: string,
  snapshot: RatesSnapshot | null,
  now: Date = new Date(),
): MonthlyTotalsResult {
  return sumMonthlyInDisplayCurrency(
    normalizedActiveRows(subs, period, now),
    displayCurrency,
    snapshot,
    now,
  );
}

export function formatSpendLabelForPeriod(
  subs: Subscription[],
  period: SpendPeriod,
  displayCurrency: string,
  snapshot: RatesSnapshot | null,
  now: Date = new Date(),
): string {
  const agg = sumPeriodSpendInDisplayCurrency(
    subs,
    period,
    displayCurrency,
    snapshot,
    now,
  );
  const fallback = formatMultiCurrencyBreakdown(agg.byCurrency) || "—";
  return agg.totalInDisplay !== null
    ? formatCurrency(agg.totalInDisplay, displayCurrency)
    : fallback;
}
