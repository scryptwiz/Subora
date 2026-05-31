import { useAuth } from "@clerk/expo";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef } from "react";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Stable Supabase client that uses Clerk as a third-party auth provider.
 * The `accessToken` callback reads `getToken` through a ref so the client
 * itself is created exactly once — preventing render loops in consumers.
 */
export function useSupabase(): SupabaseClient | null {
  const { getToken, isLoaded } = useAuth();

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  return useMemo(() => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey || !isLoaded) return null;

    return createClient(url, anonKey, {
      accessToken: async () => (await getTokenRef.current()) ?? null,
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }, [isLoaded]);
}
