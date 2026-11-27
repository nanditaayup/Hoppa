'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowDown,
  Check,
  ChevronDown,
  Gauge,
  KeyRound,
  Languages,
  Lock,
  LogIn,
  Minus,
  Play,
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
import VideoDemoShowcase from './VideoDemoShowcase';

export interface LandingPageProps {
  lang: AppLanguage;
  authBusy: boolean;
  authErrorCode: AuthErrorCode;
  onChangeLang: (lang: AppLanguage) => void;
  onSignInGoogle: () => void;
}

export default function LandingPage({
  lang,
  authBusy,
  authErrorCode,
  onChangeLang,
  onSignInGoogle,
}: LandingPageProps) {
  const t = UI_COPY[lang];
  const L = t.landing;
  const shouldReduceMotion = useReducedMotion();
  const sellerConfig = getCommercialSellerConfig();

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<AccessPlanType | null>(null);
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
        window.sessionStorage.setItem(
          SELECTED_PLAN_SESSION_KEY,
          selectedPlan ?? 'lifetime'
        );
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

  const handleWatchVideoDemo = () => {
    scrollToSection('video-demo');
    if (typeof document !== 'undefined') {
      const videoEl = document.querySelector(
        '[data-testid="landing-video-demo"]'
      ) as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.play().catch(() => {
          // Ignore autoplay block; native controls remain visible
        });
      }
    }
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

  const selectedPlanInfo = selectedPlan ? COMMERCIAL_PLANS[selectedPlan] : null;

  return (
    <div
      data-testid="login-gate-screen"
      className="min-h-screen bg-[#F7F6F2] dark:bg-slate-950 text-[#202A2A] dark:text-slate-100 flex flex-col"
    >
      {/* Clean Sticky Navigation Header (3 zones, zero clutter) */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 px-4 sm:px-8 border-b border-[#DFE7E2] dark:border-slate-800 bg-[#F7F6F2]/95 dark:bg-slate-950/90 backdrop-blur-sm flex items-center justify-between gap-2 sm:gap-8">
        <a
          href="#"
          className="text-lg sm:text-xl font-bold tracking-tight text-[#202A2A] dark:text-slate-100 whitespace-nowrap shrink-0"
        >
          PaceCraft
        </a>

        <nav
          aria-label="Landing sections"
          className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#596866] dark:text-slate-300"
        >
          <a
            href="#fitur"
            className="hover:text-[#087F73] dark:hover:text-teal-400 hover:underline whitespace-nowrap shrink-0"
          >
            {L.navFeatures}
          </a>
          <a
            href="#kalkulator-pace-tool"
            className="hover:text-[#087F73] dark:hover:text-teal-400 hover:underline whitespace-nowrap shrink-0"
          >
            {L.navDemo}
          </a>
          <a
            href="#harga"
            className="hover:text-[#087F73] dark:hover:text-teal-400 hover:underline whitespace-nowrap shrink-0"
          >
            {L.navPricing}
          </a>
          <a
            href="#faq"
            className="hover:text-[#087F73] dark:hover:text-teal-400 hover:underline whitespace-nowrap shrink-0"
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
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-700 shrink-0"
          >
            <Languages
              className="w-3.5 h-3.5 text-[#087F73] dark:text-teal-400 ml-1.5 mr-0.5 shrink-0 hidden sm:inline"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => onChangeLang('id')}
              data-testid="login-lang-btn-id"
              aria-pressed={lang === 'id'}
              className={`min-h-[30px] px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                lang === 'id'
                  ? 'bg-[#087F73] dark:bg-teal-600 text-white'
                  : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-white'
              }`}
            >
              {t.nav.idButton}
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              data-testid="login-lang-btn-en"
              aria-pressed={lang === 'en'}
              className={`min-h-[30px] px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                lang === 'en'
                  ? 'bg-[#087F73] dark:bg-teal-600 text-white'
                  : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-white'
              }`}
            >
              {t.nav.enButton}
            </button>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('masuk-aktivasi')}
            data-testid="nav-login-btn"
            className="inline-flex items-center justify-center min-h-[38px] px-4 py-1.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
          >
            {L.navLoginBtn}
          </button>
        </div>
      </header>

      <main className="flex-1 min-w-0 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-16">
        {/* 1. Above-the-Fold Hero: Benefit Proposition + Live App Preview */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left Benefit Proposition */}
          <div className="lg:col-span-6 rounded-2xl bg-[#E6F3EE] dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-[#087F73] dark:text-teal-300">
                {L.heroBadge}
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight leading-tight text-balance">
                {L.heroTitle}
              </h1>

              <p className="text-sm sm:text-base text-[#596866] dark:text-slate-300 leading-relaxed max-w-xl">
                {L.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('kalkulator-pace-tool')}
                  data-testid="landing-try-demo-btn"
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs sm:text-[13px] font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
                >
                  <span>{L.heroDemoCta}</span>
                  <ArrowDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={handleWatchVideoDemo}
                  data-testid="landing-watch-video-btn"
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 hover:border-[#087F73] text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
                >
                  <Play className="w-3.5 h-3.5 shrink-0 text-[#087F73] dark:text-teal-400" aria-hidden="true" />
                  <span>{L.heroOpenDemoCta}</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('harga')}
                  data-testid="landing-view-pricing-btn"
                  className="min-h-[44px] px-1.5 py-2 rounded-xl text-[#087F73] dark:text-teal-300 text-xs sm:text-[13px] font-semibold hover:underline inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
                >
                  {L.heroBuyCta}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DFE7E2] dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[#596866] dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#087F73] dark:bg-teal-400 shrink-0" aria-hidden="true" />
                <span>{L.trust1}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#087F73] dark:bg-teal-400 shrink-0" aria-hidden="true" />
                <span>{L.trust2}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#087F73] dark:bg-teal-400 shrink-0" aria-hidden="true" />
                <span>{L.trust3}</span>
              </span>
            </div>
          </div>

          {/* Right Realistic Warm Sport App Preview ("Latihan Hari Ini" + "Progres Mingguan") */}
          <div
            data-testid="hero-app-preview"
            className="lg:col-span-6 bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#DFE7E2] dark:border-slate-800 text-xs text-[#596866] dark:text-slate-400">
                <span className="font-semibold text-[#202A2A] dark:text-slate-200">
                  {L.previewLabel}
                </span>
                <span>{L.previewActivePlan}</span>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[#087F73] dark:text-teal-300">
                  {L.previewTodayTag}
                </p>
                <div className="flex items-center gap-2.5">
                  <Gauge
                    className="w-5 h-5 text-[#087F73] dark:text-teal-400 shrink-0"
                    aria-hidden="true"
                  />
                  <h2 className="text-xl sm:text-2xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight">
                    {L.previewTodayHeadline}
                  </h2>
                </div>
                <p className="text-sm sm:text-base font-semibold tabular-nums text-[#202A2A] dark:text-slate-100">
                  {L.previewTodayMetrics}
                </p>
                <p className="text-xs font-mono tabular-nums text-[#087F73] dark:text-teal-300 font-medium">
                  {L.previewTodaySteps}
                </p>
                <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
                  {L.previewTodayCue}
                </p>
              </div>
            </div>

            {/* Weekly Progress Preview inside the same card with hairline dividers */}
            <div className="pt-5 border-t border-[#DFE7E2] dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#202A2A] dark:text-slate-100">
                  {L.previewWeeklyTitle}
                </span>
                <span className="text-xs font-semibold font-mono tabular-nums text-[#087F73] dark:text-teal-400">
                  62%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.25fr_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#DFE7E2] dark:divide-slate-800">
                <div className="pb-2.5 sm:pb-0 sm:pr-4">
                  <p className="text-[11px] text-[#596866] dark:text-slate-400">
                    {L.previewWeeklySessionLabel}
                  </p>
                  <p className="text-sm font-bold text-[#202A2A] dark:text-slate-100 mt-0.5 tabular-nums whitespace-nowrap">
                    {L.previewWeeklySessionVal}
                  </p>
                </div>
                <div className="py-2.5 sm:py-0 sm:px-4">
                  <p className="text-[11px] text-[#596866] dark:text-slate-400">
                    {L.previewWeeklyDistLabel}
                  </p>
                  <p className="text-sm font-bold tabular-nums text-[#202A2A] dark:text-slate-100 mt-0.5 whitespace-nowrap">
                    {L.previewWeeklyDistVal}
                  </p>
                </div>
                <div className="pt-2.5 sm:pt-0 sm:pl-4">
                  <p className="text-[11px] text-[#596866] dark:text-slate-400">
                    {L.previewWeeklyCrossLabel}
                  </p>
                  <p className="text-sm font-bold text-[#202A2A] dark:text-slate-100 mt-0.5 tabular-nums whitespace-nowrap">
                    {L.previewWeeklyCrossVal}
                  </p>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-[#F7F6F2] dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#087F73] dark:bg-teal-500"
                  style={{ width: '62%' }}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. Single-Benefit Feature Breakdown (1 card = 1 benefit) */}
        <section
          id="fitur"
          data-testid="landing-feature-showcase"
          className="space-y-6 scroll-mt-20"
        >
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight text-balance">
              {L.showcaseHeading}
            </h2>
            <p className="text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
              {L.showcaseSubtitle}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0">
            {L.showcaseCards.map((card, idx) => {
              const borderClasses = [
                'md:border-r md:border-b border-[#DFE7E2] dark:border-slate-800',
                'md:border-b border-[#DFE7E2] dark:border-slate-800',
                'md:border-r border-[#DFE7E2] dark:border-slate-800',
                'border-[#DFE7E2] dark:border-slate-800',
              ][idx];

              return (
                <article
                  key={card.title}
                  className={`p-6 sm:p-7 flex flex-col gap-2.5 ${borderClasses}`}
                >
                  <span className="text-xs font-semibold text-[#087F73] dark:text-teal-300">
                    {card.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#202A2A] dark:text-slate-100">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
                    {card.desc}
                  </p>
                </article>
              );
            })}
          </div>

          <p className="text-xs text-[#596866] dark:text-slate-400 leading-relaxed max-w-3xl">
            {L.progressionNote}
          </p>
        </section>

        {/* 3. Video Demo Walkthrough + Free No-Login Interactive Pace Calculator */}
        <section
          id="kalkulator-demo"
          data-testid="landing-pace-demo-section"
          className="space-y-6 scroll-mt-20"
        >
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight text-balance">
              {L.demoHeading}
            </h2>
            <p className="text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
              {L.demoSubtitle}
            </p>
          </div>

          <VideoDemoShowcase lang={lang} />

          <div id="kalkulator-pace-tool" className="scroll-mt-20">
            <PaceCalculator
              initialRace="10K"
              activeCustomPaceSecPerKm={null}
              lang={lang}
              applyButtonLabel={L.demoApplyCta}
              onApplyTargetPace={handleDemoApply}
              onResetCustomPace={() => setDemoAppliedNotice(false)}
            />
          </div>
        </section>

        {/* 4. Dual Pricing Cards (Essential Rp59.000 / 12 mos + Lifetime Rp99.000) & Comparison Table */}
        <section
          id="harga"
          data-testid="landing-pricing-section"
          className="space-y-8 scroll-mt-20 min-w-0"
        >
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight text-balance">
              {L.pricingHeading}
            </h2>
            <p className="text-sm sm:text-base text-[#596866] dark:text-slate-300 leading-relaxed">
              {L.pricingSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {(['pro', 'lifetime'] as const).map((tierKey) => {
              const plan = COMMERCIAL_PLANS[tierKey];
              const isLifetime = tierKey === 'lifetime';
              const isSelected = selectedPlan === tierKey;
              return (
                <div
                  key={tierKey}
                  data-testid={`pricing-card-${tierKey}`}
                  className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between gap-6 transition-colors ${
                    isSelected
                      ? 'bg-[#E6F3EE] dark:bg-slate-900 border-[#087F73] dark:border-teal-500 ring-1 ring-[#087F73]/25'
                      : isLifetime
                        ? 'bg-white dark:bg-slate-900 border-[#087F73]/50 dark:border-teal-700'
                        : 'bg-white dark:bg-slate-900 border-[#DFE7E2] dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#087F73] dark:text-teal-300">
                        {plan.billingPeriod[lang]}
                      </span>
                      {isLifetime && (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#E6F3EE] dark:bg-teal-950/70 text-[#087F73] dark:text-teal-300 text-[11px] font-bold border border-[#087F73]/20">
                          {L.pricingBestValueBadge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#202A2A] dark:text-slate-100">
                        {plan.title[lang]}
                      </h3>
                      <p className="text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
                        {plan.summary[lang]}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1 pb-4 border-b border-[#DFE7E2] dark:border-slate-800">
                      <span className="text-3xl sm:text-4xl font-bold tabular-nums text-[#202A2A] dark:text-slate-100">
                        {plan.priceLabel}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#596866] dark:text-slate-300">
                        {plan.subtitle?.[lang]}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold text-[#087F73] dark:text-teal-300">
                        {plan.listIntro?.[lang]}
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features[lang].map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-2.5 text-sm text-[#202A2A] dark:text-slate-200 leading-relaxed"
                          >
                            <Check
                              className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0 mt-1"
                              aria-hidden="true"
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectPricingPlan(tierKey)}
                      data-testid={`select-plan-btn-${tierKey}`}
                      className={`w-full min-h-[48px] px-5 py-3 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                        isLifetime || isSelected
                          ? 'bg-[#087F73] dark:bg-teal-600 text-white hover:bg-[#06685E] dark:hover:bg-teal-500'
                          : 'bg-[#F7F6F2] dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 hover:border-[#087F73] hover:text-[#087F73]'
                      }`}
                    >
                      {plan.ctaLabel[lang]}
                    </button>
                    <p className="text-[11px] text-center text-[#596866] dark:text-slate-400">
                      {L.pricingFooterNote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Concise Side-by-Side Comparison Table */}
          <div
            data-testid="pricing-comparison-table"
            className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#DFE7E2] dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-bold text-[#202A2A] dark:text-slate-100">
                {L.comparisonTableHeading}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#DFE7E2] dark:border-slate-800 bg-[#F7F6F2]/60 dark:bg-slate-800/50 text-[#596866] dark:text-slate-300">
                    <th className="py-3 px-6 font-semibold">
                      {L.comparisonFeatureHeader}
                    </th>
                    <th className="py-3 px-4 font-bold text-[#202A2A] dark:text-slate-100 whitespace-nowrap">
                      {COMMERCIAL_PLANS.pro.title[lang]} ({COMMERCIAL_PLANS.pro.priceLabel})
                    </th>
                    <th className="py-3 px-6 font-bold text-[#087F73] dark:text-teal-300 whitespace-nowrap">
                      {COMMERCIAL_PLANS.lifetime.title[lang]} ({COMMERCIAL_PLANS.lifetime.priceLabel})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE7E2] dark:divide-slate-800">
                  {PRICING_COMPARISON_ROWS.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3.5 px-6 text-[#202A2A] dark:text-slate-200 font-medium">
                        {row.label[lang]}
                      </td>
                      <td className="py-3.5 px-4 text-[#202A2A] dark:text-slate-200 whitespace-nowrap">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <span className="inline-flex items-center gap-1.5 text-[#087F73] dark:text-teal-400 font-semibold">
                              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span>{L.comparisonIncludedLabel}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#596866] dark:text-slate-400">
                              <Minus className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span>{L.comparisonNotIncludedLabel}</span>
                            </span>
                          )
                        ) : (
                          <span className="font-semibold">{row.pro[lang]}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-[#202A2A] dark:text-slate-100 whitespace-nowrap">
                        {typeof row.lifetime === 'boolean' ? (
                          row.lifetime ? (
                            <span className="inline-flex items-center gap-1.5 text-[#087F73] dark:text-teal-400 font-semibold">
                              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span>{L.comparisonIncludedLabel}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[#596866] dark:text-slate-400">
                              <Minus className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span>{L.comparisonNotIncludedLabel}</span>
                            </span>
                          )
                        ) : (
                          <span className="font-bold text-[#087F73] dark:text-teal-300">
                            {row.lifetime[lang]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Runner Atmosphere Photo + Sign-In & Activation Section */}
        <section
          id="masuk-aktivasi"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch scroll-mt-20"
        >
          {/* Left Runner Photo moved below Hero */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="relative flex-1 min-h-[220px] sm:min-h-[260px]">
              <Image
                src={heroRunnerImg}
                alt={L.heroImageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-6 border-t border-[#DFE7E2] dark:border-slate-800 space-y-1.5">
              <h2 className="text-lg font-bold text-[#202A2A] dark:text-slate-100">
                {L.photoSectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
                {L.photoSectionDesc}
              </p>
            </div>
          </div>

          {/* Right Google Sign-In & Progressive License Activation */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight">
                  {t.auth.cardTitle}
                </h2>
                <p className="text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
                  {t.auth.cardSubtitle}
                </p>
              </div>

              {selectedPlanInfo && (
                <div
                  role="status"
                  data-testid="landing-selected-plan-banner"
                  className="rounded-xl bg-[#E6F3EE] dark:bg-teal-950/60 border border-[#DFE7E2] dark:border-teal-800 px-3.5 py-2.5 text-xs text-[#202A2A] dark:text-teal-200 leading-relaxed"
                >
                  {L.selectedPlanHint(
                    selectedPlanInfo.title[lang],
                    selectedPlanInfo.priceLabel
                  )}
                </div>
              )}

              {demoAppliedNotice && (
                <div
                  role="status"
                  data-testid="landing-demo-applied-banner"
                  className="rounded-xl bg-[#E6F3EE] dark:bg-teal-950/60 border border-[#DFE7E2] dark:border-teal-800 px-3.5 py-2.5 text-xs text-[#202A2A] dark:text-teal-200 leading-relaxed"
                >
                  {L.demoAppliedHint}
                </div>
              )}

              <button
                type="button"
                onClick={handleStartGoogleSignIn}
                disabled={authBusy}
                data-testid="google-signin-btn"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-sm font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
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

              {/* Progressive disclosure for buyers who already have a License Key */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowLicenseInput((prev) => !prev)}
                  aria-expanded={showLicenseInput}
                  data-testid="toggle-license-input-btn"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#087F73] dark:text-teal-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] rounded"
                >
                  <KeyRound className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{L.alreadyBoughtToggleLabel}</span>
                </button>

                {showLicenseInput && (
                  <div className="mt-3 pt-3 border-t border-[#DFE7E2] dark:border-slate-800 space-y-1.5">
                    <label
                      htmlFor="login-license-key-input"
                      className="block text-xs font-medium text-[#202A2A] dark:text-slate-300"
                    >
                      {t.auth.licenseKeyLabel}
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
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2]/70 dark:bg-slate-800/70 text-sm font-mono uppercase text-[#202A2A] dark:text-slate-100 placeholder:normal-case placeholder:font-sans placeholder:text-[#596866]/70 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F73] dark:focus-visible:ring-teal-400"
                    />
                    <p className="text-[11px] text-[#596866] dark:text-slate-400 leading-relaxed">
                      {t.auth.licenseKeyHint}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#DFE7E2] dark:border-slate-800 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-[#596866] dark:text-slate-400 leading-relaxed">
                <Lock
                  className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{t.auth.privacyNote}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                data-testid="login-privacy-btn"
                className="text-xs font-semibold text-[#087F73] dark:text-teal-400 hover:underline"
              >
                {t.privacyModal.linkLabel}
              </button>
            </div>
          </div>
        </section>

        {/* 6. Concise Expandable FAQ (includes Calculator behavior & PWA install) */}
        <section
          id="faq"
          data-testid="landing-faq-section"
          className="space-y-5 scroll-mt-20"
        >
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight">
              {L.faqHeading}
            </h2>
            <p className="text-sm text-[#596866] dark:text-slate-300">
              {L.faqSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {L.faqItems.map((item) => (
              <details
                key={item.q}
                className="group bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-5"
              >
                <summary className="list-none cursor-pointer flex items-center justify-between gap-3 text-sm font-bold text-[#202A2A] dark:text-slate-100">
                  <span>{item.q}</span>
                  <ChevronDown
                    className="w-4 h-4 text-[#596866] shrink-0 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="mt-3 space-y-3">
                  <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
                    {item.a}
                  </p>
                  {item.hasPwaAction && (
                    <div>
                      <PWAInstallButton
                        lang={lang}
                        testId="landing-pwa-install-btn"
                      />
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer
        data-testid="health-disclaimer-footer"
        className="border-t border-[#DFE7E2] dark:border-slate-800 py-5 px-4 sm:px-8 text-xs text-[#596866] dark:text-slate-400"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{t.disclaimer.text}</span>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`mailto:${sellerConfig.supportEmail}`}
              className="font-semibold text-[#087F73] dark:text-teal-400 hover:underline"
            >
              {sellerConfig.supportEmail}
            </a>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="font-semibold text-[#596866] dark:text-slate-300 hover:underline"
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
