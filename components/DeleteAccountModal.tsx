'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { AppLanguage } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';

interface DeleteAccountModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
  lang: AppLanguage;
  onCancel: () => void;
  onConfirmDelete: () => Promise<void>;
}

export default function DeleteAccountModal({
  isOpen,
  isDeleting,
  errorMessage,
  lang,
  onCancel,
  onConfirmDelete,
}: DeleteAccountModalProps) {
  const t = UI_COPY[lang].accountSecurity;
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        setConfirmText('');
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  const isMatched =
    confirmText.trim().toUpperCase() === t.confirmKeyword.toUpperCase();

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText('');
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 dark:bg-black/70 backdrop-blur-[1px] p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-modal-title"
        data-testid="delete-account-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="delete-account-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                {t.modalTitle}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            aria-label={UI_COPY[lang].detailModal.closeAria}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.modalDesc}
        </p>

        <div className="space-y-2">
          <label
            htmlFor="confirm-delete-account-input"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            {t.inputLabel(t.confirmKeyword)}
          </label>
          <input
            id="confirm-delete-account-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t.inputPlaceholder}
            disabled={isDeleting}
            data-testid="delete-account-confirm-input"
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/70 text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
          />
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="text-xs text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl px-3.5 py-2.5"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {t.cancelBtn}
          </button>
          <button
            type="button"
            onClick={() => void onConfirmDelete()}
            disabled={!isMatched || isDeleting}
            data-testid="delete-account-confirm-btn"
            className="min-h-[42px] px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 disabled:opacity-45 disabled:cursor-not-allowed inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isDeleting ? t.deletingBtn : t.confirmDeleteBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
