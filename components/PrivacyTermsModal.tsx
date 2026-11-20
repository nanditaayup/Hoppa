'use client';

import React, { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { AppLanguage } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  lang: AppLanguage;
  onClose: () => void;
}

export default function PrivacyTermsModal({
  isOpen,
  lang,
  onClose,
}: PrivacyTermsModalProps) {
  const t = UI_COPY[lang].privacyModal;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 dark:bg-black/70 backdrop-blur-[1px] p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        data-testid="privacy-terms-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="privacy-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                {t.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeAria}
            data-testid="privacy-modal-close"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {t.items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/80 p-4 space-y-1"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-5 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
