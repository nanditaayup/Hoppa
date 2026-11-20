'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { AppLanguage } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { useAppTheme } from '@/lib/strava/theme';

interface ThemeToggleProps {
  lang: AppLanguage;
  testId?: string;
}

export default function ThemeToggle({
  lang,
  testId = 'theme-toggle-btn',
}: ThemeToggleProps) {
  const { isDark, toggleTheme } = useAppTheme();
  const t = UI_COPY[lang].theme;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid={testId}
      aria-pressed={isDark}
      aria-label={isDark ? t.ariaToLight : t.ariaToDark}
      title={isDark ? t.ariaToLight : t.ariaToDark}
      className="min-h-[38px] px-2.5 sm:px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-800 dark:hover:text-teal-300 transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-hidden="true" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">
        {isDark ? t.lightShort : t.darkShort}
      </span>
    </button>
  );
}
