import { useMemo } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  ListChecks,
  Wallet,
  PiggyBank,
  Bot,
  GraduationCap,
  Activity,
  Trophy,
  Users,
  Sparkles,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  Ticket,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Statistics', path: '/statistics', icon: BarChart3 },
    ],
  },
  {
    title: 'Tracking',
    items: [
      { label: 'Betting Log', path: '/betting-log', icon: ListChecks },
      { label: 'Sportsbook', path: '/sportsbook', icon: Ticket },
      { label: 'Budget', path: '/budget', icon: Wallet },
      { label: 'Savings Goals', path: '/savings', icon: PiggyBank },
      { label: 'Challenges', path: '/challenges', icon: Trophy },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'AI Coach', path: '/coach', icon: Bot },
      { label: 'Education', path: '/education', icon: GraduationCap },
      { label: 'Risk Assessment', path: '/risk-assessment', icon: Activity },
      { label: 'Community', path: '/community', icon: Users },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Achievements', path: '/achievements', icon: Sparkles },
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export const ADMIN_ITEM: NavItem = {
  label: 'Admin Dashboard',
  path: '/admin',
  icon: ShieldCheck,
};

export function useActiveSection(pathname: string) {
  return useMemo(() => {
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (pathname.startsWith(item.path)) return item;
      }
    }
    return undefined;
  }, [pathname]);
}

export { LogOut };
