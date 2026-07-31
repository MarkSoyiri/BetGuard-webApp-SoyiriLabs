import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { UserProvider } from './UserContext';
import { BetProvider } from './BetContext';
import { BudgetProvider } from './BudgetContext';
import { GoalProvider } from './GoalContext';
import { NotificationProvider } from './NotificationContext';
import { CommunityProvider } from './CommunityContext';
import { AchievementProvider } from './AchievementContext';
import { ToastProvider } from './ToastContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <UserProvider>
          <BudgetProvider>
            <BetProvider>
              <GoalProvider>
                <AchievementProvider>
                  <NotificationProvider>
                    <CommunityProvider>{children}</CommunityProvider>
                  </NotificationProvider>
                </AchievementProvider>
              </GoalProvider>
            </BetProvider>
          </BudgetProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
