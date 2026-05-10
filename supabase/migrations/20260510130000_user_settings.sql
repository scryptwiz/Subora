-- User-level preferences (currently just the display currency for totals).
-- One row per Clerk user, keyed by `user_id` = Clerk JWT `sub`.
-- Same RLS pattern as 20260510120000_subscriptions.sql.

CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id text PRIMARY KEY,
    display_currency text NOT NULL DEFAULT 'USD' CHECK (display_currency ~ '^[A-Z]{3}$'),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_settings_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_update_own" ON public.user_settings;

CREATE POLICY "user_settings_select_own"
    ON public.user_settings
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "user_settings_insert_own"
    ON public.user_settings
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "user_settings_update_own"
    ON public.user_settings
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id)
    WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

GRANT SELECT, INSERT, UPDATE ON TABLE public.user_settings TO authenticated;

GRANT ALL ON TABLE public.user_settings TO service_role;

CREATE OR REPLACE FUNCTION public.user_settings_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at := timezone('utc', now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_settings_set_updated_at ON public.user_settings;

CREATE TRIGGER user_settings_set_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE PROCEDURE public.user_settings_set_updated_at();
