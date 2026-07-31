import {
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { motion } from 'framer-motion';

interface FieldBase {
  label?: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
}

const labelCls =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';
const fieldCls =
  'w-full rounded-xl border border-slate-300 bg-white/70 px-4 py-2.5 text-sm text-ink placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-primary-light focus:ring-4 focus:ring-primary-light/15 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500';

function FieldShell({
  label,
  icon,
  error,
  hint,
  children,
}: FieldBase & { children: ReactElement }) {
  const id = useId();
  return (
    <div>
      {label && (
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        {isValidElement(children)
          ? cloneElement(
              children as ReactElement<Record<string, unknown>>,
              { id, 'aria-invalid': error ? true : undefined },
            )
          : children}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  label,
  icon,
  error,
  hint,
  className = '',
  ...props
}: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} icon={icon} error={error} hint={hint}>
      <input
        {...props}
        className={`${fieldCls} ${icon ? 'pl-11' : ''} ${
          error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''
        } ${className}`}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  icon,
  error,
  hint,
  className = '',
  children,
  ...props
}: FieldBase & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} icon={icon} error={error} hint={hint}>
      <select
        {...props}
        className={`${fieldCls} appearance-none ${icon ? 'pl-11' : ''} pr-8 ${
          error ? 'border-danger' : ''
        } ${className}`}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  ...props
}: FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      <textarea {...props} className={`${fieldCls} resize-none ${className}`} />
    </FieldShell>
  );
}

export function AnimatedForm({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
