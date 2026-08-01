import type { BetRecord, RiskLevel } from '@/types';

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
