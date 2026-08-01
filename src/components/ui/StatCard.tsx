import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | 'slate';
  trend?: { dir: 'up' | 'down'; label: string; good: boolean };
  delay?: number;
}

const TONES: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'from-primary to-primary-light text-white shadow-primary/20',
  secondary: 'from-secondary to-emerald-600 text-white shadow-secondary/20',
  accent: 'from-accent to-orange-500 text-ink shadow-accent/20',
  warning: 'from-warning to-orange-600 text-white shadow-warning/20',
  danger: 'from-danger to-rose-600 text-white shadow-danger/20',
  slate: 'from-slate-500 to-slate-700 text-white shadow-slate-500/20',
};

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'primary',
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className="glass group relative overflow-hidden rounded-2xl p-5"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br opacity-[0.05] blur-xl transition-transform duration-500 group-hover:scale-150"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 truncate font-display text-2xl font-bold text-ink dark:text-white">
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
          )}
        </div>
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg ${TONES[tone]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`rounded-full px-2 py-0.5 ${
              trend.good
                ? 'bg-secondary/10 text-secondary-dark dark:text-secondary'
                : 'bg-danger/10 text-danger'
            }`}
          >
            {trend.dir === 'up' ? '▲' : '▼'} {trend.label}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
