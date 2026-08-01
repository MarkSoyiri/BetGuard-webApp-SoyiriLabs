import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Ticket,
  Clock,
  Flame,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Wallet,
  TrendingUp,
  ListChecks,
  X,
  Trash2,
  Zap,
  Receipt,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PostBetInsight } from '@/components/PostBetInsight';
import { useSportsbook } from '@/contexts/SportsbookContext';
import { useBets } from '@/contexts/BetContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useLimits } from '@/contexts/LimitsContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/contexts/ToastContext';
import type { LimitCheck, Match, MatchSport, SlipMarket, SlipSelection, SportsbookBet } from '@/types';
import { formatDate, formatGHS, todayISO } from '@/utils/format';
import { checkBetAgainstLimits, monthlySpending, spentOnDate } from '@/utils/stats';

type SportTab = 'All' | MatchSport;

const SPORT_TABS: SportTab[] = ['All', 'Football', 'Basketball', 'Tennis'];

const round2 = (n: number) => Math.round(n * 100) / 100;

function kickoffLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((day.getTime() - today.getTime()) / 86400000);
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return `Today · ${time}`;
  if (diff === 1) return `Tomorrow · ${time}`;
  return `${d.toLocaleDateString('en-GB', { weekday: 'short' })} · ${time}`;
}

function OddsButton({
  label,
  name,
  odds,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  name: string;
  odds: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-center transition-colors ${
        selected
          ? 'border-primary-light bg-primary/10 text-primary dark:text-primary-light'
          : 'border-slate-200 text-slate-700 hover:border-primary-light/50 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/50'
      } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="w-full truncate text-xs font-semibold">{name}</span>
      <span className="text-sm font-bold">{odds.toFixed(2)}</span>
    </button>
  );
}

export function Sportsbook() {
  const { matches, slips, placeBet, removeSlip, clearSlips, simulateResults } = useSportsbook();
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { limits, isCooldownActive, cooldownEndsAt } = useLimits();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [tab, setTab] = useState<SportTab>('All');
  const [slip, setSlip] = useState<SlipSelection[]>([]);
  const [stake, setStake] = useState('');
  const [block, setBlock] = useState<LimitCheck | null>(null);
  const [insight, setInsight] = useState<{ open: boolean; slips: SportsbookBet[] }>({
    open: false,
    slips: [],
  });
  const slipRef = useRef<HTMLDivElement>(null);

  const monthSpent = useMemo(() => monthlySpending(bets), [bets]);
  const todaySpent = useMemo(() => spentOnDate(bets, todayISO()), [bets]);
  const todayCount = useMemo(
    () => bets.filter((b) => b.date === todayISO()).length,
    [bets],
  );
  const dailyPct = limits.daily > 0 ? Math.min(100, Math.round((todaySpent / limits.daily) * 100)) : 0;

  const visible = useMemo(
    () => matches.filter((m) => tab === 'All' || m.sport === tab),
    [matches, tab],
  );
  const upcoming = visible.filter((m) => m.status === 'upcoming');
  const finished = visible.filter((m) => m.status === 'finished');

  const combinedOdds = round2(slip.reduce((p, s) => p * s.odds, 1));
  const stakeNum = Number(stake) || 0;
  const potential = stakeNum > 0 ? round2(stakeNum * combinedOdds) : 0;
  const overBudget = stakeNum > 0 && monthSpent + stakeNum > monthlyBudget;

  const pendingCount = slips.filter((s) => s.status === 'pending').length;
  const totalStaked = slips.reduce((sum, s) => sum + s.stake, 0);
  const settled = slips.filter((s) => s.status !== 'pending');
  const settledNet = settled.reduce((sum, s) => sum + (s.payout ?? 0) - s.stake, 0);
  const settledWon = settled.filter((s) => s.status === 'won').length;
  const settledRate = settled.length > 0 ? Math.round((settledWon / settled.length) * 100) : 0;

  const canSimulate = pendingCount > 0 && matches.some((m) => m.status === 'upcoming');

  const toggleSelection = (m: Match, market: SlipMarket, team: string, odds: number) => {
    if (m.status !== 'upcoming') return;
    setSlip((prev) => {
      const existing = prev.find((s) => s.matchId === m.id);
      if (existing && existing.market === market) return prev.filter((s) => s.matchId !== m.id);
      return [...prev.filter((s) => s.matchId !== m.id), { matchId: m.id, team, market, odds }];
    });
  };

  const goToSlip = () => {
    slipRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const removeSelection = (matchId: string) => {
    setSlip((prev) => prev.filter((s) => s.matchId !== matchId));
  };

  const handlePlace = () => {
    if (slip.length === 0) {
      toast('Add at least one selection first.', 'warning');
      return;
    }
    if (!stakeNum || stakeNum < 1) {
      toast('Enter a stake of at least GH₵ 1.', 'warning');
      return;
    }
    if (isCooldownActive) {
      toast('You are on a betting break — placing is paused.', 'warning');
      return;
    }
    const check = checkBetAgainstLimits(bets, limits, stakeNum, monthlyBudget);
    if (!check.ok) {
      setBlock(check);
      addNotification(
        'Bet blocked — limit reached',
        check.message,
        'warning',
      );
      return;
    }
    placeBet(slip, round2(stakeNum));
    toast('Demo bet placed — added to your Betting Log.');
    setSlip([]);
    setStake('');
  };

  const handleSimulate = () => {
    const settled = simulateResults();
    if (settled.length > 0) {
      toast(`${settled.length} bet${settled.length === 1 ? '' : 's'} settled.`);
      setInsight({ open: true, slips: settled });
    } else toast('Nothing to settle yet — add upcoming bets first.', 'info');
  };

  const stat = (icon: React.ReactNode, label: string, value: string, sub: string, tone: string) => (
    <GlassCard hover={false} className="p-4">
      <div className="flex items-center gap-2">
        <span className={tone}>{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      </div>
      <p className="mt-1.5 font-display text-xl font-bold text-ink dark:text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
    </GlassCard>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Sportsbook"
        subtitle="Browse demo fixtures, build a bet slip and settle results — no real money involved."
        action={
          <Chip tone="primary">
            <ShieldCheck className="size-3" aria-hidden="true" /> Demo mode · no real money
          </Chip>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-2xl bg-primary/[0.04] p-4 text-xs leading-relaxed text-slate-600 dark:bg-primary-light/10 dark:text-slate-300"
      >
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-light" aria-hidden="true" />
        <p>
          This is a <strong>practice sportsbook</strong> for learning good habits. Every bet you place is
          logged to your Betting Log and counts towards your monthly budget — so you can experience
          the full betting loop safely, with BetGuard keeping score of your real exposure.
        </p>
      </motion.div>

      {isCooldownActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-warning/10 p-4"
        >
          <div className="flex items-start gap-3 text-xs leading-relaxed text-orange-700 dark:text-warning">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>
              <strong>You are on a betting break</strong> until{' '}
              <strong>{formatDate(cooldownEndsAt ?? '')}</strong>. Betting is paused — a great time
              to check your numbers or talk to your AI coach.
            </p>
          </div>
        </motion.div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stat(<Ticket className="size-4 text-primary-light" aria-hidden="true" />, 'Active slips', String(pendingCount), 'awaiting settlement', 'text-primary-light')}
        {stat(<Wallet className="size-4 text-primary-light" aria-hidden="true" />, 'Total staked', formatGHS(totalStaked), 'across all slips', 'text-primary-light')}
        {stat(
          <TrendingUp className="size-4 text-secondary" aria-hidden="true" />,
          'Settled net',
          settledNet >= 0 ? `+${formatGHS(settledNet)}` : formatGHS(settledNet),
          `${settledWon} won · ${settled.length - settledWon} lost`,
          'text-secondary',
        )}
        {stat(<ListChecks className="size-4 text-accent" aria-hidden="true" />, 'Settled win rate', `${settledRate}%`, 'of settled slips', 'text-orange-600 dark:text-accent')}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {SPORT_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {upcoming.length === 0 && finished.length === 0 ? (
            <GlassCard hover={false} className="p-6">
              <EmptyState
                icon={<Ticket className="size-8" aria-hidden="true" />}
                title="No fixtures in this category"
                message="Check back later — new demo fixtures appear each day."
              />
            </GlassCard>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    slip={slip}
                    onToggle={toggleSelection}
                  />
                ))}
              </div>

              {finished.length > 0 && (
                <div>
                  <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-slate-400">
                    Finished
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {finished.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        slip={slip}
                        onToggle={toggleSelection}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <GlassCard hover={false} ref={slipRef} className="sticky top-24 scroll-mt-24 p-5 pb-24 lg:pb-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
                <Receipt className="size-4 text-primary-light" aria-hidden="true" /> Bet slip
              </h3>
              {slip.length > 0 && (
                <button
                  onClick={() => setSlip([])}
                  className="text-xs font-semibold text-slate-400 transition hover:text-danger"
                >
                  Clear
                </button>
              )}
            </div>

            {slip.length === 0 ? (
              <EmptyState
                icon={<Ticket className="size-8" aria-hidden="true" />}
                title="No selections yet"
                message="Tap an odds button on any fixture to add it to your slip."
              />
            ) : (
              <>
                <ul className="space-y-2">
                  {slip.map((s) => {
                    const m = matches.find((x) => x.id === s.matchId);
                    return (
                      <li
                        key={s.matchId}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-ink dark:text-white">{s.team}</p>
                          <p className="truncate text-[11px] text-slate-400">
                            {m ? `${m.homeTeam} vs ${m.awayTeam}` : ''}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary-light">{s.odds.toFixed(2)}</span>
                        <button
                          onClick={() => removeSelection(s.matchId)}
                          className="rounded-lg p-1 text-slate-400 transition hover:bg-danger/10 hover:text-danger"
                          aria-label={`Remove ${s.team} from slip`}
                        >
                          <X className="size-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <Input
                  label="Stake (GH₵)"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="10"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="mt-4"
                />

                <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selections</span>
                    <span className="font-bold text-ink dark:text-white">{slip.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Combined odds</span>
                    <span className="font-bold text-ink dark:text-white">{combinedOdds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Potential return</span>
                    <span className="font-bold text-secondary">{formatGHS(potential, 2)}</span>
                  </div>
                </div>

                {overBudget && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-warning/10 p-3 text-xs leading-relaxed text-orange-700 dark:text-warning">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      This would push you over your GH₵ {monthlyBudget.toLocaleString()} monthly
                      budget. Consider lowering the stake.
                    </span>
                  </div>
                )}

                {limits.enabled && (
                  <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Today</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {formatGHS(todaySpent)} of {formatGHS(limits.daily)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                      <div
                        className={`h-full rounded-full transition-all ${dailyPct >= 80 ? 'bg-danger' : dailyPct >= 50 ? 'bg-warning' : 'bg-secondary'}`}
                        style={{ width: `${dailyPct}%` }}
                      />
                    </div>
                    <p className="text-right">
                      {todayCount}/{limits.maxBetsPerDay} bets today
                    </p>
                  </div>
                )}

                <Button
                  fullWidth
                  className="mt-4"
                  disabled={isCooldownActive}
                  icon={<Zap className="size-4" aria-hidden="true" />}
                  onClick={handlePlace}
                >
                  {isCooldownActive ? 'Betting paused' : 'Place demo bet'}
                </Button>

                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  Demo only — no real money. Placed bets are added to your Betting Log and count
                  towards your monthly budget.
                </p>
              </>
            )}
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {slip.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
          >
            <button
              onClick={goToSlip}
              className="glass-strong flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left shadow-glass-lg"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary-light">
                  <Receipt className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-bold text-ink dark:text-white">
                    {slip.length} selection{slip.length === 1 ? '' : 's'} · odds{' '}
                    <span className="text-primary-light">{combinedOdds.toFixed(2)}</span>
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    {stakeNum > 0 ? `Potential ${formatGHS(potential, 2)} · ` : ''}Tap to place your bet
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-primary to-primary-light px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-primary/20">
                Place bet <Zap className="size-3.5" aria-hidden="true" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard hover={false} className="mt-6 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold text-ink dark:text-white">
            My bets ({slips.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!canSimulate}
              icon={<Zap className="size-3.5" aria-hidden="true" />}
              onClick={handleSimulate}
            >
              Simulate results
            </Button>
            {slips.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Trash2 className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  clearSlips();
                  toast('Bet history cleared.', 'info');
                }}
              >
                Clear history
              </Button>
            )}
          </div>
        </div>

        {slips.length === 0 ? (
          <EmptyState
            icon={<Ticket className="size-8" aria-hidden="true" />}
            title="No bets placed yet"
            message="Build a slip on the left and place your first demo bet to see it here."
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {slips.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink dark:text-white">
                    {s.selections.map((sel) => sel.team).join(' + ')}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDate(s.placedAt)} · {s.selections.length}{' '}
                    {s.selections.length === 1 ? 'selection' : 'selections'} @{' '}
                    {s.combinedOdds.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink dark:text-white">{formatGHS(s.stake)}</p>
                  {s.status !== 'pending' && (
                    <p className="text-[11px] text-slate-400">
                      {s.status === 'won' ? `Payout ${formatGHS(s.payout ?? 0)}` : 'No payout'}
                    </p>
                  )}
                </div>
                <span className="flex w-24 justify-end">
                  {s.status === 'pending' ? (
                    <Chip tone="warning">Pending</Chip>
                  ) : s.status === 'won' ? (
                    <Chip tone="secondary">Won</Chip>
                  ) : (
                    <Chip tone="danger">Lost</Chip>
                  )}
                </span>
                <button
                  onClick={() => removeSlip(s.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove slip"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <Modal
        open={block !== null}
        onClose={() => setBlock(null)}
        title="Bet not placed"
        subtitle="This is BetGuard looking out for you."
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-warning/15 text-orange-600 dark:text-warning">
            <ShieldAlert className="size-7" aria-hidden="true" />
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {block?.message}
          </p>
          {block?.remaining != null && (
            <p className="rounded-xl bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary-dark dark:text-secondary">
              You can still stake up to {formatGHS(block.remaining)} this period
            </p>
          )}
          <div className="grid w-full gap-2">
            <Button fullWidth onClick={() => setBlock(null)}>Lower my stake</Button>
            <Button fullWidth to="/coach" variant="outline" onClick={() => setBlock(null)}>
              Talk to my AI coach
            </Button>
            <Button fullWidth to="/education" variant="ghost" onClick={() => setBlock(null)}>
              Learn about limits
            </Button>
          </div>
        </div>
      </Modal>

      <PostBetInsight
        open={insight.open}
        slips={insight.slips}
        onClose={() => setInsight({ open: false, slips: [] })}
      />
    </div>
  );
}

function MatchCard({
  match: m,
  slip,
  onToggle,
}: {
  match: Match;
  slip: SlipSelection[];
  onToggle: (m: Match, market: SlipMarket, team: string, odds: number) => void;
}) {
  const isFinished = m.status === 'finished';
  const isSelected = (market: SlipMarket) =>
    slip.some((s) => s.matchId === m.id && s.market === market);

  const football = m.sport === 'Football';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass rounded-2xl p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span className="truncate">{m.league}</span>
          {m.featured && (
            <span className="flex shrink-0 items-center gap-0.5 text-orange-600 dark:text-accent">
              <Flame className="size-3" aria-hidden="true" /> Featured
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <Clock className="size-3.5" aria-hidden="true" />
          {isFinished ? 'Full time' : kickoffLabel(m.kickoff)}
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink dark:text-white">
          {m.homeTeam}
        </p>
        {isFinished ? (
          <p className="shrink-0 text-sm font-bold text-ink dark:text-white">
            {m.homeScore}–{m.awayScore}
          </p>
        ) : (
          <p className="shrink-0 text-xs font-bold uppercase text-slate-300">vs</p>
        )}
        <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-ink dark:text-white">
          {m.awayTeam}
        </p>
      </div>

      <div className="flex gap-2">
        <OddsButton
          label="1"
          name={m.homeTeam}
          odds={m.homeOdds}
          selected={isSelected('home')}
          disabled={isFinished}
          onClick={() => onToggle(m, 'home', m.homeTeam, m.homeOdds)}
        />
        {football && (
          <OddsButton
            label="X"
            name="Draw"
            odds={m.drawOdds ?? 0}
            selected={isSelected('draw')}
            disabled={isFinished}
            onClick={() => onToggle(m, 'draw', 'Draw', m.drawOdds ?? 0)}
          />
        )}
        <OddsButton
          label="2"
          name={m.awayTeam}
          odds={m.awayOdds}
          selected={isSelected('away')}
          disabled={isFinished}
          onClick={() => onToggle(m, 'away', m.awayTeam, m.awayOdds)}
        />
      </div>
    </motion.div>
  );
}
