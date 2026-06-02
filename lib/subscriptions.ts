import { BRAND_PRESETS, type BrandPreset } from "./brand-presets";

export type BillingCycle = "month" | "year";

export type Subscription = {
  id: string;
  name: string;
  plan?: string;
  /** Optional domain (e.g. "netflix.com") used for the favicon-based logo fallback. */
  domain?: string;
  /** Optional simpleicons slug for crisp brand icon rendering. */
  iconSlug?: string;
  /** Brand colour used for the logo background tile when no logo is available. */
  brandColor?: string;
  /** Optional user-picked emoji used as the logo (takes priority over favicon/iconSlug). */
  emoji?: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  /** ISO date for next renewal. */
  nextRenewal: string;
  /** Whether the user wants this subscription tracked / "active". */
  active: boolean;
  paymentMethod?: string;
  /** ISO timestamp of when this subscription was added to the tracker. */
  createdAt?: string;
};

const TODAY = new Date("2026-05-08T00:00:00Z");

function inDays(days: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

/** Demo subscriptions used to render the screens until persistence lands. */
export const DEMO_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub_netflix",
    name: "Netflix",
    plan: "Premium",
    domain: "netflix.com",
    iconSlug: "netflix",
    brandColor: "#E50914",
    price: 17.99,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(4),
    active: true,
    paymentMethod: "Visa •• 4242",
  },
  {
    id: "sub_spotify",
    name: "Spotify",
    plan: "Family",
    domain: "spotify.com",
    iconSlug: "spotify",
    brandColor: "#1DB954",
    price: 16.99,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(11),
    active: true,
    paymentMethod: "Apple Pay",
  },
  {
    id: "sub_appletv",
    name: "Apple TV+",
    plan: "Premium Family",
    domain: "tv.apple.com",
    iconSlug: "appletv",
    brandColor: "#000000",
    price: 9.99,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(2),
    active: true,
    paymentMethod: "Apple Pay",
  },
  {
    id: "sub_dropbox",
    name: "Dropbox",
    plan: "Plus",
    domain: "dropbox.com",
    iconSlug: "dropbox",
    brandColor: "#0061FF",
    price: 11.99,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(18),
    active: true,
    paymentMethod: "Visa •• 4242",
  },
  {
    id: "sub_figma",
    name: "Figma",
    plan: "Professional",
    domain: "figma.com",
    iconSlug: "figma",
    brandColor: "#F24E1E",
    price: 12,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(22),
    active: false,
    paymentMethod: "Mastercard •• 9930",
  },
  {
    id: "sub_notion",
    name: "Notion",
    plan: "Plus",
    domain: "notion.so",
    iconSlug: "notion",
    brandColor: "#FFFFFF",
    price: 10,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(7),
    active: true,
    paymentMethod: "Visa •• 4242",
  },
  {
    id: "sub_amazon_prime",
    name: "Amazon Prime",
    plan: "Student",
    domain: "amazon.com",
    iconSlug: "amazonprime",
    brandColor: "#00A8E1",
    price: 7.49,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(15),
    active: true,
    paymentMethod: "Visa •• 4242",
  },
  {
    id: "sub_chatgpt",
    name: "ChatGPT",
    plan: "Plus",
    domain: "openai.com",
    iconSlug: "openai",
    brandColor: "#10A37F",
    price: 20,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(9),
    active: true,
    paymentMethod: "Apple Pay",
  },
  {
    id: "sub_icloud",
    name: "iCloud+",
    plan: "200 GB",
    domain: "icloud.com",
    iconSlug: "icloud",
    brandColor: "#3693F3",
    price: 2.99,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(25),
    active: true,
    paymentMethod: "Apple Pay",
  },
  {
    id: "sub_github",
    name: "GitHub",
    plan: "Pro",
    domain: "github.com",
    iconSlug: "github",
    brandColor: "#FFFFFF",
    price: 4,
    currency: "USD",
    billingCycle: "month",
    nextRenewal: inDays(13),
    active: false,
  },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "CA$",
  AUD: "A$",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  NGN: "₦",
};

export function formatCurrency(amount: number, currency = "USD"): string {
  const code = currency.toUpperCase();
  const customSymbol = CURRENCY_SYMBOLS[code];

  if (customSymbol) {
    try {
      const minimumFractionDigits = code === "JPY" ? 0 : 2;
      const maximumFractionDigits = minimumFractionDigits;
      const number = new Intl.NumberFormat("en-US", {
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount);
      return `${customSymbol}${number}`;
    } catch {
      return `${customSymbol}${amount.toFixed(code === "JPY" ? 0 : 2)}`;
    }
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

function isAnnualPaymentMonth(nextRenewalIso: string, now: Date): boolean {
  const renewal = new Date(nextRenewalIso);
  if (Number.isNaN(renewal.getTime())) return false;
  return renewal.getMonth() === now.getMonth();
}

export function toMonthly(sub: Subscription, now: Date = new Date()): number {
  if (!sub.active) return 0;
  if (sub.billingCycle === "year") {
    return isAnnualPaymentMonth(sub.nextRenewal, now) ? sub.price : 0;
  }
  return sub.price;
}

export function totalMonthly(
  subs: Subscription[],
  now: Date = new Date(),
): number {
  return subs.reduce((sum, s) => sum + toMonthly(s, now), 0);
}

export function totalYearly(
  subs: Subscription[],
  now: Date = new Date(),
): number {
  return subs
    .filter((s) => s.active)
    .reduce(
      (sum, s) =>
        sum + (s.billingCycle === "year" ? s.price : s.price * 12),
      0,
    );
}

const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  month: "Monthly",
  year: "Yearly",
};

export function billingCycleLabel(cycle: BillingCycle): string {
  return BILLING_CYCLE_LABEL[cycle] ?? "Monthly";
}

export function renewalCountdownLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "No renewal date";

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const days = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days <= 0) return "Renewal today";
  if (days === 1) return "Renewal tomorrow";
  if (days < 7) return `Renewal in ${days} days`;

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return `Renewal ${formatter.format(date)}`;
}

export function shortDateLabel(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function findPreset(query: string): BrandPreset | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return BRAND_PRESETS.find(
    (p) =>
      p.name.toLowerCase() === q ||
      p.domain === q ||
      p.aliases?.some((a) => a.toLowerCase() === q),
  );
}

export function searchPresets(query: string, limit = 8): BrandPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return BRAND_PRESETS.filter((p) => {
    if (p.name.toLowerCase().includes(q)) return true;
    if (p.domain.toLowerCase().includes(q)) return true;
    if (p.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
    return false;
  }).slice(0, limit);
}
