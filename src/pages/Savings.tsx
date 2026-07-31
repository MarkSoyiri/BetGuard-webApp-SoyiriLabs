import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Plus, Pencil, Trash2, Target, CalendarDays, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { CircularGauge } from '@/components/ui/CircularGauge';
import { useGoals } from '@/contexts/GoalContext';
import { useToast } from '@/contexts/ToastContext';
import { formatGHS, formatDate } from '@/utils/format';
import type { SavingsGoal } from '@/types';

interface GoalForm {
  name: string;
  target: string;
  current: string;
  deadline: string;
}

const EMPTY_FORM: GoalForm = { name: '', target: '', current: '0', deadline: '' };

function estimateCompletion(goal: SavingsGoal): string {
  if (goal.current >= goal.target) return 'Goal reached';
  const created = new Date(goal.createdAt).getTime();
  const now = Date.now();
  const daysSince = Math.max(1, (now - created) / 86400000);
  const dailyRate = goal.current / daysSince;
  if (dailyRate <= 0) return 'Start saving to see an estimate';
  const daysLeft = (goal.target - goal.current) / dailyRate;
  const eta = new Date(now + daysLeft * 86400000);
  return `Est. ${eta.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function Savings() {
  const { goals, addGoal, contribute, updateGoal, deleteGoal } = useGoals();
  const { toast } = useToast();

  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<{ name?: string; target?: string; deadline?: string }>({});
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contribution, setContribution] = useState('');
  const [deleting, setDeleting] = useState<SavingsGoal | null>(null);

  const total = useMemo(
    () => ({
      current: goals.reduce((s, g) => s + g.current, 0),
      target: goals.reduce((s, g) => s + g.target, 0),
    }),
    [goals],
  );
  const totalPct = total.target > 0 ? Math.round((total.current / total.target) * 100) : 0;

  const setField = (key: keyof GoalForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = 'Give your goal a name.';
    const target = Number(form.target);
    if (!form.target || Number.isNaN(target) || target <= 0) next.target = 'Enter a target amount.';
    if (!form.deadline) next.deadline = 'Pick a deadline.';
    setErrors(next);
    if (Object.keys(next).length) return;
    if (editId) {
      updateGoal(editId, {
        name: form.name.trim(),
        target,
        current: Math.max(0, Number(form.current) || 0),
        deadline: form.deadline,
      });
      toast(`Savings goal "${form.name.trim()}" updated.`);
    } else {
      addGoal({
        name: form.name.trim(),
        target,
        current: Math.max(0, Number(form.current) || 0),
        deadline: form.deadline,
      });
      toast(`Savings goal "${form.name.trim()}" created.`);
    }
    setForm(EMPTY_FORM);
    setEditId(null);
    setCreating(false);
  };

  const handleContribute = (goal: SavingsGoal) => {
    const amount = Number(contribution);
    if (!contribution || Number.isNaN(amount) || amount <= 0) {
      toast('Enter a valid amount to add.', 'error');
      return;
    }
    contribute(goal.id, amount);
    toast(`GH₵ ${amount.toLocaleString()} added to ${goal.name}.`);
    setContribution('');
    setContributingId(null);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Savings Goals"
        subtitle="Redirect the money you would have bet toward things that actually last."
        action={
          <Button onClick={() => setCreating(true)} icon={<Plus className="size-4" aria-hidden="true" />}>
            New goal
          </Button>
        }
      />

      <GlassCard className="mb-6 flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-500 text-ink shadow-lg shadow-accent/30">
            <PiggyBank className="size-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total saved</p>
            <p className="font-display text-2xl font-bold text-ink dark:text-white">
              {formatGHS(total.current)}
              <span className="ml-1 text-sm font-semibold text-slate-400">/ {formatGHS(total.target)}</span>
            </p>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-400">
            <span>Overall progress</span>
            <span className="font-bold text-ink dark:text-white">{totalPct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${totalPct}%` }}
              transition={{ duration: 1.1 }}
            />
          </div>
        </div>
      </GlassCard>

      {goals.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<PiggyBank className="size-8" aria-hidden="true" />}
            title="No savings goals yet"
            message="Create your first goal and start turning betting money into something meaningful."
            action={
              <Button onClick={() => setCreating(true)} icon={<Plus className="size-4" aria-hidden="true" />}>
                Create a goal
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal, i) => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const daysToDeadline = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000));
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-ink dark:text-white">{goal.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">by {formatDate(goal.deadline)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setForm({ name: goal.name, target: String(goal.target), current: String(goal.current), deadline: goal.deadline });
                        setErrors({});
                        setCreating(true);
                        setEditId(goal.id);
                      }}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-primary/10 hover:text-primary-light"
                      aria-label={`Edit ${goal.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(goal)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-danger/10 hover:text-danger"
                      aria-label={`Delete ${goal.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center">
                  <CircularGauge value={pct} color="#10b981" size={132} stroke={11}>
                    <span className="font-display text-xl font-bold text-ink dark:text-white">{pct}%</span>
                  </CircularGauge>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Saved</p>
                    <p className="font-display text-lg font-bold text-secondary-dark dark:text-secondary">{formatGHS(goal.current)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Target</p>
                    <p className="font-display text-lg font-bold text-ink dark:text-white">{formatGHS(goal.target)}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <TrendingUp className="size-3.5 text-secondary" aria-hidden="true" />
                  {estimateCompletion(goal)}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <CalendarDays className="size-3.5 text-primary-light" aria-hidden="true" />
                  {daysToDeadline} days to deadline
                </div>

                {contributingId === goal.id ? (
                  <form
                    className="mt-4 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleContribute(goal);
                    }}
                  >
                    <Input
                      label="Amount (GH₵)"
                      type="number"
                      min="1"
                      placeholder="50"
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2 pt-6">
                      <Button type="submit" size="sm" variant="secondary">Add</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setContributingId(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    className="mt-4"
                    onClick={() => setContributingId(goal.id)}
                  >
                    Add money
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => {
          setCreating(false);
          setEditId(null);
          setForm(EMPTY_FORM);
          setErrors({});
        }}
        title={editId ? 'Edit goal' : 'Create a savings goal'}
        subtitle="Small deposits add up faster than you think."
      >
        <form onSubmit={handleCreate} noValidate className="space-y-4">
          <Input label="Goal name" placeholder="Emergency fund" value={form.name} onChange={setField('name')} error={errors.name} icon={<Target className="size-4" aria-hidden="true" />} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target (GH₵)" type="number" min="1" placeholder="1000" value={form.target} onChange={setField('target')} error={errors.target} />
            <Input label="Current (GH₵)" type="number" min="0" placeholder="0" value={form.current} onChange={setField('current')} />
          </div>
          <Input label="Deadline" type="date" value={form.deadline} onChange={setField('deadline')} error={errors.deadline} />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button type="submit">{editId ? 'Save changes' : 'Create goal'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this goal?"
        message={`"${deleting?.name}" and its progress will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleting) {
            deleteGoal(deleting.id);
            toast('Goal deleted.', 'info');
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
