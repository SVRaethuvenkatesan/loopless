# Loopless

Loopless is a recovery-first web app for breaking smoking, vaping, and nicotine craving loops. It combines stress-aware onboarding, daily check-ins, urge logging, coping tools, risk-aware insights, and a gamified dashboard so users can see progress without turning recovery into another stressful task.

<p align="center">
  <strong>Smoke/vape urge support</strong> · <strong>Dashboard quests</strong> · <strong>AI insights</strong> · <strong>Guided onboarding</strong>
</p>
<p align="center">
  <a href="./src/app/(app)/dashboard/dashboard-client.tsx">Dashboard</a>
  &nbsp;|&nbsp;
  <a href="./src/components/app-shell.tsx">App shell</a>
  &nbsp;|&nbsp;
  <a href="./src/components/onboarding-tour.tsx">Guided tutorial</a>
</p>

## What It Does

Loopless helps users build a cleaner feedback loop:
- **Landing experience:** clear smoke/vape quit messaging, local dark mode, and slow rising smoke/bubble motion in the hero.
- **Dashboard:** streaks, XP, lung recovery progress, daily quests, badges, weekly stress rhythm, and quick actions.
- **Check-ins:** stress, mood, nicotine triggers, sleep, and energy signals that power the rest of the app.
- **Urge logging:** capture smoke or vape cravings before they become a relapse pattern.
- **Coping toolkit:** calm tools for stressful moments.
- **Insights:** pattern detection, relapse-risk windows, model confidence, and daily takeaways.
- **Awareness:** visual education around nicotine, vaping, stress, and behavior loops.
- **Guided onboarding:** first-run setup is enforced before protected app pages.
- **Guided tutorial:** a monster-led product tour with highlighted UI targets and a replay button on the dashboard.

## Experience Highlights

The app is designed around repeated daily use rather than a marketing-style landing page:

- A readable app shell with sidebar navigation, mobile bottom nav, streak and level indicators.
- A dashboard that puts the next useful action above everything else, including clearer action buttons for history and lung recovery milestones.
- Test data mode for demos without polluting real user history.
- Guest and Google sign-in paths.
- Onboarding-aware auth flow that routes new users through setup before the dashboard.
- PWA support with service worker and install prompt components.
- Drizzle/Postgres-backed user, check-in, urge, insight, badge, streak, and notification data.

## Visual System

Loopless uses warm recovery-game visuals without making the interface feel childish:
- `src/app/icon.tsx` and `src/app/icon-large/route.tsx` generate app icons.
- Dashboard illustrations are code-native SVG/React where they need to stay crisp and dynamic.
- The landing page includes responsive dark-mode styling and subtle smoke/bubble motion.
- The in-app guide uses a character-led speech bubble so help feels integrated with the product.
- Motion is used inside the product, while the README stays lightweight and GitHub-friendly.

## Tech Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Auth:** NextAuth v5 with Google, credentials, and guest flow
- **Database:** Drizzle ORM with Postgres
- **Animation:** Framer Motion and DotLottie
- **Charts/UI:** Recharts, custom dashboard SVGs, Lucide icons
- **PWA:** service worker, manifest, install prompt
- **Tooling:** ESLint, TypeScript, Drizzle Kit

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` with the required runtime secrets for your environment:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
ACCESS_PASSWORD="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GEMINI_API_KEY="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
RESEND_API_KEY="..."
VAPID_SUBJECT="mailto:team@loopless.app"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
```

Push or generate database schema as needed:

```bash
npm run db:generate
npm run db:push
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

```bash
npm run dev          # Start the local Next.js dev server
npm run build        # Production build and type check
npm run start        # Run the built app
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema changes
npm run seed         # Seed demo data
npm run seed:clear   # Clear seeded demo data
```

## Key Paths

```text
src/app/(app)/dashboard/        Dashboard experience
src/app/(app)/checkin/          Check-in flow
src/app/(app)/urge/             Urge logging
src/app/(app)/coping/           Coping toolkit
src/app/(app)/insights/         AI and rule-based insights
src/app/(app)/onboarding/       Required first-run setup
src/components/app-shell.tsx    Main app navigation shell
src/components/onboarding-tour.tsx Guided tutorial overlay
src/lib/db/schema.ts            Drizzle schema
```

## Tutorial Tour

The tutorial runs once per signed-in user and can be replayed from the `Guide` button on the dashboard. It highlights live interface targets instead of showing a static modal, and the guide card waits for a measured target before rendering so the spotlight does not flash in the wrong place.

Current tour coverage:

- Dashboard greeting and hero actions
- Start today's quest, Log urge, Calm tool, Show stats
- Player XP card
- Sidebar overview and sidebar features
- Dashboard, Check-in, Awareness, Insights, Toolkit, Support, and Profile links

To add a new tour step:

1. Add `data-tour="your-target"` to the UI element.
2. Add a matching step in `src/components/onboarding-tour.tsx`.
3. Run `npm run build`.

## Data Model

Core tables live in `src/lib/db/schema.ts`:

- `users`
- `stress_triggers`
- `checkins`
- `urge_events`
- `coping_sessions`
- `journal_entries`
- `streaks`
- `badges`
- `ml_insights`
- `daily_insights`
- `risk_predictions`
- `nudge_logs`
- `push_subscriptions`
- `correlation_insights`

## Build Check

```bash
npm run build
```

The build should compile the Next app, run TypeScript, and generate all static routes.
