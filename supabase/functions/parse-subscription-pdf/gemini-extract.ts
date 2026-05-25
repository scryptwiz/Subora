import { DEFAULT_GEMINI_MODEL } from "./constants.ts";
import { ParseUserError } from "./parse-errors.ts";

export type GeminiRawLine = {
  rawDescription: string;
  amount: number;
  currency: string;
  transactionDate?: string | null;
  subscriptionLikelihood: "high" | "medium" | "low" | "not";
  rationale?: string | null;
  merchantGuess?: string | null;
  inferredBillingCycle?: "week" | "month" | "year" | null;
};

export type GeminiExtractResult = {
  lines: GeminiRawLine[];
  modelTruncated?: boolean;
  estimatedOmittedCount?: number | null;
};

const EXTRACTION_PROMPT = `You are parsing bank or card PDF statements and receipts.

Extract EVERY transaction row you can read from the PDF (charges and identifiable debits relevant to spending).
Treat card purchase amounts as positive numbers in the amount field (use absolute value if the PDF shows parentheses or minus for purchases).

For each line set subscriptionLikelihood:
- high: clearly a recurring digital/service subscription or known platform billing (streaming, Saa, cloud software, gyms with recurring branding, telecom add-ons when clearly billed as a recurring service charge).
- medium: could be recurring OR looks like subscription-adjacent (marketplaces ambiguous, annual software).
- low: retail, restaurants, groceries, gasoline, ambiguous one-off wording.
- not: internal transfers between accounts, payroll, refunds labeled as refunds, ATM/cash withdrawals, interest paid, fees without a clear service name, blank footers, page metadata.

When in doubt between low and not, use low if it is still a merchant purchase.

If there are more rows than you can list, set modelTruncated true and estimatedOmittedCount to your best estimate of rows you could not include. Prioritize rows with subscriptionLikelihood high or medium when you must drop rows.

Return strict JSON only (no markdown).`;

function buildResponseSchema() {
  return {
    type: "OBJECT",
    properties: {
      lines: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            rawDescription: { type: "STRING" },
            amount: { type: "NUMBER" },
            currency: { type: "STRING" },
            transactionDate: { type: "STRING", nullable: true },
            subscriptionLikelihood: {
              type: "STRING",
              format: "enum",
              enum: ["high", "medium", "low", "not"],
            },
            rationale: { type: "STRING", nullable: true },
            merchantGuess: { type: "STRING", nullable: true },
            inferredBillingCycle: {
              type: "STRING",
              format: "enum",
              enum: ["week", "month", "year"],
              nullable: true,
            },
          },
          required: [
            "rawDescription",
            "amount",
            "currency",
            "subscriptionLikelihood",
          ],
        },
      },
      modelTruncated: { type: "BOOLEAN", nullable: true },
      estimatedOmittedCount: { type: "INTEGER", nullable: true },
    },
    required: ["lines"],
  };
}

function encodePdfBase64(bytes: Uint8Array): string {
  const CHUNK = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const sub = bytes.subarray(i, i + CHUNK);
    binary += String.fromCharCode(...sub);
  }
  return btoa(binary);
}

function mapProviderStatus(status: number): ParseUserError {
  if (status === 429) return new ParseUserError("RATE_LIMITED");
  if (status === 503 || status === 502 || status === 504) {
    return new ParseUserError("SERVICE_UNAVAILABLE");
  }
  return new ParseUserError("PARSE_FAILED");
}

export async function extractWithGemini(
  pdfBytes: Uint8Array,
  apiKey: string,
  modelId: string = DEFAULT_GEMINI_MODEL,
): Promise<GeminiExtractResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: encodePdfBase64(pdfBytes),
            },
          },
          { text: EXTRACTION_PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: buildResponseSchema(),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(
      JSON.stringify({
        event: "pdf_extract_failed",
        status: res.status,
        preview: errText.slice(0, 500),
      }),
    );
    throw mapProviderStatus(res.status);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new ParseUserError("PARSE_FAILED");
  }

  let parsed: GeminiExtractResult;
  try {
    parsed = JSON.parse(text) as GeminiExtractResult;
  } catch {
    throw new ParseUserError("PARSE_FAILED");
  }
  if (!parsed.lines || !Array.isArray(parsed.lines)) {
    throw new ParseUserError("PARSE_FAILED");
  }
  return parsed;
}
