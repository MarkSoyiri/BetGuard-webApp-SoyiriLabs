import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  to?: string;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-primary/20 hover:shadow-primary/30',
  secondary:
    'bg-gradient-to-r from-secondary to-emerald-600 text-white shadow-md shadow-secondary/20 hover:shadow-secondary/30',
  accent:
    'bg-gradient-to-r from-accent to-orange-500 text-ink shadow-md shadow-accent/20 hover:shadow-accent/30',
  ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  outline:
    'border border-slate-300 bg-white/60 text-slate-700 hover:border-primary-light hover:text-primary-light dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200',
  danger:
    'bg-gradient-to-r from-danger to-rose-600 text-white shadow-md shadow-danger/20 hover:shadow-danger/30',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    icon,
    to,
    children,
    className = '',
    ...props
  },
  ref,
) {
  const classes = [
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light/50 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none select-none',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={classes}
      {...props}
    >
      {content}
    </motion.button>
  );
});
