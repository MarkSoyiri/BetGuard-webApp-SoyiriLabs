import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingDown,
  Plus,
  ChevronRight,
  Clock,
  ListChecks,
  ShieldAlert,
  Leaf,
  TreePine,
  Sprout,
  Trophy,
  Target,
  Rocket,
  Ticket,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { RiskCard } from '@/components/ui/RiskCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { DepositModal } from '@/components/wallet/DepositModal';
import { useBets } from '@/contexts/BetContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useUser } from '@/contexts/UserContext';
import { useWallet } from '@/contexts/WalletContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useLimits } from '@/contexts/LimitsContext';
import { useGreenBet } from '@/contexts/GreenBetContext';
import { useChallenges } from '@/contexts/ChallengeContext';
import { greeting, formatGHS, formatDateShort, monthLabel, todayISO } from '@/utils/format';
import { monthlySpending, budgetStatus, dateRange, computeHealthScore, spentOnDate } from '@/utils/stats';
import { ChartTooltip, AXIS_TICK, gridStyle, COLORS } from '@/components/charts/chartUtils';

export function Dashboard() {
  const { profile } = useUser();
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { balance } = useWallet();
  const { isPending, setOpen } = useOnboarding();
  const { limits, isCooldownActive, cooldownEndsAt } = useLimits();
  const { enabled: greenEnabled, greenScore, scoreBand, trees, totalContributed, greenPoints } = useGreenBet();
  const { activeChallenges, healthBonus } = useChallenges();
  const [depositOpen, setDepositOpen] = useState(false);

  const monthSpent = useMemo(() => monthlySpending(bets), [bets]);
  const health = useMemo(() => computeHealthScore(bets, monthlyBudget, limits), [bets, monthlyBudget, limits]);
  const remaining = Math.max(0, monthlyBudget - monthSpent);
  const status = budgetStatus(monthSpent, monthlyBudget);
  const budgetNotSet = monthlyBudget === 0;

  const daily = useMemo(() => {
    return dateRange(30).map((d) => ({
      day: formatDateShort(d),
      spent: bets.filter((b) => b.date === d).reduce((s, b) => s + b.amount, 0),
    }));
  }, [bets]);

  const recent = bets.slice(0, 4);
  const riskScore = health.score;
  const riskLevel = profile?.riskLevel ?? health.level;
  const todaySpent = useMemo(() => spentOnDate(bets, todayISO()), [bets]);
  const pendingCount = useMemo(() => bets.filter((b) => b.status === 'pending').length, [bets]);

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-white md:text-3xl">
            {greeting()}, {profile?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Here's your summary for {monthLabel()}.
          </p>
        </div>
        <Link
          to="/betting-log"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:shadow-primary/30"
        >
          <Plus className="size-4" aria-hidden="true" /> Log a bet
        </Link>
      </motion.div>

      {isCooldownActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-warning/10 px-4 py-3 text-sm text-orange-700 dark:text-warning"
        >
          <ShieldAlert className="size-5 shrink-0" aria-hidden="true" />
          <p className="min-w-0 flex-1">
            <strong>On a betting break</strong> until {formatDateShort(cooldownEndsAt ?? '')} — placing bets is
            paused.
          </p>
          <Link to="/settings" className="shrink-0 font-semibold text-orange-700 underline hover:no-underline dark:text-warning">
            Manage break
          </Link>
        </motion.div>
      )}

      {isPending && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-primary via-primary-light to-secondary p-6 text-white shadow-lg shadow-primary/25 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Rocket className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Set up your account in 2 minutes</h2>
              <p className="text-sm text-white/80">
                Add funds to your wallet, set a budget and take your risk assessment.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:ml-auto"
          >
            <Ticket className="size-4" aria-hidden="true" /> Start tour
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-primary via-primary-light to-primary p-6 text-white shadow-lg shadow-primary/25 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Wallet className="size-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Wallet balance</p>
            <p className="font-display text-3xl font-bold">{formatGHS(balance)}</p>
            <p className="text-xs text-white/70">Demo wallet · funds are simulated and stored locally</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <button
            onClick={() => setDepositOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Plus className="size-4" aria-hidden="true" /> Add money
          </button>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            History <ChevronRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Money spent"
          value={formatGHS(monthSpent)}
          sub={budgetNotSet ? 'No budget set yet' : `of GH₵ ${monthlyBudget.toLocaleString()} budget`}
          tone="primary"
          delay={0}
        />
        <StatCard
          icon={TrendingDown}
          label="Budget remaining"
          value={budgetNotSet ? '—' : formatGHS(remaining)}
          sub={
            budgetNotSet
              ? 'Set a budget to track yourself'
              : remaining === 0
                ? 'Budget used up'
                : `${Math.round((remaining / Math.max(1, monthlyBudget)) * 100)}% left`
          }
          tone={status === 'critical' ? 'danger' : 'secondary'}
          delay={0.06}
        />
        <StatCard
          icon={ListChecks}
          label="Pending bets"
          value={String(pendingCount)}
          sub={pendingCount > 0 ? `GH₵ ${todaySpent.toLocaleString()} staked today` : 'No open bets'}
          tone="warning"
          delay={0.12}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Spending — last 30 days" subtitle="Daily amounts placed on bets">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primaryLight} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.primaryLight} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="spent"
                    name="Spent"
                    stroke={COLORS.primaryLight}
                    strokeWidth={2.5}
                    fill="url(#dashGrad)"
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <RiskCard level={riskLevel} score={Math.max(5, Math.min(95, riskScore + healthBonus))} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Recent betting activity"
            subtitle="Your latest logged bets"
            action={
              <Link to="/betting-log" className="flex items-center gap-1 text-xs font-semibold text-primary-light hover:underline">
                View all <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          >
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-light">
                  <Ticket className="size-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-ink dark:text-white">No bets logged yet</p>
                <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
                  Your activity will show up here. Place a bet on the Sportsbook or log one manually.
                </p>
                <Link
                  to="/sportsbook"
                  className="mt-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:shadow-primary/30"
                >
                  <Ticket className="size-4" aria-hidden="true" /> Go to Sportsbook
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {recent.map((bet, i) => (
                  <motion.li
                    key={bet.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 py-3"
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        bet.status === 'pending'
                          ? 'bg-warning/10 text-orange-600 dark:text-warning'
                          : bet.outcome === 'won'
                            ? 'bg-secondary/10 text-secondary-dark dark:text-secondary'
                            : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {bet.status === 'pending' ? <Clock className="size-4" aria-hidden="true" /> : bet.outcome === 'won' ? 'W' : 'L'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink dark:text-white">
                        {bet.sport} · {bet.platform}
                      </p>
                      <p className="text-xs text-slate-400">{formatDateShort(bet.date)}</p>
                    </div>
                    <span className={`text-sm font-bold ${bet.status === 'pending' ? 'text-warning' : bet.outcome === 'won' ? 'text-secondary' : 'text-danger'}`}>
                      {bet.status === 'pending' ? formatGHS(bet.amount) : `${bet.outcome === 'won' ? '+' : '-'}${formatGHS(bet.amount)}`}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="GreenBet"
            subtitle={greenEnabled ? 'Your betting is planting trees' : 'Paused — 2% of stakes not set aside'}
            action={
              <Link to="/greenbet" className="flex items-center gap-1 text-xs font-semibold text-secondary hover:underline">
                View <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          >
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-emerald-600 text-white shadow-lg shadow-secondary/25">
                <Leaf className="size-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold text-ink dark:text-white">{greenScore}</p>
                <p className="text-xs font-semibold text-secondary-dark dark:text-secondary">{scoreBand.label}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <TreePine className="size-4 text-secondary" aria-hidden="true" />
                <p className="mt-1 font-display text-lg font-bold text-ink dark:text-white">{trees}</p>
                <p className="text-[11px] text-slate-400">Trees funded</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <Sprout className="size-4 text-secondary" aria-hidden="true" />
                <p className="mt-1 font-display text-lg font-bold text-ink dark:text-white">{greenPoints.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400">Green points</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              {formatGHS(totalContributed, 2)} contributed to environmental projects so far.
            </p>
          </ChartCard>

          <ChartCard
            title="Active challenges"
            subtitle="Auto-tracked — progress updates as you play"
            className="mt-6"
            action={
              <Link to="/challenges" className="flex items-center gap-1 text-xs font-semibold text-primary-light hover:underline">
                View all <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          >
            {activeChallenges.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                {isPending
                  ? 'Challenges unlock as you bet — start exploring to earn your first badge.'
                  : "No active challenges — you've completed everything. Check back soon."}
              </p>
            ) : (
              <div className="space-y-4">
                {activeChallenges.map((item) => (
                  <Link key={item.challenge.id} to="/challenges" className="block rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Target className="size-3.5 shrink-0 text-primary-light" aria-hidden="true" />
                      <p className="truncate text-sm font-semibold text-ink dark:text-white">{item.challenge.title}</p>
                      <span className="ml-auto shrink-0 text-xs font-bold text-primary-light">{item.pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 1.1 }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{item.estimate}</p>
                  </Link>
                ))}
                {healthBonus > 0 && (
                  <p className="flex items-center gap-1.5 rounded-lg bg-secondary/10 px-2.5 py-1.5 text-[11px] font-semibold text-secondary-dark dark:text-secondary">
                    <Trophy className="size-3" aria-hidden="true" /> Completed challenges add +{healthBonus} to your health score
                  </p>
                )}
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  );
}
