'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AppLanguage } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';

interface DisconnectModalProps {
  isOpen: boolean;
  hasStravaOAuth: boolean;
  runsCount: number;
  lang: AppLanguage;
  onCancel: () => void;
  onConfirmClear: () => void;
}

export default function DisconnectModal({
  isOpen,
  hasStravaOAuth,
  runsCount,
  lang,
  onCancel,
  onConfirmClear,
}: DisconnectModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const t = UI_COPY[lang].disconnectModal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-[2px] p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disconnect-modal-title"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2
              id="disconnect-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {hasStravaOAuth ? t.titleOAuth : t.titleLocal}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t.closeAria}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.bodyBeforeCount}{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {runsCount}
          </span>{' '}
          {t.bodyMiddleLocal}
          {hasStravaOAuth ? t.bodyOAuthAddon : '.'}
          {t.bodyAfter}
        </p>

        <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            {t.cancelBtn}
          </button>
          <button
            type="button"
            onClick={onConfirmClear}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
          >
            {t.confirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
