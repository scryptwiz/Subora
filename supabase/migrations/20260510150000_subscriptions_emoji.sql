-- Optional emoji users can pick as a subscription's logo when the brand
-- has no website / favicon (e.g. landlord, gym, family Netflix). Stored as a
-- single grapheme; all rendering is done client-side.

ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS emoji text;
