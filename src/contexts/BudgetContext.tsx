import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';

interface BudgetContextValue {
  monthlyBudget: number;
  setMonthlyBudget: (value: number) => void;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [monthlyBudget, setMonthlyBudgetState] = usePersistedState<number>('budget', 600);

  const setMonthlyBudget = useCallback(
    (value: number) => {
      setMonthlyBudgetState(Math.max(0, value));
    },
    [setMonthlyBudgetState],
  );

  return (
    <BudgetContext.Provider value={{ monthlyBudget, setMonthlyBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
  return ctx;
}
