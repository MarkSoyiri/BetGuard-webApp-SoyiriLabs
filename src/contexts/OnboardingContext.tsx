import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useUser } from './UserContext';

interface OnboardingProgress {
  step: number;
  completed: boolean;
}

interface OnboardingContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentStep: number;
  completed: boolean;
  isPending: boolean;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  finish: () => void;
  restart: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const TOTAL_STEPS = 7;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { scopeKey, isDemoAccount } = useUser();
  const [progress, setProgress] = usePersistedState<OnboardingProgress>(
    `${scopeKey}:onboarding`,
    isDemoAccount ? { step: TOTAL_STEPS - 1, completed: true } : { step: 0, completed: false },
  );
  const [open, setOpen] = useState(false);

  const next = useCallback(() => {
    setProgress((prev) =>
      prev.completed ? prev : { ...prev, step: Math.min(TOTAL_STEPS - 1, prev.step + 1) },
    );
  }, [setProgress]);

  const prev = useCallback(() => {
    setProgress((prev) => ({ ...prev, step: Math.max(0, prev.step - 1) }));
  }, [setProgress]);

  const goTo = useCallback(
    (step: number) => {
      setProgress((prev) => ({ ...prev, step: Math.max(0, Math.min(TOTAL_STEPS - 1, step)) }));
    },
    [setProgress],
  );

  const finish = useCallback(() => {
    setProgress({ step: TOTAL_STEPS - 1, completed: true });
    setOpen(false);
  }, [setProgress, setOpen]);

  const restart = useCallback(() => {
    setProgress({ step: 0, completed: false });
    setOpen(true);
  }, [setProgress, setOpen]);

  const isPending = !isDemoAccount && !progress.completed;

  const value = useMemo<OnboardingContextValue>(
    () => ({
      open,
      setOpen,
      currentStep: progress.step,
      completed: progress.completed,
      isPending,
      next,
      prev,
      goTo,
      finish,
      restart,
    }),
    [open, setOpen, progress.step, progress.completed, isPending, next, prev, goTo, finish, restart],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
