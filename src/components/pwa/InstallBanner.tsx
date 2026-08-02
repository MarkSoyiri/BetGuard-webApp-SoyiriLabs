import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePWA } from '@/contexts/PWAContext';

export function InstallBanner() {
  const { showInstallPrompt, installApp, dismissInstall } = usePWA();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!showInstallPrompt) return;
    const t = window.setTimeout(() => setReady(true), 1400);
    return () => window.clearTimeout(t);
  }, [showInstallPrompt]);

  const visible = showInstallPrompt && ready;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
          role="region"
          aria-label="Install BetGuard"
        >
          <div className="glass-strong flex flex-col gap-3 rounded-2xl p-4 shadow-glass-lg sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/25">
                <Download className="size-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-ink dark:text-white">
                  Install BetGuard
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Install BetGuard for a faster, full-screen experience with quick access from
                  your home screen.
                </p>
              </div>
              <button
                onClick={dismissInstall}
                className="-mr-1 -mt-1 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Dismiss install prompt"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                fullWidth
                size="sm"
                onClick={() => void installApp()}
                icon={<Download className="size-3.5" aria-hidden="true" />}
              >
                Install
              </Button>
              <Button fullWidth size="sm" variant="ghost" onClick={dismissInstall}>
                Maybe Later
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
