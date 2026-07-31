import { motion } from 'framer-motion';

export type Tier = 'bronze' | 'silver' | 'gold';

interface BadgeProps {
  tier?: Tier;
  children: React.ReactNode;
}

const TIER_STYLES: Record<Tier, string> = {
  bronze:
    'bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-amber-700/30',
  silver:
    'bg-gradient-to-r from-slate-400 to-slate-600 text-white shadow-slate-500/30',
  gold: 'bg-gradient-to-r from-accent to-orange-500 text-ink shadow-accent/40',
};

export function Badge({ tier = 'bronze', children }: BadgeProps) {
  return (
    <motion.span
      whileHover={{ scale: 1.06 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-lg ${TIER_STYLES[tier]}`}
    >
      {children}
    </motion.span>
  );
}

interface ChipProps {
  children: React.ReactNode;
  tone?: 'slate' | 'primary' | 'secondary' | 'warning' | 'danger' | 'accent';
}

export function Chip({ children, tone = 'slate' }: ChipProps) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    primary: 'bg-primary/10 text-primary dark:text-primary-light',
    secondary: 'bg-secondary/10 text-secondary-dark dark:text-secondary',
    warning: 'bg-warning/10 text-orange-700 dark:text-warning',
    danger: 'bg-danger/10 text-danger',
    accent: 'bg-accent/15 text-orange-700 dark:text-accent',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
