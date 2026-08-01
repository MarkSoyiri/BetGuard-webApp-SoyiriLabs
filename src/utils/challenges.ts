import type { BetRecord, ChallengeFormat } from '@/types';
import { daysAgoISO } from '@/utils/format';

export interface ChallengeData {
  userBets: BetRecord[];
  monthSpent: number;
  weekSpend: number;
  weeklyLimit: number;
  maxStake: number;
  monthlyBudget: number;
  goalsCompleted: number;
  riskLevel: string | null;
  healthScore: number;
  greenTotal: number;
  greenScore: number;
  trees: number;
  projectsSupported: number;
  readArticles: string[];
  totalArticles: number;
  quizBestPct: number;
  savingsCount: number;
  savingsWeeks: number;
  interventions: string[];
  healthyDays: number;
  greenHighDays: number;
  greenBestInBudget: number;
  cooldownsCompleted: number;
  coachMessages: number;
  weekendBets: number;
  weekBetCount: number;
  lowStakeCount: number;
  lossPairs: number;
  lossGood: number;
  consistentStreak: number;
  cleanStreak: number;
}

export interface ChallengeEval {
  progress: number;
  target: number;
  completed: boolean;
}

export function userOnly(bets: BetRecord[]): BetRecord[] {
  return bets.filter((b) => !b.id.startsWith('demo-'));
}

export function isWeekendDate(iso: string): boolean {
  const day = new Date(iso + 'T00:00:00').getDay();
  return day === 0 || day === 6;
}

export function betsInWindow(bets: BetRecord[], days: number): BetRecord[] {
  const start = daysAgoISO(days - 1);
  return bets.filter((b) => b.date >= start);
}

export function spendInWindow(bets: BetRecord[], days: number): number {
  return betsInWindow(bets, days).reduce((s, b) => s + b.amount, 0);
}

export function consecutiveStableDays(bets: BetRecord[]): number {
  let streak = 0;
  let prevAvg = Infinity;
  let hasBet = false;
  for (let i = 0; i < 7; i += 1) {
    const day = daysAgoISO(i);
    const dayBets = bets.filter((b) => b.date === day);
    if (dayBets.length > 0) hasBet = true;
    const avg = dayBets.reduce((s, b) => s + b.amount, 0) / Math.max(1, dayBets.length);
    if (avg <= prevAvg) streak += 1;
    else break;
    prevAvg = avg;
  }
  return hasBet ? streak : 0;
}

export function lossChaseStats(bets: BetRecord[]): { pairs: number; good: number } {
  const sorted = [...bets].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let pairs = 0;
  let good = 0;
  for (let i = 0; i < sorted.length - 1; i += 1) {
    if (sorted[i].outcome === 'lost') {
      pairs += 1;
      if (sorted[i + 1].amount <= sorted[i].amount) good += 1;
    }
  }
  return { pairs, good };
}

export function cleanStreakDays(bets: BetRecord[], interventions: string[]): number {
  if (betsInWindow(bets, 7).length === 0) return 0;
  const blocked = new Set(interventions);
  let streak = 0;
  for (let i = 0; i < 7; i += 1) {
    if (blocked.has(daysAgoISO(i))) break;
    streak += 1;
  }
  return streak;
}

export function isoWeekKey(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const dayNum = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNum + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const firstDayNum = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / 604800000);
  return `${d.getFullYear()}-W${week}`;
}

export function progressPct(progress: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, progress) / target) * 100));
}

export function progressLabel(progress: number, target: number, format: ChallengeFormat = 'count', unit: string): string {
  switch (format) {
    case 'ghs':
      return `GH₵ ${Math.round(progress).toLocaleString()} / GH₵ ${Math.round(target).toLocaleString()}`;
    case 'pct':
      return `${Math.min(100, Math.round(progress))}% / ${target}%`;
    case 'projects':
      return `${Math.round(progress)} / ${target} ${unit}`;
    case 'days':
      return `${Math.round(progress)} / ${target} ${unit}`;
    default:
      return `${Math.round(progress)} / ${target} ${unit}`;
  }
}
