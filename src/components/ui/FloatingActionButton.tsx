import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface FABProps {
  icon: LucideIcon;
  to?: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({ icon: Icon, to, label, onClick, className = '' }: FABProps) {
  const content = (
    <motion.span
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="group relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30"
      role="button"
      aria-label={label}
      tabIndex={to ? undefined : 0}
    >
      <Icon className="size-6" aria-hidden="true" />
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        {label}
      </span>
    </motion.span>
  );

  const wrapperCls = `fixed bottom-6 right-6 z-40 ${className}`;

  if (to) {
    return (
      <Link to={to} className={wrapperCls}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={wrapperCls}>
      {content}
    </button>
  );
}
