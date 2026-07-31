import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl" />
        <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary-light dark:text-secondary">
          {icon}
        </div>
      </div>
      <h4 className="font-display text-lg font-bold text-ink dark:text-white">{title}</h4>
      {message && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {message}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
