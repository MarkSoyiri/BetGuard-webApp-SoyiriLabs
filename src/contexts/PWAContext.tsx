import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { usePersistedState } from '@/hooks/usePersistedState';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface StorageInfo {
  usage: number | null;
  quota: number | null;
  supported: boolean;
}

interface PWAContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  showInstallPrompt: boolean;
  isIOS: boolean;
  installApp: () => Promise<void>;
  dismissInstall: () => void;
  updateAvailable: boolean;
  offlineReady: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
  offline: boolean;
  storageInfo: StorageInfo;
  appVersion: string;
  swActive: boolean;
  cacheEntries: number | null;
  welcomeOpen: boolean;
  closeWelcome: () => void;
  dismissWelcome: () => void;
}

const PWAContext = createContext<PWAContextValue | undefined>(undefined);

const INSTALL_SUPPRESS_MS = 7 * 24 * 60 * 60 * 1000;

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => detectStandalone());
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [offline, setOffline] = useState<boolean>(() => !navigator.onLine);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    usage: null,
    quota: null,
    supported: false,
  });
  const [swActive, setSwActive] = useState<boolean>(() =>
    'serviceWorker' in navigator ? !!navigator.serviceWorker.controller : false,
  );
  const [cacheEntries, setCacheEntries] = useState<number | null>(null);

  const [installDismissedAt, setInstallDismissedAt] = usePersistedState<number | null>(
    'pwa-install-dismissed',
    null,
  );
  const [welcomeDismissed, setWelcomeDismissed] = usePersistedState<boolean>(
    'pwa-welcome-dismissed',
    false,
  );
  const [welcomeShown, setWelcomeShown] = usePersistedState<boolean>('pwa-welcome-shown', false);

  const welcomeDismissedRef = useRef(welcomeDismissed);
  welcomeDismissedRef.current = welcomeDismissed;

  const { offlineReady: [offlineReady], needRefresh, updateServiceWorker } = useRegisterSW();

  const canInstall = deferredPrompt !== null && !isInstalled;
  const showInstallPrompt =
    canInstall &&
    (installDismissedAt === null || Date.now() - installDismissedAt >= INSTALL_SUPPRESS_MS);
  const updateAvailable = needRefresh[0];
  const dismissUpdate = useCallback(() => needRefresh[1](false), [needRefresh]);
  const applyUpdate = useCallback(() => {
    void updateServiceWorker(true);
  }, [updateServiceWorker]);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (!welcomeDismissedRef.current) {
        setWelcomeShown(true);
        setWelcomeOpen(true);
      }
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    const onDisplayMode = (e: MediaQueryListEvent) => setIsInstalled(e.matches);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window
      .matchMedia('(display-mode: standalone)')
      .addEventListener('change', onDisplayMode);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window
        .matchMedia('(display-mode: standalone)')
        .removeEventListener('change', onDisplayMode);
    };
  }, [setWelcomeShown]);

  useEffect(() => {
    if (isInstalled && !welcomeShown && !welcomeDismissed) {
      setWelcomeShown(true);
      setWelcomeOpen(true);
    }
  }, [isInstalled, welcomeShown, welcomeDismissed, setWelcomeShown]);

  useEffect(() => {
    const nav = navigator as Navigator & {
      storage?: { estimate: () => Promise<{ usage: number; quota: number }> };
    };
    if (!nav.storage?.estimate) return;
    setStorageInfo((s) => ({ ...s, supported: true }));
    let cancelled = false;
    nav.storage
      .estimate()
      .then(({ usage, quota }) => {
        if (cancelled) return;
        setStorageInfo({ usage: usage ?? null, quota: quota ?? null, supported: true });
      })
      .catch(() => {
        if (!cancelled) setStorageInfo((s) => ({ ...s, supported: false }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const update = () => setSwActive(!!navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', update);
    update();
    return () => navigator.serviceWorker.removeEventListener('controllerchange', update);
  }, []);

  useEffect(() => {
    if (!('caches' in window)) return;
    let cancelled = false;
    const refresh = () => {
      if (cancelled) return;
      window.caches
        .keys()
        .then((keys) => {
          if (cancelled) return;
          Promise.all(keys.map((k) => window.caches.open(k).then((c) => c.keys()))).then((all) => {
            if (cancelled) return;
            setCacheEntries(all.reduce((sum, list) => sum + list.length, 0));
          });
        })
        .catch(() => {});
    };
    refresh();
    return () => {
      cancelled = true;
    };
  }, [offlineReady]);

  const installApp = useCallback(async () => {
    const prompt = deferredPrompt;
    if (!prompt) return;
    prompt.prompt();
    setDeferredPrompt(null);
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    setInstallDismissedAt(Date.now());
  }, [setInstallDismissedAt]);

  const closeWelcome = useCallback(() => {
    setWelcomeShown(true);
    setWelcomeOpen(false);
  }, [setWelcomeShown]);

  const dismissWelcome = useCallback(() => {
    setWelcomeDismissed(true);
    setWelcomeShown(true);
    setWelcomeOpen(false);
  }, [setWelcomeDismissed, setWelcomeShown]);

  const value: PWAContextValue = {
    canInstall,
    isInstalled,
    showInstallPrompt,
    isIOS: detectIOS(),
    installApp,
    dismissInstall,
    updateAvailable,
    offlineReady,
    applyUpdate,
    dismissUpdate,
    offline,
    storageInfo,
    appVersion: __APP_VERSION__,
    swActive,
    cacheEntries,
    welcomeOpen,
    closeWelcome,
    dismissWelcome,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
}

export function usePWA(): PWAContextValue {
  const ctx = useContext(PWAContext);
  if (!ctx) throw new Error('usePWA must be used within PWAProvider');
  return ctx;
}
