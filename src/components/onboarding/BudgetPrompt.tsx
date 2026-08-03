import { useEffect, useState, type FormEvent } from 'react';
import { Wallet, ShieldCheck, PiggyBank } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBudget } from '@/contexts/BudgetContext';
import { useUser } from '@/contexts/UserContext';
import { useWallet } from '@/contexts/WalletContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useToast } from '@/contexts/ToastContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import { formatGHS } from '@/utils/format';

const SUGGESTIONS = [100, 300, 600, 1000];

export function BudgetPrompt() {
  const { isDemoAccount, scopeKey } = useUser();
  const { monthlyBudget, setMonthlyBudget } = useBudget();
  const { balance } = useWallet();
  const { open: tourOpen } = useOnboarding();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = usePersistedState<boolean>(`${scopeKey}:budget-prompt-dismissed`, false);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isDemoAccount || monthlyBudget > 0 || dismissed || balance <= 0 || tourOpen) return;
    setOpen(true);
  }, [isDemoAccount, monthlyBudget, balance, dismissed, tourOpen]);

  const amountNum = Number(value);
  const valid = Number.isFinite(amountNum) && amountNum > 0;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setMonthlyBudget(Math.round(amountNum));
    toast(`Monthly budget set to ${formatGHS(Math.round(amountNum))}.`);
    setOpen(false);
    setValue('');
  };

  const skip = () => {
    setDismissed(true);
    setOpen(false);
    setValue('');
  };

  return (
    <Modal
      open={open}
      onClose={skip}
      title="Set your monthly budget"
      subtitle="You added funds — now set a safe limit for the month."
    >
      <form onSubmit={save} noValidate className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl bg-secondary/10 p-4 text-sm leading-relaxed text-secondary-dark dark:text-secondary">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            BetGuard works best when you decide <strong>before</strong> you bet how much you can
            afford to lose. You can change this anytime on the Budget page or in Settings.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick options
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue(String(s))}
                aria-pressed={amountNum === s}
                className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                  amountNum === s
                    ? 'border-primary-light bg-primary/10 text-primary dark:text-primary-light'
                    : 'border-slate-200 text-slate-700 hover:border-primary-light/50 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/50'
                }`}
              >
                {formatGHS(s)}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Monthly betting budget (GH₵)"
          type="number"
          min="1"
          step="1"
          placeholder="300"
          icon={<PiggyBank className="size-4" aria-hidden="true" />}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" fullWidth disabled={!valid} icon={<Wallet className="size-4" aria-hidden="true" />}>
            Save budget
          </Button>
          <Button type="button" variant="ghost" onClick={skip}>
            Skip for now
          </Button>
        </div>
      </form>
    </Modal>
  );
}
