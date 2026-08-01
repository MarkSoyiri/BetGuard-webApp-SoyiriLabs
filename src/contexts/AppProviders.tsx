import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { UserProvider } from './UserContext';
import { BetProvider } from './BetContext';
import { SportsbookProvider } from './SportsbookContext';
import { BudgetProvider } from './BudgetContext';
import { LimitsProvider } from './LimitsContext';
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
              <SportsbookProvider>
                <LimitsProvider>
                  <GoalProvider>
                    <AchievementProvider>
                      <NotificationProvider>
                        <CommunityProvider>{children}</CommunityProvider>
                      </NotificationProvider>
                    </AchievementProvider>
                  </GoalProvider>
                </LimitsProvider>
              </SportsbookProvider>
            </BetProvider>
          </BudgetProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
