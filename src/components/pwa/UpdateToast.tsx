import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePWA } from '@/contexts/PWAContext';

export function UpdateToast() {
  const { updateAvailable, applyUpdate, dismissUpdate } = usePWA();

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="glass-strong pointer-events-auto fixed right-2 top-2 z-[100] flex w-[calc(100vw-1rem)] max-w-sm items-start gap-3 rounded-2xl p-4 shadow-glass-lg sm:right-4 sm:top-4 sm:w-[calc(100vw-2rem)]"
          role="status"
          aria-live="polite"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-light">
            <RefreshCw className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink dark:text-white">
              A new version of BetGuard is available.
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Update now to get the latest improvements.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={applyUpdate} icon={<RefreshCw className="size-3.5" aria-hidden="true" />}>
                Update Now
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissUpdate}>
                Later
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
