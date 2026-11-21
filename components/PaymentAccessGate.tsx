'use client';

import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  KeyRound,
  Languages,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { requestManualAccessConfirmation } from '@/lib/firebase/firestore-sync';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  AccessGrantRecord,
  AccessPlanType,
  AppLanguage,
} from '@/lib/strava/types';
import ThemeToggle from './ThemeToggle';

interface PaymentAccessGateProps {
  user: User;
  lang: AppLanguage;
  authBusy: boolean;
  accessGrant: AccessGrantRecord | null;
  onChangeLang: (lang: AppLanguage) => void;
  onSignOut: () => Promise<void>;
  onServerUnlocked: () => void;
  onRefreshStatus: () => Promise<void>;
}

export default function PaymentAccessGate({
  user,
  lang,
  authBusy,
  accessGrant,
  onChangeLang,
  onSignOut,
  onServerUnlocked,
  onRefreshStatus,
}: PaymentAccessGateProps) {
  const t = UI_COPY[lang];
  const g = t.accessGate;

  const [accessCode, setAccessCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [openingCheckout, setOpeningCheckout] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  const [planType, setPlanType] = useState<AccessPlanType>('lifetime');
  const [orderRef, setOrderRef] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  const [checkingStripeReturn, setCheckingStripeReturn] = useState(false);

  // Auto-verify Stripe Checkout session on return from ?checkout_session_id=...
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
    if (!accessCode.trim()) return;
    setCodeError(null);
    setVerifyingCode(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/access/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });
      const data = (await res.json()) as { unlocked?: boolean };
      if (res.ok && data.unlocked) {
        onServerUnlocked();
        return;
      }
      setCodeError(g.invalidCodeError);
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

        {/* 3 Verification Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {/* Option 1: Payment Gateway Checkout */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <CreditCard className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {g.checkoutCardTitle}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {g.checkoutCardDesc}
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void handleOpenCheckout()}
                disabled={openingCheckout}
                data-testid="access-checkout-btn"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 disabled:opacity-60 transition-colors"
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

          {/* Option 2: Buyer License / Access Code */}
          <form
            onSubmit={handleVerifyAccessCode}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <KeyRound className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {g.codeCardTitle}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {g.codeCardDesc}
              </p>
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
              {codeError && (
                <p
                  role="alert"
                  className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed"
                >
                  {codeError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifyingCode || !accessCode.trim()}
              data-testid="verify-access-code-btn"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-700 dark:bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-800 dark:hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {verifyingCode ? g.verifyingBtn : g.verifyCodeBtn}
            </button>
          </form>

          {/* Option 3: Manual Payment Confirmation */}
          <form
            onSubmit={handleSubmitManualConfirmation}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {g.manualCardTitle}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {g.manualCardDesc}
              </p>

              <div>
                <label
                  htmlFor="manual-plan-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {g.planLabel}
                </label>
                <select
                  id="manual-plan-select"
                  value={planType}
                  onChange={(e) =>
                    setPlanType(e.target.value === 'pro' ? 'pro' : 'lifetime')
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="lifetime">{g.planLifetime}</option>
                  <option value="pro">{g.planPro}</option>
                </select>
              </div>

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
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-sm font-semibold hover:border-teal-400 disabled:opacity-50 transition-colors"
            >
              {submittingManual ? g.submittingManualBtn : g.submitManualBtn}
            </button>
          </form>
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
