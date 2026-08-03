import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Search, Ticket, Wallet } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useUser } from '@/contexts/UserContext';
import { useWallet } from '@/contexts/WalletContext';
import { DepositModal } from '@/components/wallet/DepositModal';
import { InstallButton } from '@/components/pwa/InstallButton';
import { useActiveSection } from './nav';
import { prefetchPage } from '@/utils/pagePrefetch';
import { formatGHS } from '@/utils/format';

interface NavbarProps {
  onOpenMobile: () => void;
}

export function Navbar({ onOpenMobile }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { profile } = useUser();
  const { balance } = useWallet();
  const [walletOpen, setWalletOpen] = useState(false);
  const location = useLocation();
  const active = useActiveSection(location.pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl pt-[env(safe-area-inset-top)] dark:border-slate-700/60 dark:bg-slate-900/70">
      <div className="flex h-16 items-center gap-3 px-4 md:px-8">
        <button
          onClick={onOpenMobile}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink md:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>

        <h1 className="hidden font-display text-base font-bold text-ink sm:block dark:text-white">
          {active?.label ?? 'BetGuard'}
        </h1>

        <div className="relative ml-auto hidden w-64 lg:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            placeholder="Quick search…"
            className="w-full rounded-xl border border-slate-200 bg-base/60 py-2 pl-9 pr-3 text-sm text-ink placeholder-slate-400 outline-none transition focus:border-primary-light focus:ring-4 focus:ring-primary-light/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
            aria-label="Quick search"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="ml-auto hidden rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink sm:ml-0 md:block lg:ml-0 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </button>

        <Link
          to="/sportsbook"
          onMouseEnter={() => prefetchPage('/sportsbook')}
          className="ml-auto flex items-center rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink md:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Open sportsbook"
        >
          <Ticket className="size-5" />
        </Link>

        <button
          onClick={() => setWalletOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm font-bold text-ink shadow-sm transition hover:border-primary-light/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
          aria-label={`Wallet balance ${formatGHS(balance)}. Tap to add money`}
        >
          <Wallet className="size-4 text-primary-light" aria-hidden="true" />
          <span>{formatGHS(balance)}</span>
        </button>

        <InstallButton iconOnly />

        <Link
          to="/notifications"
          className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/settings"
          className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light font-display text-xs font-bold text-white shadow-md shadow-primary/25 transition hover:scale-105"
          aria-label="Open settings"
        >
          {(profile?.name ?? 'GU')
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </Link>
      </div>
      <DepositModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </header>
  );
}
