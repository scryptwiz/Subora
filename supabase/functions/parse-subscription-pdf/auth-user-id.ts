import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

function decodeJwtSub(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad =
      base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    const payload = JSON.parse(atob(base64 + pad)) as {
      sub?: string;
      role?: string;
    };
    if (payload.role && payload.role !== "authenticated") return null;
    return typeof payload.sub === "string" && payload.sub.length > 0
      ? payload.sub
      : null;
  } catch {
    return null;
  }
}

export async function resolveAuthUserId(
  supabase: SupabaseClient,
  authHeader: string,
): Promise<string | null> {
  const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!bearer) return null;

  const auth = supabase.auth as {
    getClaims?: () => Promise<{
      data?: { claims?: Record<string, unknown> };
      error?: { message?: string } | null;
    }>;
  };

  if (typeof auth.getClaims === "function") {
    const { data, error } = await auth.getClaims();
    if (!error) {
      const sub = data?.claims?.sub;
      if (typeof sub === "string" && sub.length > 0) return sub;
    }
  }

  return decodeJwtSub(bearer);
}
