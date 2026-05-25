import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { resolveAuthUserId } from "./auth-user-id.ts";
import { DEFAULT_GEMINI_MODEL, MAX_PDF_BYTES } from "./constants.ts";
import { extractWithGemini } from "./gemini-extract.ts";
import { ParseUserError, toUserFacingResponse } from "./parse-errors.ts";
import { postProcessGeminiResult } from "./post-process.ts";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function decodeBase64Pdf(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function readPdfFromRequest(req: Request): Promise<Uint8Array> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new Error('Missing PDF file in form field "file".');
    }
    if (file.type && file.type !== "application/pdf") {
      throw new Error("Only PDF files are supported.");
    }
    const buf = await file.arrayBuffer();
    return new Uint8Array(buf);
  }

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { pdfBase64?: string };
    if (!body.pdfBase64?.trim()) {
      throw new Error("Missing pdfBase64 in JSON body.");
    }
    return decodeBase64Pdf(body.pdfBase64.trim());
  }

  throw new Error(
    "Use multipart/form-data (file) or application/json (pdfBase64).",
  );
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const geminiModel =
    Deno.env.get("GEMINI_MODEL")?.trim() || DEFAULT_GEMINI_MODEL;

  if (!geminiKey) {
    console.error("parse-subscription-pdf: extraction API key missing");
    return jsonResponse(
      { error: new ParseUserError("UNAVAILABLE").message },
      503,
    );
  }
  if (!supabaseUrl || !supabaseAnon) {
    console.error("parse-subscription-pdf: Supabase env missing");
    return jsonResponse(
      { error: new ParseUserError("UNAVAILABLE").message },
      503,
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userId = await resolveAuthUserId(supabase, authHeader);
  if (!userId) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const pdfBytes = await readPdfFromRequest(req);
    if (pdfBytes.length === 0) {
      return jsonResponse({ error: "Empty PDF" }, 400);
    }
    if (pdfBytes.length > MAX_PDF_BYTES) {
      return jsonResponse(
        {
          error: `PDF too large (max ${Math.round(MAX_PDF_BYTES / (1024 * 1024))} MB)`,
        },
        400,
      );
    }

    const geminiResult = await extractWithGemini(
      pdfBytes,
      geminiKey,
      geminiModel,
    );
    const result = postProcessGeminiResult(geminiResult);
    if (result.lines.length === 0) {
      return jsonResponse(
        { error: new ParseUserError("PARSE_FAILED").message },
        400,
      );
    }

    console.log(
      JSON.stringify({
        event: "parse_subscription_pdf",
        userId,
        lineCount: result.lines.length,
        truncated: result.truncated,
      }),
    );

    return jsonResponse(result);
  } catch (e) {
    console.error(
      "parse-subscription-pdf",
      e instanceof Error ? e.message : e,
    );
    const { error, status } = toUserFacingResponse(e);
    return jsonResponse({ error }, status);
  }
});
