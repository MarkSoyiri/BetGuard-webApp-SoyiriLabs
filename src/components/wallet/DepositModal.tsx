import { useState, type FormEvent } from 'react';
import { Wallet, ShieldCheck, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';
import { formatGHS } from '@/utils/format';

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onDeposited?: (amount: number) => void;
}

const PRESETS = [100, 200, 500, 1000, 2000];

export function DepositModal({ open, onClose, onDeposited }: DepositModalProps) {
  const { balance, deposit } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const amountNum = Number(amount);
  const valid = Number.isFinite(amountNum) && amountNum > 0;

  const pick = (value: number) => {
    setAmount(String(value));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || processing) return;
    setProcessing(true);
    setTimeout(() => {
      const final = Math.round(amountNum);
      deposit(final, 'Demo wallet top-up');
      toast(`${formatGHS(final)} added to your demo wallet.`);
      setProcessing(false);
      setAmount('');
      onClose();
      onDeposited?.(final);
    }, 650);
  };

  return (
    <Modal
      open={open}
      onClose={processing ? () => undefined : onClose}
      title="Add money to your wallet"
      subtitle="Demo funds — simulated, no real money involved."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary/[0.06] to-secondary/[0.06] p-4 dark:from-primary-light/10 dark:to-secondary/10">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25">
              <Wallet className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current balance</p>
              <p className="font-display text-2xl font-bold text-ink dark:text-white">{formatGHS(balance)}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick top-up
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => pick(p)}
                aria-pressed={amountNum === p}
                className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                  amountNum === p
                    ? 'border-primary-light bg-primary/10 text-primary dark:text-primary-light'
                    : 'border-slate-200 text-slate-700 hover:border-primary-light/50 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/50'
                }`}
              >
                {formatGHS(p)}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Custom amount (GH₵)"
          type="number"
          min="1"
          step="1"
          placeholder="300"
          icon={<Plus className="size-4" aria-hidden="true" />}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex items-start gap-2.5 rounded-2xl bg-warning/10 p-4 text-xs leading-relaxed text-orange-700 dark:text-warning">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            This is a <strong>demo wallet</strong> for learning good betting habits. Funds are
            simulated and stored only in your browser — no real money is deposited or withdrawn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" fullWidth size="lg" disabled={!valid} loading={processing}>
            {processing ? 'Adding funds…' : `Add ${valid ? formatGHS(amountNum) : 'funds'}`}
          </Button>
          {!processing && (
            <Button type="button" variant="ghost" size="lg" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
