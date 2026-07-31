import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { User, Cake, Briefcase, Banknote, Mail, Lock, Wallet } from 'lucide-react';
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
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your full name.';
    const age = Number(form.age);
    if (!form.age || Number.isNaN(age)) next.age = 'Enter your age.';
    else if (age < 18) next.age = 'You must be 18 or older to use BetGuard.';
    const income = Number(form.income);
    if (!form.income || Number.isNaN(income) || income < 0) next.income = 'Enter a valid monthly income.';
    const budget = Number(form.budget);
    if (!form.budget || Number.isNaN(budget) || budget < 0) next.budget = 'Enter a valid monthly budget.';
    else if (budget > income * 0.2 && income > 0)
      next.budget = 'Consider a budget of 20% or less of income.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
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
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            placeholder="Ama Mensah"
            icon={<User className="size-4" aria-hidden="true" />}
            value={form.name}
            onChange={set('name')}
            error={errors.name}
          />
          <Input
            label="Age"
            type="number"
            placeholder="24"
            icon={<Cake className="size-4" aria-hidden="true" />}
            value={form.age}
            onChange={set('age')}
            error={errors.age}
          />
        </div>
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
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
