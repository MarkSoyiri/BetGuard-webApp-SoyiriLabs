import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { UserProfile } from '@/types';

interface UserContextValue {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  register: (profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const GUEST_PROFILE: UserProfile = {
  name: 'Guest',
  email: 'guest@betguard.app',
  age: 24,
  occupation: 'Student',
  monthlyIncome: 2500,
  riskLevel: null,
  joinedAt: new Date().toISOString(),
  notificationsEnabled: true,
  isAdmin: true,
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = usePersistedState<UserProfile | null>('user', null);
  const [authed, setAuthed] = usePersistedState<boolean>('authed', false);

  const login = useCallback(
    (email: string, _password: string): boolean => {
      const demo = GUEST_PROFILE;
      setProfile((prev) => {
        if (prev) return prev;
        return { ...demo, email, name: 'Alex Mensah' };
      });
      setAuthed(true);
      return true;
    },
    [setProfile, setAuthed],
  );

  const register = useCallback(
    (p: UserProfile) => {
      setProfile(p);
      setAuthed(true);
    },
    [setProfile, setAuthed],
  );

  const logout = useCallback(() => {
    setAuthed(false);
  }, [setAuthed]);

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [setProfile],
  );

  const isAuthenticated = Boolean(profile && authed);
  const isAdmin = Boolean(profile?.isAdmin);

  return (
    <UserContext.Provider
      value={{ profile, isAuthenticated, isAdmin, login, register, logout, updateProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
