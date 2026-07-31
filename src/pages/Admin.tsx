import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Users,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Trophy,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Chip } from '@/components/ui/Badge';
import { useBets } from '@/contexts/BetContext';
import { formatGHS, formatDateShort } from '@/utils/format';
import { dateRange } from '@/utils/stats';
import { ChartTooltip, AXIS_TICK, gridStyle, COLORS } from '@/components/charts/chartUtils';

const DAILY_ACTIVE = 486;

export function Admin() {
  const { bets } = useBets();

  const platformSpend = useMemo(() => {
    const map = new Map<string, number>();
    bets.forEach((b) => map.set(b.platform, (map.get(b.platform) ?? 0) + b.amount));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [bets]);

  const platformTrend = useMemo(() => {
    const days = dateRange(14);
    const platforms = Array.from(new Set(bets.map((b) => b.platform)));
    return days.map((d) => {
      const row: Record<string, string | number> = { day: formatDateShort(d) };
      platforms.forEach((p) => {
        row[p] = bets.filter((b) => b.date === d && b.platform === p).reduce((s, b) => s + b.amount, 0);
      });
      return row;
    });
  }, [bets]);

  const weekdayHeatmap = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const grid = days.map((day, di) => {
      let total = 0;
      let count = 0;
      for (let w = 0; w < 8; w += 1) {
        const d = new Date(now);
        d.setDate(d.getDate() - w * 7);
        while (d.getDay() !== (di === 6 ? 0 : di + 1)) d.setDate(d.getDate() - 1);
        const iso = d.toISOString().slice(0, 10);
        const dayBets = bets.filter((b) => b.date === iso);
        total += dayBets.reduce((s, b) => s + b.amount, 0);
        count += dayBets.length;
      }
      return { day, total, avg: count > 0 ? total / 8 : 0 };
    });
    const max = Math.max(...grid.map((g) => g.avg), 1);
    return { grid, max };
  }, [bets]);

  const riskDistribution = [
    { name: 'Low risk', value: 62 },
    { name: 'Medium risk', value: 27 },
    { name: 'High risk', value: 11 },
  ];
  const RISK_COLORS = [COLORS.secondary, COLORS.warning, COLORS.danger];

  const completion = [
    { label: '7-Day Challenge', pct: 68 },
    { label: '30-Day Challenge', pct: 34 },
    { label: 'Risk Assessment', pct: 82 },
    { label: 'Financial Literacy', pct: 74 },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform-wide demo analytics for BetGuard."
        action={
          <Chip tone="primary">
            <ShieldCheck className="size-3" aria-hidden="true" /> Admin view · demo data
          </Chip>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Users} label="Total users" value="12,482" sub={`+312 this week · ${DAILY_ACTIVE} active today`} tone="primary" delay={0} />
        <StatCard icon={Wallet} label="Avg. monthly spending" value={formatGHS(420)} sub="per active user" tone="warning" delay={0.05} />
        <StatCard icon={PiggyBank} label="Avg. monthly savings" value={formatGHS(186)} sub="via BetGuard goals" tone="secondary" delay={0.1} />
        <StatCard icon={AlertTriangle} label="High risk users" value="1,373" sub="11% of users · −4% this month" tone="danger" delay={0.15} />
        <StatCard icon={Trophy} label="Challenge completion" value="51%" sub="across all challenges" tone="accent" delay={0.2} />
        <StatCard icon={GraduationCap} label="Education completion" value="74%" sub="of users read 3+ articles" tone="primary" delay={0.25} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ChartCard title="Risk distribution" subtitle="All users">
          <div className="flex flex-col items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={4}
                    strokeWidth={0}
                    animationDuration={1200}
                  >
                    {riskDistribution.map((_, i) => (
                      <Cell key={i} fill={RISK_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 w-full space-y-2">
              {riskDistribution.map((r, i) => (
                <li key={r.name} className="flex items-center gap-2 text-sm">
                  <span className="size-3 rounded-full" style={{ background: RISK_COLORS[i] }} />
                  <span className="flex-1 font-medium text-slate-600 dark:text-slate-300">{r.name}</span>
                  <span className="font-bold text-ink dark:text-white">{r.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>

        <ChartCard title="Spending by platform" subtitle="All time (from your demo log)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformSpend} layout="vertical" margin={{ top: 8, right: 12, left: 6, bottom: 0 }}>
                <CartesianGrid {...gridStyle} horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                <Bar dataKey="value" name="Spent" radius={[0, 8, 8, 0]} animationDuration={1200}>
                  {platformSpend.map((_, i) => (
                    <Cell key={i} fill={[COLORS.primary, COLORS.primaryLight, COLORS.secondary][i % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Platform spending trend" subtitle="Last 14 days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformTrend} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                {platformTrend[0] &&
                  Object.keys(platformTrend[0])
                    .filter((k) => k !== 'day')
                    .map((k, i) => (
                      <Line
                        key={k}
                        type="monotone"
                        dataKey={k}
                        name={k}
                        stroke={[COLORS.primary, COLORS.secondary, COLORS.accent][i % 3]}
                        strokeWidth={2.5}
                        dot={false}
                        animationDuration={1200}
                      />
                    ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Engagement heatmap" subtitle="Average daily spending by weekday (GH₵, last 8 weeks)">
          <div className="grid grid-cols-7 gap-2">
            {weekdayHeatmap.grid.map((g) => {
              const intensity = g.avg / weekdayHeatmap.max;
              const bg =
                intensity > 0.8
                  ? 'rgba(239,68,68,0.85)'
                  : intensity > 0.55
                    ? 'rgba(245,158,11,0.8)'
                    : intensity > 0.3
                      ? 'rgba(37,99,235,0.65)'
                      : 'rgba(16,185,129,0.55)';
              return (
                <div key={g.day} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{g.day}</span>
                  <div
                    className="flex aspect-square w-full max-w-14 items-center justify-center rounded-xl text-[10px] font-bold text-white shadow-lg"
                    style={{ background: bg, boxShadow: `0 4px 14px ${bg}` }}
                  >
                    {Math.round(g.avg) || '–'}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-[rgba(16,185,129,0.55)]" /> Low</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-[rgba(37,99,235,0.65)]" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-[rgba(245,158,11,0.8)]" /> Elevated</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-[rgba(239,68,68,0.85)]" /> High</span>
          </div>
        </ChartCard>

        <GlassCard className="p-6">
          <h3 className="mb-5 font-display text-base font-bold text-ink dark:text-white">
            Programme completion
          </h3>
          <div className="space-y-5">
            {completion.map((c, i) => (
              <div key={c.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{c.label}</span>
                  <span className="font-bold text-ink dark:text-white">{c.pct}%</span>
                </div>
                <ProgressBar
                  value={c.pct}
                  color={[COLORS.secondary, COLORS.accent, COLORS.primaryLight, COLORS.violet][i % 4]}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary/[0.06] to-secondary/[0.06] p-4">
            <p className="text-sm font-bold text-ink dark:text-white">Insight</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Users who complete the risk assessment are 2.3× more likely to stay within budget.
              Challenge completion correlates with a 34% drop in average weekly spending.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
