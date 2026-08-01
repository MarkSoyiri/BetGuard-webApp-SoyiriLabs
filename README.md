# BetGuard — Responsible Betting Companion

BetGuard is a responsive single-page web app that helps people understand their betting spend, set healthy limits, and build better financial habits. It pairs rich spending analytics with a demo sportsbook and a built-in **responsible gambling system** — all client-side, no real money, no payments, no external APIs.

> Live demo: https://bet-guard-web-app-soyiri-labs.vercel.app

## Highlights

- **Command-center dashboard** — health score with factor breakdown, quick actions, daily-vs-limit pulse, pending-settlement tracker and responsible-mode status.
- **Demo sportsbook** — realistic fixtures (Ghana Premier League, EPL, UCL, basketball, tennis) with a bet slip, 1/X/2 odds, combined odds and one-click result simulation.
- **Post-bet insights** — after results settle, a modal summarises net P&L, per-slip breakdown and personalised behavioural insights.
- **Responsible betting system** — enforced daily/weekly/monthly/max-stake/max-bets limits, a 0–100 health score, betting breaks (cooldowns) and block-style interventions when a bet breaches a limit.
- **Budget, savings goals, challenges, achievements, community, education center, AI coach and risk assessment.**

## Features

| Area | Description |
| --- | --- |
| Dashboard | Greeting, stat cards, 30-day & 8-week spend charts, recent bets, savings progress, AI recommendations, notifications |
| Betting Log | Add, edit and delete bets; pending and settled statuses |
| Sportsbook | Demo fixtures, bet slip, stake/odds/potential-return, simulate results, bet history |
| Budget | Set a monthly budget; alerts at 80% / 90% / 100% |
| Savings Goals | Create goals and contribute; track overall progress |
| AI Coach | Rule-based chat coach that reasons about your actual numbers |
| Education | Short articles on probability, gambling addiction and financial literacy + a quiz |
| Risk Assessment | Standard risk questionnaire producing a Low / Medium / High band |
| Challenges | Daily/weekly/monthly responsible-gambling challenges |
| Community | Anonymous posts, comments and community content |
| Statistics | Deeper breakdowns of spend, outcomes and win rate |
| Achievements | Unlockable badges tied to behaviour |
| Notifications | Warning / achievement / info feed |
| Settings | Profile, budget, notification prefs, responsible limits, betting breaks, data export/import/clear |
| Admin | Demo-only admin dashboard |

## Responsible betting system

- **Limits** (`src/contexts/LimitsContext.tsx`): daily, weekly, monthly spend caps, max stake and max bets per day, each toggleable.
- **Enforcement** (`src/utils/stats.ts` → `checkBetAgainstLimits`): placing a bet is blocked before it is recorded if any limit is exceeded, with a friendly intervention modal and an in-app notification.
- **Health score** (`computeHealthScore`): 0–100 score derived from budget pacing, betting frequency, average stake size, loss chasing and breaks/limits; rendered as a gauge with a factor breakdown.
- **Betting breaks**: start a 1 / 3 / 7 / 30-day cooldown; bets are disabled while active.
- **Post-bet insights** (`src/components/PostBetInsight.tsx`): shown after simulating results in the sportsbook.

## Tech stack

- React 19, TypeScript, Vite 8
- Tailwind CSS v4 (CSS-first config, class-based dark mode)
- React Router 7 (lazy-loaded routes)
- Framer Motion (animations)
- Recharts (charts)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev      # start Vite dev server
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check then production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run `tsc --noEmit` |

## Project structure

```
src/
  App.tsx                 # Routes (landing + lazy-loaded app routes)
  main.tsx                # Entry point
  components/
    layout/               # Sidebar, Navbar, Footer, nav config
    ui/                   # Button, Modal, Card, Badge, charts, gauges, etc.
    charts/               # Recharts helpers & shared chart styling
    PostBetInsight.tsx    # Post-settlement insights modal
  contexts/               # React context providers (state + logic)
    AppProviders.tsx      # Provider composition & order
    BetContext.tsx        # Bet records
    BudgetContext.tsx     # Monthly budget
    LimitsContext.tsx     # Responsible-betting limits & cooldowns
    SportsbookContext.tsx # Fixtures, bet slips, result simulation
    UserContext.tsx       # Auth + profile (demo)
    ...                   # Goal, Achievement, Notification, Community, Theme, Toast
  data/                   # Demo seed data (bets, matches, posts, goals)
  pages/                  # One file per route (Dashboard, Sportsbook, ...)
  styles/index.css        # Tailwind theme tokens, utilities, dark mode
  types/index.ts          # Shared TypeScript types
  utils/                  # formatting, stats/health logic, localStorage helpers
  hooks/                  # usePersistedState
```

## Data & persistence

Everything is stored in the browser via `localStorage` under the `betguard:` prefix (`src/hooks/usePersistedState.ts`, `src/utils/storage.ts`). There is no backend. Users can export, import or clear their data from Settings → Data.

## Demo auth

Authentication is simulated — any email/password is accepted on Login/Register and creates a demo "Alex Mensah" admin profile. There is no real account system.

## Deployment

Deployed on Vercel (GitHub repo `MarkSoyiri/BetGuard-webApp-SoyiriLabs`, branch `main`). `vercel.json` rewrites all routes to `index.html` for SPA routing.
