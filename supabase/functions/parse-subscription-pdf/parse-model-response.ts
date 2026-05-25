import type { GeminiExtractResult, GeminiRawLine } from "./gemini-extract.ts";
import { ParseUserError } from "./parse-errors.ts";

function isRawLine(v: unknown): v is GeminiRawLine {
  if (!v || typeof v !== "object") return false;
  const o = v as GeminiRawLine;
  return (
    typeof o.rawDescription === "string" &&
    typeof o.amount === "number" &&
    typeof o.currency === "string" &&
    typeof o.subscriptionLikelihood === "string"
  );
}

function normalizeResult(parsed: {
  lines?: unknown;
  modelTruncated?: boolean;
  estimatedOmittedCount?: number | null;
}): GeminiExtractResult {
  const lines = Array.isArray(parsed.lines)
    ? parsed.lines.filter(isRawLine)
    : [];
  if (lines.length === 0) {
    throw new ParseUserError("PARSE_FAILED");
  }
  return {
    lines,
    modelTruncated: Boolean(parsed.modelTruncated) || undefined,
    estimatedOmittedCount:
      typeof parsed.estimatedOmittedCount === "number"
        ? parsed.estimatedOmittedCount
        : null,
  };
}

/** Recover partial `lines` when output JSON is cut off at the token limit. */
function salvageTruncatedJson(text: string): GeminiExtractResult | null {
  const linesKey = '"lines"';
  const keyIdx = text.indexOf(linesKey);
  if (keyIdx < 0) return null;

  const arrayStart = text.indexOf("[", keyIdx);
  if (arrayStart < 0) return null;

  for (let end = text.length; end > arrayStart + 2; end--) {
    let slice = text.slice(arrayStart, end).trimEnd().replace(/,\s*$/, "");
    if (!slice.endsWith("]")) slice = `${slice}]`;
    try {
      const lines = JSON.parse(slice) as unknown;
      return normalizeResult({ lines, modelTruncated: true });
    } catch {
      /* trim and retry */
    }
  }
  return null;
}

export function parseModelResponseText(text: string): GeminiExtractResult {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed) as {
      lines?: unknown;
      modelTruncated?: boolean;
      estimatedOmittedCount?: number | null;
    };
    return normalizeResult(parsed);
  } catch {
    const salvaged = salvageTruncatedJson(trimmed);
    if (salvaged) return salvaged;
    throw new ParseUserError("PARSE_FAILED");
  }
}
