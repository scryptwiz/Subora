-- Subscriptions owned by Clerk users: user_id stores Clerk user id (`sub` claim).
-- Requires Clerk configured as a Third-Party Auth provider in Supabase
-- (Authentication → Sign In / Up → Third-party auth → Clerk).
-- The native Clerk session token is validated by Supabase; no JWT template is needed.

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    name text NOT NULL,
    plan text,
    domain text,
    icon_slug text,
    brand_color text,
    price numeric(12, 2) NOT NULL CHECK (price >= 0),
    currency text NOT NULL DEFAULT 'USD',
    billing_cycle text NOT NULL CHECK (billing_cycle IN ('week', 'month', 'year')),
    next_renewal timestamptz NOT NULL,
    active boolean NOT NULL DEFAULT true,
    payment_method text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS subscriptions_user_next_renewal_idx ON public.subscriptions (user_id, next_renewal);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_delete_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "subscriptions_insert_own"
    ON public.subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "subscriptions_update_own"
    ON public.subscriptions
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id)
    WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "subscriptions_delete_own"
    ON public.subscriptions
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.jwt()->>'sub') = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO authenticated;

GRANT ALL ON TABLE public.subscriptions TO service_role;

CREATE OR REPLACE FUNCTION public.subscriptions_set_updated_at()
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

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON public.subscriptions;

CREATE TRIGGER subscriptions_set_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE public.subscriptions_set_updated_at();
