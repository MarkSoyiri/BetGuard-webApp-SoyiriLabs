import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useUser } from './UserContext';
import type { BettingLimits } from '@/types';

interface LimitsContextValue {
  limits: BettingLimits;
  setLimits: (patch: Partial<BettingLimits>) => void;
  resetLimits: () => void;
  startCooldown: (days: number) => string;
  cancelCooldown: () => void;
  isCooldownActive: boolean;
  cooldownEndsAt: string | null;
}

const LimitsContext = createContext<LimitsContextValue | undefined>(undefined);

const DEFAULT_LIMITS: BettingLimits = {
  daily: 150,
  weekly: 350,
  monthly: 600,
  maxStake: 80,
  maxBetsPerDay: 5,
  enabled: true,
  cooldownUntil: null,
};

export function LimitsProvider({ children }: { children: ReactNode }) {
  const { scopeKey } = useUser();
  const [limits, setLimitsState] = usePersistedState<BettingLimits>(
    `${scopeKey}:limits`,
    DEFAULT_LIMITS,
  );

  const setLimits = useCallback(
    (patch: Partial<BettingLimits>) => {
      setLimitsState((prev) => {
        const next = { ...prev, ...patch };
        for (const key of ['daily', 'weekly', 'monthly', 'maxStake', 'maxBetsPerDay'] as const) {
          if (typeof next[key] === 'number' && !Number.isFinite(next[key])) next[key] = 0;
          if (typeof next[key] === 'number' && next[key] < 0) next[key] = 0;
        }
        return next;
      });
    },
    [setLimitsState],
  );

  const resetLimits = useCallback(() => {
    setLimitsState(DEFAULT_LIMITS);
  }, [setLimitsState]);

  const startCooldown = useCallback(
    (days: number): string => {
      const until = new Date();
      until.setDate(until.getDate() + days);
      const iso = until.toISOString();
      setLimitsState((prev) => ({ ...prev, cooldownUntil: iso }));
      return iso;
    },
    [setLimitsState],
  );

  const cancelCooldown = useCallback(() => {
    setLimitsState((prev) => ({ ...prev, cooldownUntil: null }));
  }, [setLimitsState]);

  const cooldownEndsAt = limits.cooldownUntil;
  const isCooldownActive = useMemo(() => {
    if (!cooldownEndsAt) return false;
    return new Date(cooldownEndsAt).getTime() > Date.now();
  }, [cooldownEndsAt]);

  return (
    <LimitsContext.Provider
      value={{
        limits,
        setLimits,
        resetLimits,
        startCooldown,
        cancelCooldown,
        isCooldownActive,
        cooldownEndsAt,
      }}
    >
      {children}
    </LimitsContext.Provider>
  );
}

export function useLimits(): LimitsContextValue {
  const ctx = useContext(LimitsContext);
  if (!ctx) throw new Error('useLimits must be used within LimitsProvider');
  return ctx;
}
