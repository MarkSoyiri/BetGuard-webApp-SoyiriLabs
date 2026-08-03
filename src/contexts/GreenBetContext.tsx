import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { sampleGreenProjects } from '@/data/sample';
import { useUser } from './UserContext';
import { useBets } from './BetContext';
import { useBudget } from './BudgetContext';
import { useGoals } from './GoalContext';
import { useLimits } from './LimitsContext';
import { useAchievements } from './AchievementContext';
import { useNotifications } from './NotificationContext';
import { computeHealthScore, monthlySpending } from '@/utils/stats';
import { formatGHS, uid } from '@/utils/format';
import type { GreenContribution, GreenProject } from '@/types';

const round2 = (n: number) => Math.round(n * 100) / 100;

const GREEN_RATE = 0.02;
const POINTS_PER_GH = 0.1;

export interface GreenScoreInputs {
  healthScore: number;
  budgetPct: number;
  savingsPct: number;
  completedChallenges: number;
  totalContributed: number;
}

export function computeGreenScore({
  healthScore,
  budgetPct,
  savingsPct,
  completedChallenges,
  totalContributed,
}: GreenScoreInputs): number {
  const healthPart = (Math.max(0, Math.min(100, healthScore)) / 100) * 30;
  const budgetPart = budgetPct >= 100 ? 2 : budgetPct >= 90 ? 8 : budgetPct >= 80 ? 15 : 20;
  const savingsPart = (Math.max(0, Math.min(100, savingsPct)) / 100) * 15;
  const challengesPart = (Math.min(100, completedChallenges * (100 / 6)) / 100) * 15;
  const contribPart = (Math.min(100, (totalContributed / 1000) * 100) / 100) * 20;
  return Math.max(0, Math.min(100, Math.round(healthPart + budgetPart + savingsPart + challengesPart + contribPart)));
}

export function greenScoreBand(score: number): { label: string; tone: 'secondary' | 'primary' | 'accent' | 'slate' } {
  if (score >= 90) return { label: 'Eco Champion', tone: 'secondary' };
  if (score >= 75) return { label: 'Green Advocate', tone: 'primary' };
  if (score >= 50) return { label: 'Environmental Supporter', tone: 'accent' };
  return { label: 'Beginner', tone: 'slate' };
}

interface GreenBetContextValue {
  enabled: boolean;
  toggleEnabled: () => void;
  contributions: GreenContribution[];
  projects: GreenProject[];
  totalContributed: number;
  monthlyContributed: number;
  greenPoints: number;
  greenScore: number;
  scoreBand: { label: string; tone: 'secondary' | 'primary' | 'accent' | 'slate' };
  trees: number;
  cleanups: number;
  waterProjects: number;
  renewableProjects: number;
  projectsSupported: number;
  completedChallenges: number;
  recordContribution: (betRef: string, sport: string, stake: number) => void;
  completeGreenChallenge: (points: number, title: string) => void;
  resetGreenData: () => void;
}

const GreenBetContext = createContext<GreenBetContextValue | undefined>(undefined);

export function GreenBetProvider({ children }: { children: ReactNode }) {
  const { scopeKey } = useUser();
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { goals } = useGoals();
  const { limits } = useLimits();
  const { achievements, unlock } = useAchievements();
  const { addNotification } = useNotifications();

  const [contributions, setContributions] = usePersistedState<GreenContribution[]>(`${scopeKey}:green-contributions`, []);
  const [projects, setProjects] = usePersistedState<GreenProject[]>(`${scopeKey}:green-projects`, sampleGreenProjects());
  const [greenPoints, setGreenPoints] = usePersistedState<number>(`${scopeKey}:green-points`, 0);
  const [completedChallenges, setCompletedChallenges] = usePersistedState<number>(`${scopeKey}:green-challenges-completed`, 0);
  const [enabled, setEnabled] = usePersistedState<boolean>(`${scopeKey}:green-enabled`, true);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
  }, [setEnabled]);

  const totalContributed = useMemo(
    () => round2(contributions.reduce((s, c) => s + c.contribution, 0)),
    [contributions],
  );

  const monthlyContributed = useMemo(() => {
    const now = new Date();
    return round2(
      contributions
        .filter((c) => {
          const d = new Date(c.date);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((s, c) => s + c.contribution, 0),
    );
  }, [contributions]);

  const scoreFor = useCallback(
    (completed: number, contributed: number): number => {
      const health = computeHealthScore(bets, monthlyBudget, limits).score;
      const monthSpent = monthlySpending(bets);
      const budgetPct = monthlyBudget > 0 ? (monthSpent / monthlyBudget) * 100 : 0;
      const savingsPct =
        goals.length > 0 ? goals.reduce((s, g) => s + (g.target > 0 ? (g.current / g.target) * 100 : 0), 0) / goals.length : 0;
      return computeGreenScore({
        healthScore: health,
        budgetPct,
        savingsPct,
        completedChallenges: completed,
        totalContributed: contributed,
      });
    },
    [bets, monthlyBudget, limits, goals],
  );

  const greenScore = scoreFor(completedChallenges, totalContributed);

  const scoreBand = greenScoreBand(greenScore);
  const trees = Math.floor(totalContributed / 50);
  const cleanups = Math.floor(totalContributed / 200);
  const waterProjects = Math.floor(totalContributed / 500);
  const renewableProjects = Math.floor(totalContributed / 1000);
  const projectsSupported = projects.filter((p) => p.raised > 0).length;

  const maybeUnlock = useCallback(
    (id: string, title: string, message: string) => {
      if (achievements.some((a) => a.id === id && a.unlocked)) return;
      if (!unlock(id)) return;
      addNotification(`${title} unlocked!`, message, 'achievement');
    },
    [achievements, unlock, addNotification],
  );

  const completeGreenChallenge = useCallback(
    (points: number, title: string) => {
      const nextCompleted = completedChallenges + 1;
      setCompletedChallenges(nextCompleted);
      setGreenPoints((prev) => prev + Math.max(0, Math.round(points)));
      addNotification('Green points earned!', `You earned ${Math.round(points)} Green Points for "${title}".`, 'success');
      if (scoreFor(nextCompleted, totalContributed) >= 90) {
        maybeUnlock('ach-sustainability', 'Sustainability Champion', 'You reached a Green Score of 90+. Keep it growing!');
      }
    },
    [completedChallenges, setCompletedChallenges, setGreenPoints, addNotification, scoreFor, totalContributed, maybeUnlock],
  );

  const recordContribution = useCallback(
    (betRef: string, sport: string, stake: number) => {
      if (!enabled || stake <= 0) return;
      const contribution = round2(stake * GREEN_RATE);
      if (contribution <= 0) return;
      const points = Math.max(1, Math.round(contribution * POINTS_PER_GH));

      const active = projects.filter((p) => p.status === 'active');
      const pool = active.length > 0 ? active : projects;
      const target = pool[contributions.length % pool.length] ?? projects[0];
      const projectName = target?.name ?? 'Environmental Project';

      const rec: GreenContribution = {
        id: uid('green'),
        date: new Date().toISOString(),
        betRef,
        sport,
        stake,
        contribution,
        points,
        project: projectName,
      };

      const nextTotal = totalContributed + contribution;
      const nextContribs = contributions.length + 1;

      setContributions((prev) => [rec, ...prev]);
      setGreenPoints((prev) => prev + points);
      setProjects((prev) =>
        prev.map((p) =>
          p.name === projectName
            ? {
                ...p,
                raised: Math.min(p.target, round2(p.raised + contribution)),
                supporters: p.supporters + 1,
                status: p.raised + contribution >= p.target ? 'funded' : 'active',
              }
            : p,
        ),
      );

      addNotification(
        'Green contribution added',
        `${formatGHS(contribution, 2)} from your ${sport} bet is now funding "${projectName}".`,
        'success',
      );

      maybeUnlock('ach-green-bronze', 'Bronze Environmental Supporter', 'You made your first green contribution.');
      if (nextContribs >= 10) maybeUnlock('ach-green-silver', 'Silver Environmental Supporter', 'You reached 10 green contributions.');
      if (nextContribs >= 25) maybeUnlock('ach-green-gold', 'Gold Environmental Supporter', 'You reached 25 green contributions.');
      if (nextTotal >= 200) maybeUnlock('ach-eco-warrior', 'Eco Warrior', `You put ${formatGHS(200)}+ into green projects.`);
      if (scoreFor(completedChallenges, nextTotal) >= 90) {
        maybeUnlock('ach-sustainability', 'Sustainability Champion', 'You reached a Green Score of 90+. Keep it growing!');
      }
    },
    [enabled, projects, contributions, totalContributed, scoreFor, completedChallenges, setContributions, setGreenPoints, setProjects, addNotification, maybeUnlock],
  );

  const resetGreenData = useCallback(() => {
    setContributions([]);
    setProjects(sampleGreenProjects());
    setGreenPoints(0);
    setCompletedChallenges(0);
  }, [setContributions, setProjects, setGreenPoints, setCompletedChallenges]);

  const value = useMemo<GreenBetContextValue>(
    () => ({
      enabled,
      toggleEnabled,
      contributions,
      projects,
      totalContributed,
      monthlyContributed,
      greenPoints,
      greenScore,
      scoreBand,
      trees,
      cleanups,
      waterProjects,
      renewableProjects,
      projectsSupported,
      completedChallenges,
      recordContribution,
      completeGreenChallenge,
      resetGreenData,
    }),
    [
      enabled,
      toggleEnabled,
      contributions,
      projects,
      totalContributed,
      monthlyContributed,
      greenPoints,
      greenScore,
      scoreBand,
      trees,
      cleanups,
      waterProjects,
      renewableProjects,
      projectsSupported,
      completedChallenges,
      recordContribution,
      completeGreenChallenge,
      resetGreenData,
    ],
  );

  return <GreenBetContext.Provider value={value}>{children}</GreenBetContext.Provider>;
}

export function useGreenBet(): GreenBetContextValue {
  const ctx = useContext(GreenBetContext);
  if (!ctx) throw new Error('useGreenBet must be used within GreenBetProvider');
  return ctx;
}
