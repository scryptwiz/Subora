-- Allow a user to permanently delete their own `user_settings` row when they
-- nuke their account (GDPR right-to-erasure). The original migration only had
-- SELECT/INSERT/UPDATE policies and DELETE was implicitly denied by RLS.

DROP POLICY IF EXISTS "user_settings_delete_own" ON public.user_settings;

CREATE POLICY "user_settings_delete_own"
    ON public.user_settings
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id);

GRANT DELETE ON TABLE public.user_settings TO authenticated;
