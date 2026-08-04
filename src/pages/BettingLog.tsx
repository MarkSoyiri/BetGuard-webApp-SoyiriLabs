import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Pencil, Trash2, ListChecks, TrendingUp, TrendingDown, ClipboardList, Eraser, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Badge';
import { ChartCard } from '@/components/ui/ChartCard';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { PLATFORMS, SPORTS } from '@/data/sample';
import type { BetOutcome, BetRecord } from '@/types';
import { useBets } from '@/contexts/BetContext';
import { useToast } from '@/contexts/ToastContext';
import { computeStats, dateRange } from '@/utils/stats';
import { formatGHS, formatDate, todayISO } from '@/utils/format';
import { ChartTooltip, AXIS_TICK, gridStyle, COLORS } from '@/components/charts/chartUtils';

interface FormState {
  date: string;
  platform: string;
  sport: string;
  amount: string;
  outcome: BetOutcome;
  notes: string;
}

const EMPTY: FormState = {
  date: todayISO(),
  platform: PLATFORMS[0],
  sport: SPORTS[0],
  amount: '',
  outcome: 'lost',
  notes: '',
};

export function BettingLog() {
  const { bets, addBet, updateBet, deleteBet } = useBets();
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<{ amount?: string }>({});
  const [editing, setEditing] = useState<BetRecord | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY);
  const [deleting, setDeleting] = useState<BetRecord | null>(null);
  const [viewing, setViewing] = useState<BetRecord | null>(null);
  const [mobileFormOpen, setMobileFormOpen] = useState(false);

  const stats = useMemo(() => computeStats(bets), [bets]);

  const sportData = useMemo(() => {
    const map = new Map<string, number>();
    bets.forEach((b) => map.set(b.sport, (map.get(b.sport) ?? 0) + b.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [bets]);

  const daily = useMemo(
    () =>
      dateRange(30).map((d) => ({
        day: formatDate(d).slice(0, 6),
        spent: bets.filter((b) => b.date === d).reduce((s, b) => s + b.amount, 0),
      })),
    [bets],
  );

  const PIE_COLORS = [COLORS.primaryLight, COLORS.secondary, COLORS.accent];

  const setField = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (amount: string) => {
    const a = Number(amount);
    if (!amount || Number.isNaN(a) || a <= 0) {
      setErrors({ amount: 'Enter an amount greater than zero.' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!validate(form.amount)) return;
    addBet({
      date: form.date,
      platform: form.platform,
      sport: form.sport,
      amount: Number(form.amount),
      outcome: form.outcome,
      notes: form.notes.trim(),
    });
    toast('Bet logged successfully.');
    setForm(EMPTY);
    setMobileFormOpen(false);
  };

  const clearForm = () => {
    setForm(EMPTY);
    setErrors({});
  };

  const openEdit = (bet: BetRecord) => {
    setEditing(bet);
    setEditForm({
      date: bet.date,
      platform: bet.platform,
      sport: bet.sport,
      amount: String(bet.amount),
      outcome: bet.outcome,
      notes: bet.notes,
    });
  };

  const handleEditSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!validate(editForm.amount)) return;
    updateBet(editing.id, {
      date: editForm.date,
      platform: editForm.platform,
      sport: editForm.sport,
      amount: Number(editForm.amount),
      outcome: editForm.outcome,
      notes: editForm.notes.trim(),
    });
    toast('Bet updated.');
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteBet(deleting.id);
    toast('Bet deleted.', 'info');
    setDeleting(null);
  };

  const outcomeControl = (value: BetOutcome, onChange: (o: BetOutcome) => void) => (
    <div className="flex gap-3">
      {(['won', 'lost'] as const).map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-bold capitalize transition-all ${
            value === o
              ? o === 'won'
                ? 'border-secondary bg-secondary/10 text-secondary-dark dark:text-secondary'
                : 'border-danger bg-danger/10 text-danger'
              : 'border-slate-200 text-slate-400 hover:border-slate-300 dark:border-slate-700'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Betting Log"
        subtitle="Track every bet you place — honesty here is your superpower."
      />

      <button
        type="button"
        onClick={() => setMobileFormOpen((o) => !o)}
        aria-expanded={mobileFormOpen}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-secondary/25 transition hover:opacity-90 lg:hidden"
      >
        {mobileFormOpen ? <Minus className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
        {mobileFormOpen ? 'Hide add a bet' : 'Add a bet'}
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className={`h-fit p-6 lg:block ${mobileFormOpen ? 'block' : 'hidden'}`}>
          <h3 className="mb-5 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
            <ClipboardList className="size-5 text-primary-light" aria-hidden="true" />
            Add a bet
          </h3>
          <form onSubmit={handleSave} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" value={form.date} onChange={setField('date')} />
              <Select label="Platform" value={form.platform} onChange={setField('platform')}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <Select label="Sport" value={form.sport} onChange={setField('sport')}>
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Input
              label="Amount (GH₵)"
              type="number"
              min="1"
              step="1"
              placeholder="50"
              value={form.amount}
              onChange={setField('amount')}
              error={errors.amount}
            />
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Outcome
              </p>
              {outcomeControl(form.outcome, (o) => setForm((f) => ({ ...f, outcome: o })))}
            </div>
            <Textarea
              label="Notes (optional)"
              placeholder="How are you feeling about this one?"
              rows={3}
              value={form.notes}
              onChange={setField('notes')}
            />
            <div className="flex gap-3">
              <Button type="submit" fullWidth icon={<Plus className="size-4" aria-hidden="true" />}>
                Save bet
              </Button>
              <Button type="button" variant="ghost" onClick={clearForm} icon={<Eraser className="size-4" aria-hidden="true" />}>
                Clear
              </Button>
            </div>
          </form>
        </GlassCard>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <GlassCard hover={false} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total bets</p>
              <p className="mt-1.5 flex items-center gap-1.5 font-display text-xl font-bold text-ink dark:text-white">
                <ListChecks className="size-4 text-primary-light" aria-hidden="true" />
                {stats.total}
              </p>
            </GlassCard>
            <GlassCard hover={false} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total spent</p>
              <p className="mt-1.5 font-display text-xl font-bold text-ink dark:text-white">{formatGHS(stats.spent)}</p>
            </GlassCard>
            <GlassCard hover={false} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net result</p>
              <p className={`mt-1.5 font-display text-xl font-bold ${stats.net >= 0 ? 'text-secondary' : 'text-danger'}`}>
                {stats.net >= 0 ? '+' : '-'}{formatGHS(Math.abs(stats.net))}
              </p>
            </GlassCard>
            <GlassCard hover={false} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Win rate</p>
              <p className="mt-1.5 font-display text-xl font-bold text-ink dark:text-white">
                {Math.round(stats.winRate)}%
              </p>
            </GlassCard>
          </div>

          <ChartCard title="Spending by sport" subtitle="Where your money goes (all time)">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-56 w-full sm:w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sportData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={4}
                      strokeWidth={0}
                      animationDuration={1200}
                    >
                      {sportData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-2.5">
                {sportData.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-2 text-sm">
                    <span className="size-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="flex-1 font-medium text-slate-600 dark:text-slate-300">{s.name}</span>
                    <span className="font-bold text-ink dark:text-white">{formatGHS(s.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="mt-6">
        <ChartCard title="Spending trend — last 30 days" subtitle="Updates automatically as you log bets">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="logGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="spent" name="Spent" stroke={COLORS.primary} strokeWidth={2.5} fill="url(#logGrad)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <GlassCard hover={false} className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-ink dark:text-white">
            All records ({bets.length})
          </h3>
          <div className="flex gap-2">
            <Chip tone="primary">{stats.won} wins</Chip>
            <Chip tone="danger">{stats.lost} losses</Chip>
          </div>
        </div>

        {bets.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-8" aria-hidden="true" />}
            title="No bets logged yet"
            message="Use the form to add your first betting record and start building your picture."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-700">
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Platform</th>
                  <th className="pb-3 pr-4 font-semibold">Sport</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Amount</th>
                  <th className="pb-3 pr-4 font-semibold">Outcome</th>
                  <th className="pb-3 pr-4 font-semibold">Notes</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bets.slice(0, 15).map((bet) => (
                  <motion.tr
                    key={bet.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 pr-4 font-medium text-ink dark:text-white">{formatDate(bet.date)}</td>
                    <td className="py-3 pr-4">{bet.platform}</td>
                    <td className="py-3 pr-4">{bet.sport}</td>
                    <td className="py-3 pr-4 text-right font-bold text-ink dark:text-white">{formatGHS(bet.amount)}</td>
                    <td className="py-3 pr-4">
                      {bet.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:text-warning">
                          pending
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          bet.outcome === 'won' ? 'bg-secondary/10 text-secondary-dark dark:text-secondary' : 'bg-danger/10 text-danger'
                        }`}>
                          {bet.outcome === 'won' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          {bet.outcome}
                        </span>
                      )}
                    </td>
                    <td className="max-w-[180px] truncate py-3 pr-4 text-slate-400">{bet.notes || '—'}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setViewing(bet)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-primary/10 hover:text-primary-light"
                          aria-label={`View bet on ${formatDate(bet.date)}`}
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => openEdit(bet)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-primary/10 hover:text-primary-light"
                          aria-label={`Edit bet on ${formatDate(bet.date)}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(bet)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-danger/10 hover:text-danger"
                          aria-label={`Delete bet on ${formatDate(bet.date)}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {bets.length > 15 && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Showing latest 15 of {bets.length} records.
              </p>
            )}
          </div>
        )}
      </GlassCard>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit bet"
        subtitle="Update the details below."
      >
        <form onSubmit={handleEditSave} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={editForm.date} onChange={setFieldEdit('date')} />
            <Select label="Platform" value={editForm.platform} onChange={setFieldEdit('platform')}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          <Select label="Sport" value={editForm.sport} onChange={setFieldEdit('sport')}>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Input label="Amount (GH₵)" type="number" min="1" value={editForm.amount} onChange={setFieldEdit('amount')} error={errors.amount} />
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Outcome</p>
            {outcomeControl(editForm.outcome, (o) => setEditForm((f) => ({ ...f, outcome: o })))}
          </div>
          <Textarea label="Notes" rows={2} value={editForm.notes} onChange={setFieldEdit('notes')} />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Bet details"
        subtitle={viewing ? formatDate(viewing.date) : undefined}
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div>
                <p className="text-xs text-slate-400">Amount</p>
                <p className="font-display text-2xl font-bold text-ink dark:text-white">
                  {formatGHS(viewing.amount)}
                </p>
              </div>
              {viewing.status === 'pending' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-bold text-orange-700 dark:text-warning">
                  pending
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  viewing.outcome === 'won' ? 'bg-secondary/10 text-secondary-dark dark:text-secondary' : 'bg-danger/10 text-danger'
                }`}>
                  {viewing.outcome === 'won' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {viewing.outcome}
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Platform</dt>
                <dd className="mt-0.5 font-semibold text-ink dark:text-white">{viewing.platform}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Sport</dt>
                <dd className="mt-0.5 font-semibold text-ink dark:text-white">{viewing.sport}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Date</dt>
                <dd className="mt-0.5 font-semibold text-ink dark:text-white">{formatDate(viewing.date)}</dd>
              </div>
              {viewing.source && (
                <div>
                  <dt className="text-xs text-slate-400">Source</dt>
                  <dd className="mt-0.5 font-semibold capitalize text-ink dark:text-white">{viewing.source}</dd>
                </div>
              )}
            </dl>

            <div>
              <p className="mb-1.5 text-xs text-slate-400">Notes</p>
              <p className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                {viewing.notes || 'No notes for this bet.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this bet?"
        message={`This will permanently remove the ${deleting ? formatGHS(deleting.amount) : ''} ${deleting?.sport ?? ''} record from your log. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );

  function setFieldEdit(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setEditForm((f) => ({ ...f, [key]: e.target.value }));
  }
}
