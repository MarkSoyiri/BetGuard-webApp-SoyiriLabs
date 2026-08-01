import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  TreePine,
  Recycle,
  Droplets,
  School,
  TreeDeciduous,
  Globe2,
  Sprout,
  HeartHandshake,
  ChevronRight,
  Ticket,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { CircularGauge } from '@/components/ui/CircularGauge';
import { Chip } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useGreenBet } from '@/contexts/GreenBetContext';
import type { GreenProject } from '@/types';
import { formatDate, formatGHS } from '@/utils/format';

const PROJECT_ICONS: Record<string, LucideIcon> = {
  tree: TreePine,
  recycle: Recycle,
  droplet: Droplets,
  school: School,
  'tree-deciduous': TreeDeciduous,
  earth: Globe2,
};

const BAND_COLORS: Record<string, string> = {
  secondary: '#10b981',
  primary: '#2563eb',
  accent: '#fbbf24',
  slate: '#94a3b8',
};

const GHANA_PRIORITIES = [
  {
    icon: Globe2,
    code: 'Ghana',
    name: 'Climate Action',
    text: 'Every contribution slows the spiral of reckless spending while funding real climate solutions for Ghana.',
  },
  {
    icon: TreePine,
    code: 'Ghana',
    name: 'Forests & Land',
    text: 'Trees planted and habitats restored across the country with the small percentage set aside from your stakes.',
  },
  {
    icon: Droplets,
    code: 'Ghana',
    name: 'Clean Water',
    text: 'Boreholes and filters bring safe drinking water to communities across Ghana.',
  },
  {
    icon: TreeDeciduous,
    code: 'Ghana',
    name: 'Green Cities',
    text: 'Green parks and recycling hubs make Ghanaian neighbourhoods cooler, cleaner and more liveable.',
  },
];

export function GreenBet() {
  const {
    enabled,
    toggleEnabled,
    contributions,
    projects,
    totalContributed,
    monthlyContributed,
    greenPoints,
    greenScore,
    scoreBand,
    trees,
    cleanups,
    waterProjects,
    renewableProjects,
    projectsSupported,
    completedChallenges,
  } = useGreenBet();

  const [filter, setFilter] = useState<string>('All');

  const filtered = useMemo(
    () => (filter === 'All' ? contributions : contributions.filter((c) => c.project === filter)),
    [contributions, filter],
  );

  const gaugeColor = BAND_COLORS[scoreBand.tone];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="GreenBet"
        subtitle="A responsible, planet-friendly twist: 2% of every demo stake is set aside for real environmental projects."
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Chip tone={scoreBand.tone}>
              <Leaf className="size-3" aria-hidden="true" /> {scoreBand.label}
            </Chip>
            <Chip tone={enabled ? 'secondary' : 'slate'}>{enabled ? 'Active' : 'Paused'}</Chip>
          </div>
        }
      />

      {!enabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warning/10 p-4"
        >
          <p className="text-sm text-orange-700 dark:text-warning">
            <strong>GreenBet is paused.</strong> New bets will not create environmental contributions until
            you turn it back on.
          </p>
          <Button size="sm" onClick={toggleEnabled} icon={<Leaf className="size-4" aria-hidden="true" />}>
            Enable GreenBet
          </Button>
        </motion.div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Leaf}
          label="Total contributed"
          value={formatGHS(totalContributed, 2)}
          sub={`${formatGHS(monthlyContributed, 2)} this month`}
          tone="secondary"
          delay={0}
        />
        <StatCard
          icon={Sprout}
          label="Green points"
          value={greenPoints.toLocaleString()}
          sub={`${completedChallenges} green challenges done`}
          tone="primary"
          delay={0.06}
        />
        <StatCard
          icon={TreePine}
          label="Trees funded"
          value={String(trees)}
          sub={`${cleanups} clean-ups · ${waterProjects} water projects`}
          tone="accent"
          delay={0.12}
        />
        <StatCard
          icon={HeartHandshake}
          label="Projects supported"
          value={String(projectsSupported)}
          sub={`${renewableProjects} renewable initiatives`}
          tone="warning"
          delay={0.18}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center p-6">
          <h3 className="self-start font-display text-base font-bold text-ink dark:text-white">Green Score</h3>
          <div className="mt-4 flex flex-col items-center">
            <CircularGauge value={greenScore} color={gaugeColor} size={170} label="out of 100">
              <p className="font-display text-3xl font-bold text-ink dark:text-white">{greenScore}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {scoreBand.label}
              </p>
            </CircularGauge>
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Your score blends healthy betting habits (budget, health score, savings) with your green
            impact — contributions and completed eco challenges.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-4 font-display text-base font-bold text-ink dark:text-white">How it works</h3>
          <ul className="space-y-4">
            {[
              { icon: Ticket, title: 'You place a demo bet', text: 'Every stake on the sportsbook is a practice bet — no real money.' },
              { icon: Leaf, title: '2% is set aside', text: 'A small share of each stake is marked as a green contribution.' },
              { icon: TreePine, title: 'It funds real projects', text: 'Contributions pool into tree planting, clean water and recycling projects.' },
              { icon: Sparkles, title: 'Your score grows', text: 'Each contribution earns Green Points and lifts your Green Score.' },
            ].map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-emerald-600/20 text-secondary-dark dark:text-secondary">
                  <s.icon className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink dark:text-white">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{s.text}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </GlassCard>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <ImpactMini icon={TreePine} label="Trees" value={String(trees)} />
            <ImpactMini icon={Recycle} label="Clean-ups" value={String(cleanups)} />
            <ImpactMini icon={Droplets} label="Water projects" value={String(waterProjects)} />
            <ImpactMini icon={Globe2} label="Renewable" value={String(renewableProjects)} />
          </div>
          <GlassCard className="p-5">
            <h3 className="font-display text-sm font-bold text-ink dark:text-white">Impact conversion</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex justify-between"><span>GH₵50</span><span className="font-semibold text-ink dark:text-white">= 1 tree</span></li>
              <li className="flex justify-between"><span>GH₵200</span><span className="font-semibold text-ink dark:text-white">= community clean-up</span></li>
              <li className="flex justify-between"><span>GH₵500</span><span className="font-semibold text-ink dark:text-white">= water project</span></li>
              <li className="flex justify-between"><span>GH₵1,000</span><span className="font-semibold text-ink dark:text-white">= renewable energy</span></li>
            </ul>
          </GlassCard>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold text-ink dark:text-white">Green projects</h3>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Your contributions are pooled into these demo initiatives.
            </p>
          </div>
          <Chip tone="secondary">
            <TreePine className="size-3" aria-hidden="true" /> {projects.filter((p) => p.status === 'funded').length} of {projects.length} funded
          </Chip>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-ink dark:text-white">Contribution history</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Every green contribution from your bets.</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {['All', ...projects.map((p) => p.name)].map((name) => (
            <button
              key={name}
              onClick={() => setFilter(name)}
              aria-pressed={filter === name}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === name
                  ? 'bg-secondary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {name === 'All' ? 'All projects' : name}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <GlassCard hover={false} className="p-6">
            <EmptyState
              icon={<Leaf className="size-8" aria-hidden="true" />}
              title="No contributions yet"
              message="Place a demo bet on the Sportsbook — 2% of every stake is set aside automatically."
              action={
                <Button to="/sportsbook">
                  Go to Sportsbook <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              }
            />
          </GlassCard>
        ) : (
          <GlassCard hover={false} className="overflow-x-auto p-6">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-700">
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Sport</th>
                  <th className="pb-3 pr-4 font-semibold">Stake</th>
                  <th className="pb-3 pr-4 font-semibold">Contribution</th>
                  <th className="pb-3 pr-4 font-semibold">Project</th>
                  <th className="pb-3 font-semibold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{formatDate(c.date)}</td>
                    <td className="py-3 pr-4 font-medium text-ink dark:text-white">{c.sport}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{formatGHS(c.stake)}</td>
                    <td className="py-3 pr-4 font-bold text-secondary-dark dark:text-secondary">{formatGHS(c.contribution, 2)}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{c.project}</td>
                    <td className="py-3 font-bold text-ink dark:text-white">{c.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        )}
      </div>

      <div className="mt-10">
        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-ink dark:text-white">Supporting Ghana's green future</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            GreenBet is built around Ghana's environmental priorities — turning betting discipline into local, planet-positive impact.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {GHANA_PRIORITIES.map((s, i) => (
            <motion.div
              key={s.code}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-emerald-600/20 text-secondary-dark dark:text-secondary">
                  <s.icon className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.code}</p>
                  <p className="text-sm font-bold text-ink dark:text-white">{s.name}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImpactMini({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <GlassCard hover={false} className="p-4 text-center">
      <Icon className="mx-auto size-5 text-secondary-dark dark:text-secondary" aria-hidden="true" />
      <p className="mt-1.5 font-display text-xl font-bold text-ink dark:text-white">{value}</p>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
    </GlassCard>
  );
}

function ProjectCard({ project: p, index }: { project: GreenProject; index: number }) {
  const Icon = PROJECT_ICONS[p.icon] ?? Leaf;
  const pct = Math.min(100, Math.round((p.raised / p.target) * 100));
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      className={`glass relative overflow-hidden rounded-2xl p-6 ${p.status === 'funded' ? 'ring-2 ring-secondary/40' : ''}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br from-secondary/10 to-transparent blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} text-white shadow-lg`}>
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <Chip tone={p.status === 'funded' ? 'secondary' : 'primary'}>
          {p.status === 'funded' ? 'Funded' : 'Active'}
        </Chip>
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-ink dark:text-white">{p.name}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{p.description}</p>
      <p className="mt-3 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        {p.sdg.split('·')[1]?.trim() ?? p.sdg}
      </p>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-slate-400">
            {formatGHS(p.raised)} of {formatGHS(p.target)}
          </span>
          <span className="font-bold text-ink dark:text-white">{pct}%</span>
        </div>
        <ProgressBar value={pct} color={p.status === 'funded' ? '#10b981' : '#2563eb'} />
        <p className="mt-2 text-[11px] text-slate-400">{p.supporters} supporters</p>
      </div>
    </motion.div>
  );
}
