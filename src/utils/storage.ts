const PREFIX = 'betguard:';

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw != null) return JSON.parse(raw) as T;
  } catch {
    // ignore malformed data
  }
  return fallback;
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage may be full or unavailable — fail silently for PoC
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export function clearAllStorage(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export function exportAllStorage(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => {
        try {
          data[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k) ?? 'null');
        } catch {
          data[k.slice(PREFIX.length)] = localStorage.getItem(k);
        }
      });
  } catch {
    // ignore
  }
  return data;
}

export function importAllStorage(data: Record<string, unknown>): string[] {
  const imported: string[] = [];
  Object.entries(data).forEach(([key, value]) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      imported.push(key);
    } catch {
      // ignore invalid entries
    }
  });
  return imported;
}

const LEGACY_USER_KEYS = [
  'bets',
  'budget',
  'limits',
  'goals',
  'achievements',
  'notifications',
  'green-contributions',
  'green-projects',
  'green-points',
  'green-challenges-completed',
  'green-enabled',
  'challenge-awards',
  'challenge-articles',
  'challenge-quiz-best',
  'challenge-savings',
  'challenge-interventions',
  'challenge-healthy',
  'challenge-green-high',
  'challenge-green-best',
  'challenge-cooldowns',
  'challenge-coach',
  'sportsbook-slips',
  'chat',
];

export function migrateLegacyDemoData(): void {
  try {
    if (localStorage.getItem(PREFIX + 'demo:bets') != null) return;
    let migrated = 0;
    LEGACY_USER_KEYS.forEach((key) => {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw == null) return;
      localStorage.setItem(PREFIX + 'demo:' + key, raw);
      migrated += 1;
    });
    if (migrated > 0) localStorage.setItem(PREFIX + 'migrated-v1', String(migrated));
  } catch {
    // storage may be unavailable — fail silently
  }
}
