import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { sampleGoals } from '@/data/sample';
import { useUser } from './UserContext';
import type { SavingsGoal } from '@/types';
import { uid } from '@/utils/format';

interface GoalContextValue {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  contribute: (id: string, amount: number) => void;
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  resetGoals: () => void;
}

const GoalContext = createContext<GoalContextValue | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
  const { scopeKey, isDemoAccount } = useUser();
  const [goals, setGoals] = usePersistedState<SavingsGoal[]>(
    `${scopeKey}:goals`,
    isDemoAccount ? sampleGoals() : [],
  );

  const addGoal = useCallback(
    (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
      setGoals((prev) => [
        ...prev,
        { ...goal, id: uid('goal'), createdAt: new Date().toISOString() },
      ]);
    },
    [setGoals],
  );

  const contribute = useCallback(
    (id: string, amount: number) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, current: Math.min(g.target, g.current + amount) } : g,
        ),
      );
    },
    [setGoals],
  );

  const updateGoal = useCallback(
    (id: string, patch: Partial<SavingsGoal>) => {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    },
    [setGoals],
  );

  const deleteGoal = useCallback(
    (id: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [setGoals],
  );

  const resetGoals = useCallback(() => {
    setGoals(isDemoAccount ? sampleGoals() : []);
  }, [setGoals, isDemoAccount]);

  return (
    <GoalContext.Provider value={{ goals, addGoal, contribute, updateGoal, deleteGoal, resetGoals }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals(): GoalContextValue {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoals must be used within GoalProvider');
  return ctx;
}
