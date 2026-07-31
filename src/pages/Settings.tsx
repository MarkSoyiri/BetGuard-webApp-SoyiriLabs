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
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useToast } from '@/contexts/ToastContext';
import { clearAllStorage, exportAllStorage, importAllStorage } from '@/utils/storage';
import { formatGHS } from '@/utils/format';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { profile, updateProfile } = useUser();
  const { monthlyBudget, setMonthlyBudget } = useBudget();
  const { toast } = useToast();

  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [occupation, setOccupation] = useState(profile?.occupation ?? '');
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [income, setIncome] = useState(String(profile?.monthlyIncome ?? ''));
  const [budget, setBudget] = useState(String(monthlyBudget));
  const [notifEnabled, setNotifEnabled] = useState(profile?.notificationsEnabled ?? true);
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
