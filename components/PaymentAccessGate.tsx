'use client';

import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  KeyRound,
  Landmark,
  Languages,
  LogOut,
  MessageCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  redeemFirestoreAccessCode,
  requestManualAccessConfirmation,
} from '@/lib/firebase/firestore-sync';
import { isValidAccessCodeFormat } from '@/lib/billing/license-format';
import {
  COMMERCIAL_PLANS,
  buildWhatsAppConfirmationUrl,
  getCommercialSellerConfig,
} from '@/lib/billing/commercial-config';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  AccessGrantRecord,
  AccessPlanType,
  AppLanguage,
} from '@/lib/strava/types';
import { PWAInstallButton } from './PWAInstallButton';
import ThemeToggle from './ThemeToggle';

export const SELECTED_PLAN_SESSION_KEY = 'pacecraft_selected_plan_v1';

interface PaymentAccessGateProps {
  user: User;
  lang: AppLanguage;
  authBusy: boolean;
  accessGrant: AccessGrantRecord | null;
  initialLicenseError?: string | null;
  onChangeLang: (lang: AppLanguage) => void;
  onSignOut: () => Promise<void>;
  onServerUnlocked: () => void;
  onRefreshStatus: () => Promise<void>;
}

function readInitialSelectedPlan(): AccessPlanType {
  if (typeof window === 'undefined') return 'lifetime';
  try {
    const raw = window.sessionStorage.getItem(SELECTED_PLAN_SESSION_KEY);
    if (raw === 'pro') return 'pro';
  } catch {
    // Ignore storage restriction
  }
  return 'lifetime';
}

export default function PaymentAccessGate({
  user,
  lang,
  authBusy,
  accessGrant,
  initialLicenseError = null,
  onChangeLang,
  onSignOut,
  onServerUnlocked,
  onRefreshStatus,
}: PaymentAccessGateProps) {
  const t = UI_COPY[lang];
  const g = t.accessGate;
  const sellerConfig = getCommercialSellerConfig();

  const [accessCode, setAccessCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [openingCheckout, setOpeningCheckout] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  const [planType, setPlanType] = useState<AccessPlanType>(
    readInitialSelectedPlan
  );
  const [orderRef, setOrderRef] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [activationTab, setActivationTab] = useState<'code' | 'payment'>('code');

  const [checkingStripeReturn, setCheckingStripeReturn] = useState(false);

  const selectedPlan = COMMERCIAL_PLANS[planType];
  const whatsappUrl = buildWhatsAppConfirmationUrl({
    whatsappDigits: sellerConfig.whatsappDigits,
    planType,
    userEmail: user.email,
    userUid: user.uid,
    orderRef,
    lang,
  });

  // Auto-verify checkout session on return from ?checkout_session_id=...
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const canceled = params.get('checkout_canceled');
    const sessionId = params.get('checkout_session_id');

    if (!canceled && !sessionId) return;

    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;

      if (canceled === '1') {
        setCheckoutNotice(g.stripeCanceledNotice);
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('checkout_canceled');
        window.history.replaceState({}, '', cleanUrl.toString());
        return;
      }

      if (!sessionId) return;

      setCheckingStripeReturn(true);
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/access/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ stripeSessionId: sessionId }),
        });
        const data = (await res.json()) as { unlocked?: boolean };
        if (!cancelled && res.ok && data.unlocked) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('checkout_session_id');
          window.history.replaceState({}, '', cleanUrl.toString());
          onServerUnlocked();
        }
      } catch {
        // Ignore network error on return verification
      } finally {
        if (!cancelled) setCheckingStripeReturn(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, g.stripeCanceledNotice, onServerUnlocked]);

  const handleOpenCheckout = async () => {
    setCheckoutNotice(null);
    setOpeningCheckout(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/access/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = (await res.json()) as {
        configured?: boolean;
        url?: string;
        error?: string;
      };
      if (data.configured && data.url) {
        window.location.assign(data.url);
        return;
      }
      setCheckoutNotice(g.checkoutNotConfigured);
    } catch {
      setCheckoutNotice(g.checkoutNotConfigured);
    } finally {
      setOpeningCheckout(false);
    }
  };

  const handleVerifyAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = accessCode.trim();
    if (!trimmedCode) return;
    setCodeError(null);
    setVerifyingCode(true);

    try {
      if (!trimmedCode.startsWith('PC-')) {
        const directResult = await redeemFirestoreAccessCode({
          uid: user.uid,
          grantExists: Boolean(accessGrant),
          rawCode: trimmedCode,
        });
        if (directResult.ok) {
          await onRefreshStatus();
          return;
        }
      }

      const idToken = await user.getIdToken();
      const res = await fetch('/api/access/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ accessCode: trimmedCode }),
      });
      const data = (await res.json()) as {
        unlocked?: boolean;
      };
      if (res.ok && data.unlocked) {
        onServerUnlocked();
        return;
      }

      setCodeError(
        isValidAccessCodeFormat(trimmedCode)
          ? g.alreadyUsedCodeError
          : g.invalidCodeError
      );
    } catch {
      setCodeError(g.invalidCodeError);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmitManualConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRef.trim()) return;
    setSubmittingManual(true);
    setManualSuccess(false);
    try {
      await requestManualAccessConfirmation(
        user.uid,
        Boolean(accessGrant),
        planType,
        orderRef.trim(),
        manualNote.trim()
      );
      setManualSuccess(true);
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <div
      data-testid="payment-access-gate"
      className="min-h-screen bg-[#F7F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col"
    >
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-[#F7F9FA]/95 dark:bg-slate-950/90 flex items-center justify-between gap-3">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
          PaceCraft
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <PWAInstallButton lang={lang} testId="access-gate-pwa-btn" />
          </div>
          <ThemeToggle lang={lang} testId="access-gate-theme-toggle" />

          <div
            role="group"
            aria-label={t.nav.languageGroupLabel}
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0"
          >
            <Languages
              className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 ml-1.5 mr-0.5 shrink-0"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => onChangeLang('id')}
              aria-pressed={lang === 'id'}
              className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                lang === 'id'
                  ? 'bg-teal-700 dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.nav.idButton}
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              aria-pressed={lang === 'en'}
              className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                lang === 'en'
                  ? 'bg-teal-700 dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.nav.enButton}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void onSignOut()}
            disabled={authBusy}
            data-testid="access-gate-signout-btn"
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-700 dark:hover:text-rose-300 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t.auth.signOutBtn}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Hero Banner */}
        <section className="rounded-2xl bg-gradient-to-br from-[#EAF6F3] via-[#F4F8FB] to-[#EEF2FB] dark:from-teal-950/60 dark:via-slate-900 dark:to-indigo-950/50 border border-teal-100/90 dark:border-teal-800/60 p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {g.badge}
            </span>
            <button
              type="button"
              onClick={() => void onRefreshStatus()}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-400 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              {g.refreshBtn}
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {g.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {g.subtitle}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {g.signedInAs}{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {user.displayName || user.email || user.uid}
            </span>
            {user.email ? ` (${user.email})` : ''}
          </p>
        </section>

        {checkingStripeReturn && (
          <div
            role="status"
            className="rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-4 py-3 text-sm text-sky-900 dark:text-sky-200"
          >
            {g.stripeReturnedChecking}
          </div>
        )}

        {/* Current Grant Pending or Revoked Status */}
        {accessGrant?.status === 'pending' && (
          <div
            role="status"
            data-testid="access-pending-banner"
            className="rounded-2xl bg-indigo-50/85 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/70 p-5 flex items-start gap-3"
          >
            <Clock3
              className="w-5 h-5 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
                {g.pendingTitle}
              </p>
              <p className="text-xs sm:text-sm text-indigo-900/90 dark:text-indigo-200 leading-relaxed">
                {g.pendingDesc(accessGrant.orderRef || '-')}
              </p>
            </div>
          </div>
        )}

        {accessGrant?.status === 'revoked' && (
          <div
            role="alert"
            className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-5 flex items-start gap-3"
          >
            <AlertCircle
              className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-bold text-rose-950 dark:text-rose-100">
                {g.revokedTitle}
              </p>
              <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 leading-relaxed">
                {g.revokedDesc}
              </p>
            </div>
          </div>
        )}

        {/* Focused Activation Switcher: License Key vs QRIS/Payment */}
        <div className="space-y-4">
          <div
            role="tablist"
            aria-label={g.title}
            className="inline-flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activationTab === 'code'}
              onClick={() => setActivationTab('code')}
              data-testid="access-tab-code"
              className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                activationTab === 'code'
                  ? 'bg-teal-700 dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{g.codeCardTitle}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activationTab === 'payment'}
              onClick={() => setActivationTab('payment')}
              data-testid="access-tab-payment"
              className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                activationTab === 'payment'
                  ? 'bg-teal-700 dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{g.manualCardTitle}</span>
            </button>
          </div>

          {activationTab === 'code' ? (
            <form
              onSubmit={handleVerifyAccessCode}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <KeyRound className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {g.codeCardTitle}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {g.codeCardDesc}
                </p>
              </div>

              <div>
                <label
                  htmlFor="buyer-access-code-input"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {g.codeLabel}
                </label>
                <input
                  id="buyer-access-code-input"
                  data-testid="buyer-access-code-input"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder={g.codePlaceholder}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
                />
              </div>

              {(codeError || initialLicenseError) && (
                <p
                  role="alert"
                  data-testid="access-code-error"
                  className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed"
                >
                  {codeError ?? initialLicenseError}
                </p>
              )}

              <button
                type="submit"
                disabled={verifyingCode || !accessCode.trim()}
                data-testid="verify-access-code-btn"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 disabled:opacity-50 transition-colors"
              >
                {verifyingCode ? g.verifyingBtn : g.verifyCodeBtn}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Step 1: Plan Selector Cards with Clear Pricing */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {g.planChooseLabel}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(['lifetime', 'pro'] as const).map((key) => {
                    const plan = COMMERCIAL_PLANS[key];
                    const active = planType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPlanType(key)}
                        data-testid={`gate-plan-card-${key}`}
                        aria-pressed={active}
                        className={`text-left rounded-xl border p-4 space-y-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                          active
                            ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-600 dark:border-teal-500'
                            : 'bg-[#F7F9FA] dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {plan.title[lang]}
                          </span>
                          {plan.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-teal-700 dark:bg-teal-600 text-white text-[11px] font-semibold">
                              {plan.badge[lang]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold font-mono tabular-nums text-teal-800 dark:text-teal-300">
                            {plan.priceLabel}
                          </span>
                          <span className="text-xs font-mono tabular-nums line-through text-slate-400">
                            {plan.originalPriceLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {plan.billingPeriod[lang]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                {/* Step 2: QRIS + Bank Transfer + WhatsApp Deep Link */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                      <QrCode className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {g.qrisSectionTitle}
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {g.qrisSectionDesc}
                    </p>

                    {/* Merchant QRIS Frame */}
                    <div className="rounded-xl bg-[#F7F9FA] dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center text-center gap-3">
                      <div className="flex items-center justify-between w-full text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {sellerConfig.merchantName}
                        </span>
                        <span className="font-mono tabular-nums font-bold text-teal-700 dark:text-teal-300">
                          {selectedPlan.priceLabel}
                        </span>
                      </div>

                      {sellerConfig.qrisImageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={sellerConfig.qrisImageUrl}
                          alt={`QRIS ${sellerConfig.merchantName}`}
                          referrerPolicy="no-referrer"
                          className="w-52 h-52 object-contain rounded-lg bg-white p-2 border border-slate-200"
                        />
                      ) : (
                        <div className="w-full py-5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 space-y-2">
                          <QrCode
                            className="w-10 h-10 text-teal-700 dark:text-teal-400 mx-auto"
                            aria-hidden="true"
                          />
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {g.qrisNotConfiguredNote}
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {g.qrisScanHint}
                      </p>
                    </div>

                    {sellerConfig.bankAccountInfo && (
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-4 py-3 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                        <Landmark
                          className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="space-y-0.5">
                          <span className="font-semibold block">
                            {g.bankSectionLabel}
                          </span>
                          <span className="font-mono tabular-nums">
                            {sellerConfig.bankAccountInfo}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="whatsapp-confirm-link"
                        className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-800 dark:hover:bg-emerald-500 inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{g.whatsappBtn}</span>
                      </a>
                    ) : (
                      <div
                        data-testid="whatsapp-missing-notice"
                        className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed"
                      >
                        {g.whatsappMissingNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Manual Reference Form + Optional Gateway Checkout */}
                <div className="flex flex-col gap-5">
                  <form
                    onSubmit={handleSubmitManualConfirmation}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex-1 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {g.manualFormHeading}
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {g.manualFormDesc}
                      </p>

                      <div>
                        <label
                          htmlFor="manual-order-ref"
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          {g.orderRefLabel}
                        </label>
                        <input
                          id="manual-order-ref"
                          data-testid="manual-order-ref-input"
                          type="text"
                          maxLength={80}
                          value={orderRef}
                          onChange={(e) => setOrderRef(e.target.value)}
                          placeholder={g.orderRefPlaceholder}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm font-mono text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="manual-note-input"
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          {g.noteLabel}
                        </label>
                        <input
                          id="manual-note-input"
                          type="text"
                          maxLength={160}
                          value={manualNote}
                          onChange={(e) => setManualNote(e.target.value)}
                          placeholder={g.notePlaceholder}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {manualSuccess && accessGrant?.orderRef && (
                        <p
                          role="status"
                          className="text-xs text-emerald-700 dark:text-emerald-300"
                        >
                          {g.pendingDesc(accessGrant.orderRef)}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submittingManual || !orderRef.trim()}
                      data-testid="submit-manual-confirm-btn"
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 disabled:opacity-50 transition-colors"
                    >
                      {submittingManual ? g.submittingManualBtn : g.submitManualBtn}
                    </button>
                  </form>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <CreditCard
                          className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{g.gatewayTitle}</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {g.gatewayDesc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleOpenCheckout()}
                      disabled={openingCheckout}
                      data-testid="access-checkout-btn"
                      className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold hover:border-teal-400 disabled:opacity-60 transition-colors"
                    >
                      {openingCheckout ? g.checkoutOpeningBtn : g.checkoutBtn}
                    </button>

                    {checkoutNotice && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {checkoutNotice}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Health Disclaimer Footer */}
      <footer
        data-testid="health-disclaimer-footer"
        className="border-t border-slate-200/80 dark:border-slate-800 py-4 px-4 sm:px-8 text-center text-xs text-slate-500 dark:text-slate-400"
      >
        {t.disclaimer.text}
      </footer>
    </div>
  );
}
