import { MAX_PDF_BYTES, MAX_PDF_MB } from "@/lib/constants/pdf-import";
import { isSupabaseConfigured } from "@/hooks/use-supabase";
import { toParsePdfUserMessage } from "@/lib/pdf-import/parse-pdf-user-message";
import {
  releasePdfParseLock,
  tryAcquirePdfParseLock,
} from "@/lib/pdf-import/pdf-parse-lock";
import type { ParsePdfResponse } from "@/types/pdf-import";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system/legacy";

export async function parseSubscriptionPdf(
  supabase: SupabaseClient,
  fileUri: string,
): Promise<ParsePdfResponse> {
  if (!tryAcquirePdfParseLock()) {
    throw new Error(
      "A PDF import is already in progress. Please wait for it to finish.",
    );
  }

  try {
    return await runParseSubscriptionPdf(supabase, fileUri);
  } finally {
    releasePdfParseLock();
  }
}

async function runParseSubscriptionPdf(
  supabase: SupabaseClient,
  fileUri: string,
): Promise<ParsePdfResponse> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) {
    throw new Error("Could not read the selected file.");
  }
  const size = info.size;
  if (typeof size === "number" && size > MAX_PDF_BYTES) {
    throw new Error(`PDF is too large (max ${MAX_PDF_MB} MB).`);
  }

  const pdfBase64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { data, error } = await supabase.functions.invoke(
    "parse-subscription-pdf",
    {
      body: { pdfBase64 },
    },
  );

  let bodyError: string | undefined;
  if (error) {
    const ctx = (
      error as { context?: { json?: () => Promise<{ error?: string }> } }
    ).context;
    if (ctx?.json) {
      try {
        const body = await ctx.json();
        bodyError = body?.error;
      } catch {
        /* use sanitized fallback */
      }
    }
    throw new Error(toParsePdfUserMessage(error, bodyError));
  }

  const payload = data as ParsePdfResponse & { error?: string };
  if (!payload?.lines || !Array.isArray(payload.lines)) {
    throw new Error(toParsePdfUserMessage(null, payload?.error));
  }
  return payload;
}
