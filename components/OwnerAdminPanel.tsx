'use client';

import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Copy, KeyRound } from 'lucide-react';
import {
  AccessCodeRecord,
  AccessGrantRecord,
  AccessPlanType,
  AppLanguage,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  isValidAccessCodeFormat,
  normalizeAccessCode,
} from '@/lib/billing/license-format';
import {
  OWNER_ADMIN_EMAIL,
  adminCreateAccessCode,
  adminRevokeAccessCode,
  adminUpsertAccessGrant,
  subscribeToAdminAccessCodes,
  subscribeToAdminAccessGrants,
} from '@/lib/firebase/firestore-sync';

interface OwnerAdminPanelProps {
  lang: AppLanguage;
  firebaseUser: User | null;
  isOwnerAdmin: boolean;
}

export default function OwnerAdminPanel({
  lang,
  firebaseUser,
  isOwnerAdmin,
}: OwnerAdminPanelProps) {
  const adminCopy = UI_COPY[lang].adminAccess;

  const [adminGrants, setAdminGrants] = useState<AccessGrantRecord[]>([]);
  const [adminCodes, setAdminCodes] = useState<AccessCodeRecord[]>([]);
  const [licensePlanType, setLicensePlanType] =
    useState<AccessPlanType>('lifetime');
  const [customLicenseCode, setCustomLicenseCode] = useState('');
  const [licenseBuyerNote, setLicenseBuyerNote] = useState('');
  const [generatedLicense, setGeneratedLicense] = useState<string | null>(null);
  const [licenseGenError, setLicenseGenError] = useState<string | null>(null);
  const [isGeneratingLicense, setIsGeneratingLicense] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);

  const canShowOwnerAdmin = Boolean(
    isOwnerAdmin &&
      firebaseUser?.emailVerified === true &&
      firebaseUser.email?.toLowerCase() === OWNER_ADMIN_EMAIL
  );

  useEffect(() => {
    if (!canShowOwnerAdmin) return;
    const unsubGrants = subscribeToAdminAccessGrants((grants) => {
      setAdminGrants(grants);
    });
    const unsubCodes = subscribeToAdminAccessCodes((codes) => {
      setAdminCodes(codes);
    });
    return () => {
      unsubGrants();
      unsubCodes();
    };
  }, [canShowOwnerAdmin]);

  if (!canShowOwnerAdmin) return null;

  const handleCreateAccessCode = async () => {
    if (!firebaseUser || isGeneratingLicense) return;
    setIsGeneratingLicense(true);
    setCopiedLicense(false);
    setLicenseGenError(null);
    try {
      const cleanedCustom = normalizeAccessCode(customLicenseCode);
      let codeToCreate = cleanedCustom;

      if (cleanedCustom.length > 0) {
        if (!isValidAccessCodeFormat(cleanedCustom)) {
          setLicenseGenError(adminCopy.generateError);
          return;
        }
      } else {
        const idToken = await firebaseUser.getIdToken();
        const res = await fetch('/api/access/generate-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ planType: licensePlanType }),
        });
        if (!res.ok) {
          setLicenseGenError(adminCopy.generateError);
          return;
        }
        const data = (await res.json()) as {
          licenseKey?: string;
          codeId?: string;
        };
        codeToCreate = data.licenseKey || data.codeId || '';
      }

      if (!codeToCreate || !isValidAccessCodeFormat(codeToCreate)) {
        setLicenseGenError(adminCopy.generateError);
        return;
      }

      await adminCreateAccessCode({
        codeId: codeToCreate,
        planType: licensePlanType,
        buyerNote: licenseBuyerNote,
      });
      setGeneratedLicense(codeToCreate);
      setCustomLicenseCode('');
      setLicenseBuyerNote('');
    } catch {
      setLicenseGenError(adminCopy.generateError);
    } finally {
      setIsGeneratingLicense(false);
    }
  };

  const handleCopyCodeText = async (codeText: string) => {
    if (!codeText || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedLicense(true);
      setTimeout(() => setCopiedLicense(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div
      data-testid="admin-access-panel"
      className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 space-y-5"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#202A2A] dark:text-slate-100 flex items-center gap-2">
            <KeyRound
              className="w-5 h-5 text-[#087F73] dark:text-teal-400 shrink-0"
              aria-hidden="true"
            />
            <span>{adminCopy.heading}</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300">
            {adminCopy.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-3">
            <label
              htmlFor="admin-license-plan-select"
              className="block text-xs font-medium text-[#202A2A] dark:text-slate-300 mb-1"
            >
              {adminCopy.planLabel}
            </label>
            <select
              id="admin-license-plan-select"
              data-testid="admin-license-plan-select"
              value={licensePlanType}
              onChange={(e) =>
                setLicensePlanType(
                  e.target.value === 'pro' ? 'pro' : 'lifetime'
                )
              }
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-sm text-[#202A2A] dark:text-slate-100"
            >
              <option value="lifetime">{adminCopy.planLifetime}</option>
              <option value="pro">{adminCopy.planPro}</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="admin-license-custom-code"
              className="block text-xs font-medium text-[#202A2A] dark:text-slate-300 mb-1"
            >
              {adminCopy.customCodeLabel}
            </label>
            <input
              id="admin-license-custom-code"
              data-testid="admin-license-custom-code"
              type="text"
              maxLength={64}
              value={customLicenseCode}
              onChange={(e) => setCustomLicenseCode(e.target.value)}
              placeholder={adminCopy.customCodePlaceholder}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans text-[#202A2A] dark:text-slate-100"
            />
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="admin-license-buyer-note"
              className="block text-xs font-medium text-[#202A2A] dark:text-slate-300 mb-1"
            >
              {adminCopy.buyerNoteLabel}
            </label>
            <input
              id="admin-license-buyer-note"
              data-testid="admin-license-buyer-note"
              type="text"
              maxLength={120}
              value={licenseBuyerNote}
              onChange={(e) => setLicenseBuyerNote(e.target.value)}
              placeholder={adminCopy.buyerNotePlaceholder}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-sm text-[#202A2A] dark:text-slate-100"
            />
          </div>

          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => void handleCreateAccessCode()}
              disabled={isGeneratingLicense}
              data-testid="admin-generate-license-btn"
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 disabled:opacity-60 whitespace-nowrap"
            >
              {isGeneratingLicense
                ? adminCopy.generatingBtn
                : adminCopy.generateCodeBtn}
            </button>
          </div>
        </div>
      </div>

      {licenseGenError && (
        <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">
          {licenseGenError}
        </p>
      )}

      {generatedLicense && (
        <div className="rounded-xl bg-[#E6F3EE] dark:bg-teal-950/50 border border-[#DFE7E2] dark:border-teal-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold text-[#087F73] dark:text-teal-200">
              {adminCopy.generatedLabel}
            </p>
            <p className="text-xs font-mono text-[#202A2A] dark:text-slate-100 break-all">
              {generatedLicense}
            </p>
            <p className="text-[11px] text-[#596866] dark:text-teal-200/80">
              {adminCopy.singleUseHint}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleCopyCodeText(generatedLicense)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#DFE7E2] dark:border-teal-700 text-xs font-semibold text-[#087F73] dark:text-teal-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {copiedLicense ? adminCopy.copiedBtn : adminCopy.copyCodeBtn}
            </span>
          </button>
        </div>
      )}

      {/* Issued Single-Use access-codes List */}
      <div className="pt-3 border-t border-[#DFE7E2] dark:border-slate-800 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-[#596866] dark:text-slate-400">
          {adminCopy.licenseListTitle}
        </h4>
        {adminCodes.length === 0 ? (
          <p className="text-xs text-[#596866] dark:text-slate-400">
            {adminCopy.licenseEmptyList}
          </p>
        ) : (
          <div className="divide-y divide-[#DFE7E2] dark:divide-slate-800">
            {adminCodes.slice(0, 15).map((lic) => (
              <div
                key={lic.codeId}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-[#202A2A] dark:text-slate-100">
                      {lic.codeId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold ${
                        lic.status === 'unused'
                          ? 'bg-[#E6F3EE] dark:bg-emerald-950/60 text-[#087F73] dark:text-emerald-200'
                          : lic.status === 'used'
                            ? 'bg-[#F7F6F2] dark:bg-slate-800 text-[#202A2A] dark:text-slate-200'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      {adminCopy.licenseStatusLabels[lic.status]}
                    </span>
                    <span className="text-[11px] font-mono text-[#596866] dark:text-slate-400">
                      {lic.planType}
                    </span>
                    {lic.buyerNote && (
                      <span className="text-[#596866] dark:text-slate-300 truncate">
                        {lic.buyerNote}
                      </span>
                    )}
                  </div>
                  {lic.usedByUid && (
                    <p className="text-[11px] font-mono text-[#596866] dark:text-slate-400 truncate">
                      UID: {lic.usedByUid}
                    </p>
                  )}
                </div>

                {lic.status === 'unused' && (
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => void handleCopyCodeText(lic.codeId)}
                      className="min-h-[36px] px-3 py-1 rounded-xl border border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-200 text-xs font-semibold hover:border-[#087F73] inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <Copy className="w-3 h-3" aria-hidden="true" />
                      <span>{adminCopy.copyCodeBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void adminRevokeAccessCode(lic.codeId, lic.buyerNote)
                      }
                      className="min-h-[36px] px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/50 whitespace-nowrap"
                    >
                      {adminCopy.revokeLicenseBtn}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {adminGrants.length === 0 ? (
        <p className="text-xs text-[#596866] dark:text-slate-400">
          {adminCopy.emptyList}
        </p>
      ) : (
        <div className="divide-y divide-[#DFE7E2] dark:divide-slate-800">
          {adminGrants.map((grant) => (
            <div
              key={grant.uid}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-semibold text-[#202A2A] dark:text-slate-100 truncate">
                    {grant.uid}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      grant.status === 'active'
                        ? 'bg-[#E6F3EE] dark:bg-emerald-950/60 text-[#087F73] dark:text-emerald-200'
                        : grant.status === 'revoked'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                          : 'bg-[#F7F6F2] dark:bg-slate-800 text-[#202A2A] dark:text-slate-200'
                    }`}
                  >
                    {adminCopy.statusLabels[grant.status]}
                  </span>
                </div>
                <p className="text-xs text-[#596866] dark:text-slate-300 font-mono">
                  {grant.orderRef || '-'} · {grant.planType}
                  {grant.note ? ` · ${grant.note}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {grant.status !== 'active' && (
                  <button
                    type="button"
                    onClick={() =>
                      void adminUpsertAccessGrant(
                        grant.uid,
                        true,
                        'active',
                        grant.planType,
                        'admin_manual',
                        grant.orderRef,
                        grant.note
                      )
                    }
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] whitespace-nowrap"
                  >
                    {adminCopy.approveBtn}
                  </button>
                )}
                {grant.status === 'active' && (
                  <button
                    type="button"
                    onClick={() =>
                      void adminUpsertAccessGrant(
                        grant.uid,
                        true,
                        'revoked',
                        grant.planType,
                        grant.provider,
                        grant.orderRef,
                        grant.note
                      )
                    }
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/50 whitespace-nowrap"
                  >
                    {adminCopy.revokeBtn}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
