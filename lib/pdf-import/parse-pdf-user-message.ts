const RATE_LIMIT =
  "Import is busy right now. Please wait a minute and try again.";
const UNAVAILABLE =
  "Could not process this PDF right now. Please try again shortly.";
const GENERIC =
  "Could not read this PDF. Try a shorter statement or add subscriptions manually.";

const INTERNAL_PATTERN =
  /gemini|generativelanguage|openai|anthropic|api[_-]?key|edge function returned/i;

export function isSafeParseErrorMessage(message: string): boolean {
  const t = message.trim();
  if (!t || t.length > 200) return false;
  return !INTERNAL_PATTERN.test(t) && !/\(\d{3}\)/.test(t);
}

export function toParsePdfUserMessage(
  error: unknown,
  bodyError?: string,
): string {
  if (bodyError && isSafeParseErrorMessage(bodyError)) return bodyError;

  const raw = error instanceof Error ? error.message : String(error ?? "");
  if (/429|rate limit|too many requests/i.test(raw)) return RATE_LIMIT;
  if (/503|502|504|unavailable/i.test(raw)) return UNAVAILABLE;
  if (INTERNAL_PATTERN.test(raw)) return GENERIC;
  if (isSafeParseErrorMessage(raw)) return raw;
  return GENERIC;
}
