import { useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  Wallet,
  PiggyBank,
  ShieldAlert,
  Zap,
  Leaf,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Ticket,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DepositModal } from '@/components/wallet/DepositModal';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useToast } from '@/contexts/ToastContext';
import { formatGHS } from '@/utils/format';

const TOTAL_STEPS = 7;

export function OnboardingFlow() {
  const { open, setOpen, currentStep, next, prev, finish } = useOnboarding();
  const { setMonthlyBudget } = useBudget();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [depositOpen, setDepositOpen] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');

  if (!open) return null;

  const budgetNum = Number(budgetValue);
  const budgetValid = Number.isFinite(budgetNum) && budgetNum > 0;

  const saveBudget = (e: FormEvent) => {
    e.preventDefault();
    if (!budgetValid) return;
    setMonthlyBudget(Math.round(budgetNum));
    toast(`Monthly budget set to ${formatGHS(Math.round(budgetNum))}.`);
    setBudgetValue('');
    next();
  };

  const goToPage = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const progress = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="BetGuard getting started"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-strong w-full max-w-lg overflow-hidden rounded-3xl shadow-glass-lg"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 px-6 py-4 dark:border-slate-700/60">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Getting started · Step {currentStep + 1} of {TOTAL_STEPS}
            </p>
            <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Close onboarding"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {stepContent(currentStep, {
                setDepositOpen,
                budgetValue,
                setBudgetValue,
                budgetValid,
                saveBudget,
                goToPage,
                next,
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200/60 px-6 py-4 dark:border-slate-700/60">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="size-3.5" aria-hidden="true" />}
            onClick={prev}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            {currentStep < TOTAL_STEPS - 1 && (
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Skip for now
              </Button>
            )}
            {stepFooter(currentStep, { next, finish, goToPage })}
          </div>
        </div>
      </motion.div>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onDeposited={() => next()}
      />
    </motion.div>
  );
}

interface StepHandlers {
  setDepositOpen: (open: boolean) => void;
  budgetValue: string;
  setBudgetValue: (value: string) => void;
  budgetValid: boolean;
  saveBudget: (e: FormEvent) => void;
  goToPage: (path: string) => void;
  next: () => void;
}

function StepShell({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25">
          {icon}
        </div>
        <h3 className="font-display text-xl font-bold text-ink dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function stepContent(step: number, h: StepHandlers): ReactNode {
  switch (step) {
    case 0:
      return (
        <StepShell icon={<Rocket className="size-6" aria-hidden="true" />} title="Welcome to BetGuard">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            You've started with a <strong>clean account</strong>. Over the next few minutes we'll set up
            your demo wallet, a monthly budget, and show you the tools BetGuard uses to keep betting
            fun and under control.
          </p>
        </StepShell>
      );
    case 1:
      return (
        <StepShell icon={<Wallet className="size-6" aria-hidden="true" />} title="Add money to your wallet">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Every bet on the Sportsbook is paid from your <strong>demo wallet</strong>. Add some
            practice funds — this is simulated money stored on your device.
          </p>
          <Button
            className="mt-5"
            fullWidth
            icon={<Wallet className="size-4" aria-hidden="true" />}
            onClick={() => h.setDepositOpen(true)}
          >
            Add money
          </Button>
        </StepShell>
      );
    case 2:
      return (
        <StepShell icon={<PiggyBank className="size-6" aria-hidden="true" />} title="Set your monthly budget">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Decide up front how much you can afford to lose each month. BetGuard will track this for
            you and nudge you before you go over.
          </p>
          <form onSubmit={h.saveBudget} className="mt-5 space-y-3">
            <Input
              label="Monthly betting budget (GH₵)"
              type="number"
              min="1"
              step="1"
              placeholder="300"
              value={h.budgetValue}
              onChange={(e) => h.setBudgetValue(e.target.value)}
            />
            <Button type="submit" fullWidth disabled={!h.budgetValid}>
              Save budget
            </Button>
          </form>
        </StepShell>
      );
    case 3:
      return (
        <StepShell icon={<ShieldAlert className="size-6" aria-hidden="true" />} title="Know your risk">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            A short questionnaire gives you a <strong>Low, Medium or High</strong> risk score and
            personal advice. It takes under a minute and shapes your health score.
          </p>
          <Button
            className="mt-5"
            fullWidth
            icon={<Target className="size-4" aria-hidden="true" />}
            onClick={() => h.goToPage('/risk-assessment')}
          >
            Take the assessment
          </Button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Or{' '}
            <button type="button" onClick={h.next} className="font-semibold text-primary-light hover:underline">
              skip this step
            </button>
          </p>
        </StepShell>
      );
    case 4:
      return (
        <StepShell icon={<Zap className="size-6" aria-hidden="true" />} title="Place your first bet">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            The <strong>Sportsbook</strong> is where the fun happens. Pick a team, enter a stake, and
            BetGuard checks it against your limits before taking it from your wallet.
          </p>
          <Button
            className="mt-5"
            fullWidth
            icon={<Ticket className="size-4" aria-hidden="true" />}
            onClick={() => h.goToPage('/sportsbook')}
          >
            Go to Sportsbook
          </Button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Or{' '}
            <button type="button" onClick={h.next} className="font-semibold text-primary-light hover:underline">
              skip this step
            </button>
          </p>
        </StepShell>
      );
    case 5:
      return (
        <StepShell icon={<Leaf className="size-6" aria-hidden="true" />} title="Bet greener">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            With <strong>GreenBet</strong>, 2% of every stake is set aside for real environmental
            projects. Betting a little less doesn't just protect your wallet — it plants trees.
          </p>
          <Button
            className="mt-5"
            fullWidth
            variant="secondary"
            icon={<Leaf className="size-4" aria-hidden="true" />}
            onClick={() => h.goToPage('/greenbet')}
          >
            Explore GreenBet
          </Button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Or{' '}
            <button type="button" onClick={h.next} className="font-semibold text-primary-light hover:underline">
              skip this step
            </button>
          </p>
        </StepShell>
      );
    default:
      return (
        <StepShell icon={<TrendingUp className="size-6" aria-hidden="true" />} title="You're ready">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Your dashboard now shows your <strong>wallet balance</strong>, budget remaining, health
            score and green score. Log every bet, respect your limits, and check in with your AI
            coach whenever you need a second opinion.
          </p>
          <ul className="mt-4 space-y-2">
            {[
              'Wallet balance & demo deposits',
              'Auto-tracked budget progress',
              'Guided risk assessment',
              'Challenges, achievements & GreenBet',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex size-5 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </StepShell>
      );
  }
}

function stepFooter(
  step: number,
  h: { next: () => void; finish: () => void; goToPage: (path: string) => void },
): ReactNode {
  if (step >= TOTAL_STEPS - 1) {
    return (
      <Button size="sm" icon={<Check className="size-3.5" aria-hidden="true" />} onClick={h.finish}>
        Finish
      </Button>
    );
  }
  if (step === 0) {
    return (
      <Button size="sm" icon={<ArrowRight className="size-3.5" aria-hidden="true" />} onClick={h.next}>
        Get started
      </Button>
    );
  }
  return (
    <Button size="sm" icon={<ArrowRight className="size-3.5" aria-hidden="true" />} onClick={h.next}>
      Continue
    </Button>
  );
}
