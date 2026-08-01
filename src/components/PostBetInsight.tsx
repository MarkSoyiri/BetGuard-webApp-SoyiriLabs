import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, TrendingUp, Wallet, Leaf } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Badge';
import type { SportsbookBet } from '@/types';
import { formatGHS } from '@/utils/format';
import { useBets } from '@/contexts/BetContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useLimits } from '@/contexts/LimitsContext';
import { useGreenBet } from '@/contexts/GreenBetContext';
import { computeHealthScore, monthlySpending } from '@/utils/stats';

interface PostBetInsightProps {
  open: boolean;
  slips: SportsbookBet[];
  onClose: () => void;
}

interface Insight {
  text: string;
  tone: 'secondary' | 'warning' | 'primary';
}

export function PostBetInsight({ open, slips, onClose }: PostBetInsightProps) {
  const navigate = useNavigate();
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { limits } = useLimits();
  const { greenScore, scoreBand } = useGreenBet();

  const snapshot = useMemo(() => {
    const totalStake = slips.reduce((s, x) => s + x.stake, 0);
    const totalPayout = slips.reduce((s, x) => s + (x.payout ?? 0), 0);
    const net = totalPayout - totalStake;
    const won = slips.filter((s) => s.status === 'won').length;
    const lost = slips.filter((s) => s.status === 'lost').length;
    const greenContribution = Math.round(totalStake * 0.02 * 100) / 100;

    const monthSpent = monthlySpending(bets);
    const budgetPct = monthlyBudget > 0 ? Math.round((monthSpent / monthlyBudget) * 100) : 0;
    const health = computeHealthScore(bets, monthlyBudget, limits);

    const insights: Insight[] = [];
    if (net >= 0) {
      insights.push({
        text: 'You came out ahead this round. Enjoy the win — but remember the bookmaker’s margin means long-term profit is statistically unlikely.',
        tone: 'secondary',
      });
    } else {
      insights.push({
        text: 'A losing round. Losses are part of the game and the house edge is real — this is a good moment to review your limits.',
        tone: 'warning',
      });
    }

    const worst = health.factors.find((f) => f.status === 'poor') ?? health.factors.find((f) => f.status === 'ok');
    if (worst) {
      insights.push({
        text: `${worst.label}: ${worst.detail}. Your health score is ${health.score} (${health.level} risk).`,
        tone: 'primary',
      });
    }

    if (budgetPct >= 80) {
      insights.push({
        text: `You have used ${budgetPct}% of your monthly budget (${formatGHS(monthSpent)} of ${formatGHS(monthlyBudget)}). Consider easing off this month.`,
        tone: 'warning',
      });
    } else if (monthlyBudget > 0) {
      insights.push({
        text: `Budget pacing is healthy — ${formatGHS(monthlyBudget - monthSpent)} left this month. Redirecting even ${formatGHS(Math.round(monthSpent * 0.2))} into savings would build a cushion.`,
        tone: 'primary',
      });
    }

    return { totalStake, totalPayout, net, won, lost, monthSpent, budgetPct, health, insights, greenContribution };
  }, [bets, monthlyBudget, limits, slips]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post-bet insights"
      subtitle="How this round shaped your bankroll and habits"
      size="lg"
    >
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex items-center justify-between rounded-2xl px-5 py-4 ${
            snapshot.net >= 0
              ? 'bg-secondary/10 text-secondary-dark dark:text-secondary'
              : 'bg-danger/10 text-danger-dark dark:text-danger'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex size-12 items-center justify-center rounded-xl ${
                snapshot.net >= 0 ? 'bg-secondary/20' : 'bg-danger/20'
              }`}
            >
              {snapshot.net >= 0 ? (
                <TrendingUp className="size-6" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-6" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="font-display text-2xl font-bold">
                {snapshot.net >= 0 ? '+' : ''}
                {formatGHS(snapshot.net, 2)}
              </p>
              <p className="text-xs font-semibold opacity-80">
                Won {snapshot.won} of {snapshot.won + snapshot.lost} settled bets
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Staked</p>
            <p className="font-display font-bold">{formatGHS(snapshot.totalStake, 2)}</p>
          </div>
        </motion.div>

        {slips.length > 0 && (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/60 bg-white/60 dark:divide-slate-700/60 dark:border-slate-700/60 dark:bg-slate-900/40">
            {slips.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink dark:text-white">
                    {s.selections.map((sel) => sel.team).join(' + ')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {s.selections.length} selection{s.selections.length === 1 ? '' : 's'} · {formatGHS(s.stake, 2)} stake
                  </p>
                </div>
                <Chip tone={s.status === 'won' ? 'secondary' : 'danger'}>
                  {s.status === 'won' ? `+${formatGHS(s.payout ?? 0, 2)}` : `-${formatGHS(s.stake, 2)}`}
                </Chip>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-2xl border border-primary-light/30 bg-gradient-to-br from-primary/5 to-accent/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary-light" aria-hidden="true" />
            <p className="font-display text-sm font-bold text-ink dark:text-white">BetGuard insight</p>
          </div>
          <ul className="mt-2.5 space-y-2">
            {snapshot.insights.map((ins, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-light" aria-hidden="true" />
                {ins.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-secondary/10 to-emerald-600/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-emerald-600 text-white shadow-md shadow-secondary/25">
              <Leaf className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink dark:text-white">Green contribution from this round</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatGHS(snapshot.greenContribution, 2)} set aside for environmental projects
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-lg font-bold text-secondary-dark dark:text-secondary">{formatGHS(snapshot.greenContribution, 2)}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Green score {greenScore} · {scoreBand.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-4 py-2.5 text-xs font-semibold text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
          <Wallet className="size-4" aria-hidden="true" />
          Health score {snapshot.health.score} / 100 · {snapshot.health.level} risk · limits{' '}
          {limits.enabled ? 'on' : 'off'}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            fullWidth
            onClick={() => {
              onClose();
              navigate('/dashboard');
            }}
          >
            Back to dashboard
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => {
              onClose();
              navigate('/coach');
            }}
          >
            Talk to my AI coach
          </Button>
        </div>
      </div>
    </Modal>
  );
}
