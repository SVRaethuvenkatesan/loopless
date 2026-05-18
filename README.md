# Loopless

Loopless is a recovery-first web app for breaking nicotine and vaping loops. It combines daily check-ins, urge logging, coping tools, risk-aware insights, and a gamified dashboard so users can see progress without turning recovery into another stressful task.

<p align="center">
  <strong>Dashboard quests</strong> · <strong>AI insights</strong> · <strong>Urge support</strong> · <strong>Guided onboarding</strong>
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

- **Dashboard:** streaks, XP, recovery progress, daily quests, badges, weekly stress rhythm, and quick actions.
- **Check-ins:** stress, mood, triggers, sleep, and energy signals that power the rest of the app.
- **Urge logging:** capture cravings before they become a relapse pattern.
- **Coping toolkit:** calm tools for stressful moments.
- **Insights:** pattern detection, relapse-risk windows, model confidence, and daily takeaways.
- **Awareness:** visual education around nicotine, vaping, stress, and behavior loops.
- **Guided tutorial:** a first-login product tour with highlighted UI targets and a replay button on the dashboard.

## Experience Highlights

The app is designed around repeated daily use rather than a marketing-style landing page:

- A readable app shell with sidebar navigation, mobile bottom nav, streak and level indicators.
- A dashboard that puts the next useful action above everything else.
- Test data mode for demos without polluting real user history.
- Guest and Google sign-in paths.
- PWA support with service worker and install prompt components.
- Drizzle/Postgres-backed user, check-in, urge, insight, badge, streak, and notification data.

## Visual System

Loopless uses warm recovery-game visuals without making the interface feel childish:
- `src/app/icon.tsx` and `src/app/icon-large/route.tsx` generate app icons.
- Dashboard illustrations are code-native SVG/React where they need to stay crisp and dynamic.
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
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
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
src/components/app-shell.tsx    Main app navigation shell
src/components/onboarding-tour.tsx Guided tutorial overlay
src/lib/db/schema.ts            Drizzle schema
```

## Tutorial Tour

The tutorial runs once per signed-in user and can be replayed from the `Guide` button on the dashboard. It highlights live interface targets instead of showing a static modal.

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
