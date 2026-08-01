const loaders: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/pages/Dashboard'),
  '/statistics': () => import('@/pages/Statistics'),
  '/betting-log': () => import('@/pages/BettingLog'),
  '/sportsbook': () => import('@/pages/Sportsbook'),
  '/budget': () => import('@/pages/Budget'),
  '/savings': () => import('@/pages/Savings'),
  '/challenges': () => import('@/pages/Challenges'),
  '/greenbet': () => import('@/pages/GreenBet'),
  '/coach': () => import('@/pages/AICoach'),
  '/education': () => import('@/pages/Education'),
  '/risk-assessment': () => import('@/pages/RiskAssessment'),
  '/community': () => import('@/pages/Community'),
  '/achievements': () => import('@/pages/Achievements'),
  '/notifications': () => import('@/pages/Notifications'),
  '/settings': () => import('@/pages/Settings'),
  '/admin': () => import('@/pages/Admin'),
};

export function prefetchPage(path: string): void {
  loaders[path]?.().catch(() => {});
}

export function prefetchAllPages(): void {
  for (const loader of Object.values(loaders)) {
    loader().catch(() => {});
  }
}
