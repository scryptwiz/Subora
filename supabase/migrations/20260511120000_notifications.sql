-- Push tokens (Expo) per Clerk user; RLS matches subscriptions / user_settings.
-- renewal_notification_log: server-only dedupe for scheduled renewal pushes (service_role).

CREATE TABLE IF NOT EXISTS public.push_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    expo_push_token text NOT NULL,
    platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web', 'unknown')),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id, expo_push_token)
);

CREATE INDEX IF NOT EXISTS push_tokens_user_id_idx ON public.push_tokens (user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_tokens_select_own" ON public.push_tokens;
DROP POLICY IF EXISTS "push_tokens_insert_own" ON public.push_tokens;
DROP POLICY IF EXISTS "push_tokens_update_own" ON public.push_tokens;
DROP POLICY IF EXISTS "push_tokens_delete_own" ON public.push_tokens;

CREATE POLICY "push_tokens_select_own"
    ON public.push_tokens
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "push_tokens_insert_own"
    ON public.push_tokens
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "push_tokens_update_own"
    ON public.push_tokens
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id)
    WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "push_tokens_delete_own"
    ON public.push_tokens
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.push_tokens TO authenticated;
GRANT ALL ON TABLE public.push_tokens TO service_role;

CREATE TABLE IF NOT EXISTS public.renewal_notification_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id uuid NOT NULL REFERENCES public.subscriptions (id) ON DELETE CASCADE,
    renewal_at timestamptz NOT NULL,
    sent_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (subscription_id, renewal_at)
);

CREATE INDEX IF NOT EXISTS renewal_notification_log_subscription_idx
    ON public.renewal_notification_log (subscription_id);

ALTER TABLE public.renewal_notification_log ENABLE ROW LEVEL SECURITY;

-- No policies for authenticated: only service_role (bypasses RLS) may read/write.
REVOKE ALL ON TABLE public.renewal_notification_log FROM PUBLIC;
GRANT ALL ON TABLE public.renewal_notification_log TO service_role;

ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS reminder_days_before integer NOT NULL DEFAULT 1
        CHECK (reminder_days_before >= 0 AND reminder_days_before <= 14);
