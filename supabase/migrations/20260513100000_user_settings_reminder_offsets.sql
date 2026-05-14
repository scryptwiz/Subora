-- Multiple default renewal lead times (up to 3); legacy reminder_days_before widened to 0–30 and kept in sync with first offset.
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_reminder_days_before_check;

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS reminder_default_offsets integer[];

UPDATE public.user_settings
SET reminder_default_offsets = ARRAY[LEAST(GREATEST(reminder_days_before, 0), 30)]::integer[]
WHERE reminder_default_offsets IS NULL;

ALTER TABLE public.user_settings
  ALTER COLUMN reminder_default_offsets SET DEFAULT ARRAY[1]::integer[],
  ALTER COLUMN reminder_default_offsets SET NOT NULL;

ALTER TABLE public.user_settings
  ADD CONSTRAINT user_settings_reminder_days_before_check
  CHECK (reminder_days_before >= 0 AND reminder_days_before <= 30);

UPDATE public.user_settings
SET reminder_days_before = LEAST(GREATEST(reminder_days_before, 0), 30)
WHERE reminder_days_before IS NOT NULL;
