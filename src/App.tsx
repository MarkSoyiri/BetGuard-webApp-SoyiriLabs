import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { PageLoader } from '@/components/ui/PageLoader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const BettingLog = lazy(() => import('@/pages/BettingLog').then((m) => ({ default: m.BettingLog })));
const Sportsbook = lazy(() => import('@/pages/Sportsbook').then((m) => ({ default: m.Sportsbook })));
const Budget = lazy(() => import('@/pages/Budget').then((m) => ({ default: m.Budget })));
const Savings = lazy(() => import('@/pages/Savings').then((m) => ({ default: m.Savings })));
const AICoach = lazy(() => import('@/pages/AICoach').then((m) => ({ default: m.AICoach })));
const Education = lazy(() => import('@/pages/Education').then((m) => ({ default: m.Education })));
const RiskAssessment = lazy(() => import('@/pages/RiskAssessment').then((m) => ({ default: m.RiskAssessment })));
const Challenges = lazy(() => import('@/pages/Challenges').then((m) => ({ default: m.Challenges })));
const GreenBet = lazy(() => import('@/pages/GreenBet').then((m) => ({ default: m.GreenBet })));
const Community = lazy(() => import('@/pages/Community').then((m) => ({ default: m.Community })));
const Statistics = lazy(() => import('@/pages/Statistics').then((m) => ({ default: m.Statistics })));
const Achievements = lazy(() => import('@/pages/Achievements').then((m) => ({ default: m.Achievements })));
const NotificationsPage = lazy(() => import('@/pages/Notifications').then((m) => ({ default: m.NotificationsPage })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));
const Admin = lazy(() => import('@/pages/Admin').then((m) => ({ default: m.Admin })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/betting-log" element={<BettingLog />} />
              <Route path="/sportsbook" element={<Sportsbook />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/coach" element={<AICoach />} />
              <Route path="/education" element={<Education />} />
              <Route path="/risk-assessment" element={<RiskAssessment />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/greenbet" element={<GreenBet />} />
              <Route path="/community" element={<Community />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
