'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  CalendarCheck2,
  Check,
  ChevronDown,
  Flame,
  KeyRound,
  Languages,
  Lock,
  LogIn,
  Minus,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import heroRunnerImg from '@/src/assets/images/hero_runner_dawn_1795518781622.jpg';
import {
  COMMERCIAL_PLANS,
  PRICING_COMPARISON_ROWS,
  getCommercialSellerConfig,
} from '@/lib/billing/commercial-config';
import {
  normalizeAccessCode,
  PENDING_LICENSE_KEY_SESSION_KEY,
} from '@/lib/billing/license-format';
import { UI_COPY } from '@/lib/strava/i18n';
import { AccessPlanType, AppLanguage, RaceDistanceKey } from '@/lib/strava/types';
import { AuthErrorCode } from './AuthProvider';
import { SELECTED_PLAN_SESSION_KEY } from './PaymentAccessGate';
import PaceCalculator from './PaceCalculator';
import PrivacyTermsModal from './PrivacyTermsModal';
import { PWAInstallButton } from './PWAInstallButton';
import ThemeToggle from './ThemeToggle';

export interface LandingPageProps {
  lang: AppLanguage;
  authBusy: boolean;
  authErrorCode: AuthErrorCode;
  onChangeLang: (lang: AppLanguage) => void;
  onSignInGoogle: () => void;
  onOpenDemo?: () => void;
}

export default function LandingPage({
  lang,
  authBusy,
  authErrorCode,
  onChangeLang,
  onSignInGoogle,
  onOpenDemo,
}: LandingPageProps) {
  const t = UI_COPY[lang];
  const L = t.landing;
  const shouldReduceMotion = useReducedMotion();
  const sellerConfig = getCommercialSellerConfig();

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<AccessPlanType>('lifetime');
  const [demoAppliedNotice, setDemoAppliedNotice] = useState(false);

  const handleStartGoogleSignIn = () => {
    if (typeof window !== 'undefined') {
      try {
        const cleaned = normalizeAccessCode(licenseKey);
        if (cleaned.length > 0) {
          window.sessionStorage.setItem(
            PENDING_LICENSE_KEY_SESSION_KEY,
            cleaned
          );
        } else {
          window.sessionStorage.removeItem(PENDING_LICENSE_KEY_SESSION_KEY);
        }
        window.sessionStorage.setItem(SELECTED_PLAN_SESSION_KEY, selectedPlan);
      } catch {
        // Ignore sessionStorage restriction
      }
    }
    onSignInGoogle();
  };

  const scrollToSection = (sectionId: string) => {
    if (typeof document === 'undefined') return;
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectPricingPlan = (plan: AccessPlanType) => {
    setSelectedPlan(plan);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(SELECTED_PLAN_SESSION_KEY, plan);
      } catch {
        // Ignore storage error
      }
    }
    scrollToSection('masuk-aktivasi');
  };

  const handleDemoApply = (_race: RaceDistanceKey, _paceSecPerKm: number) => {
    setDemoAppliedNotice(true);
    scrollToSection('masuk-aktivasi');
  };

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
      {/* Clean Sticky Navigation Header (<=15% mobile height, zero wrap) */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-[#F7F9FA]/95 dark:bg-slate-950/90 backdrop-blur-sm flex items-center justify-between gap-2 sm:gap-3">
        <a
          href="#"
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
        >
          PaceCraft
        </a>

        <nav
          aria-label="Landing sections"
          className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300"
        >
          <a
            href="#fitur"
            className="hover:text-teal-700 dark:hover:text-teal-400 whitespace-nowrap"
          >
            {L.navFeatures}
          </a>
          <a
            href="#kalkulator-demo"
            className="hover:text-teal-700 dark:hover:text-teal-400 whitespace-nowrap"
          >
            {L.navDemo}
          </a>
          <a
            href="#harga"
            className="hover:text-teal-700 dark:hover:text-teal-400 whitespace-nowrap"
          >
            {L.navPricing}
          </a>
          <a
            href="#faq"
            className="hover:text-teal-700 dark:hover:text-teal-400 whitespace-nowrap"
          >
            {L.navFaq}
          </a>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle lang={lang} testId="login-theme-toggle" />

          <div
            role="group"
            aria-label={t.nav.languageGroupLabel}
            data-testid="login-language-switcher"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0"
          >
            <Languages
              className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 ml-1.5 mr-0.5 shrink-0 hidden sm:inline"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => onChangeLang('id')}
              data-testid="login-lang-btn-id"
              aria-pressed={lang === 'id'}
              className={`min-h-[30px] px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
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
              className={`min-h-[30px] px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                lang === 'en'
                  ? 'bg-teal-700 dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.nav.enButton}
            </button>
          </div>

          {onOpenDemo && (
            <button
              type="button"
              onClick={onOpenDemo}
              data-testid="nav-open-demo-btn"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold hover:border-teal-400 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
            >
              <Play className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Demo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => scrollToSection('masuk-aktivasi')}
            className="hidden sm:inline-flex items-center justify-center min-h-[38px] px-3.5 py-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            {L.navLoginBtn}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-16">
        {/* 1. Above-the-Fold Hero + Sign In / License Key Card */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left Commercial Hero */}
          <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#EAF6F3] via-[#F4F8FB] to-[#EEF2FB] dark:from-teal-950/60 dark:via-slate-900 dark:to-indigo-950/50 border border-teal-100/90 dark:border-teal-800/60 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/85 dark:bg-slate-800/90 border border-teal-200/80 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-300">
                <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{L.heroBadge}</span>
              </span>

              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight text-balance">
                {L.heroTitle}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {L.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {onOpenDemo && (
                  <button
                    type="button"
                    onClick={onOpenDemo}
                    data-testid="landing-open-demo-btn"
                    className="min-h-[46px] px-5 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
                  >
                    <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{L.heroOpenDemoCta}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => scrollToSection('kalkulator-demo')}
                  data-testid="landing-try-demo-btn"
                  className={`min-h-[46px] px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                    onOpenDemo
                      ? 'bg-white dark:bg-slate-800 border border-teal-200 dark:border-slate-700 text-teal-900 dark:text-slate-100 hover:border-teal-400'
                      : 'bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800 dark:hover:bg-teal-500'
                  }`}
                >
                  <span>{L.heroDemoCta}</span>
                  <ArrowDown className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('harga')}
                  data-testid="landing-view-pricing-btn"
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold hover:border-teal-400 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
                >
                  <span>{L.heroBuyCta}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-teal-200/70 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                <Image
                  src={heroRunnerImg}
                  alt={L.heroImageAlt}
                  priority
                  referrerPolicy="no-referrer"
                  className="w-full h-44 sm:h-56 object-cover object-center"
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Activity
                    className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400"
                    aria-hidden="true"
                  />
                  {L.trust1}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone
                    className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400"
                    aria-hidden="true"
                  />
                  {L.trust2}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck
                    className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400"
                    aria-hidden="true"
                  />
                  {L.trust3}
                </span>
              </div>
            </div>
          </div>

          {/* Right Google Sign-In & Single-Use License Key Card */}
          <div
            id="masuk-aktivasi"
            className="lg:col-span-5 lg:self-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 scroll-mt-20"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {t.auth.cardTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.auth.cardSubtitle}
              </p>
            </div>

            {demoAppliedNotice && (
              <div
                role="status"
                data-testid="landing-demo-applied-banner"
                className="rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3.5 py-2.5 text-xs text-teal-900 dark:text-teal-200 leading-relaxed"
              >
                {L.demoAppliedHint}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="login-license-key-input"
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  <KeyRound
                    className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t.auth.licenseKeyLabel}</span>
                </label>
                <input
                  id="login-license-key-input"
                  data-testid="login-license-key-input"
                  type="text"
                  maxLength={64}
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder={t.auth.licenseKeyPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm font-mono uppercase text-slate-900 dark:text-slate-100 placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
                />
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.auth.licenseKeyHint}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartGoogleSignIn}
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

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <Lock
                  className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{t.auth.privacyNote}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  data-testid="login-privacy-btn"
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  {t.privacyModal.linkLabel}
                </button>
                <PWAInstallButton lang={lang} testId="landing-pwa-install-btn" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. Visual Feature Showcase */}
        <section
          id="fitur"
          data-testid="landing-feature-showcase"
          className="space-y-6 scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight text-balance">
                {L.showcaseHeading}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {L.showcaseSubtitle}
              </p>
            </div>

            {onOpenDemo && (
              <button
                type="button"
                onClick={onOpenDemo}
                data-testid="showcase-open-demo-btn"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs sm:text-sm font-semibold hover:border-teal-400 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
              >
                <Play className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{L.showcaseTryDemoBtn}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {L.showcaseCards.map((card, idx) => {
              const Icon =
                idx === 0
                  ? CalendarCheck2
                  : idx === 1
                    ? Flame
                    : Activity;
              return (
                <article
                  key={card.title}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                        {card.badge}
                      </span>
                      <Icon
                        className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {card.highlightLabel}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-teal-800 dark:text-teal-300 text-right">
                      {card.highlightValue}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 3. Free No-Login Interactive Pace Calculator & Full App Demo */}
        <section
          id="kalkulator-demo"
          data-testid="landing-pace-demo-section"
          className="space-y-5 scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight text-balance">
                {L.demoHeading}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {L.demoSubtitle}
              </p>
            </div>

            {onOpenDemo && (
              <button
                type="button"
                onClick={onOpenDemo}
                data-testid="landing-demo-section-btn"
                className="min-h-[46px] px-5 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
              >
                <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{L.demoOpenFullBtn}</span>
              </button>
            )}
          </div>

          <PaceCalculator
            initialRace="10K"
            activeCustomPaceSecPerKm={null}
            lang={lang}
            applyButtonLabel={L.demoApplyCta}
            onApplyTargetPace={handleDemoApply}
            onResetCustomPace={() => setDemoAppliedNotice(false)}
          />
        </section>

        {/* 4. Pricing Cards + Clear Lifetime vs Annual Comparison Table */}
        <section
          id="harga"
          data-testid="landing-pricing-section"
          className="space-y-8 scroll-mt-20"
        >
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight text-balance">
              {L.pricingHeading}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {L.pricingSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {(['lifetime', 'pro'] as const).map((planKey) => {
              const plan = COMMERCIAL_PLANS[planKey];
              const isSelected = selectedPlan === planKey;
              return (
                <div
                  key={planKey}
                  data-testid={`pricing-card-${planKey}`}
                  className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between gap-6 transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#EAF6F3] via-white to-[#EEF2FB] dark:from-teal-950/60 dark:via-slate-900 dark:to-indigo-950/40 border-teal-500 dark:border-teal-500 ring-1 ring-teal-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {plan.title[lang]}
                      </h3>
                      {plan.badge && (
                        <span className="px-2.5 py-1 rounded-lg bg-teal-700 dark:bg-teal-600 text-white text-xs font-semibold whitespace-nowrap shrink-0">
                          {plan.badge[lang]}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                          {plan.priceLabel}
                        </span>
                        <span className="text-sm font-mono tabular-nums line-through text-slate-400">
                          {plan.originalPriceLabel}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                        {plan.billingPeriod[lang]}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {plan.summary[lang]}
                    </p>

                    <ul className="space-y-2.5 pt-2">
                      {plan.features[lang].map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
                        >
                          <Check
                            className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPricingPlan(planKey)}
                    data-testid={`select-plan-btn-${planKey}`}
                    className={`w-full min-h-[46px] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                      isSelected
                        ? 'bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800'
                        : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-teal-400'
                    }`}
                  >
                    {isSelected ? L.pricingSelectedBtn : L.pricingSelectBtn}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Side-by-Side Plan Comparison Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {L.comparisonTableHeading}
              </h3>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {COMMERCIAL_PLANS.lifetime.priceLabel} vs{' '}
                {COMMERCIAL_PLANS.pro.priceLabel}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table
                data-testid="pricing-comparison-table"
                className="w-full min-w-[540px] text-left border-collapse"
              >
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
                    <th
                      scope="col"
                      className="py-3.5 px-5 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 w-1/2"
                    >
                      {L.comparisonFeatureHeader}
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-5 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40 w-1/4"
                    >
                      <span className="block">{COMMERCIAL_PLANS.lifetime.title[lang]}</span>
                      <span className="block font-mono tabular-nums text-[11px] font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                        {COMMERCIAL_PLANS.lifetime.priceLabel}
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-5 text-xs font-bold text-slate-800 dark:text-slate-200 w-1/4"
                    >
                      <span className="block">{COMMERCIAL_PLANS.pro.title[lang]}</span>
                      <span className="block font-mono tabular-nums text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {COMMERCIAL_PLANS.pro.priceLabel}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {PRICING_COMPARISON_ROWS.map((row) => {
                    const renderCell = (
                      val: Record<AppLanguage, string> | boolean,
                      isHighlightedCol: boolean
                    ) => {
                      if (typeof val === 'boolean') {
                        return val ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400">
                            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{L.comparisonIncludedLabel}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400">
                            <Minus className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span className="sr-only">Not included</span>
                          </span>
                        );
                      }
                      return (
                        <span
                          className={`font-mono tabular-nums font-semibold ${
                            isHighlightedCol
                              ? 'text-teal-900 dark:text-teal-200'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {val[lang]}
                        </span>
                      );
                    };

                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <th
                          scope="row"
                          className="py-3.5 px-5 font-medium text-slate-700 dark:text-slate-200"
                        >
                          {row.label[lang]}
                        </th>
                        <td className="py-3.5 px-5 bg-teal-50/35 dark:bg-teal-950/20">
                          {renderCell(row.lifetime, true)}
                        </td>
                        <td className="py-3.5 px-5">
                          {renderCell(row.pro, false)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Concise Expandable Buyer FAQ */}
        <section
          id="faq"
          data-testid="landing-faq-section"
          className="space-y-5 scroll-mt-20"
        >
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {L.faqHeading}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {L.faqSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {L.faqItems.map((item) => (
              <details
                key={item.q}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"
              >
                <summary className="list-none cursor-pointer flex items-center justify-between gap-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <span>{item.q}</span>
                  <ChevronDown
                    className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer
        data-testid="health-disclaimer-footer"
        className="border-t border-slate-200/80 dark:border-slate-800 py-5 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{t.disclaimer.text}</span>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`mailto:${sellerConfig.supportEmail}`}
              className="font-semibold text-teal-700 dark:text-teal-400 hover:underline"
            >
              {sellerConfig.supportEmail}
            </a>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="font-semibold text-slate-600 dark:text-slate-300 hover:underline"
            >
              {t.privacyModal.linkLabel}
            </button>
          </div>
        </div>
      </footer>

      <PrivacyTermsModal
        isOpen={isPrivacyOpen}
        lang={lang}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
