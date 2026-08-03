import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { readStorage, writeStorage } from '@/utils/storage';

export function usePersistedState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => readStorage(key, initial));
  const [prevKey, setPrevKey] = useState(key);

  if (prevKey !== key) {
    setPrevKey(key);
    setState(() => readStorage(key, initial));
  }

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);
  return [state, setState];
}
