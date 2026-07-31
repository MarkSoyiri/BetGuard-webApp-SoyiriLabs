import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Plus,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { RiskCard } from '@/components/ui/RiskCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { Chip } from '@/components/ui/Badge';
import { useBets } from '@/contexts/BetContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useGoals } from '@/contexts/GoalContext';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { greeting, formatGHS, formatDateShort, timeAgo, monthLabel } from '@/utils/format';
import { computeStats, budgetStatus, monthlySpending, dateRange } from '@/utils/stats';
import { ChartTooltip, AXIS_TICK, gridStyle, COLORS } from '@/components/charts/chartUtils';

export function Dashboard() {
  const { profile } = useUser();
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { goals } = useGoals();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  const stats = useMemo(() => computeStats(bets), [bets]);
  const monthSpent = useMemo(() => monthlySpending(bets), [bets]);
  const remaining = Math.max(0, monthlyBudget - monthSpent);
  const status = budgetStatus(monthSpent, monthlyBudget);
  const savingsTotal = goals.reduce((s, g) => s + g.current, 0);
  const savingsTarget = goals.reduce((s, g) => s + g.target, 0);

  const daily = useMemo(() => {
    return dateRange(30).map((d) => ({
      day: formatDateShort(d),
      spent: bets.filter((b) => b.date === d).reduce((s, b) => s + b.amount, 0),
    }));
  }, [bets]);

  const weekly = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; spent: number }[] = [];
    for (let w = 7; w >= 0; w -= 1) {
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const startISO = start.toISOString().slice(0, 10);
      const spent = bets
        .filter((b) => b.date >= startISO && b.date <= end.toISOString().slice(0, 10))
        .reduce((s, b) => s + b.amount, 0);
      weeks.push({ week: `W${8 - w}`, spent });
    }
    return weeks;
  }, [bets]);

  const recent = bets.slice(0, 5);
  const latestNotifications = notifications.slice(0, 4);
  const riskScore = 100 - Math.min(100, Math.round((monthSpent / Math.max(1, monthlyBudget)) * 40));
  const riskLevel = profile?.riskLevel ?? (riskScore > 65 ? 'Low' : riskScore > 40 ? 'Medium' : 'High');

  const savingsPct = savingsTarget > 0 ? Math.round((savingsTotal / savingsTarget) * 100) : 0;

  const recommendations = useMemo(() => {
    const list: { text: string; tone: 'primary' | 'secondary' | 'warning' | 'danger' }[] = [];
    if (status === 'critical' || status === 'warning')
      list.push({ text: 'You are close to (or over) your monthly budget. Consider a betting pause until next month.', tone: 'danger' });
    else if (status === 'caution')
      list.push({ text: 'You have used over 80% of your budget. Reduce stake sizes for the rest of the month.', tone: 'warning' });
    else
      list.push({ text: 'You are pacing well within budget. Keep the current monthly limit.', tone: 'secondary' });

    if (stats.winRate < 45)
      list.push({ text: `Your win rate is ${Math.round(stats.winRate)}%. Remember the bookmaker's margin always wins long term.`, tone: 'primary' });
    if (monthSpent > 0 && monthlyBudget > 0)
      list.push({ text: `Cutting betting by 30% could free up ~GH₵ ${Math.round(monthSpent * 0.3).toLocaleString()} a month for savings.`, tone: 'primary' });
    list.push({ text: 'Complete today\'s "No Bet Today" challenge to keep your streak alive.', tone: 'primary' });
    return list;
  }, [status, stats.winRate, monthSpent, monthlyBudget]);

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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:shadow-primary/40"
        >
          <Plus className="size-4" aria-hidden="true" /> Log a bet
        </Link>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
          icon={PiggyBank}
          label="Savings"
          value={formatGHS(savingsTotal)}
          sub={`${savingsPct}% of ${formatGHS(savingsTarget)} target`}
          tone="accent"
          delay={0.12}
        />
        <StatCard
          icon={ShieldCheck}
          label="Risk level"
          value={riskLevel}
          sub="Based on your activity"
          tone={riskLevel === 'High' ? 'danger' : riskLevel === 'Medium' ? 'warning' : 'secondary'}
          delay={0.18}
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

        <ChartCard title="Weekly spending" subtitle="Last 8 weeks">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="week" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                <Bar dataKey="spent" name="Spent" radius={[6, 6, 0, 0]} animationDuration={1200}>
                  {weekly.map((_, i) => (
                    <Cell key={i} fill={i >= weekly.length - 3 ? COLORS.danger : COLORS.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
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
                      bet.outcome === 'won'
                        ? 'bg-secondary/10 text-secondary-dark dark:text-secondary'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {bet.outcome === 'won' ? 'W' : 'L'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink dark:text-white">
                      {bet.sport} · {bet.platform}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateShort(bet.date)}</p>
                  </div>
                  <span className={`text-sm font-bold ${bet.outcome === 'won' ? 'text-secondary' : 'text-danger'}`}>
                    {bet.outcome === 'won' ? '+' : '-'}{formatGHS(bet.amount)}
                  </span>
                </motion.li>
              ))}
            </ul>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="Savings progress" subtitle={`${savingsPct}% of overall target`}>
            <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-secondary to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${savingsPct}%` }}
                transition={{ duration: 1.2 }}
              />
            </div>
            <div className="space-y-2.5">
              {goals.slice(0, 2).map((g) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <div key={g.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500 dark:text-slate-400">{g.name}</span>
                    <span className="font-bold text-ink dark:text-white">{pct}%</span>
                  </div>
                );
              })}
            </div>
            <Link
              to="/savings"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-secondary-dark hover:underline dark:text-secondary"
            >
              Manage goals <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </ChartCard>

          <ChartCard title="AI recommendations" subtitle="Personalised for you">
            <ul className="space-y-3">
              {recommendations.slice(0, 3).map((r, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2.5"
                >
                  <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                    r.tone === 'danger' ? 'bg-danger/10 text-danger' : r.tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-secondary/10 text-secondary-dark'
                  }`}>
                    <Sparkles className="size-3" aria-hidden="true" />
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{r.text}</p>
                </motion.li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/coach')}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-light hover:underline"
            >
              Chat with your coach <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </ChartCard>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Recent notifications" subtitle="Stay on top of your limits">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {latestNotifications.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => navigate('/notifications')}
                    className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <Chip tone={n.type === 'warning' ? 'warning' : n.type === 'achievement' ? 'accent' : n.type === 'success' ? 'secondary' : 'slate'}>
                      {n.type}
                    </Chip>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink dark:text-white">{n.title}</p>
                      <p className="truncate text-xs text-slate-400">{n.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{timeAgo(n.date)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </ChartCard>
        </div>
        <RiskCard level={riskLevel} score={Math.max(5, Math.min(95, riskScore))} />
      </div>
    </div>
  );
}
