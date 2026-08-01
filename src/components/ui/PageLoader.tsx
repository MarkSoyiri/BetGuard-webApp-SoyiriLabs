import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function PageContentLoader() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/30"
      >
        <ShieldCheck className="size-5 text-white" aria-hidden="true" />
      </motion.div>
      <p className="text-xs font-semibold text-slate-400">Loading…</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.12, 1], rotate: [0, 4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30"
      >
        <ShieldCheck className="size-7 text-white" aria-hidden="true" />
      </motion.div>
      <p className="text-sm font-semibold text-slate-400">Loading BetGuard…</p>
    </div>
  );
}
