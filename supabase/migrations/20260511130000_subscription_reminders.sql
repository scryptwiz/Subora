CREATE TABLE IF NOT EXISTS public.subscription_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  offset_days integer NOT NULL CHECK (offset_days BETWEEN 0 AND 30),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (subscription_id, offset_days)
);

CREATE INDEX IF NOT EXISTS subscription_reminders_user_sub_idx
  ON public.subscription_reminders (user_id, subscription_id);

ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscription_reminders_own" ON public.subscription_reminders;
CREATE POLICY "subscription_reminders_own"
  ON public.subscription_reminders
  USING (user_id = (auth.jwt()->>'sub'))
  WITH CHECK (user_id = (auth.jwt()->>'sub'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_reminders TO authenticated;

ALTER TABLE public.renewal_notification_log
  ADD COLUMN IF NOT EXISTS offset_days integer NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS renewal_notification_log_subscription_idx;

CREATE UNIQUE INDEX IF NOT EXISTS renewal_notification_log_dedupe_idx
  ON public.renewal_notification_log (subscription_id, renewal_at, offset_days);
