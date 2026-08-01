import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Wallet,
  BookOpen,
  Activity,
  PiggyBank,
  Flame,
  Trophy,
  Sparkles,
  Crown,
  ShieldCheck,
  Award,
  Leaf,
  Sprout,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { Badge, type Tier } from '@/components/ui/Badge';
import { useAchievements } from '@/contexts/AchievementContext';
import { formatDate } from '@/utils/format';

const ICONS: Record<string, LucideIcon> = {
  calendar: CalendarCheck,
  wallet: Wallet,
  book: BookOpen,
  activity: Activity,
  piggy: PiggyBank,
  flame: Flame,
  trophy: Trophy,
  sparkles: Sparkles,
  crown: Crown,
  shield: ShieldCheck,
  award: Award,
  leaf: Leaf,
  sprout: Sprout,
};

const TIER_BG: Record<Tier, string> = {
  bronze: 'from-amber-600/15 to-orange-700/15 text-amber-700 dark:text-amber-400',
  silver: 'from-slate-400/15 to-slate-600/15 text-slate-500 dark:text-slate-300',
  gold: 'from-accent/20 to-orange-500/20 text-orange-600 dark:text-accent',
};

const TIER_RING: Record<Tier, string> = {
  bronze: 'ring-amber-600/40',
  silver: 'ring-slate-400/40',
  gold: 'ring-accent/50',
};

export function Achievements() {
  const { achievements, unlockedCount } = useAchievements();
  const [filter, setFilter] = useState<'All' | 'Betting' | 'Green'>('All');

  const tiers: Tier[] = ['bronze', 'silver', 'gold'];
  const visible = achievements.filter((a) =>
    filter === 'All' ? true : filter === 'Green' ? a.category === 'green' : a.category !== 'green',
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Achievements"
        subtitle={`${unlockedCount} of ${achievements.length} badges unlocked — every healthy habit counts.`}
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {tiers.map((t) => {
          const count = achievements.filter((a) => a.tier === t && a.unlocked).length;
          const total = achievements.filter((a) => a.tier === t).length;
          return (
            <Badge key={t} tier={t}>
              {t} · {count}/{total}
            </Badge>
          );
        })}
        <span className="mx-1 hidden w-px self-stretch bg-slate-200 dark:bg-slate-700 sm:block" />
        {(['All', 'Betting', 'Green'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === f
                ? f === 'Green'
                  ? 'bg-gradient-to-r from-secondary to-emerald-600 text-white shadow-md shadow-secondary/25'
                  : 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-primary/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-pressed={filter === f}
          >
            {f === 'Green' && <Leaf className="mr-1 inline size-3.5" aria-hidden="true" />}
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((a, i) => {
          const Icon = ICONS[a.icon] ?? Award;
          const locked = !a.unlocked;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -5, rotate: locked ? 0 : 0.5 }}
              className={`glass relative overflow-hidden rounded-2xl p-6 text-center ${
                locked ? 'opacity-75' : `ring-2 ${TIER_RING[a.tier]}`
              }`}
            >
              {locked && (
                <div className="pointer-events-none absolute inset-0 bg-slate-200/40 backdrop-blur-[1px] dark:bg-slate-900/40" />
              )}
              <div
                className={`mx-auto flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br ${TIER_BG[a.tier]} shadow-lg`}
              >
                {locked ? (
                  <Lock className="size-8 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                ) : (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: i * 0.05 }}
                  >
                    <Icon className="size-8" aria-hidden="true" />
                  </motion.div>
                )}
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-ink dark:text-white">{a.title}</h3>
              <p className="mt-1.5 min-h-[36px] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {a.description}
              </p>
              <div className="mt-3">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    a.tier === 'bronze'
                      ? 'bg-amber-600/10 text-amber-700 dark:text-amber-400'
                      : a.tier === 'silver'
                        ? 'bg-slate-400/10 text-slate-500 dark:text-slate-300'
                        : 'bg-accent/15 text-orange-600 dark:text-accent'
                  }`}
                >
                  {a.tier}
                </span>
              </div>
              {a.unlocked && a.unlockedAt && (
                <p className="mt-2 text-[11px] text-slate-400">Unlocked {formatDate(a.unlockedAt)}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
