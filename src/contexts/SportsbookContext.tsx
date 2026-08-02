import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { generateMatches } from '@/data/matches';
import { useBets } from './BetContext';
import type { BetOutcome, Match, SlipSelection, SportsbookBet } from '@/types';
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
  simulateResults: () => SportsbookBet[];
  nextRefreshAt: string;
}

const SportsbookContext = createContext<SportsbookContextValue | undefined>(undefined);

const round2 = (n: number) => Math.round(n * 100) / 100;

const CYCLE_MS = 60 * 60 * 1000;

function cycleStart(now = Date.now()): number {
  return Math.floor(now / CYCLE_MS) * CYCLE_MS;
}

function cycleBucket(now = Date.now()): string {
  return new Date(cycleStart(now)).toISOString();
}

function bucketSeed(bucket: string): number {
  return Number(bucket.replace(/\D/g, ''));
}

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
  const [bucket, setBucket] = useState(() => cycleBucket());
  const lastSettled = useRef(bucket);

  useEffect(() => {
    const id = setInterval(() => setBucket(cycleBucket()), 30_000);
    return () => clearInterval(id);
  }, []);

  const seed = bucketSeed(bucket);
  const matches = store.seed === bucket ? store.matches : generateMatches(seed);

  useEffect(() => {
    if (store.seed !== bucket) {
      setStore({ seed: bucket, matches: generateMatches(seed) });
    }
  }, [bucket, seed, store.seed, setStore]);

  useEffect(() => {
    if (lastSettled.current === bucket) return;
    lastSettled.current = bucket;
    const freshIds = new Set(matches.map((m) => m.id));
    const orphaned = slips.filter(
      (s) => s.status === 'pending' && !s.selections.every((sel) => freshIds.has(sel.matchId)),
    );
    if (orphaned.length === 0) return;
    orphaned.forEach((s) => updateBet(s.betId, { outcome: 'lost' as BetOutcome, status: 'settled' }));
    setSlips((prev) =>
      prev.map((s) =>
        orphaned.some((o) => o.id === s.id) ? { ...s, status: 'lost' as const, payout: 0 } : s,
      ),
    );
  }, [bucket, matches, slips, setSlips, updateBet]);

  const nextRefreshAt = new Date(cycleStart() + CYCLE_MS).toISOString();

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

  const simulateResults = useCallback((): SportsbookBet[] => {
    const seed = todayISO();
    const pendingMatchIds = new Set(
      slips
        .filter((s) => s.status === 'pending')
        .flatMap((s) => s.selections.map((sel) => sel.matchId)),
    );
    const upcoming = matches.filter((m) => m.status === 'upcoming');
    const betOn = upcoming.filter((m) => pendingMatchIds.has(m.id));
    const fill = upcoming.filter((m) => !pendingMatchIds.has(m.id)).slice(0, 6);
    const toFinish = [...betOn, ...fill];
    if (toFinish.length === 0) return [];

    const finishedIds = new Set(toFinish.map((m) => m.id));
    const nextMatches = matches.map((m) => {
      if (!finishedIds.has(m.id)) return m;
      const [hs, as] = randomScore(m);
      return { ...m, status: 'finished' as const, homeScore: hs, awayScore: as };
    });

    const newlySettled: SportsbookBet[] = [];
    const nextSlips = slips.map((s) => {
      if (s.status !== 'pending') return s;
      if (!s.selections.every((sel) => finishedIds.has(sel.matchId))) return s;
      const allWon = s.selections.every((sel) => {
        const m = nextMatches.find((x) => x.id === sel.matchId);
        return m ? matchWinner(m) === sel.market : false;
      });
      const resolved: SportsbookBet = allWon
        ? { ...s, status: 'won', payout: s.potentialReturn }
        : { ...s, status: 'lost', payout: 0 };
      newlySettled.push(resolved);
      return resolved;
    });

    if (newlySettled.length > 0) {
      newlySettled.forEach((s) => {
        updateBet(s.betId, { outcome: s.status as BetOutcome, status: 'settled' });
      });
    }

    setStore({ seed, matches: nextMatches });
    setSlips(nextSlips);
    return newlySettled;
  }, [matches, slips, setStore, setSlips, updateBet]);

  return (
    <SportsbookContext.Provider
      value={{ matches, slips, placeBet, removeSlip, clearSlips, simulateResults, nextRefreshAt }}
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
