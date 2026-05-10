-- Make domain optional on subscriptions: many users don't know the service
-- website and the logo gracefully falls back to an initials tile when the
-- column is null.

ALTER TABLE public.subscriptions
    ALTER COLUMN domain DROP NOT NULL;
