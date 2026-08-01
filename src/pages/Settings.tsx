import { useRef, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  User,
  Download,
  Upload,
  RotateCcw,
  Save,
  Palette,
  ShieldCheck,
  Timer,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useLimits } from '@/contexts/LimitsContext';
import { useToast } from '@/contexts/ToastContext';
import { clearAllStorage, exportAllStorage, importAllStorage } from '@/utils/storage';
import { formatDate, formatGHS } from '@/utils/format';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { profile, updateProfile } = useUser();
  const { monthlyBudget, setMonthlyBudget } = useBudget();
  const { limits, setLimits, startCooldown, cancelCooldown, isCooldownActive, cooldownEndsAt } = useLimits();
  const { toast } = useToast();

  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [occupation, setOccupation] = useState(profile?.occupation ?? '');
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [income, setIncome] = useState(String(profile?.monthlyIncome ?? ''));
  const [budget, setBudget] = useState(String(monthlyBudget));
  const [notifEnabled, setNotifEnabled] = useState(profile?.notificationsEnabled ?? true);
  const [limitDaily, setLimitDaily] = useState(String(limits.daily));
  const [limitWeekly, setLimitWeekly] = useState(String(limits.weekly));
  const [limitMonthly, setLimitMonthly] = useState(String(limits.monthly));
  const [limitMaxStake, setLimitMaxStake] = useState(String(limits.maxStake));
  const [limitMaxBets, setLimitMaxBets] = useState(String(limits.maxBetsPerDay));
  const [limitEnabled, setLimitEnabled] = useState(limits.enabled);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    const ageNum = Number(age);
    const incomeNum = Number(income);
    if (name.trim().length < 2) {
      toast('Please enter your name.', 'error');
      return;
    }
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      occupation: occupation.trim() || 'Not specified',
      age: Number.isNaN(ageNum) ? null : ageNum,
      monthlyIncome: Number.isNaN(incomeNum) ? null : incomeNum,
      notificationsEnabled: notifEnabled,
    });
    const budgetNum = Number(budget);
    if (!Number.isNaN(budgetNum) && budgetNum >= 0) setMonthlyBudget(budgetNum);
    toast('Settings saved successfully.');
  };

  const handleReset = () => {
    clearAllStorage();
    setConfirmReset(false);
    window.location.reload();
  };

  const handleExport = () => {
    const data = exportAllStorage();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `betguard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Demo data exported as JSON.');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const keys = importAllStorage(parsed);
        if (keys.length === 0) {
          toast('No valid BetGuard data found in that file.', 'error');
          return;
        }
        toast(`Imported ${keys.length} data groups. Reloading…`);
        setTimeout(() => window.location.reload(), 800);
      } catch {
        toast('Could not parse that file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const toggle = (checked: boolean) => {
    setNotifEnabled(checked);
    toast(checked ? 'Notifications enabled.' : 'Notifications disabled.', 'info');
  };

  const toggleLimits = (checked: boolean) => {
    setLimitEnabled(checked);
    toast(checked ? 'Limits will be enforced.' : 'Limits disabled.', 'info');
  };

  const num = (v: string) => {
    const n = Number(v);
    return Number.isNaN(n) || n < 0 ? 0 : Math.round(n);
  };

  const handleSaveLimits = () => {
    setLimits({
      daily: num(limitDaily),
      weekly: num(limitWeekly),
      monthly: num(limitMonthly),
      maxStake: num(limitMaxStake),
      maxBetsPerDay: num(limitMaxBets),
      enabled: limitEnabled,
    });
    toast('Responsible limits saved.');
  };

  const handleStartCooldown = (days: number) => {
    const until = startCooldown(days);
    toast(`Betting break started until ${formatDate(until)}.`, 'info');
  };

  const handleCancelCooldown = () => {
    cancelCooldown();
    toast('Betting break cancelled.', 'info');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="Personalise BetGuard to fit your life."
      />

      <div className="space-y-6">
        <GlassCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
            <Palette className="size-5 text-primary-light" aria-hidden="true" /> Appearance
          </h3>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-primary-light dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {theme === 'light' ? <Moon className="size-5" aria-hidden="true" /> : <Sun className="size-5" aria-hidden="true" />}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-bold text-ink dark:text-white">Dark mode</p>
                <p className="text-xs text-slate-400">Easier on the eyes at night</p>
              </div>
            </div>
            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${theme === 'dark' ? 'bg-secondary' : 'bg-slate-300'}`}
              aria-hidden="true"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={`absolute top-1 size-5 rounded-full bg-white shadow ${theme === 'dark' ? 'right-1' : 'left-1'}`}
              />
            </span>
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
            <Bell className="size-5 text-primary-light" aria-hidden="true" /> Notifications
          </h3>
          <button
            onClick={() => toggle(!notifEnabled)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-primary-light dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Bell className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-bold text-ink dark:text-white">Budget & reminder alerts</p>
                <p className="text-xs text-slate-400">Warnings at 80%, 90% and 100% of your budget</p>
              </div>
            </div>
            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${notifEnabled ? 'bg-secondary' : 'bg-slate-300'}`}
              aria-hidden="true"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={`absolute top-1 size-5 rounded-full bg-white shadow ${notifEnabled ? 'right-1' : 'left-1'}`}
              />
            </span>
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
            <User className="size-5 text-primary-light" aria-hidden="true" /> Profile & budget
          </h3>
          <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
              <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Monthly income (GH₵)" type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
              <Input label="Monthly betting budget (GH₵)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="rounded-2xl bg-secondary/10 p-4 text-sm text-secondary-dark dark:text-secondary">
              Current budget: {formatGHS(monthlyBudget)} · Income:{' '}
              {profile?.monthlyIncome != null ? formatGHS(profile.monthlyIncome) : '—'}
            </div>
            <Button type="submit" icon={<Save className="size-4" aria-hidden="true" />}>Save changes</Button>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
            <ShieldCheck className="size-5 text-primary-light" aria-hidden="true" /> Responsible limits
          </h3>

          <button
            onClick={() => toggleLimits(!limitEnabled)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-primary-light dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-bold text-ink dark:text-white">Enforce betting limits</p>
                <p className="text-xs text-slate-400">BetGuard blocks any bet that would break a limit</p>
              </div>
            </div>
            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${limitEnabled ? 'bg-secondary' : 'bg-slate-300'}`}
              aria-hidden="true"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={`absolute top-1 size-5 rounded-full bg-white shadow ${limitEnabled ? 'right-1' : 'left-1'}`}
              />
            </span>
          </button>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Daily limit (GH₵)" type="number" min="0" value={limitDaily} onChange={(e) => setLimitDaily(e.target.value)} />
            <Input label="Weekly limit (GH₵)" type="number" min="0" value={limitWeekly} onChange={(e) => setLimitWeekly(e.target.value)} />
            <Input label="Monthly limit (GH₵)" type="number" min="0" value={limitMonthly} onChange={(e) => setLimitMonthly(e.target.value)} />
            <Input label="Max stake per bet (GH₵)" type="number" min="0" value={limitMaxStake} onChange={(e) => setLimitMaxStake(e.target.value)} />
            <Input label="Max bets per day" type="number" min="0" value={limitMaxBets} onChange={(e) => setLimitMaxBets(e.target.value)} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={handleSaveLimits} icon={<Save className="size-4" aria-hidden="true" />}>
              Save limits
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLimitDaily(String(150));
                setLimitWeekly(String(350));
                setLimitMonthly(String(600));
                setLimitMaxStake(String(80));
                setLimitMaxBets(String(5));
                setLimitEnabled(true);
                toast('Limits reset to recommended values.');
              }}
            >
              Reset to recommended
            </Button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Recommended: daily {formatGHS(150)}, weekly {formatGHS(350)}, monthly {formatGHS(600)},
            max stake {formatGHS(80)}, up to 5 bets a day. These match a responsible share of an
            average monthly betting budget.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
            <Timer className="size-5 text-primary-light" aria-hidden="true" /> Take a betting break
          </h3>
          {isCooldownActive ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 rounded-2xl bg-warning/10 p-4">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-orange-600 dark:text-warning" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-bold text-orange-700 dark:text-warning">You are on a betting break</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    BetGuard has paused sportsbook betting until <strong>{formatDate(cooldownEndsAt ?? '')}</strong>.
                    Use this time to rest, review your numbers, or talk to your AI coach.
                  </p>
                </div>
              </div>
              <div>
                <Button variant="outline" onClick={handleCancelCooldown} icon={<Timer className="size-4" aria-hidden="true" />}>
                  End break early
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                A betting break pauses all sportsbook bets for a set period — a powerful way to reset
                after a rough streak or before a big event.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { days: 1, label: '1 day' },
                  { days: 3, label: '3 days' },
                  { days: 7, label: '1 week' },
                  { days: 30, label: '1 month' },
                ].map((o) => (
                  <Button key={o.days} variant="outline" size="sm" onClick={() => handleStartCooldown(o.days)}>
                    {o.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
            <SettingsIcon className="size-5 text-primary-light" aria-hidden="true" /> Demo data
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" onClick={handleExport} icon={<Download className="size-4" aria-hidden="true" />}>
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              icon={<Upload className="size-4" aria-hidden="true" />}
            >
              Import JSON
            </Button>
            <Button variant="danger" onClick={() => setConfirmReset(true)} icon={<RotateCcw className="size-4" aria-hidden="true" />}>
              Reset demo data
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = '';
            }}
            aria-label="Import demo data file"
          />
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Export your local demo data as JSON to back it up or move it between devices. Importing
            replaces your current data. Resetting restores the original sample data.
          </p>
        </GlassCard>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        message="This will restore the original sample data and remove everything you have added or changed."
        confirmLabel="Reset data"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
