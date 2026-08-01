import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Check,
  Gift,
  Flame,
  Wallet,
  Shield,
  Sparkles,
  Crown,
  Activity,
  Heart,
  Leaf,
  TreePine,
  Sprout,
  Globe,
  BookOpen,
  PiggyBank,
  Award,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Chip } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useChallenges } from '@/contexts/ChallengeContext';
import { progressPct, progressLabel } from '@/utils/challenges';
import type { ChallengeCategory } from '@/types';

const CATEGORIES: { label: string; value: ChallengeCategory | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Betting', value: 'betting' },
  { label: 'Green', value: 'green' },
  { label: 'Education', value: 'education' },
  { label: 'Savings', value: 'savings' },
];

const CATEGORY_TONE: Record<ChallengeCategory, 'primary' | 'secondary' | 'accent' | 'slate'> = {
  betting: 'primary',
  green: 'secondary',
  education: 'accent',
  savings: 'slate',
};

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  flame: Flame,
  trophy: Trophy,
  calendar: Activity,
  shield: Shield,
  sparkles: Sparkles,
  crown: Crown,
  activity: Activity,
  heart: Heart,
  leaf: Leaf,
  tree: TreePine,
  sprout: Sprout,
  earth: Globe,
  book: BookOpen,
  piggy: PiggyBank,
  award: Award,
};

export function Challenges() {
  const { challenges, completedCount, totalCount, recentCompletions, estimateDays } = useChallenges();
  const [category, setCategory] = useState<ChallengeCategory | 'All'>('All');

  const filtered =
    category === 'All' ? challenges : challenges.filter((c) => c.category === category);

  const stats = [
    { label: 'Total challenges', value: totalCount, icon: Trophy },
    { label: 'Completed', value: completedCount, icon: Check },
    { label: 'In progress', value: totalCount - completedCount, icon: Activity },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Challenges"
        subtitle="Progress is tracked automatically from your real activity — no manual logging, rewards arrive on their own."
        action={
          <Link
            to="/achievements"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-secondary hover:bg-secondary/10 hover:text-secondary-dark dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
          >
            <Award className="size-4" aria-hidden="true" /> View badges
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <GlassCard key={s.label} hover={false} className="p-4 text-center">
            <s.icon className="mx-auto size-5 text-primary-light" aria-hidden="true" />
            <p className="mt-1.5 font-display text-2xl font-bold text-ink dark:text-white">{s.value}</p>
            <p className="text-xs font-medium text-slate-400">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              category === cat.value
                ? 'bg-gradient-to-r from-secondary to-emerald-600 text-white shadow-lg shadow-secondary/25'
                : 'glass text-slate-500 hover:text-ink dark:text-slate-300 dark:hover:text-white'
            }`}
            aria-pressed={category === cat.value}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Trophy className="size-8" aria-hidden="true" />}
            title={`No ${category === 'All' ? '' : category} challenges`}
            message="New challenges appear here as they become available."
          />
        </GlassCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => {
            const Icon = ICONS[c.icon ?? 'award'] ?? Award;
            const pct = progressPct(c.progress, c.target);
            const fresh = recentCompletions.includes(c.id);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -5 }}
                className={`glass relative overflow-hidden rounded-2xl p-6 ${
                  c.completed ? 'ring-2 ring-secondary/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex size-11 items-center justify-center rounded-2xl text-white shadow-lg ${
                      c.category === 'green'
                        ? 'bg-gradient-to-br from-emerald-500 to-green-700 shadow-secondary/25'
                        : 'bg-gradient-to-br from-secondary to-emerald-600 shadow-secondary/25'
                    }`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.category && <Chip tone={CATEGORY_TONE[c.category]}>{c.category}</Chip>}
                    <Chip tone={c.completed ? 'secondary' : 'slate'}>{c.frequency}</Chip>
                  </div>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-white">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {c.description}
                </p>

                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-400">
                    <span>{progressLabel(c.progress, c.target, c.format, c.unit)}</span>
                    <span className="font-bold text-ink dark:text-white">{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                    <motion.div
                      className={`h-full rounded-full ${c.completed ? 'bg-secondary' : 'bg-gradient-to-r from-primary to-primary-light'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-[11px] text-slate-400">{estimateDays(c)}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent/10 p-3">
                  <Gift className="size-4 shrink-0 text-orange-600" aria-hidden="true" />
                  <p className="text-xs font-semibold text-orange-700 dark:text-accent">
                    Reward: {c.reward}
                    {c.points && c.points > 0 ? ` · ${c.points} Green Pts` : ''}
                    {c.healthBoost ? ' · +Health' : ''}
                  </p>
                </div>

                <div className="mt-5">
                  {c.completed ? (
                    <motion.div
                      initial={fresh ? { scale: 0.8, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-secondary/10 py-2.5 text-sm font-bold text-secondary-dark dark:text-secondary"
                    >
                      <Check className="size-4" aria-hidden="true" />
                      {fresh ? 'Reward auto-claimed!' : 'Completed — reward claimed'}
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100/80 py-2.5 text-xs font-semibold text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
                      <Activity className="size-4" aria-hidden="true" />
                      Auto-tracked — keep going
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
