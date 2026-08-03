import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { AuthShell } from '@/components/ui/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.7-.2-2.5H12v4.8h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.3 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l4-3.1z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.6l4 3.1c.9-2.8 3.5-5 6.6-5z" />
    </svg>
  );
}

export function Login() {
  const { isAuthenticated, login } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  if (isAuthenticated) return <Navigate to={from} replace />;

  const validate = () => {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (password.length < 4) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      toast('Welcome back! Stay in control today.');
      navigate(from, { replace: true });
    }, 900);
  };

  const handleGoogle = () => {
    login('guest@betguard.app', 'demo');
    toast('Signed in with Google (demo).');
    navigate(from, { replace: true });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue protecting your habits."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-light hover:underline dark:text-primary-light">
            Create one free
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="size-4" aria-hidden="true" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="size-4" aria-hidden="true" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              className="size-3.5 rounded accent-primary"
              defaultChecked
            />
            Remember me
          </label>
          <button type="button" className="font-semibold text-primary-light hover:underline">
            Forgot password?
          </button>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        or continue with
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button
        type="button"
        variant="outline"
        fullWidth
        icon={<GoogleIcon />}
        onClick={handleGoogle}
      >
        Continue with Google
      </Button>

      <p className="mt-5 rounded-xl bg-primary/5 px-4 py-3 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        <strong>Demo mode</strong> — any email and password will work. On your first visit you'll
        explore the sample demo account; accounts you create stay separate with their own clean
        data. Nothing is ever sent online.
      </p>
    </AuthShell>
  );
}
