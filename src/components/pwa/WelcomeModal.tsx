import { useEffect, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { usePWA } from '@/contexts/PWAContext';

export function WelcomeModal() {
  const { welcomeOpen, closeWelcome, dismissWelcome } = usePWA();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (welcomeOpen) setDontShowAgain(false);
  }, [welcomeOpen]);

  const handleContinue = () => {
    if (dontShowAgain) dismissWelcome();
    else closeWelcome();
  };

  return (
    <Modal open={welcomeOpen} onClose={closeWelcome} size="sm">
      <div className="flex flex-col items-center py-2 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30">
          <PartyPopper className="size-8" aria-hidden="true" />
        </div>
        <h4 className="font-display text-xl font-bold text-ink dark:text-white">
          Welcome to BetGuard
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Thanks for installing BetGuard! You can now enjoy a faster, distraction-free experience
          directly from your home screen.
        </p>
        <label className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="size-4 rounded border-slate-300 text-primary focus:ring-primary-light/40 dark:border-slate-600"
          />
          Don't show this again
        </label>
        <div className="mt-6 w-full">
          <Button fullWidth onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
