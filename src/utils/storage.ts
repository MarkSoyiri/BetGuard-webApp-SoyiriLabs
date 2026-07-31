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
