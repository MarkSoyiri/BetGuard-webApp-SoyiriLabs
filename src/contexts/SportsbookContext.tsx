import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { generateMatches } from '@/data/matches';
import { useBets } from './BetContext';
import type { Match, SlipSelection, SportsbookBet } from '@/types';
import { todayISO, uid } from '@/utils/format';

interface MatchesStore {
  seed: string;
  matches: Match[];
}

interface SportsbookContextValue {
  matches: Match[];
  slips: SportsbookBet[];
  placeBet: (selections: SlipSelection[], stake: number) => SportsbookBet | null;
  removeSlip: (id: string) => void;
  clearSlips: () => void;
  simulateResults: () => number;
}

const SportsbookContext = createContext<SportsbookContextValue | undefined>(undefined);

const round2 = (n: number) => Math.round(n * 100) / 100;

function matchWinner(m: Match): 'home' | 'draw' | 'away' | null {
  if (m.status !== 'finished' || m.homeScore === undefined || m.awayScore === undefined) return null;
  if (m.homeScore > m.awayScore) return 'home';
  if (m.homeScore < m.awayScore) return 'away';
  return 'draw';
}

function randomScore(m: Match): [number, number] {
  const roll = () => Math.floor(Math.random() * (m.sport === 'Football' ? 4 : 22));
  const fav = m.homeOdds <= m.awayOdds ? 'home' : 'away';
  const favWins = Math.random() < 0.68;
  let hs = roll();
  let as = roll();
  if (favWins) {
    if (fav === 'home') {
      if (as >= hs) hs = as + 1 + Math.floor(Math.random() * 3);
    } else if (hs >= as) {
      as = hs + 1 + Math.floor(Math.random() * 3);
    }
  } else if (fav === 'home') {
    if (hs >= as) as = hs + 1 + Math.floor(Math.random() * 3);
  } else if (as >= hs) {
    hs = as + 1 + Math.floor(Math.random() * 3);
  }
  return [hs, as];
}

export function SportsbookProvider({ children }: { children: ReactNode }) {
  const { addBet, updateBet } = useBets();
  const [store, setStore] = usePersistedState<MatchesStore>('sportsbook-matches', {
    seed: '',
    matches: generateMatches(),
  });
  const [slips, setSlips] = usePersistedState<SportsbookBet[]>('sportsbook-slips', []);

  const matches = store.seed === todayISO() ? store.matches : generateMatches();

  const placeBet = useCallback(
    (selections: SlipSelection[], stake: number): SportsbookBet | null => {
      if (selections.length === 0 || stake <= 0) return null;
      const combinedOdds = round2(selections.reduce((p, s) => p * s.odds, 1));
      const potentialReturn = round2(stake * combinedOdds);
      const firstMatch = matches.find((m) => m.id === selections[0].matchId);
      const notes = selections
        .map((s) => {
          const m = matches.find((x) => x.id === s.matchId);
          return m ? `${m.homeTeam} vs ${m.awayTeam} · ${s.team} @ ${s.odds}` : s.team;
        })
        .join(' | ');
      const rec = addBet({
        date: todayISO(),
        platform: 'BetGuard Sportsbook',
        sport: firstMatch?.sport ?? 'Football',
        amount: stake,
        outcome: 'lost',
        notes,
        status: 'pending',
        source: 'sportsbook',
      });
      const slip: SportsbookBet = {
        id: uid('slip'),
        betId: rec.id,
        selections,
        stake,
        combinedOdds,
        potentialReturn,
        placedAt: new Date().toISOString(),
        status: 'pending',
      };
      setSlips((prev) => [slip, ...prev]);
      return slip;
    },
        [addBet, setSlips, matches],
  );

  const removeSlip = useCallback(
    (id: string) => {
      setSlips((prev) => prev.filter((s) => s.id !== id));
    },
    [setSlips],
  );

  const clearSlips = useCallback(() => {
    setSlips([]);
  }, [setSlips]);

  const simulateResults = useCallback((): number => {
    const seed = todayISO();
    const upcoming = matches.filter((m) => m.status === 'upcoming');
    const toFinish = upcoming.slice(0, Math.min(6, upcoming.length));
    if (toFinish.length === 0) return 0;

    const finishedIds = new Set(toFinish.map((m) => m.id));
    const nextMatches = matches.map((m) => {
      if (!finishedIds.has(m.id)) return m;
      const [hs, as] = randomScore(m);
      return { ...m, status: 'finished' as const, homeScore: hs, awayScore: as };
    });

    let settled = 0;
    const nextSlips = slips.map((s) => {
      if (s.status !== 'pending') return s;
      if (!s.selections.every((sel) => finishedIds.has(sel.matchId))) return s;
      settled += 1;
      const allWon = s.selections.every((sel) => {
        const m = nextMatches.find((x) => x.id === sel.matchId);
        return m ? matchWinner(m) === sel.market : false;
      });
      return allWon
        ? { ...s, status: 'won' as const, payout: s.potentialReturn }
        : { ...s, status: 'lost' as const, payout: 0 };
    });

    if (settled > 0) {
      nextSlips.forEach((s) => {
        if (s.status === 'pending') return;
        const original = slips.find((x) => x.id === s.id);
        if (original?.status === s.status) return;
        updateBet(s.betId, { outcome: s.status, status: 'settled' });
      });
    }

    setStore({ seed, matches: nextMatches });
    setSlips(nextSlips);
    return settled;
  }, [matches, slips, setStore, setSlips, updateBet]);

  return (
    <SportsbookContext.Provider
      value={{ matches, slips, placeBet, removeSlip, clearSlips, simulateResults }}
    >
      {children}
    </SportsbookContext.Provider>
  );
}

export function useSportsbook(): SportsbookContextValue {
  const ctx = useContext(SportsbookContext);
  if (!ctx) throw new Error('useSportsbook must be used within SportsbookProvider');
  return ctx;
}
