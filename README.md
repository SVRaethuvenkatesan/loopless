# Loopless

A science-backed web app that helps young Australians quit vaping by breaking the habit loop through gamification, behavioural science, and real-time data insights.

## What it does

Loopless turns the quit journey into a structured, engaging experience. Users log daily check-ins, battle cravings with coping tools, track their recovery progress, and explore verified research data — all wrapped in a gamified system with XP, levels, streaks, and badges.

## Features shipped in Iteration 1

### Dashboard
Central hub showing the user's current state at a glance: check-in streak, average stress, estimated savings, and urges logged this week. Includes an XP bar, level display, and lung recovery projection based on days clean.

### Daily Check-in
A guided multi-step flow (stress slider → mood picker → trigger selector → optional note). Submitting earns XP, triggers an AI coach response, and updates the user's streak. Full check-in history with analytics (avg stress, high-stress days, top trigger, most common mood) is available in a history tab.

### Urge Battle Mode
When a craving hits, users enter a gamified boss battle. An AI generates a personalised fight scenario based on stress level and trigger. Coping tools become weapons:
- **4-7-8 Breathing** — guided breathing mini-game
- **Interrupt Walk** — tap 30 steps to break the pattern
- **Ice Shock** — hold button while running cold water
- **Brain Dump** — write out the craving to externalise it

Defeating the craving awards XP and unlocks an AI debrief.

### Awareness / Data Intelligence
A spin-wheel interface over six verified research datasets (AIHW youth trends, ABS mental health, WHO tobacco control, physical health risks, Generation Vape tracker, youth wellbeing). Each source contains two data stories with Recharts visualisations. Users can spin or click directly to explore.

### XP & Progression System
All key actions earn XP. XP accumulates into levels (Loop Breaker Lv.1, Lv.2, …). Badges are awarded for milestones: first check-in, 7/12/30/100-day streaks, beating urges, journalling, and completing Loop analysis.

### Auth & Onboarding
Email/password auth (NextAuth v5 + Drizzle adapter). Guest mode for unauthenticated access stored in local storage. Onboarding collects age group, coping style preference, and vaping loop entry point.

### AI Coach
Claude-powered endpoints for:
- Check-in reaction (personalised encouragement based on stress + mood)
- Check-in insight (pattern analysis over last 14 check-ins)
- Urge battle scenario generation (boss name, taunts, visual style)
- Urge debrief (post-battle reflection)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom design system |
| Animation | Framer Motion |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5 |
| AI | Anthropic Claude API |
| Charts | Recharts |
| Rate limiting | Upstash Redis |
| Email | Resend |
| Push notifications | Web Push API + Workbox |

## Local Setup

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local

# Push schema to database
npx drizzle-kit push

# Start dev server
npm run dev
```

Required env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`.

## Pages

| Route | Status |
|---|---|
| `/dashboard` | Live |
| `/checkin` | Live |
| `/urge` | Live |
| `/awareness` | Live |
| `/progress` | Planned — Iteration 2 |
| `/loop` | Planned — Iteration 2 |
| `/coping` | Planned — Iteration 2 |
| `/myths` | Planned — Iteration 2 |
| `/insights` | Planned — Iteration 2 |
