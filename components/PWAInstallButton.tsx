'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  PlusSquare,
  Share,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '@/hooks/usePWAInstall';
import { UI_COPY } from '@/lib/strava/i18n';
import { AppLanguage } from '@/lib/strava/types';

interface PWAInstallButtonProps {
  lang: AppLanguage;
  variant?: 'compact' | 'banner';
  testId?: string;
}

export function PWAInstallButton({
  lang,
  variant = 'compact',
  testId = 'pwa-install-btn',
}: PWAInstallButtonProps) {
  const { isInstalled, isIos, canPromptNative, triggerNativeInstall } =
    usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const t = UI_COPY[lang].pwa;

  useEffect(() => {
    if (!showGuideModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuideModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showGuideModal]);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    if (canPromptNative) {
      const outcome = await triggerNativeInstall();
      if (outcome !== 'unavailable') return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      {variant === 'banner' ? (
        <div
          data-testid="pwa-install-banner"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.bannerTitle}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.bannerDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleInstallClick()}
            data-testid={testId}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t.installBtn}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void handleInstallClick()}
          data-testid={testId}
          className="min-h-[40px] px-3.5 py-2 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/80 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{t.installBtn}</span>
        </button>
      )}

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 dark:bg-black/70 backdrop-blur-[1px] p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-modal-title"
            data-testid="pwa-guide-modal"
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="pwa-guide-modal-title"
                    className="text-base font-bold text-slate-900 dark:text-slate-100"
                  >
                    {t.guideTitle}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {isIos ? t.iosSubtitle : t.androidSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label={t.closeAria}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              {isIos ? (
                <>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 flex items-start gap-3">
                    <Share
                      className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{t.iosStep1}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 flex items-start gap-3">
                    <PlusSquare
                      className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{t.iosStep2}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 flex items-start gap-3">
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{t.iosStep3}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 flex items-start gap-3">
                    <Smartphone
                      className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{t.androidStep1}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 flex items-start gap-3">
                    <PlusSquare
                      className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{t.androidStep2}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function OfflineIndicator({ lang }: { lang: AppLanguage }) {
  const isOnline = useOnlineStatus();
  const t = UI_COPY[lang].pwa;

  if (isOnline) return null;

  return (
    <div
      role="status"
      data-testid="offline-indicator"
      className="rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-950 dark:text-amber-200"
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{t.offlineNotice}</span>
    </div>
  );
}
