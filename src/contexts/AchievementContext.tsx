import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { sampleAchievements } from '@/data/sample';
import type { Achievement } from '@/types';
import { uid } from '@/utils/format';

interface AchievementContextValue {
  achievements: Achievement[];
  unlockedCount: number;
  unlock: (id: string) => boolean;
  addAchievement: (title: string, description: string, icon?: string) => void;
  resetAchievements: () => void;
}

const AchievementContext = createContext<AchievementContextValue | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = usePersistedState<Achievement[]>(
    'achievements',
    sampleAchievements(),
  );

  useEffect(() => {
    setAchievements((prev) => {
      const known = new Set(prev.map((a) => a.id));
      const missing = sampleAchievements().filter((a) => !known.has(a.id));
      return missing.length === 0 ? prev : [...prev, ...missing];
    });
  }, [setAchievements]);

  const unlock = useCallback(
    (id: string): boolean => {
      let unlocked = false;
      setAchievements((prev) =>
        prev.map((a) => {
          if (a.id === id && !a.unlocked) {
            unlocked = true;
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        }),
      );
      return unlocked;
    },
    [setAchievements],
  );

  const addAchievement = useCallback(
    (title: string, description: string, icon = 'award') => {
      setAchievements((prev) => {
        if (prev.some((a) => a.title === title)) return prev;
        return [
          ...prev,
          {
            id: uid('ach'),
            title,
            description,
            icon,
            tier: 'bronze',
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          },
        ];
      });
    },
    [setAchievements],
  );

  const resetAchievements = useCallback(() => {
    setAchievements(sampleAchievements());
  }, [setAchievements]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <AchievementContext.Provider
      value={{ achievements, unlockedCount, unlock, addAchievement, resetAchievements }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements(): AchievementContextValue {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error('useAchievements must be used within AchievementProvider');
  return ctx;
}
