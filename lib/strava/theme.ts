'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from './config';
import { AppTheme } from './types';

const THEME_CHANGE_EVENT = 'pacecraft-theme-change';

function subscribeTheme(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (media?.addEventListener) {
    media.addEventListener('change', callback);
  }
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    if (media?.removeEventListener) {
      media.removeEventListener('change', callback);
    }
  };
}

export function resolvePreferredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = raw === 'dark' || raw === '"dark"' ? 'dark' : raw === 'light' || raw === '"light"' ? 'light' : null;
      if (parsed) return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function applyThemeToDocument(theme: AppTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function setStoredTheme(nextTheme: AppTheme): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // Ignore storage write errors
  }
  applyThemeToDocument(nextTheme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function useAppTheme(): {
  theme: AppTheme;
  isDark: boolean;
  setTheme: (next: AppTheme) => void;
  toggleTheme: () => void;
} {
  const theme = useSyncExternalStore<AppTheme>(
    subscribeTheme,
    resolvePreferredTheme,
    () => 'light'
  );

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const toggleTheme = () => {
    setStoredTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    isDark: theme === 'dark',
    setTheme: setStoredTheme,
    toggleTheme,
  };
}
