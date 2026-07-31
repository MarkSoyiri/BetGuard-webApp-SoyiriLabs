import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { sampleNotifications } from '@/data/sample';
import type { AppNotification, NotificationType } from '@/types';
import { uid } from '@/utils/format';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationType) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  resetNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = usePersistedState<AppNotification[]>(
    'notifications',
    sampleNotifications(),
  );

  const addNotification = useCallback(
    (title: string, message: string, type: NotificationType = 'info') => {
      setNotifications((prev) => [
        { id: uid('nt'), type, title, message, date: new Date().toISOString(), read: false },
        ...prev,
      ]);
    },
    [setNotifications],
  );

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [setNotifications],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const removeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotifications],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const resetNotifications = useCallback(() => {
    setNotifications(sampleNotifications());
  }, [setNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
        removeNotification,
        clearAll,
        resetNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
