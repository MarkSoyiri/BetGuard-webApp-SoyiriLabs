import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Cake, Briefcase, Banknote, Mail, Lock, Wallet, ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthShell } from '@/components/ui/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUser } from '@/contexts/UserContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useToast } from '@/contexts/ToastContext';

interface FormState {
  name: string;
  age: string;
  occupation: string;
  income: string;
  budget: string;
  email: string;
  password: string;
}

const INITIAL: FormState = {
  name: '',
  age: '',
  occupation: '',
  income: '',
  budget: '',
  email: '',
  password: '',
};

export function Register() {
  const { isAuthenticated, register } = useUser();
  const { setMonthlyBudget } = useBudget();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validateStep1 = () => {
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your full name.';
    const age = Number(form.age);
    if (!form.age || Number.isNaN(age)) next.age = 'Enter your age.';
    else if (age < 18) next.age = 'You must be 18 or older to use BetGuard.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: typeof errors = {};
    const income = Number(form.income);
    if (!form.income || Number.isNaN(income) || income < 0) next.income = 'Enter a valid monthly income.';
    const budget = Number(form.budget);
    if (!form.budget || Number.isNaN(budget) || budget < 0) next.budget = 'Enter a valid monthly budget.';
    else if (budget > income * 0.2 && income > 0)
      next.budget = 'Consider a budget of 20% or less of income.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goTo = (nextStep: number, dir: number) => {
    setDirection(dir);
    setStep(nextStep);
  };

  const handleContinue = () => {
    if (!validateStep1()) {
      toast('Please fix the highlighted fields.', 'error');
      return;
    }
    goTo(2, 1);
  };

  const handleBack = () => {
    setErrors({});
    goTo(1, -1);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) {
      toast('Please fix the highlighted fields.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const budget = Number(form.budget);
      setMonthlyBudget(budget);
      register({
        name: form.name.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        occupation: form.occupation.trim() || 'Not specified',
        monthlyIncome: Number(form.income),
        riskLevel: null,
        joinedAt: new Date().toISOString(),
        notificationsEnabled: true,
        isAdmin: true,
      });
      toast('Account created! Welcome to BetGuard.');
      navigate('/dashboard', { replace: true });
    }, 1000);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Takes less than a minute. Everything is stored on your device."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-light hover:underline dark:text-primary-light">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <span>Step {step} of 2</span>
          <span>{step === 1 ? 'Personal Information' : 'Profile & Betting Setup'}</span>
        </div>
        <div className="mt-2.5 flex gap-1.5">
          {[1, 2].map((s) => (
            <motion.div
              key={s}
              className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700"
              animate={{ backgroundColor: step >= s ? '#2563eb' : undefined }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                initial={false}
                animate={{ scaleX: step >= s ? 1 : 0, opacity: step >= s ? 1 : 0 }}
                style={{ originX: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {step === 1 ? (
            <motion.div
              key="step1"
              custom={direction}
              initial={{ opacity: 0, x: 40 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * direction }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  placeholder="Ama Mensah"
                  icon={<User className="size-4" aria-hidden="true" />}
                  value={form.name}
                  onChange={set('name')}
                  error={errors.name}
                  autoComplete="name"
                />
                <Input
                  label="Age"
                  type="number"
                  placeholder="24"
                  icon={<Cake className="size-4" aria-hidden="true" />}
                  value={form.age}
                  onChange={set('age')}
                  error={errors.age}
                  autoComplete="off"
                />
              </div>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="size-4" aria-hidden="true" />}
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                icon={<Lock className="size-4" aria-hidden="true" />}
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                autoComplete="new-password"
              />
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              custom={direction}
              initial={{ opacity: 0, x: 40 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * direction }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Occupation"
                  placeholder="Student / Engineer / Nurse…"
                  icon={<Briefcase className="size-4" aria-hidden="true" />}
                  value={form.occupation}
                  onChange={set('occupation')}
                />
                <Input
                  label="Monthly income"
                  type="number"
                  placeholder="2500"
                  icon={<Banknote className="size-4" aria-hidden="true" />}
                  value={form.income}
                  onChange={set('income')}
                  error={errors.income}
                />
              </div>
              <Input
                label="Monthly betting budget"
                hint="The maximum you can responsibly afford to lose each month."
                type="number"
                placeholder="300"
                icon={<Wallet className="size-4" aria-hidden="true" />}
                value={form.budget}
                onChange={set('budget')}
                error={errors.budget}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 pt-1">
          {step === 1 ? (
            <div className="flex w-full justify-end">
              <Button type="button" size="md" icon={<ArrowRight className="size-3.5" aria-hidden="true" />} onClick={handleContinue}>
                Continue
              </Button>
            </div>
          ) : (
            <>
              <Button type="button" variant="ghost" size="md" icon={<ArrowLeft className="size-3.5" aria-hidden="true" />} onClick={handleBack}>
                Back
              </Button>
              <Button type="submit" size="md" loading={loading}>
                Create Account
              </Button>
            </>
          )}
        </div>
      </form>
    </AuthShell>
  );
}
