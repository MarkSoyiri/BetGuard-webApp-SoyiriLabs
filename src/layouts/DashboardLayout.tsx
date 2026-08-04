import { Suspense, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { PageContentLoader } from '@/components/ui/PageLoader';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { prefetchAllPages } from '@/utils/pagePrefetch';
import { useUser } from '@/contexts/UserContext';
import { BudgetPrompt } from '@/components/onboarding/BudgetPrompt';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

const SPORTSBOOK_FAB_PAGES = ['/dashboard', '/statistics', '/betting-log', '/budget', '/coach'];

export function DashboardLayout() {
  const { isAuthenticated } = useUser();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const showSportsbookFab = SPORTSBOOK_FAB_PAGES.includes(location.pathname);

  useEffect(() => {
    const t = window.setTimeout(prefetchAllPages, 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="relative flex-1 px-4 py-6 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense fallback={<PageContentLoader />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="border-t border-slate-200/60 px-4 py-4 text-center text-xs text-slate-400 dark:border-slate-700/60">
          BetGuard — responsible betting companion · Demo data is stored locally in your browser
        </footer>
      </div>
      {showSportsbookFab && (
        <FloatingActionButton
          icon={Ticket}
          to="/sportsbook"
          label="Sportsbook"
          className="md:hidden"
        />
      )}
      <BudgetPrompt />
      <OnboardingFlow />
    </div>
  );
}
