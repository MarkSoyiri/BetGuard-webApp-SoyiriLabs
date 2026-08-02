import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { usePWA } from '@/contexts/PWAContext';

export function OfflineBanner() {
  const { offline } = usePWA();

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 top-0 z-[80]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-dark to-primary px-4 py-2 text-center text-xs font-semibold text-white shadow-md">
            <WifiOff className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              You're offline. Your saved data is still available. Connect to the internet to
              refresh fixtures.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
