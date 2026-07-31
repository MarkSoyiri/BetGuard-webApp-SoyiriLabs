import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-transparent to-secondary/[0.06]" />
        <div className="absolute -left-32 top-[-15%] size-[30rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-[-15%] size-[30rem] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
              <ShieldCheck className="size-6 text-white" aria-hidden="true" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-ink dark:text-white">
              BetGuard
            </span>
          </Link>
        </div>

        <div className="glass-strong rounded-3xl p-8 shadow-glass-lg">
          <h1 className="font-display text-2xl font-bold text-ink dark:text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>
      </motion.div>
    </div>
  );
}
