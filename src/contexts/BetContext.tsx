import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { generateDemoBets } from '@/data/sample';
import { useUser } from './UserContext';
import type { BetRecord } from '@/types';
import { uid } from '@/utils/format';

interface BetContextValue {
  bets: BetRecord[];
  addBet: (bet: Omit<BetRecord, 'id'>) => BetRecord;
  updateBet: (id: string, patch: Partial<BetRecord>) => void;
  deleteBet: (id: string) => void;
  resetBets: () => void;
}

const BetContext = createContext<BetContextValue | undefined>(undefined);

export function BetProvider({ children }: { children: ReactNode }) {
  const { scopeKey, isDemoAccount } = useUser();
  const [bets, setBets] = usePersistedState<BetRecord[]>(
    `${scopeKey}:bets`,
    isDemoAccount ? generateDemoBets() : [],
  );

  const addBet = useCallback(
    (bet: Omit<BetRecord, 'id'>): BetRecord => {
      const record: BetRecord = { ...bet, id: uid('bet') };
      setBets((prev) => [record, ...prev]);
      return record;
    },
    [setBets],
  );

  const updateBet = useCallback(
    (id: string, patch: Partial<BetRecord>) => {
      setBets((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    },
    [setBets],
  );

  const deleteBet = useCallback(
    (id: string) => {
      setBets((prev) => prev.filter((b) => b.id !== id));
    },
    [setBets],
  );

  const resetBets = useCallback(() => {
    setBets(isDemoAccount ? generateDemoBets() : []);
  }, [setBets, isDemoAccount]);

  return (
    <BetContext.Provider value={{ bets, addBet, updateBet, deleteBet, resetBets }}>
      {children}
    </BetContext.Provider>
  );
}

export function useBets(): BetContextValue {
  const ctx = useContext(BetContext);
  if (!ctx) throw new Error('useBets must be used within BetProvider');
  return ctx;
}
