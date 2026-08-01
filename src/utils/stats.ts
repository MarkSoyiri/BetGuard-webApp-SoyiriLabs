import type { BetRecord, BettingLimits, LimitCheck, RiskLevel } from '@/types';
import { formatGHS, todayISO } from '@/utils/format';

export interface BetStats {
  total: number;
  spent: number;
  won: number;
  lost: number;
  net: number;
  winRate: number;
}

export function computeStats(bets: BetRecord[]): BetStats {
  let spent = 0;
  let won = 0;
  let lost = 0;
  let wonAmt = 0;
  let lostAmt = 0;
  bets.forEach((b) => {
    spent += b.amount;
    if (b.status === 'pending') return;
    if (b.outcome === 'won') {
      won += 1;
      wonAmt += b.amount;
    } else {
      lost += 1;
      lostAmt += b.amount;
    }
  });
  const winRate = won + lost === 0 ? 0 : (won / (won + lost)) * 100;
  return {
    total: bets.length,
    spent,
    won,
    lost,
    net: wonAmt - lostAmt,
    winRate,
  };
}

export function monthlySpending(bets: BetRecord[], year?: number, month?: number): number {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  return bets
    .filter((b) => {
      const d = new Date(b.date);
      return d.getFullYear() === y && d.getMonth() === m;
    })
    .reduce((sum, b) => sum + b.amount, 0);
}

export interface RiskBands {
  score: number;
  level: RiskLevel;
}

export function assessRisk(answers: number[]): RiskBands {
  if (answers.length === 0) return { score: 0, level: 'Low' };
  const max = answers.length * 4;
  const sum = answers.reduce((a, b) => a + b, 0);
  const score = Math.round((sum / max) * 100);
  const level: RiskLevel = score < 40 ? 'Low' : score < 70 ? 'Medium' : 'High';
  return { score, level };
}

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'High':
      return '#ef4444';
    case 'Medium':
      return '#f59e0b';
    default:
      return '#10b981';
  }
}

export function budgetProgress(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min(100, Math.round((spent / budget) * 100));
}

export function budgetStatus(spent: number, budget: number): 'safe' | 'caution' | 'warning' | 'critical' {
  const pct = budget > 0 ? spent / budget : 0;
  if (pct >= 1) return 'critical';
  if (pct >= 0.9) return 'warning';
  if (pct >= 0.8) return 'caution';
  return 'safe';
}

export function budgetMessage(spent: number, budget: number): { text: string; tone: 'safe' | 'caution' | 'warning' | 'critical' } {
  const status = budgetStatus(spent, budget);
  const remaining = Math.max(0, budget - spent);
  const left = budget - spent;
  switch (status) {
    case 'critical':
      return { text: 'You have reached or exceeded your budget. Consider taking a break.', tone: 'critical' };
    case 'warning':
      return { text: `You're very close to your limit. Only GH₵ ${left.toLocaleString()} remains.`, tone: 'warning' };
    case 'caution':
      return { text: `You've used over 80% of your budget. Ease off to stay in control.`, tone: 'caution' };
    default:
      return {
        text:
          remaining > budget * 0.5
            ? 'Excellent budgeting this month. Keep it up!'
            : 'You are pacing well within your budget.',
        tone: 'safe',
      };
  }
}

export function dateRange(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function spentOnDate(bets: BetRecord[], iso: string): number {
  return bets.filter((b) => b.date === iso).reduce((s, b) => s + b.amount, 0);
}

export function spentLastDays(bets: BetRecord[], days: number): number {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startISO = start.toISOString().slice(0, 10);
  return bets
    .filter((b) => b.date >= startISO)
    .reduce((s, b) => s + b.amount, 0);
}

export function checkBetAgainstLimits(
  bets: BetRecord[],
  limits: BettingLimits,
  amount: number,
  _monthlyBudget: number,
): LimitCheck {
  if (!limits.enabled) return { ok: true, message: '' };

  const userBets = bets.filter((b) => !b.id.startsWith('demo-'));
  const today = todayISO();
  const todaySpent = spentOnDate(userBets, today);
  const weekSpent = spentLastDays(userBets, 7);

  if (limits.daily > 0 && todaySpent + amount > limits.daily) {
    return {
      ok: false,
      kind: 'daily',
      message: `This bet would take you over your daily limit of ${formatGHS(limits.daily)}.`,
      remaining: Math.max(0, limits.daily - todaySpent),
    };
  }

  if (limits.weekly > 0 && weekSpent + amount > limits.weekly) {
    return {
      ok: false,
      kind: 'weekly',
      message: `This bet would take you over your weekly limit of ${formatGHS(limits.weekly)}.`,
      remaining: Math.max(0, limits.weekly - weekSpent),
    };
  }

  return { ok: true, message: '' };
}

export interface HealthFactor {
  label: string;
  detail: string;
  status: 'good' | 'ok' | 'poor';
}

export interface HealthScore {
  score: number;
  level: RiskLevel;
  factors: HealthFactor[];
}

export function computeHealthScore(
  bets: BetRecord[],
  monthlyBudget: number,
  limits: BettingLimits,
): HealthScore {
  const factors: HealthFactor[] = [];
  let score = 100;

  const monthSpent = monthlySpending(bets);
  const budgetPct = monthlyBudget > 0 ? monthSpent / monthlyBudget : 0;
  if (budgetPct >= 1) {
    score -= 30;
    factors.push({
      label: 'Budget',
      detail: `Used ${Math.round(budgetPct * 100)}% of your monthly budget`,
      status: 'poor',
    });
  } else if (budgetPct >= 0.8) {
    score -= 14;
    factors.push({ label: 'Budget', detail: 'Close to your monthly budget', status: 'ok' });
  } else {
    factors.push({ label: 'Budget', detail: 'Pacing well within your budget', status: 'good' });
  }

  const today = todayISO();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  const startISO = start.toISOString().slice(0, 10);
  const recent = bets.filter((b) => b.date >= startISO && b.date <= today);
  const perDay = recent.length / 30;

  if (perDay > 2) {
    score -= 12;
    factors.push({ label: 'Frequency', detail: `${perDay.toFixed(1)} bets per day on average`, status: 'poor' });
  } else if (perDay > 0.8) {
    score -= 4;
    factors.push({ label: 'Frequency', detail: `${perDay.toFixed(1)} bets per day on average`, status: 'ok' });
  } else {
    factors.push({ label: 'Frequency', detail: `${perDay.toFixed(1)} bets per day on average`, status: 'good' });
  }

  const avgStake = recent.length > 0 ? recent.reduce((s, b) => s + b.amount, 0) / recent.length : 0;
  if (monthlyBudget > 0) {
    if (avgStake > monthlyBudget * 0.25) {
      score -= 10;
      factors.push({ label: 'Stake size', detail: `Average stake ${formatGHS(Math.round(avgStake))} is large`, status: 'poor' });
    } else if (avgStake > monthlyBudget * 0.1) {
      score -= 4;
      factors.push({ label: 'Stake size', detail: `Average stake ${formatGHS(Math.round(avgStake))}`, status: 'ok' });
    } else {
      factors.push({ label: 'Stake size', detail: `Average stake ${formatGHS(Math.round(avgStake))} is modest`, status: 'good' });
    }
  }

  const newestFirst = [...bets].sort((a, b) => b.date.localeCompare(a.date));
  let chasing = 0;
  for (let i = 0; i < newestFirst.length - 1; i += 1) {
    if (newestFirst[i].outcome === 'lost' && newestFirst[i + 1].amount >= newestFirst[i].amount * 1.5) {
      chasing += 1;
    }
  }
  if (chasing > 0) {
    score -= 8;
    factors.push({
      label: 'Loss chasing',
      detail: `${chasing} bet${chasing === 1 ? '' : 's'} increased right after a loss`,
      status: 'ok',
    });
  } else {
    factors.push({ label: 'Loss chasing', detail: 'No signs of chasing losses', status: 'good' });
  }

  if (recent.length === 0) {
    score += 5;
    factors.push({ label: 'Breaks', detail: 'No bets in the last 30 days', status: 'good' });
  } else if (limits.enabled) {
    factors.push({ label: 'Limits', detail: 'Limits are enabled and enforced', status: 'good' });
  }

  const final = Math.max(0, Math.min(100, Math.round(score)));
  const level: RiskLevel = final >= 70 ? 'Low' : final >= 45 ? 'Medium' : 'High';
  return { score: final, level, factors };
}
