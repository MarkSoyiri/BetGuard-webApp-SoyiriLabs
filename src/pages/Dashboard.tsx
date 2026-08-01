import { useMemo } from 'react';
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
import { useBets } from '@/contexts/BetContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useUser } from '@/contexts/UserContext';
import { useLimits } from '@/contexts/LimitsContext';
import { useGreenBet } from '@/contexts/GreenBetContext';
import { greeting, formatGHS, formatDateShort, monthLabel, todayISO } from '@/utils/format';
import { monthlySpending, budgetStatus, dateRange, computeHealthScore, spentOnDate } from '@/utils/stats';
import { ChartTooltip, AXIS_TICK, gridStyle, COLORS } from '@/components/charts/chartUtils';

export function Dashboard() {
  const { profile } = useUser();
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { limits, isCooldownActive, cooldownEndsAt } = useLimits();
  const { enabled: greenEnabled, greenScore, scoreBand, trees, totalContributed, greenPoints } = useGreenBet();

  const monthSpent = useMemo(() => monthlySpending(bets), [bets]);
  const health = useMemo(() => computeHealthScore(bets, monthlyBudget, limits), [bets, monthlyBudget, limits]);
  const remaining = Math.max(0, monthlyBudget - monthSpent);
  const status = budgetStatus(monthSpent, monthlyBudget);

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

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Money spent"
          value={formatGHS(monthSpent)}
          sub={`of GH₵ ${monthlyBudget.toLocaleString()} budget`}
          tone="primary"
          delay={0}
        />
        <StatCard
          icon={TrendingDown}
          label="Budget remaining"
          value={formatGHS(remaining)}
          sub={remaining === 0 ? 'Budget used up' : `${Math.round((remaining / Math.max(1, monthlyBudget)) * 100)}% left`}
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

        <RiskCard level={riskLevel} score={Math.max(5, Math.min(95, riskScore))} />
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
        </div>
      </div>
    </div>
  );
}
