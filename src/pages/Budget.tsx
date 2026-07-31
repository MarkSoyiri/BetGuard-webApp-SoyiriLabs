import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Save, AlertTriangle, CheckCircle2, Calendar, Info, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CircularGauge } from '@/components/ui/CircularGauge';
import { useBudget } from '@/contexts/BudgetContext';
import { useBets } from '@/contexts/BetContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { budgetProgress, budgetStatus, budgetMessage, monthlySpending } from '@/utils/stats';
import { formatGHS } from '@/utils/format';

const RULES = [
  { pct: 80, label: 'Yellow warning', desc: 'Ease off — you are getting close to your limit.', color: '#fbbf24' },
  { pct: 90, label: 'Orange warning', desc: 'Strong signal. Stop and reconsider before betting again.', color: '#f59e0b' },
  { pct: 100, label: 'Red warning', desc: 'Budget reached. Consider a pause until next month.', color: '#ef4444' },
];

export function Budget() {
  const { monthlyBudget, setMonthlyBudget } = useBudget();
  const { bets } = useBets();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const [draft, setDraft] = useState(String(monthlyBudget));

  const spent = useMemo(() => monthlySpending(bets), [bets]);
  const remaining = Math.max(0, monthlyBudget - spent);
  const progress = budgetProgress(spent, monthlyBudget);
  const status = budgetStatus(spent, monthlyBudget);
  const message = budgetMessage(spent, monthlyBudget);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const suggestedDaily = Math.max(0, Math.round((remaining / Math.max(1, daysInMonth - dayOfMonth + 1)) * 100) / 100);

  const handleSaveBudget = () => {
    const value = Number(draft);
    if (!draft || Number.isNaN(value) || value <= 0) {
      toast('Please enter a valid budget amount.', 'error');
      return;
    }
    setMonthlyBudget(value);
    toast('Monthly budget updated.');
    if (spent > value) {
      addNotification('Budget overrun', `Your spending (${formatGHS(spent)}) now exceeds your new budget (${formatGHS(value)}).`, 'warning');
    }
  };

  const statusStyles: Record<string, { text: string; bg: string; icon: typeof CheckCircle2; hex: string }> = {
    safe: { text: 'text-secondary', bg: 'bg-secondary/10', icon: CheckCircle2, hex: '#10b981' },
    caution: { text: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle, hex: '#fbbf24' },
    warning: { text: 'text-orange-600', bg: 'bg-warning/10', icon: AlertTriangle, hex: '#f59e0b' },
    critical: { text: 'text-danger', bg: 'bg-danger/10', icon: AlertTriangle, hex: '#ef4444' },
  };
  const st = statusStyles[status];
  const StatusIcon = st.icon;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Monthly Budget"
        subtitle="Set a limit you can defend, and let BetGuard keep you honest."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex-1">
                <h3 className="mb-4 font-display text-base font-bold text-ink dark:text-white">
                  Your monthly betting budget
                </h3>
                <div className="flex flex-wrap items-end gap-4">
                  <div className="w-full max-w-xs">
                    <Input
                      label="Budget (GH₵)"
                      type="number"
                      min="0"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveBudget} icon={<Save className="size-4" aria-hidden="true" />}>
                    Update budget
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <CircularGauge value={progress} color={st.hex} size={120} stroke={10}>
                  <span className="font-display text-2xl font-bold text-ink dark:text-white">{progress}%</span>
                </CircularGauge>
                <p className="mt-1 text-xs font-medium text-slate-400">budget used</p>
              </div>
            </div>

            <div className="mt-6">
              <ProgressBar value={progress} showLabel />
            </div>

            <div className={`mt-5 flex items-start gap-3 rounded-2xl ${st.bg} p-4`}>
              <StatusIcon className={`mt-0.5 size-5 shrink-0 ${st.text}`} aria-hidden="true" />
              <div>
                <p className={`text-sm font-bold ${st.text}`}>
                  {message.tone === 'safe'
                    ? 'Healthy zone'
                    : message.tone === 'caution'
                      ? 'Caution zone'
                      : message.tone === 'warning'
                        ? 'Warning zone'
                        : 'Critical zone'}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message.text}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="mb-5 font-display text-base font-bold text-ink dark:text-white">
              Warning rules
            </h3>
            <div className="space-y-4">
              {RULES.map((r, i) => {
                const reached = progress >= r.pct;
                return (
                  <motion.div
                    key={r.pct}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                      reached ? 'border-current' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    style={reached ? { borderColor: r.color, backgroundColor: `${r.color}14` } : undefined}
                  >
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ background: r.color, boxShadow: `0 4px 14px ${r.color}55` }}
                    >
                      <AlertTriangle className="size-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink dark:text-white">{r.label} · {r.pct}%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        reached ? 'text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}
                      style={reached ? { background: r.color } : undefined}
                    >
                      {reached ? 'Triggered' : 'Armed'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30">
                <Wallet className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Spent this month</p>
                <p className="font-display text-2xl font-bold text-ink dark:text-white">{formatGHS(spent)}</p>
              </div>
            </div>
            <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-emerald-600 text-white shadow-lg shadow-secondary/30">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget remaining</p>
                <p className="font-display text-2xl font-bold text-secondary-dark dark:text-secondary">{formatGHS(remaining)}</p>
              </div>
            </div>
            <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-500 text-ink shadow-lg shadow-accent/30">
                <Calendar className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Safe daily budget</p>
                <p className="font-display text-2xl font-bold text-ink dark:text-white">{formatGHS(suggestedDaily)}</p>
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              <Info className="mt-0.5 size-3.5 shrink-0 text-primary-light" aria-hidden="true" />
              To stay within budget, do not bet more than {formatGHS(suggestedDaily)} on any single day.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-emerald-600 text-white shadow-lg shadow-secondary/30">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-ink dark:text-white">Guard tip</p>
                <p className="text-xs text-slate-400">Healthy budgeting, every day</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              {['Treat betting as entertainment — never an income', 'Never bet money you cannot afford to lose', 'Pause for 24 hours before any impulse bet'].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
