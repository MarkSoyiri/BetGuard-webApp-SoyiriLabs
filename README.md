# BetGuard — Responsible Betting Companion

BetGuard is a responsive single-page web app that helps people understand their betting spend, set healthy limits, and build better financial habits. It pairs rich spending analytics with a demo sportsbook and a built-in **responsible gambling system** — all client-side, no real money, no payments, no external APIs.

> Live demo: https://bet-guard-web-app-soyiri-labs.vercel.app

## Highlights

- **Focused dashboard** — greeting, key stat cards (spend, budget remaining, pending bets), a 30-day spending chart, recent activity and your live risk gauge.
- **Demo sportsbook** — realistic fixtures (Ghana Premier League, EPL, UCL, basketball, tennis) with a bet slip, 1/X/2 odds, combined odds and one-click result simulation. Fixtures auto-refresh every hour, and every placed bet opens a full detail view.
- **Post-bet insights** — after results settle, a modal summarises net P&L, per-slip breakdown and personalised behavioural insights.
- **GreenBet 🌱** — every demo stake sets aside 2% for mock environmental projects, feeding a 0–100 Green Score, Green Points, eco challenges, badges and a Ghana-focused green impact page.
- **Challenge Engine 🏆** — 21 challenges auto-tracked from your real activity (bets, budget, limits, health, GreenBet, education, savings, breaks, coach). No manual logging or claiming — progress updates live, rewards are granted automatically, and the AI Coach points you at your closest goal.
- **Responsible betting system** — enforced daily/weekly/monthly/max-stake/max-bets limits, a 0–100 health score, betting breaks (cooldowns) and block-style interventions when a bet breaches a limit.
- **Installable PWA** — install BetGuard on any phone or desktop (standalone app, home-screen icon, splash screen) and use it fully offline: the app shell, fonts, icons and images are pre-cached by a service worker.
- **Budget, savings goals, challenges, achievements, community, education center, AI coach and risk assessment.**

## Recent updates

- **Installable PWA with offline support** — BetGuard can now be installed as a native app on Android, iOS, Windows and macOS. A service worker pre-caches the app shell, fonts and icons (with a runtime cache for Google Fonts) so the app works offline; an offline banner appears when you lose connectivity. The install flow is fully in-app: an install banner with Install / Maybe Later on first visit, an "Install App" button on the Landing page, Navbar and Settings, first-install welcome modal, and an update toast when a new version is deployed. The Settings → App Installation card shows install status, version, storage usage, offline support and how many assets are cached. Icons were generated from the brand SVG (`public/betguard-icon.svg`) and iOS-specific meta tags are included.

- **Challenge Engine** — challenges are now evaluated automatically from live app data instead of manual "log progress" taps. A central provider (`src/contexts/ChallengeContext.tsx`) reads bets, budget, limits, goals, risk level, health score, GreenBet metrics, education reads/quizzes, savings contributions, cooldown completions and coach messages to score 21 challenges across Betting, Green, Education and Savings. Progress bars, percentage chips and ETA estimates update live; completing one auto-grants the reward (Green Points, badge, health boost, notification and celebration) exactly once, and resets Daily/Weekly targets on schedule. The Dashboard gained an "Active Challenges" widget (top 3 by progress), the AI Coach now recommends your closest challenge and answers "Which challenge should I focus on?", and Post-bet insights show the health-score bonus. Demo bets are excluded from challenge progress just like the limit checks.
- **GreenBet** — a planet-friendly twist on the demo sportsbook. 2% of every stake is set aside automatically, pooled into six environmental projects (tree planting, recycling, clean water, education, urban parks, climate awareness) with animated funding progress, supporters and funded states. Contributions earn Green Points, feed a weighted Green Score (health, budget, savings, challenges, contributions) with tiered bands, and unlock green badges. Green challenges award points, the AI coach answers planet questions, the dashboard shows a GreenBet widget, post-bet insights show the contribution, and Settings lets you toggle, reset and track it.
- **Simplified dashboard** — removed the redundant 8-week chart, AI-recommendations box and savings-progress card; kept only the core stats, one spending chart, recent activity and the risk gauge.
- **Auto-refreshing sportsbook** — fixtures reset every hour on a rolling cycle, so there are always fresh games. Pending slips on expired fixtures settle automatically, and the header shows a live countdown to the next refresh.
- **Bet detail views** — clicking the eye icon on any record in the Betting Log's "All records" or the Sportsbook's "My bets" opens a modal with the full details (fixture, market, odds, stake, status, payout, notes).

## Features

| Area | Description |
| --- | --- |
| Dashboard | Greeting, key stat cards, 30-day spending chart, recent activity, risk gauge |
| Betting Log | Add, edit and delete bets; pending and settled statuses; per-record detail modal |
| Sportsbook | Demo fixtures (auto-refresh every hour), bet slip, stake/odds/potential-return, simulate results, bet history with detail modal |
| Budget | Set a monthly budget; alerts at 80% / 90% / 100% |
| Savings Goals | Create goals and contribute; track overall progress |
| AI Coach | Rule-based chat coach that reasons about your actual numbers |
| Education | Short articles on probability, gambling addiction and financial literacy + a quiz |
| Risk Assessment | Standard risk questionnaire producing a Low / Medium / High band |
| Challenges | 21 auto-tracked challenges across betting / green / education / savings; live progress with automatic rewards |
| Community | Anonymous posts, comments and community content |
| Statistics | Deeper breakdowns of spend, outcomes and win rate |
| GreenBet | 2% of stakes → environmental projects, Green Score, Green Points, impact history & Ghana green priorities |
| Achievements | Unlockable badges tied to behaviour (incl. green/eco badges) |
| Notifications | Warning / achievement / info feed |
| Settings | Profile, budget, notification prefs, responsible limits, betting breaks, data export/import/clear, app installation status |
| PWA | Installable standalone app, offline support, update notifications, first-install welcome flow |
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
- vite-plugin-pwa (manifest, service worker, offline caching, install/update hooks)

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

To regenerate the PWA icons from `public/betguard-icon.svg` (only needed if you change the logo): `npx pwa-assets-generator` (config in `pwa-assets.config.ts`).

### Installing the app

- **Android / Chrome**: open the live demo, tap the install prompt in the address bar, or use the "Install App" button in the banner, Navbar or Settings.
- **iOS (Safari)**: open the demo, tap **Share → Add to Home Screen**. The install banner is not shown on iOS (Safari doesn't support the install prompt), but the Settings page shows this hint.
- **Desktop (Chrome/Edge)**: the install icon in the address bar, or the in-app "Install App" button.

Once installed, BetGuard launches in its own window and works offline.

## Project structure

```
src/
  App.tsx                 # Routes (landing + lazy-loaded app routes)
  main.tsx                # Entry point
  components/
    layout/               # Sidebar, Navbar, Footer, nav config
    ui/                   # Button, Modal, Card, Badge, charts, gauges, etc.
    charts/               # Recharts helpers & shared chart styling
    pwa/                  # InstallBanner, UpdateToast, OfflineBanner, WelcomeModal, InstallButton, PWAChrome
    PostBetInsight.tsx    # Post-settlement insights modal
  contexts/               # React context providers (state + logic)
    AppProviders.tsx      # Provider composition & order
    PWAContext.tsx        # Install / offline / update / storage / welcome state
    BetContext.tsx        # Bet records
    BudgetContext.tsx     # Monthly budget
    LimitsContext.tsx     # Responsible-betting limits & cooldowns
    SportsbookContext.tsx # Fixtures, bet slips, result simulation
    GreenBetContext.tsx   # Environmental contributions, points, score
    ChallengeContext.tsx  # Auto-tracked challenge engine (evaluate + reward)
    UserContext.tsx       # Auth + profile (demo)
    ...                   # Goal, Achievement, Notification, Community, Theme, Toast
  data/                   # Demo seed data (bets, matches, posts, goals, challenges)
  pages/                  # One file per route (Dashboard, Sportsbook, ...)
  styles/index.css        # Tailwind theme tokens, utilities, dark mode
  types/index.ts          # Shared TypeScript types
  utils/                  # formatting, stats/health logic, challenge scoring, localStorage helpers
  hooks/                  # usePersistedState
```

Root config: `vite.config.ts` (includes `VitePWA` manifest + service worker config, `__APP_VERSION__`), `pwa-assets.config.ts` (icon generation). Generated PWA icons live in `public/` (`pwa-*.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`).

## Data & persistence

Everything is stored in the browser via `localStorage` under the `betguard:` prefix (`src/hooks/usePersistedState.ts`, `src/utils/storage.ts`). There is no backend. Users can export, import or clear their data from Settings → Data.

## Demo auth

Authentication is simulated — any email/password is accepted on Login/Register and creates a demo "Alex Mensah" admin profile. There is no real account system.

## Deployment

Deployed on Vercel (GitHub repo `MarkSoyiri/BetGuard-webApp-SoyiriLabs`, branch `main`). `vercel.json` rewrites all routes to `index.html` for SPA routing.
