'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  CalendarCheck2,
  Flame,
  Languages,
  Lock,
  LogIn,
} from 'lucide-react';
import { AppLanguage } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { AuthErrorCode } from './AuthProvider';
import PrivacyTermsModal from './PrivacyTermsModal';
import ThemeToggle from './ThemeToggle';

interface LoginGateScreenProps {
  lang: AppLanguage;
  authBusy: boolean;
  authErrorCode: AuthErrorCode;
  onChangeLang: (lang: AppLanguage) => void;
  onSignInGoogle: () => void;
}

export default function LoginGateScreen({
  lang,
  authBusy,
  authErrorCode,
  onChangeLang,
  onSignInGoogle,
}: LoginGateScreenProps) {
  const t = UI_COPY[lang];
  const shouldReduceMotion = useReducedMotion();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const authErrorText =
    authErrorCode === 'popup_closed'
      ? t.auth.popupClosedError
      : authErrorCode === 'popup_blocked'
        ? t.auth.popupBlockedError
        : authErrorCode === 'generic'
          ? t.auth.genericAuthError
          : null;

  return (
    <div
      data-testid="login-gate-screen"
      className="min-h-screen bg-[#F7F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col"
    >
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-[#F7F9FA]/95 dark:bg-slate-950/90 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            PaceCraft
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle lang={lang} testId="login-theme-toggle" />

          <div
            role="group"
            aria-label={t.nav.languageGroupLabel}
            data-testid="login-language-switcher"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0"
          >
            <Languages
              className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 ml-1.5 mr-0.5 shrink-0"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => onChangeLang('id')}
              data-testid="login-lang-btn-id"
              aria-pressed={lang === 'id'}
              className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                lang === 'id'
                  ? 'bg-teal-700 dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.nav.idButton}
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              data-testid="login-lang-btn-en"
              aria-pressed={lang === 'en'}
              className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                lang === 'en'
                  ? 'bg-teal-700 dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.nav.enButton}
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Auth Split */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
          className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left Narrative Card */}
          <section className="order-2 lg:order-1 lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#EAF6F3] via-[#F4F8FB] to-[#EEF2FB] dark:from-teal-950/60 dark:via-slate-900 dark:to-indigo-950/50 border border-teal-100/90 dark:border-teal-800/60 p-6 sm:p-8 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-teal-800 dark:text-teal-300 tracking-wide">
                {t.auth.loginEyebrow}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug text-balance">
                {t.auth.loginTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {t.auth.loginSubtitle}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-teal-200/60 dark:border-teal-800/50">
              <div className="flex items-start gap-3">
                <CalendarCheck2
                  className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.auth.feature1Title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    {t.auth.feature1Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Flame
                  className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.auth.feature2Title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    {t.auth.feature2Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity
                  className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.auth.feature3Title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    {t.auth.feature3Desc}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Google Sign-In Card */}
          <section className="order-1 lg:order-2 lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {t.auth.cardTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.auth.cardSubtitle}
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={onSignInGoogle}
                disabled={authBusy}
                data-testid="google-signin-btn"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
              >
                <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  {authBusy ? t.auth.signingInBtn : t.auth.googleBtn}
                </span>
              </button>

              {authErrorText && (
                <div
                  role="alert"
                  data-testid="auth-error-banner"
                  className="rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-4 py-3 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 leading-relaxed"
                >
                  <AlertCircle
                    className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{authErrorText}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <Lock className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{t.auth.privacyNote}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                data-testid="login-privacy-btn"
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 rounded"
              >
                {t.privacyModal.linkLabel}
              </button>
            </div>
          </section>
        </motion.div>
      </main>

      <PrivacyTermsModal
        isOpen={isPrivacyOpen}
        lang={lang}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
