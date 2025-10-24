/**
 * Storage utilities for localStorage and sessionStorage
 */

import React from "react";

export type StorageType = "localStorage" | "sessionStorage";

/**
 * Safe storage operations with error handling
 */
export const createStorage = (type: StorageType) => {
  const storage =
    type === "localStorage" ? window.localStorage : window.sessionStorage;

  return {
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = storage.getItem(key);
        if (item === null) return defaultValue ?? null;
        return JSON.parse(item);
      } catch (error) {
        console.error(`Error reading from ${type}:`, error);
        return defaultValue ?? null;
      }
    },

    set: <T>(key: string, value: T): boolean => {
      try {
        storage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`Error writing to ${type}:`, error);
        return false;
      }
    },

    remove: (key: string): boolean => {
      try {
        storage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Error removing from ${type}:`, error);
        return false;
      }
    },

    clear: (): boolean => {
      try {
        storage.clear();
        return true;
      } catch (error) {
        console.error(`Error clearing ${type}:`, error);
        return false;
      }
    },

    exists: (key: string): boolean => {
      return storage.getItem(key) !== null;
    },

    keys: (): string[] => {
      try {
        return Object.keys(storage);
      } catch (error) {
        console.error(`Error getting keys from ${type}:`, error);
        return [];
      }
    },
  };
};

export const localStorage = createStorage("localStorage");
export const sessionStorage = createStorage("sessionStorage");

/**
 * Hook for localStorage with React state synchronization
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = localStorage.get<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.set(key, valueToStore);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = React.useCallback(() => {
    try {
      setStoredValue(initialValue);
      localStorage.remove(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

/**
 * Hook for sessionStorage with React state synchronization
 */
export const useSessionStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = sessionStorage.get<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        sessionStorage.set(key, valueToStore);
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = React.useCallback(() => {
    try {
      setStoredValue(initialValue);
      sessionStorage.remove(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};
