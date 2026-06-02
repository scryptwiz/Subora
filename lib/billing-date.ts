/**
 * Convert a calendar date to a stable ISO timestamp anchored at noon UTC.
 * Anchoring at noon UTC keeps the calendar day intact across timezones,
 * so a "May 10" pick stays "May 10" wherever it's read.
 */
export function dateToBillingIso(date: Date): string {
  const utcNoon = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0),
  );
  return utcNoon.toISOString();
}

function addBillingCycle(date: Date, billingCycle: "month" | "year"): Date {
  if (billingCycle === "year") {
    return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
  }
  return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function transactionDateToNextRenewalIso(
  transactionDate: string | undefined,
  billingCycle: "month" | "year" = "month",
): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!transactionDate) {
    return dateToBillingIso(now);
  }

  const parsed = new Date(transactionDate);
  if (Number.isNaN(parsed.getTime())) {
    return dateToBillingIso(now);
  }

  const transactionDay = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  );

  if (transactionDay >= today) {
    return dateToBillingIso(transactionDay);
  }

  const nextRenewal = addBillingCycle(transactionDay, billingCycle);
  if (nextRenewal < today) {
    return dateToBillingIso(now);
  }

  return dateToBillingIso(nextRenewal);
}

/** Friendly label for a calendar date (uses local timezone). */
export function formatBillingDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const oneDay = 1000 * 60 * 60 * 24;
  const diff = Math.round((target.getTime() - today.getTime()) / oneDay);

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: target.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(date);
}
