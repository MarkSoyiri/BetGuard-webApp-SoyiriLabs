import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import type { RiskLevel } from '@/types';
import { riskColor } from '@/utils/stats';
import { CircularGauge } from './CircularGauge';

interface RiskCardProps {
  level: RiskLevel;
  score: number;
  compact?: boolean;
}

const META: Record<RiskLevel, { label: string; text: string; icon: typeof ShieldCheck }> = {
  Low: {
    label: 'Low Risk',
    text: 'Your habits look healthy. Keep monitoring to stay ahead.',
    icon: ShieldCheck,
  },
  Medium: {
    label: 'Medium Risk',
    text: 'Some warning signs present. Consider tightening your limits.',
    icon: ShieldAlert,
  },
  High: {
    label: 'High Risk',
    text: 'Strong indicators of harmful habits. We recommend seeking support.',
    icon: ShieldX,
  },
};

export function RiskCard({ level, score, compact }: RiskCardProps) {
  const meta = META[level];
  const Icon = meta.icon;
  const color = riskColor(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -4 }}
      className="glass flex flex-col items-center rounded-2xl p-6 text-center"
    >
      <CircularGauge value={score} color={color} size={compact ? 120 : 150} stroke={compact ? 10 : 12}>
        <span className="font-display text-3xl font-bold" style={{ color }}>
          {score}
        </span>
      </CircularGauge>
      <div
        className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-display text-sm font-bold"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon className="size-4" aria-hidden="true" />
        {meta.label}
      </div>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {meta.text}
      </p>
    </motion.div>
  );
}
