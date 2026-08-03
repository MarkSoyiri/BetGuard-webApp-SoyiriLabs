import type { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { UserProvider } from './UserContext';
import { WalletProvider } from './WalletContext';
import { OnboardingProvider } from './OnboardingContext';
import { BetProvider } from './BetContext';
import { SportsbookProvider } from './SportsbookContext';
import { BudgetProvider } from './BudgetContext';
import { LimitsProvider } from './LimitsContext';
import { GoalProvider } from './GoalContext';
import { NotificationProvider } from './NotificationContext';
import { CommunityProvider } from './CommunityContext';
import { AchievementProvider } from './AchievementContext';
import { GreenBetProvider } from './GreenBetContext';
import { ChallengeProvider } from './ChallengeContext';
import { ToastProvider } from './ToastContext';
import { PWAProvider } from './PWAContext';
import { PWAChrome } from '@/components/pwa/PWAChrome';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PWAProvider>
      <ThemeProvider>
        <ToastProvider>
          <UserProvider>
            <WalletProvider>
              <OnboardingProvider>
                <BudgetProvider>
                  <BetProvider>
                    <SportsbookProvider>
                      <LimitsProvider>
                        <GoalProvider>
                          <AchievementProvider>
                            <NotificationProvider>
                              <GreenBetProvider>
                                <ChallengeProvider>
                                  <CommunityProvider>
                                    {children}
                                    <PWAChrome />
                                  </CommunityProvider>
                                </ChallengeProvider>
                              </GreenBetProvider>
                            </NotificationProvider>
                          </AchievementProvider>
                        </GoalProvider>
                      </LimitsProvider>
                    </SportsbookProvider>
                  </BetProvider>
                </BudgetProvider>
              </OnboardingProvider>
            </WalletProvider>
          </UserProvider>
        </ToastProvider>
      </ThemeProvider>
    </PWAProvider>
  );
}
