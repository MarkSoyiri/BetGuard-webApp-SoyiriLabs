import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PageHeader } from '@/components/ui/PageTransition';
import { ChartCard } from '@/components/ui/ChartCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useBets } from '@/contexts/BetContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useGoals } from '@/contexts/GoalContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { formatGHS, formatDateShort } from '@/utils/format';
import { computeStats, dateRange, monthlySpending } from '@/utils/stats';
import { ChartTooltip, AXIS_TICK, gridStyle, COLORS } from '@/components/charts/chartUtils';

export function Statistics() {
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { goals } = useGoals();
  const { achievements, unlockedCount } = useAchievements();

  const stats = useMemo(() => computeStats(bets), [bets]);

  const daily = useMemo(
    () =>
      dateRange(30).map((d) => ({
        day: formatDateShort(d),
        spent: bets.filter((b) => b.date === d).reduce((s, b) => s + b.amount, 0),
      })),
    [bets],
  );

  const monthly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleDateString('en-GB', { month: 'short' });
      const spent = bets
        .filter((b) => {
          const bd = new Date(b.date);
          return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
        })
        .reduce((s, b) => s + b.amount, 0);
      return { month: label, spent, budget: monthlyBudget };
    });
  }, [bets, monthlyBudget]);

  const winsLosses = useMemo(
    () => [
      { name: 'Won', value: stats.won },
      { name: 'Lost', value: stats.lost },
    ],
    [stats],
  );

  const budgetHistory = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const spent = bets
        .filter((b) => {
          const bd = new Date(b.date);
          return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
        })
        .reduce((s, b) => s + b.amount, 0);
      return {
        month: d.toLocaleDateString('en-GB', { month: 'short' }),
        spent,
        budget: monthlyBudget,
      };
    });
  }, [bets, monthlyBudget]);

  const savingsGrowth = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1).getTime();
      const amount = goals
        .filter((g) => new Date(g.createdAt).getTime() <= cutoff)
        .reduce((s, g) => s + g.current * (0.4 + i * 0.12), 0);
      return {
        month: new Date(cutoff).toLocaleDateString('en-GB', { month: 'short' }),
        saved: Math.round(amount),
      };
    });
  }, [goals]);

  const riskTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const spent = bets
        .filter((b) => {
          const bd = new Date(b.date);
          return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
        })
        .reduce((s, b) => s + b.amount, 0);
      const ratio = spent / Math.max(1, monthlyBudget);
      const risk = Math.max(5, Math.min(95, Math.round(ratio * 80 + (5 - i) * 4)));
      return { month: d.toLocaleDateString('en-GB', { month: 'short' }), risk };
    });
  }, [bets, monthlyBudget]);

  const PIE_COLORS = [COLORS.secondary, COLORS.danger];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Statistics"
        subtitle="Your numbers never lie — trends reveal what single days hide."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Daily spending" subtitle="Last 30 days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="spent"
                  name="Spent"
                  stroke={COLORS.primaryLight}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Monthly spending" subtitle="Last 6 months">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                <Bar dataKey="spent" name="Spent" fill={COLORS.primary} radius={[6, 6, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Wins vs Losses" subtitle="By number of bets">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winsLosses}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={4}
                    strokeWidth={0}
                    animationDuration={1200}
                  >
                    {winsLosses.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {winsLosses.map((w, i) => (
                <div key={w.name} className="flex items-center gap-2 text-sm">
                  <span className="size-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="font-medium text-slate-600 dark:text-slate-300">{w.name}</span>
                  <span className="font-bold text-ink dark:text-white">{w.value}</span>
                </div>
              ))}
              <p className="mt-2 max-w-[180px] text-xs leading-relaxed text-slate-400">
                Win rate: {Math.round(stats.winRate)}% · Net: {formatGHS(stats.net)}
              </p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Budget history" subtitle="Spending vs budget · last 6 months">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={budgetHistory} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="spent" name="Spent" stroke={COLORS.primaryLight} strokeWidth={2.5} dot={{ r: 4 }} animationDuration={1200} />
                <Line type="monotone" dataKey="budget" name="Budget" stroke={COLORS.secondary} strokeWidth={2.5} strokeDasharray="6 4" dot={false} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Savings growth" subtitle="Projected across your goals">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsGrowth} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="saveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={COLORS.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="saved" name="Saved" stroke={COLORS.secondary} strokeWidth={2.5} fill="url(#saveGrad)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risk trend" subtitle="Estimated risk score · last 6 months">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="risk" name="Risk score" stroke={COLORS.danger} strokeWidth={2.5} fill="url(#riskGrad)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Achievement progress"
          subtitle={`${unlockedCount} of ${achievements.length} badges unlocked`}
        >
          <ProgressBar value={(unlockedCount / Math.max(1, achievements.length)) * 100} showLabel />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {(['bronze', 'silver', 'gold'] as const).map((tier) => {
              const count = achievements.filter((a) => a.tier === tier && a.unlocked).length;
              const total = achievements.filter((a) => a.tier === tier).length;
              return (
                <div key={tier} className="rounded-2xl bg-slate-100/70 p-3 dark:bg-slate-800/60">
                  <p className={`font-display text-lg font-bold ${tier === 'bronze' ? 'text-amber-700' : tier === 'silver' ? 'text-slate-500' : 'text-orange-500'}`}>
                    {count}/{total}
                  </p>
                  <p className="text-xs font-semibold capitalize text-slate-400">{tier}</p>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Monthly overview" subtitle="This month at a glance">
          <div className="space-y-4">
            {[
              { label: 'Total spent', value: formatGHS(monthlySpending(bets)) },
              { label: 'Total bets placed', value: String(stats.total) },
              { label: 'Won', value: String(stats.won) },
              { label: 'Lost', value: String(stats.lost) },
              { label: 'Net result', value: formatGHS(stats.net), tone: stats.net >= 0 ? 'text-secondary' : 'text-danger' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{row.label}</span>
                <span className={`font-display font-bold text-ink dark:text-white ${row.tone ?? ''}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
