import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Plus, Check, Gift, Flame, Leaf } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Badge';
import { sampleChallenges } from '@/data/sample';
import type { Challenge } from '@/types';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useToast } from '@/contexts/ToastContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useGreenBet } from '@/contexts/GreenBetContext';

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'] as const;
type Frequency = (typeof FREQUENCIES)[number];
type Category = 'All' | 'Standard' | 'Environmental';

const FREQ_TONES: Record<Frequency, 'primary' | 'secondary' | 'accent'> = {
  Daily: 'primary',
  Weekly: 'secondary',
  Monthly: 'accent',
};

export function Challenges() {
  const [challenges, setChallenges] = usePersistedState<Challenge[]>('challenges', sampleChallenges());
  const [tab, setTab] = useState<Frequency>('Daily');
  const [category, setCategory] = useState<Category>('All');
  const { toast } = useToast();
  const { addAchievement } = useAchievements();
  const { addNotification } = useNotifications();
  const { completeGreenChallenge } = useGreenBet();

  useEffect(() => {
    setChallenges((prev) => {
      const known = new Set(prev.map((c) => c.id));
      const missing = sampleChallenges().filter((c) => !known.has(c.id));
      return missing.length === 0 ? prev : [...prev, ...missing];
    });
  }, [setChallenges]);

  const filtered = challenges.filter(
    (c) =>
      c.frequency === tab &&
      (category === 'All' ||
        (category === 'Environmental' && c.category === 'environmental') ||
        (category === 'Standard' && c.category !== 'environmental')),
  );

  const logProgress = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id && !c.completed
          ? { ...c, progress: Math.min(c.target, c.progress + 1) }
          : c,
      ),
    );
    toast('Progress logged!');
  };

  const claim = (c: Challenge) => {
    if (!c.completed || c.claimed) return;
    setChallenges((prev) => prev.map((x) => (x.id === c.id ? { ...x, claimed: true } : x)));
    addAchievement(c.reward, `Completed the "${c.title}" challenge.`);
    if (c.category === 'environmental') {
      completeGreenChallenge(c.points ?? 0, c.title);
    } else {
      addNotification('Reward claimed!', `You unlocked the "${c.reward}" badge.`, 'achievement');
    }
    toast(
      c.category === 'environmental'
        ? `Reward claimed — ${c.points} Green Points earned!`
        : `Reward claimed — "${c.reward}" unlocked!`,
    );
  };

  const completed = challenges.filter((c) => c.completed).length;
  const claimed = challenges.filter((c) => c.claimed).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Challenges"
        subtitle="Small, winnable goals that build the habit of staying in control."
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total challenges', value: challenges.length, icon: Trophy },
          { label: 'Completed', value: completed, icon: Check },
          { label: 'Rewards claimed', value: claimed, icon: Gift },
        ].map((s) => (
          <GlassCard key={s.label} hover={false} className="p-4 text-center">
            <s.icon className="mx-auto size-5 text-primary-light" aria-hidden="true" />
            <p className="mt-1.5 font-display text-2xl font-bold text-ink dark:text-white">{s.value}</p>
            <p className="text-xs font-medium text-slate-400">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mb-6 flex gap-2">
        {FREQUENCIES.map((f) => (
          <button
            key={f}
            onClick={() => setTab(f)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              tab === f
                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/25'
                : 'glass text-slate-500 hover:text-ink dark:text-slate-300 dark:hover:text-white'
            }`}
            aria-pressed={tab === f}
          >
            {f}
          </button>
        ))}
        <span className="mx-1 hidden w-px bg-slate-200 dark:bg-slate-700 sm:block" />
        {(['All', 'Standard', 'Environmental'] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              category === cat
                ? 'bg-gradient-to-r from-secondary to-emerald-600 text-white shadow-lg shadow-secondary/25'
                : 'glass text-slate-500 hover:text-ink dark:text-slate-300 dark:hover:text-white'
            }`}
            aria-pressed={category === cat}
          >
            {cat === 'Environmental' && <Leaf className="mr-1 inline size-3.5" aria-hidden="true" />}
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard hover={false} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No {category === 'Environmental' ? 'environmental' : ''} {tab.toLowerCase()} challenges right now.
        </GlassCard>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c, i) => {
          const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -5 }}
              className={`glass relative overflow-hidden rounded-2xl p-6 ${c.completed ? 'ring-2 ring-secondary/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex size-11 items-center justify-center rounded-2xl text-white shadow-lg ${
                    c.category === 'environmental'
                      ? 'bg-gradient-to-br from-emerald-500 to-green-700 shadow-secondary/25'
                      : 'bg-gradient-to-br from-secondary to-emerald-600 shadow-secondary/25'
                  }`}
                >
                  {c.category === 'environmental' ? (
                    <Leaf className="size-5" aria-hidden="true" />
                  ) : (
                    <Flame className="size-5" aria-hidden="true" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {c.category === 'environmental' && (
                    <Chip tone="secondary">
                      <Leaf className="size-3" aria-hidden="true" /> {c.points} pts
                    </Chip>
                  )}
                  <Chip tone={FREQ_TONES[c.frequency]}>{c.frequency}</Chip>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-white">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {c.description}
              </p>

              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-400">
                  <span>
                    {c.progress} / {c.target} {c.unit}
                  </span>
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
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent/10 p-3">
                <Gift className="size-4 shrink-0 text-orange-600" aria-hidden="true" />
                <p className="text-xs font-semibold text-orange-700 dark:text-accent">Reward: {c.reward}</p>
              </div>

              <div className="mt-5">
                {c.completed ? (
                  c.claimed ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary/10 py-2.5 text-sm font-bold text-secondary-dark dark:text-secondary">
                      <Check className="size-4" aria-hidden="true" /> Reward claimed
                    </div>
                  ) : (
                    <Button variant="secondary" fullWidth onClick={() => claim(c)} icon={<Gift className="size-4" aria-hidden="true" />}>
                      Claim reward
                    </Button>
                  )
                ) : (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => logProgress(c.id)}
                    icon={<Plus className="size-4" aria-hidden="true" />}
                  >
                    Log progress
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
