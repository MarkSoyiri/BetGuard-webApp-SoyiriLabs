import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  className?: string;
  color?: string;
  thresholds?: { at: number; color: string }[];
  showLabel?: boolean;
}

const DEFAULT_THRESHOLDS = [
  { at: 0.8, color: '#fbbf24' },
  { at: 0.9, color: '#f59e0b' },
  { at: 1.0, color: '#ef4444' },
];

export function ProgressBar({
  value,
  className = '',
  color,
  thresholds = DEFAULT_THRESHOLDS,
  showLabel,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const base = color ?? '#10b981';
  const effective =
    color ??
    thresholds.find((t) => pct / 100 >= t.at)?.color ??
    thresholds[0]?.color ??
    base;

  return (
    <div className={className}>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: effective, boxShadow: `0 2px 12px ${effective}66` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Progress</span>
          <span className="font-semibold text-ink dark:text-white">{Math.round(pct)}%</span>
        </div>
      )}
    </div>
  );
}
