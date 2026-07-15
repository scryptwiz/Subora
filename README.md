# Subora

**Know what you're paying for — and when it's due.**

<img src="assets/docs/subora-demo.gif" alt="Subora demo" width="280" />

---

Subora is a personal subscription tracker built for iOS and Android. It's the kind of app you wish you'd had before you forgot about that $15/month app you stopped using six months ago.

Add your subscriptions, see how much you're spending, and get a heads-up before renewals hit your account.

---

## Features

- **Track anything** — streaming, apps, gym, whatever you pay for regularly
- **See the full picture** — monthly and yearly totals at a glance
- **Renewal reminders** — push notifications before you get charged
- **Import from a bank PDF** — drop in a statement and let the app pull out your subscriptions automatically
- **Sign in your way** — Google, Apple, or email

---

## Running it locally

You'll need [Bun](https://bun.sh), a [Clerk](https://clerk.com) app, and a [Supabase](https://supabase.com) project set up.

```bash
git clone <your-repo-url>
cd Subora
bun install
cp .env.example .env
# fill in your keys, then:
bun start
```

| Variable                            | Where to get it                   |
| ----------------------------------- | --------------------------------- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys        |
| `EXPO_PUBLIC_SUPABASE_URL`          | Supabase → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`     | Same as above                     |

```bash
bun run ios      # iOS
bun run android  # Android
```

> This app uses native modules, so you'll need a development build — not Expo Go.

---

## Built with

- [Expo](https://expo.dev) + React Native
- [Expo Router](https://expo.github.io/router/) for navigation
- [Clerk](https://clerk.com) for auth
- [Supabase](https://supabase.com) for data + backend functions
