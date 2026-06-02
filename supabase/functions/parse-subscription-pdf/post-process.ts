import { EDGE_BRAND_PRESETS, type EdgeBrandPreset } from "./brand-presets.ts";
import { MAX_RESPONSE_LINES } from "./constants.ts";
import type { GeminiRawLine } from "./gemini-extract.ts";

export type ParsedStatementLine = {
  id: string;
  rawDescription: string;
  amount: number;
  currency: string;
  transactionDate?: string;
  subscriptionLikelihood: "high" | "medium" | "low" | "not";
  rationale?: string;
  merchantGuess?: string;
  suggestedName?: string;
  suggestedDomain?: string;
  iconSlug?: string;
  brandColor?: string;
  inferredBillingCycle?: "month" | "year";
};

export type ParsePdfResponse = {
  lines: ParsedStatementLine[];
  truncated: boolean;
  omittedLineCount?: number;
};

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rowKey(line: GeminiRawLine): string {
  const desc = normalizeText(line.rawDescription);
  const date = line.transactionDate?.slice(0, 10) ?? "";
  const amt = Math.round(line.amount * 100);
  return `${date}|${amt}|${desc}`;
}

function matchPreset(text: string): EdgeBrandPreset | undefined {
  const norm = normalizeText(text);
  for (const preset of EDGE_BRAND_PRESETS) {
    const nameNorm = normalizeText(preset.name);
    if (norm.includes(nameNorm)) return preset;
    if (preset.aliases?.some((a) => norm.includes(normalizeText(a))))
      return preset;
    const domainStem = preset.domain.split(".")[0];
    if (domainStem.length > 3 && norm.includes(domainStem)) return preset;
  }
  return undefined;
}

function isLikelihood(
  v: unknown,
): v is GeminiRawLine["subscriptionLikelihood"] {
  return v === "high" || v === "medium" || v === "low" || v === "not";
}

function isCycle(v: unknown): v is "month" | "year" {
  return v === "month" || v === "year";
}

function sanitizeLine(
  raw: GeminiRawLine,
  index: number,
): ParsedStatementLine | null {
  const desc =
    typeof raw.rawDescription === "string" ? raw.rawDescription.trim() : "";
  if (!desc || desc.length < 2) return null;
  if (/^(page|balance|total|subtotal)\b/i.test(desc)) return null;

  const amount = Number(raw.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const currency =
    typeof raw.currency === "string" && raw.currency.trim()
      ? raw.currency.trim().toUpperCase().slice(0, 3)
      : "USD";

  const likelihood = isLikelihood(raw.subscriptionLikelihood)
    ? raw.subscriptionLikelihood
    : "low";

  const matchText = [desc, raw.merchantGuess ?? ""].filter(Boolean).join(" ");
  const preset = matchPreset(matchText);

  const suggestedName =
    preset?.name ??
    (typeof raw.merchantGuess === "string" && raw.merchantGuess.trim()
      ? raw.merchantGuess.trim()
      : desc.slice(0, 80));

  let transactionDate: string | undefined;
  if (typeof raw.transactionDate === "string" && raw.transactionDate.trim()) {
    const d = new Date(raw.transactionDate.trim());
    if (!Number.isNaN(d.getTime())) transactionDate = d.toISOString();
  }

  return {
    id: `line_${index}`,
    rawDescription: desc,
    amount: Math.round(amount * 100) / 100,
    currency,
    transactionDate,
    subscriptionLikelihood: likelihood,
    rationale:
      typeof raw.rationale === "string" && raw.rationale.trim()
        ? raw.rationale.trim()
        : undefined,
    merchantGuess:
      typeof raw.merchantGuess === "string" && raw.merchantGuess.trim()
        ? raw.merchantGuess.trim()
        : undefined,
    suggestedName,
    suggestedDomain: preset?.domain,
    iconSlug: preset?.iconSlug,
    brandColor: preset?.brandColor,
    inferredBillingCycle: isCycle(raw.inferredBillingCycle)
      ? raw.inferredBillingCycle
      : undefined,
  };
}

export function postProcessGeminiResult(
  raw: {
    lines: GeminiRawLine[];
    modelTruncated?: boolean;
    estimatedOmittedCount?: number | null;
  },
  startId = 0,
): ParsePdfResponse {
  const seen = new Set<string>();
  const deduped: ParsedStatementLine[] = [];
  let idx = startId;

  for (const line of raw.lines) {
    const key = rowKey(line);
    if (seen.has(key)) continue;
    seen.add(key);
    const sanitized = sanitizeLine(line, idx++);
    if (sanitized) deduped.push(sanitized);
  }

  const truncatedByModel = Boolean(raw.modelTruncated);
  const truncatedByCap = deduped.length > MAX_RESPONSE_LINES;
  const lines = deduped.slice(0, MAX_RESPONSE_LINES);

  let omittedLineCount: number | undefined;
  if (truncatedByCap) {
    omittedLineCount = deduped.length - MAX_RESPONSE_LINES;
  } else if (
    typeof raw.estimatedOmittedCount === "number" &&
    raw.estimatedOmittedCount > 0
  ) {
    omittedLineCount = raw.estimatedOmittedCount;
  }

  return {
    lines,
    truncated: truncatedByModel || truncatedByCap,
    omittedLineCount,
  };
}
