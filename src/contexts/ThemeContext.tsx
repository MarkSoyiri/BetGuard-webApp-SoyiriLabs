import { createContext, useContext, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = usePersistedState<Theme>('theme', 'light');

  const applyTheme = (t: Theme) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Apply on first mount
  applyTheme(theme);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
