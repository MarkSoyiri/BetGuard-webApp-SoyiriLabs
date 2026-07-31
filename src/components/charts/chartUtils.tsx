export const COLORS = {
  primary: '#1e3a8a',
  primaryLight: '#2563eb',
  secondary: '#10b981',
  accent: '#fbbf24',
  warning: '#f59e0b',
  danger: '#ef4444',
  slate: '#94a3b8',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
};

interface TooltipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  formatter?: (value: number, name: string) => string;
}

export function ChartTooltip({ active, label, payload, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 text-sm shadow-xl">
      {label !== undefined && (
        <p className="mb-1.5 font-display font-bold text-ink dark:text-white">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => {
          const numeric = typeof p.value === 'number' ? p.value : Number(p.value ?? 0);
          return (
            <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
              {String(p.name ?? p.dataKey ?? '')}:{' '}
              {formatter ? formatter(numeric, String(p.name ?? '')) : numeric.toLocaleString()}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export const AXIS_TICK = {
  fontSize: 11,
  fill: '#94a3b8',
  fontWeight: 500,
} as const;

export const gridStyle = {
  stroke: 'rgba(148, 163, 184, 0.18)',
  strokeDasharray: '4 4',
} as const;
