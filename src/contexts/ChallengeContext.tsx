import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useBets } from './BetContext';
import { useBudget } from './BudgetContext';
import { useLimits } from './LimitsContext';
import { useGoals } from './GoalContext';
import { useUser } from './UserContext';
import { useAchievements } from './AchievementContext';
import { useNotifications } from './NotificationContext';
import { useGreenBet } from './GreenBetContext';
import { useToast } from './ToastContext';
import { CHALLENGES } from '@/data/challenges';
import type { Challenge } from '@/types';
import {
  userOnly,
  betsInWindow,
  spendInWindow,
  consecutiveStableDays,
  lossChaseStats,
  cleanStreakDays,
  isoWeekKey,
  progressPct,
  type ChallengeData,
} from '@/utils/challenges';
import { computeHealthScore, monthlySpending } from '@/utils/stats';
import { todayISO } from '@/utils/format';
import { sampleArticles } from '@/data/sample';

interface ActiveChallengeItem {
  challenge: Challenge;
  pct: number;
  estimate: string;
}

interface ChallengeContextValue {
  challenges: Challenge[];
  activeChallenges: ActiveChallengeItem[];
  completedCount: number;
  totalCount: number;
  recentCompletions: string[];
  healthBonus: number;
  recordIntervention: () => void;
  recordArticleRead: (articleId: string) => void;
  recordQuizScore: (pct: number) => void;
  recordSavingsContribution: () => void;
  recordCoachMessage: () => void;
  estimateDays: (c: Challenge) => string;
}

const ChallengeContext = createContext<ChallengeContextValue | undefined>(undefined);

const HEALTH_BONUS_PER_CHALLENGE = 2;
const HEALTH_BONUS_CAP = 10;

interface HealthyState {
  days: number;
  last: string | null;
}

interface CooldownState {
  count: number;
  lastCounted: string | null;
}

interface SavingsState {
  count: number;
  weeks: string[];
}

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { limits, isCooldownActive, cooldownEndsAt } = useLimits();
  const { goals } = useGoals();
  const { profile, scopeKey } = useUser();
  const { unlock, addAchievement } = useAchievements();
  const { addNotification } = useNotifications();
  const {
    greenScore,
    totalContributed,
    trees,
    projectsSupported,
    completeGreenChallenge,
  } = useGreenBet();
  const { toast } = useToast();

  const [awarded, setAwarded] = usePersistedState<string[]>(`${scopeKey}:challenge-awards`, []);
  const [readArticles, setReadArticles] = usePersistedState<string[]>(`${scopeKey}:challenge-articles`, []);
  const [quizBestPct, setQuizBestPct] = usePersistedState<number>(`${scopeKey}:challenge-quiz-best`, 0);
  const [savings, setSavings] = usePersistedState<SavingsState>(`${scopeKey}:challenge-savings`, { count: 0, weeks: [] });
  const [interventions, setInterventions] = usePersistedState<string[]>(`${scopeKey}:challenge-interventions`, []);
  const [healthy, setHealthy] = usePersistedState<HealthyState>(`${scopeKey}:challenge-healthy`, { days: 0, last: null });
  const [greenHigh, setGreenHigh] = usePersistedState<HealthyState>(`${scopeKey}:challenge-green-high`, { days: 0, last: null });
  const [greenBestInBudget, setGreenBestInBudget] = usePersistedState<number>(`${scopeKey}:challenge-green-best`, 0);
  const [cooldowns, setCooldowns] = usePersistedState<CooldownState>(`${scopeKey}:challenge-cooldowns`, { count: 0, lastCounted: null });
  const [coachMessages, setCoachMessages] = usePersistedState<number>(`${scopeKey}:challenge-coach`, 0);
  const [recentCompletions, setRecentCompletions] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());

  const awardedRef = useRef<Set<string>>(new Set(awarded));
  useEffect(() => {
    awardedRef.current = new Set(awarded);
  }, [awarded]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const userBets = useMemo(() => userOnly(bets), [bets]);
  const monthSpent = useMemo(() => monthlySpending(bets), [bets]);
  const healthScore = useMemo(
    () => computeHealthScore(bets, monthlyBudget, limits).score,
    [bets, monthlyBudget, limits],
  );

  useEffect(() => {
    const today = todayISO();
    setHealthy((prev) => {
      if (healthScore >= 80) {
        if (prev.last === today) return prev;
        return { days: prev.days + 1, last: today };
      }
      if (prev.days === 0 && prev.last === null) return prev;
      return { days: 0, last: null };
    });
  }, [healthScore, setHealthy]);

  useEffect(() => {
    const today = todayISO();
    setGreenHigh((prev) => {
      if (greenScore >= 90) {
        if (prev.last === today) return prev;
        return { days: prev.days + 1, last: today };
      }
      if (prev.days === 0 && prev.last === null) return prev;
      return { days: 0, last: null };
    });
  }, [greenScore, setGreenHigh]);

  useEffect(() => {
    if (monthlyBudget > 0 && monthSpent <= monthlyBudget && greenScore > greenBestInBudget) {
      setGreenBestInBudget(greenScore);
    }
  }, [monthSpent, monthlyBudget, greenScore, greenBestInBudget, setGreenBestInBudget]);

  useEffect(() => {
    if (!cooldownEndsAt || isCooldownActive) return;
    if (new Date(cooldownEndsAt).getTime() >= now) return;
    setCooldowns((prev) => {
      if (prev.lastCounted === cooldownEndsAt) return prev;
      return { count: prev.count + 1, lastCounted: cooldownEndsAt };
    });
  }, [cooldownEndsAt, isCooldownActive, now, setCooldowns]);

  const snapshot = useMemo<ChallengeData>(() => {
    const weekBets = betsInWindow(userBets, 7);
    const loss = lossChaseStats(userBets);
    return {
      userBets,
      monthSpent,
      weekSpend: spendInWindow(userBets, 7),
      weeklyLimit: limits.weekly,
      maxStake: limits.maxStake,
      monthlyBudget,
      goalsCompleted: goals.filter((g) => g.target > 0 && g.current >= g.target).length,
      riskLevel: profile?.riskLevel ?? null,
      healthScore,
      greenTotal: totalContributed,
      greenScore,
      trees,
      projectsSupported,
      readArticles,
      totalArticles: sampleArticles().length,
      quizBestPct,
      savingsCount: savings.count,
      savingsWeeks: savings.weeks.length,
      interventions,
      healthyDays: healthy.days,
      greenHighDays: greenHigh.days,
      greenBestInBudget,
      cooldownsCompleted: cooldowns.count,
      coachMessages,
      weekendBets: weekBets.filter((b) => {
        const day = new Date(b.date + 'T00:00:00').getDay();
        return day === 0 || day === 6;
      }).length,
      weekBetCount: weekBets.length,
      lowStakeCount:
        limits.maxStake > 0 ? userBets.filter((b) => b.amount < limits.maxStake).length : userBets.length,
      lossPairs: loss.pairs,
      lossGood: loss.good,
      consistentStreak: consecutiveStableDays(userBets),
      cleanStreak: cleanStreakDays(userBets, interventions),
    };
  }, [
    userBets,
    monthSpent,
    limits.weekly,
    limits.maxStake,
    monthlyBudget,
    goals,
    profile,
    healthScore,
    totalContributed,
    greenScore,
    trees,
    projectsSupported,
    readArticles,
    quizBestPct,
    savings,
    interventions,
    healthy.days,
    greenHigh.days,
    greenBestInBudget,
    cooldowns.count,
    coachMessages,
  ]);

  const challenges = useMemo<Challenge[]>(
    () =>
      CHALLENGES.map((spec) => {
        const { progress, target, completed } = spec.evaluate(snapshot);
        const cap = Math.max(target, 1);
        return {
          id: spec.id,
          title: spec.title,
          description: spec.description,
          frequency: spec.frequency,
          target,
          progress: Math.min(progress, cap),
          unit: spec.unit,
          reward: spec.reward,
          completed,
          claimed: false,
          category: spec.category,
          points: spec.points,
          format: spec.format,
          icon: spec.icon,
          achievementId: spec.achievementId,
          healthBoost: spec.healthBoost,
        };
      }),
    [snapshot],
  );

  const estimateDays = useCallback(
    (c: Challenge): string => {
      if (c.completed) return 'Complete';
      const remaining = Math.max(0, c.target - c.progress);
      if (remaining === 0) return 'Today';
      const thirty = userBets.length > 0 ? betsInWindow(userBets, 30) : [];
      const betRate = thirty.length / 30;
      const spendRate = thirty.reduce((s, b) => s + b.amount, 0) / 30;
      let days: number | null = null;
      if (c.format === 'days') {
        days = remaining;
      } else if (c.format === 'count' && c.id === 'ch-coach-check') {
        days = remaining / Math.max(coachMessages / 30, 0.05);
      } else if (c.format === 'count' && betRate > 0) {
        days = Math.ceil(remaining / betRate);
      } else if (c.format === 'ghs' && spendRate > 0) {
        days = Math.ceil(remaining / spendRate);
      }
      if (days === null) return '—';
      if (days <= 0) return 'Today';
      if (days < 30) return `~${days}d left`;
      return `~${Math.round(days / 7)}w left`;
    },
    [userBets, coachMessages],
  );

  const grantReward = useCallback(
    (c: Challenge) => {
      const points = c.points && c.points > 0 ? c.points : 10;
      completeGreenChallenge(points, c.title);
      if (c.achievementId) {
        const unlocked = unlock(c.achievementId);
        if (unlocked) {
          addNotification('Badge unlocked!', `You earned "${c.reward}" for completing "${c.title}".`, 'achievement');
        }
      } else {
        addAchievement(c.reward, `Completed the "${c.title}" challenge automatically.`, c.icon ?? 'award');
      }
      addNotification('Challenge completed!', `"${c.title}" — ${c.reward}. Rewards were added automatically.`, 'achievement');
    },
    [completeGreenChallenge, unlock, addAchievement, addNotification],
  );

  useEffect(() => {
    const newly = challenges.filter((c) => c.completed && !awardedRef.current.has(c.id));
    if (newly.length === 0) return;
    const ids = newly.map((c) => c.id);
    newly.forEach((c) => awardedRef.current.add(c.id));
    newly.forEach((c) => grantReward(c));
    setAwarded((prev) => [...prev, ...ids]);
    setRecentCompletions(ids);
    const completedCount = challenges.filter((c) => c.completed).length;
    if (completedCount >= 5) {
      const unlocked = unlock('ach-challenger');
      if (unlocked) addNotification('Badge unlocked!', 'You completed 5 challenges — Challenge Champion earned!', 'achievement');
    }
    ids.slice(0, 3).forEach((id) => {
      const c = challenges.find((x) => x.id === id);
      if (c) toast(`Challenge completed — "${c.title}"!`, 'success');
    });
  }, [challenges, grantReward, setAwarded, unlock, addNotification, toast]);

  const completedCount = challenges.filter((c) => c.completed).length;
  const healthBonus = Math.min(
    HEALTH_BONUS_CAP,
    challenges.filter((c) => c.completed && c.healthBoost).length * HEALTH_BONUS_PER_CHALLENGE,
  );

  const activeChallenges = useMemo<ActiveChallengeItem[]>(
    () =>
      challenges
        .filter((c) => !c.completed)
        .map((c) => ({ challenge: c, pct: progressPct(c.progress, c.target), estimate: estimateDays(c) }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 3),
    [challenges, estimateDays],
  );

  const recordIntervention = useCallback(() => {
    const today = todayISO();
    setInterventions((prev) => (prev.includes(today) ? prev : [...prev.slice(-20), today]));
  }, [setInterventions]);

  const recordArticleRead = useCallback(
    (articleId: string) => {
      setReadArticles((prev) => (prev.includes(articleId) ? prev : [...prev, articleId]));
    },
    [setReadArticles],
  );

  const recordQuizScore = useCallback(
    (pct: number) => {
      setQuizBestPct((prev) => Math.max(prev, Math.round(pct)));
    },
    [setQuizBestPct],
  );

  const recordSavingsContribution = useCallback(() => {
    const week = isoWeekKey(todayISO());
    setSavings((prev) => ({
      count: prev.count + 1,
      weeks: prev.weeks.includes(week) ? prev.weeks : [...prev.weeks, week],
    }));
  }, [setSavings]);

  const recordCoachMessage = useCallback(() => {
    setCoachMessages((prev) => prev + 1);
  }, [setCoachMessages]);

  const value = useMemo<ChallengeContextValue>(
    () => ({
      challenges,
      activeChallenges,
      completedCount,
      totalCount: challenges.length,
      recentCompletions,
      healthBonus,
      recordIntervention,
      recordArticleRead,
      recordQuizScore,
      recordSavingsContribution,
      recordCoachMessage,
      estimateDays,
    }),
    [
      challenges,
      activeChallenges,
      completedCount,
      recentCompletions,
      healthBonus,
      recordIntervention,
      recordArticleRead,
      recordQuizScore,
      recordSavingsContribution,
      recordCoachMessage,
      estimateDays,
    ],
  );

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
}

export function useChallenges(): ChallengeContextValue {
  const ctx = useContext(ChallengeContext);
  if (!ctx) throw new Error('useChallenges must be used within ChallengeProvider');
  return ctx;
}
