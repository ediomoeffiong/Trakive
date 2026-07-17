/**
 * @file useLocalStorage.js
 * @description Custom hook for syncing state with localStorage.
 */

import { useState, useEffect } from 'react';

/**
 * @template T
 * @param {string} key    localStorage key
 * @param {T}      initialValue
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`[useLocalStorage] Error setting key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
