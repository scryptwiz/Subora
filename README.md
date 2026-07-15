# Subora

**Know what you're paying for — and when it's due.**

Subora is a mobile subscription tracker for iOS and Android. Add your streaming services, apps, and memberships in one place, see what they cost per month or year, and get reminded before renewals hit.

Built with [Expo](https://expo.dev) and React Native.

---

## What you can do

- **Track subscriptions** — name, price, billing cycle, renewal date, payment method, and brand styling (emoji, colors, icons).
- **See your spend** — monthly and yearly totals on the dashboard, with currency conversion when you pick a display currency in Profile.
- **Stay ahead of renewals** — local push reminders on your device, plus optional server-side renewal notifications.
- **Import from a bank PDF** — upload a statement and let AI extract likely subscriptions so you don't have to type everything in.
- **Manage your account** — sign in with Google, Apple, or email (via Clerk), edit your profile, export data as CSV, or delete your account.

---

## Tech stack

| Layer | Tools |
| --- | --- |
| App | Expo 57, React Native, Expo Router, NativeWind |
| Auth | [Clerk](https://clerk.com) |
| Database & backend | [Supabase](https://supabase.com) (Postgres + Edge Functions) |
| PDF parsing | Supabase Edge Function + Gemini |

---

## Prerequisites

Before you run the app locally, you'll need:

- [Bun](https://bun.sh) (package manager — the project uses `bun install` / `bun start`)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) and a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (this app uses native modules like notifications and isn't meant for Expo Go alone)
- A [Clerk](https://clerk.com) application with Google, Apple, and/or email sign-in enabled
- A [Supabase](https://supabase.com) project with migrations applied and Clerk configured as a third-party auth provider

For iOS: Xcode and a simulator or device.  
For Android: Android Studio and an emulator or device.

---

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Subora
bun install
```

### 2. Set up environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Where to get it |
| --- | --- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as above |

The app won't start without the Clerk key. Supabase powers sync, PDF import, and reminders — without it, the UI still runs but data won't persist.

### 3. Configure Clerk + Supabase

In Supabase: **Authentication → Sign In / Up → Third-party auth → Clerk**.  
Subora stores subscriptions keyed by your Clerk user ID (`sub` claim). Row Level Security ensures users only see their own data.

Run the SQL migrations in `supabase/migrations/` against your project (via the Supabase CLI or Dashboard SQL editor), in filename order.

### 4. Start the dev server

```bash
bun start
```

This runs `expo start --dev-client`. Open the app in your development build on a simulator or device.

Platform shortcuts:

```bash
bun run ios      # build & run on iOS
bun run android  # build & run on Android
bun run web      # web (limited — mobile-first app)
```

---

## Supabase Edge Functions

Two functions live in `supabase/functions/`:

| Function | Purpose |
| --- | --- |
| `parse-subscription-pdf` | Reads a bank/credit-card PDF and returns suggested subscriptions (Gemini). Called from the import flow in the app. |
| `send-renewal-reminders` | Cron job for push reminders. Needs `EXPO_ACCESS_TOKEN` and `CRON_SECRET` set as function secrets in the Supabase Dashboard. |

Deploy with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy parse-subscription-pdf
supabase functions deploy send-renewal-reminders
```

Schedule `send-renewal-reminders` in the Dashboard (Edge Functions → Schedules) with header `Authorization: Bearer <CRON_SECRET>`.

---

## Project structure

```
app/                    # Screens and routes (Expo Router, file-based)
  (auth)/               # Sign-in flows
  (home)/               # Main app — dashboard, subscriptions, profile, add/import
components/             # UI pieces grouped by feature
contexts/               # React context (subscriptions, preferences, notifications)
hooks/                  # Shared hooks
lib/                    # Business logic — DB helpers, PDF import, exchange rates
constants/              # Static config (currencies, billing cycles, …)
theme/                  # Colors and typography
supabase/
  migrations/           # Postgres schema + RLS policies
  functions/            # Edge Functions
```

Routes live under `app/`. Shared logic lives in `lib/` and `hooks/`. Feature UI is split into small files under `components/` (the repo keeps files under ~300 lines).

---

## Scripts

| Command | Description |
| --- | --- |
| `bun start` | Start Expo dev server (development client) |
| `bun run ios` | Run on iOS |
| `bun run android` | Run on Android |
| `bun run web` | Start web bundler |
| `bun run lint` | Run ESLint |

Production builds use [EAS Build](https://docs.expo.dev/build/introduction/) — see `eas.json` for `development`, `preview`, and `production` profiles.

---

## A note on privacy

Your subscription data is tied to your Clerk account and stored in Supabase with row-level security. PDF import sends document content to the `parse-subscription-pdf` edge function for extraction — review that flow before importing sensitive statements.

---

## License

Private project — not published to npm.
