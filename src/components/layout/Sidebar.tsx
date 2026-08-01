import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LogOut, ChevronsLeft, ChevronsRight, Sparkles } from 'lucide-react';
import { ADMIN_ITEM, NAV_SECTIONS } from './nav';
import { prefetchPage } from '@/utils/pagePrefetch';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}) {
  const { profile, logout, isAdmin } = useUser();
  const { unreadCount } = useNotifications();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast('You have been signed out. Stay in control!', 'info');
    onNavigate?.();
  };

  const initials = (profile?.name ?? 'GU')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/60 px-5 dark:border-slate-700/60">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
          <ShieldCheck className="size-5 text-white" aria-hidden="true" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-tight text-ink dark:text-white">
            BetGuard
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="ml-auto hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 md:block dark:hover:bg-slate-800"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const unread = item.path === '/notifications' ? unreadCount : 0;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onNavigate}
                      onMouseEnter={() => prefetchPage(item.path)}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-primary dark:text-primary-light'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                        } ${collapsed ? 'justify-center' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="sidebar-active"
                              className="absolute inset-0 rounded-xl bg-primary/10 dark:bg-primary-light/15"
                              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            />
                          )}
                          <Icon
                            className="relative size-5 shrink-0 transition-transform group-hover:scale-110"
                            aria-hidden="true"
                          />
                          {!collapsed && (
                            <span className="relative">{item.label}</span>
                          )}
                          {unread > 0 && (
                            <span
                              className={`relative flex size-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white ${
                                collapsed ? 'absolute -right-1 -top-1' : 'ml-auto'
                              }`}
                            >
                              {unread}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Platform
              </p>
            )}
            <NavLink
              to={ADMIN_ITEM.path}
              onClick={onNavigate}
              onMouseEnter={() => prefetchPage(ADMIN_ITEM.path)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary dark:text-primary-light'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <ADMIN_ITEM.icon className="size-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span>{ADMIN_ITEM.label}</span>}
            </NavLink>
          </div>
        )}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-slate-200/60 p-3 dark:border-slate-700/60">
        {!collapsed && (
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 p-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light font-display text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink dark:text-white">
                {profile?.name ?? 'Guest User'}
              </p>
              <p className="truncate text-xs text-slate-400">{profile?.email}</p>
            </div>
          </div>
        )}
        <div className={`flex gap-2 ${collapsed ? 'flex-col' : ''}`}>
          <button
            onClick={toggleTheme}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Toggle theme"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {!collapsed && (theme === 'light' ? 'Dark mode' : 'Light mode')}
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-xs font-semibold text-danger transition hover:bg-danger/20"
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      <aside
        className={`hidden shrink-0 flex-col border-r border-slate-200/60 bg-white/70 backdrop-blur-xl transition-all duration-300 md:flex dark:border-slate-700/60 dark:bg-slate-900/70 ${
          collapsed ? 'w-20' : 'w-64'
        } sticky top-0 h-screen`}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl dark:bg-slate-900"
          >
            <SidebarContent collapsed={false} onToggleCollapse={onToggleCollapse} onNavigate={onCloseMobile} />
          </motion.aside>
        </div>
      )}
    </>
  );
}
