import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useUser } from './UserContext';
import type { WalletSnapshot, WalletTransaction, WalletTransactionType } from '@/types';
import { uid } from '@/utils/format';

interface WalletContextValue {
  balance: number;
  transactions: WalletTransaction[];
  deposit: (amount: number, label?: string) => boolean;
  spend: (amount: number, label: string) => boolean;
  credit: (amount: number, label: string) => void;
  refund: (amount: number, label: string) => void;
  resetWallet: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const round2 = (n: number) => Math.round(n * 100) / 100;

function startingWallet(isDemo: boolean): WalletSnapshot {
  if (isDemo) {
    const opening: WalletTransaction = {
      id: uid('tx'),
      type: 'deposit',
      amount: 500,
      description: 'Demo account starting balance',
      date: new Date().toISOString(),
      balanceAfter: 500,
    };
    return { balance: 500, transactions: [opening] };
  }
  return { balance: 0, transactions: [] };
}

function pushTransaction(
  prev: WalletSnapshot,
  type: WalletTransactionType,
  amount: number,
  description: string,
): WalletSnapshot {
  const safe = Math.max(0, round2(amount));
  const signed = type === 'bet' ? -safe : safe;
  const nextBalance = round2(prev.balance + signed);
  return {
    balance: nextBalance,
    transactions: [
      {
        id: uid('tx'),
        type,
        amount: safe,
        description,
        date: new Date().toISOString(),
        balanceAfter: nextBalance,
      },
      ...prev.transactions,
    ],
  };
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { scopeKey, isDemoAccount } = useUser();
  const [wallet, setWallet] = usePersistedState<WalletSnapshot>(
    `${scopeKey}:wallet`,
    startingWallet(isDemoAccount),
  );

  const deposit = useCallback(
    (amount: number, label = 'Demo wallet top-up'): boolean => {
      if (!Number.isFinite(amount) || amount <= 0) return false;
      setWallet((prev) => pushTransaction(prev, 'deposit', amount, label));
      return true;
    },
    [setWallet],
  );

  const spend = useCallback(
    (amount: number, label: string): boolean => {
      if (!Number.isFinite(amount) || amount <= 0) return false;
      if (wallet.balance < amount) return false;
      setWallet((prev) => pushTransaction(prev, 'bet', amount, label));
      return true;
    },
    [wallet.balance, setWallet],
  );

  const credit = useCallback(
    (amount: number, label: string) => {
      if (!Number.isFinite(amount) || amount <= 0) return;
      setWallet((prev) => pushTransaction(prev, 'win', amount, label));
    },
    [setWallet],
  );

  const refund = useCallback(
    (amount: number, label: string) => {
      if (!Number.isFinite(amount) || amount <= 0) return;
      setWallet((prev) => pushTransaction(prev, 'refund', amount, label));
    },
    [setWallet],
  );

  const resetWallet = useCallback(() => {
    setWallet(startingWallet(isDemoAccount));
  }, [setWallet, isDemoAccount]);

  const value = useMemo<WalletContextValue>(
    () => ({
      balance: wallet.balance,
      transactions: wallet.transactions,
      deposit,
      spend,
      credit,
      refund,
      resetWallet,
    }),
    [wallet.balance, wallet.transactions, deposit, spend, credit, refund, resetWallet],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
