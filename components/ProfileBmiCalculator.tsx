'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ShieldCheck,
  AlertCircle,
  HeartPulse,
  Gauge,
  Shield,
  Trash2,
  Footprints,
  Download,
  Upload,
  CheckCircle2,
  KeyRound,
  Copy,
  RotateCcw,
  User as UserIcon,
} from 'lucide-react';
import {
  AccessCodeRecord,
  AccessGrantRecord,
  AccessPlanType,
  AppLanguage,
  BackupPayloadV1,
  BmiResult,
  HeartRateVo2Summary,
  HeartRateZone,
  InjuryStatus,
  RunActivity,
  RunnerProfile,
} from '@/lib/strava/types';
import PersonalBestCard from './PersonalBestCard';
import { UI_COPY } from '@/lib/strava/i18n';
import { formatDecimalComma } from '@/lib/strava/transform';
import { parseAndValidateBackupJson } from '@/lib/strava/backup';
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

interface ProfileBmiCalculatorProps {
  profile: RunnerProfile;
  bmiResult: BmiResult;
  hrVo2: HeartRateVo2Summary;
  runs?: RunActivity[];
  lang: AppLanguage;
  latestRunKm?: number;
  isOwnerAdmin?: boolean;
  firebaseUser?: User | null;
  onChangeProfile: (updater: (prev: RunnerProfile) => RunnerProfile) => void;
  onExportBackup?: () => void;
  onRestoreBackup?: (backup: BackupPayloadV1) => Promise<void>;
  onOpenPrivacyModal?: () => void;
  onOpenDeleteAccountModal?: () => void;
  onReopenWizard?: () => void;
}

const HR_ZONE_PASTEL: Record<HeartRateZone['zone'], string> = {
  Z1: 'bg-slate-100/85 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200',
  Z2: 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border border-transparent dark:border-emerald-800/60',
  Z3: 'bg-sky-50/90 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border border-transparent dark:border-sky-800/60',
  Z4: 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-transparent dark:border-indigo-800/60',
  Z5: 'bg-rose-50/90 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-transparent dark:border-rose-800/60',
};

export default function ProfileBmiCalculator({
  profile,
  bmiResult,
  hrVo2,
  runs = [],
  lang,
  latestRunKm = 0,
  isOwnerAdmin = false,
  firebaseUser,
  onChangeProfile,
  onExportBackup,
  onRestoreBackup,
  onOpenPrivacyModal,
  onOpenDeleteAccountModal,
  onReopenWizard,
}: ProfileBmiCalculatorProps) {
  const fullCopy = UI_COPY[lang];
  const t = fullCopy.bmi;
  const shoeCopy = fullCopy.shoeTracker;
  const backupCopy = fullCopy.backup;
  const adminCopy = fullCopy.adminAccess;
  const accountSec = fullCopy.accountSecurity;
  const autoTanakaMaxHr = Math.round(208 - 0.7 * Math.min(85, Math.max(14, profile.age)));

  const [activeProfileTab, setActiveProfileTab] = useState<
    'body' | 'hr' | 'shoes' | 'account' | 'admin'
  >('body');
  const backupInputRef = useRef<HTMLInputElement | null>(null);
  const [backupNotice, setBackupNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

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

  const shoeCurrentKm = Math.max(0, profile.shoeCurrentKm ?? 0);
  const shoeMaxKm = Math.min(2000, Math.max(200, profile.shoeMaxKm ?? 700));
  const shoePct = Math.round((shoeCurrentKm / shoeMaxKm) * 100);
  const shoeBarRatio = Math.min(1, shoeCurrentKm / shoeMaxKm);
  const shoeRemainingKm = Math.max(0, shoeMaxKm - shoeCurrentKm);
  const shoeAlertLevel: 'healthy' | 'warning' | 'replace' =
    shoePct >= 100 ? 'replace' : shoePct >= 80 ? 'warning' : 'healthy';

  const handleTriggerExport = () => {
    if (!onExportBackup) return;
    onExportBackup();
    setBackupNotice({ type: 'success', message: backupCopy.exportDone });
  };

  const handleBackupFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !onRestoreBackup) return;

    setIsRestoringBackup(true);
    setBackupNotice(null);
    try {
      const text = await file.text();
      const parsed = parseAndValidateBackupJson(text);
      if (!parsed.ok) {
        setBackupNotice({
          type: 'error',
          message: backupCopy.restoreInvalidError,
        });
        return;
      }
      await onRestoreBackup(parsed.data);
      setBackupNotice({
        type: 'success',
        message: backupCopy.restoreSuccess(
          parsed.data.runs.length,
          parsed.data.progressEntries.length
        ),
      });
    } catch {
      setBackupNotice({
        type: 'error',
        message: backupCopy.restoreInvalidError,
      });
    } finally {
      setIsRestoringBackup(false);
    }
  };

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

  const categorySurface: Record<BmiResult['category'], string> = {
    kurus:
      'bg-sky-50/80 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/70 text-sky-900 dark:text-sky-100',
    ideal:
      'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-100',
    berlebih:
      'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/70 text-indigo-900 dark:text-indigo-100',
    obesitas:
      'bg-rose-50/80 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/70 text-rose-900 dark:text-rose-100',
  };

  return (
    <section
      id="profil-bmi"
      aria-labelledby="profil-bmi-heading"
      className="space-y-5"
    >
      <div className="space-y-1">
        <h2
          id="profil-bmi-heading"
          className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
        >
          {t.heading}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t.subtitle}</p>
      </div>

      {/* Focused Sub-Tabs so Users Only See 1 Tool at a Time */}
      <div
        role="tablist"
        aria-label={t.tabsAriaLabel}
        data-testid="profile-subtabs"
        className="flex w-full items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto"
      >
        {(
          [
            { id: 'body', label: t.tabs.body, icon: UserIcon },
            { id: 'hr', label: t.tabs.hr, icon: HeartPulse },
            { id: 'shoes', label: t.tabs.shoes, icon: Footprints },
            { id: 'account', label: t.tabs.account, icon: Shield },
            ...(canShowOwnerAdmin
              ? [{ id: 'admin' as const, label: t.tabs.admin, icon: KeyRound }]
              : []),
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeProfileTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-testid={`profile-tab-${tab.id}`}
              onClick={() => setActiveProfileTab(tab.id)}
              className={`min-h-[42px] px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                isSelected
                  ? 'bg-teal-700 dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeProfileTab === 'body' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Form Inputs Card */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.methodLabel}
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() =>
                  onChangeProfile((p) => ({ ...p, useDirectBmi: false }))
                }
                className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  !profile.useDirectBmi
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.weightHeightBtn}
              </button>
              <button
                type="button"
                onClick={() =>
                  onChangeProfile((p) => ({
                    ...p,
                    useDirectBmi: true,
                    directBmi: p.directBmi ?? bmiResult.bmi,
                  }))
                }
                className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  profile.useDirectBmi
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.directBmiBtn}
              </button>
            </div>
          </div>

          {!profile.useDirectBmi ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="input-weight-kg"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  {t.weightLabel}
                </label>
                <input
                  id="input-weight-kg"
                  type="number"
                  min={30}
                  max={200}
                  step={0.5}
                  value={profile.weightKg}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChangeProfile((p) => ({
                      ...p,
                      weightKg: Number.isFinite(val) ? val : 65,
                    }));
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.weightHint}
                </p>
              </div>

              <div>
                <label
                  htmlFor="input-height-cm"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  {t.heightLabel}
                </label>
                <input
                  id="input-height-cm"
                  type="number"
                  min={120}
                  max={230}
                  step={1}
                  value={profile.heightCm}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChangeProfile((p) => ({
                      ...p,
                      heightCm: Number.isFinite(val) ? val : 170,
                    }));
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.heightHint}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="input-direct-bmi"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
              >
                {t.directBmiLabel}
              </label>
              <input
                id="input-direct-bmi"
                type="number"
                min={12}
                max={55}
                step={0.1}
                value={profile.directBmi ?? bmiResult.bmi}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onChangeProfile((p) => ({
                    ...p,
                    directBmi: Number.isFinite(val) ? val : 22,
                  }));
                }}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="input-age"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
              >
                {t.ageLabel}
              </label>
              <input
                id="input-age"
                type="number"
                min={14}
                max={85}
                value={profile.age}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onChangeProfile((p) => ({
                    ...p,
                    age: Number.isFinite(val) ? val : 30,
                  }));
                }}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
              />
            </div>

            <div>
              <label
                htmlFor="select-injury-status"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
              >
                {t.injuryLabel}
              </label>
              <select
                id="select-injury-status"
                value={profile.injuryStatus}
                onChange={(e) =>
                  onChangeProfile((p) => ({
                    ...p,
                    injuryStatus: e.target.value as InjuryStatus,
                  }))
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
              >
                <option value="none">{t.injuryOptions.none}</option>
                <option value="recovering">{t.injuryOptions.recovering}</option>
                <option value="active">{t.injuryOptions.active}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sibling Pastel BMI Result Card */}
        <div
          className={`lg:col-span-5 rounded-2xl border p-6 flex flex-col justify-between gap-4 ${categorySurface[bmiResult.category]}`}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium opacity-80">{t.resultLabel}</p>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span
                    data-testid="bmi-value"
                    className="text-4xl font-bold font-mono tabular-nums tracking-tight"
                  >
                    {bmiResult.formattedBmi}
                  </span>
                  <span
                    data-testid="bmi-category"
                    className="text-sm font-semibold"
                  >
                    · {t.categoryPrefix} {bmiResult.categoryLabel}
                  </span>
                </div>
              </div>
              {bmiResult.category === 'ideal' ? (
                <ShieldCheck className="w-6 h-6 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-6 h-6 shrink-0" aria-hidden="true" />
              )}
            </div>

            <p className="text-sm leading-relaxed">{bmiResult.safetyNote}</p>
          </div>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="opacity-75 block">{t.maxIncreaseLabel}</span>
              <span className="font-mono tabular-nums font-bold text-sm mt-0.5 block">
                {t.maxPrefix} +{bmiResult.maxWeeklyIncreasePct}%
              </span>
            </div>
            <div>
              <span className="opacity-75 block">{t.extraEasyLabel}</span>
              <span className="font-mono tabular-nums font-bold text-sm mt-0.5 block">
                +{bmiResult.extraEasyRatioPct}%
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
        {t.helperTip}
      </p>

      <PersonalBestCard
        profile={profile}
        runs={runs}
        lang={lang}
        onChangeProfile={onChangeProfile}
      />
      </div>
      )}

      {/* Heart Rate Tracking & Estimated VO2max Panel */}
      {activeProfileTab === 'hr' && (
      <div
        data-testid="hr-vo2max-panel"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HeartPulse
                  className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0"
                  aria-hidden="true"
                />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t.hrSectionTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.hrSectionSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="input-resting-hr"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  {t.restingHrLabel}
                </label>
                <input
                  id="input-resting-hr"
                  data-testid="input-resting-hr"
                  type="number"
                  min={35}
                  max={110}
                  step={1}
                  value={profile.restingHrBpm ?? 60}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChangeProfile((p) => ({
                      ...p,
                      restingHrBpm: Number.isFinite(val) ? val : 60,
                    }));
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t.restingHrHint}
                </p>
              </div>

              <div>
                <label
                  htmlFor="input-max-hr"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  {t.maxHrLabel}
                </label>
                <input
                  id="input-max-hr"
                  data-testid="input-max-hr"
                  type="number"
                  min={120}
                  max={230}
                  step={1}
                  value={profile.maxHrBpm ?? ''}
                  placeholder={`${t.maxHrPlaceholder} (${autoTanakaMaxHr})`}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    if (!raw) {
                      onChangeProfile((p) => ({ ...p, maxHrBpm: null }));
                      return;
                    }
                    const val = Number(raw);
                    onChangeProfile((p) => ({
                      ...p,
                      maxHrBpm: Number.isFinite(val) ? val : null,
                    }));
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t.maxHrAutoHint(autoTanakaMaxHr)}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estimated VO2max Metric Card */}
            <div className="rounded-xl bg-teal-50/85 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/70 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                  {t.vo2MaxLabel}
                </span>
                <Gauge className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  data-testid="vo2max-value"
                  className="text-3xl font-bold font-mono tabular-nums text-teal-950 dark:text-teal-100"
                >
                  {formatDecimalComma(hrVo2.vo2Max, 1, lang)}
                </span>
                <span className="text-xs font-medium text-teal-800 dark:text-teal-300">
                  {t.vo2MaxUnit}
                </span>
              </div>
              <p
                data-testid="vo2max-category"
                className="text-xs font-semibold text-teal-800 dark:text-teal-300"
              >
                {t.categoryPrefix}: {hrVo2.vo2MaxCategory}
              </p>
              <p className="text-[11px] font-semibold text-teal-900 dark:text-teal-200">
                {hrVo2.vo2MaxSource === 'strava_hr_blended'
                  ? t.vo2MethodBlended
                  : t.vo2MethodResting}
              </p>
              <p className="text-[11px] text-teal-900/85 dark:text-teal-200/85 leading-relaxed">
                {hrVo2.vo2MaxNote}
              </p>
            </div>

            {/* Avg Observed HR Card */}
            <div className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/70 p-4 flex flex-col justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 block">
                  {t.avgObservedHrLabel}
                </span>
                <p
                  data-testid="avg-observed-hr"
                  className="text-3xl font-bold font-mono tabular-nums text-indigo-950 dark:text-indigo-100 mt-2"
                >
                  {hrVo2.avgLoggedHrBpm ? `${hrVo2.avgLoggedHrBpm} bpm` : '-- bpm'}
                </p>
              </div>
              <p className="text-[11px] text-indigo-900/85 dark:text-indigo-200/85 leading-relaxed">
                {hrVo2.avgLoggedHrBpm
                  ? `${t.restingHrLabel}: ${hrVo2.restingHrBpm} bpm · HRmax: ${hrVo2.maxHrBpm} bpm`
                  : t.noObservedHrYet}
              </p>
            </div>
          </div>
        </div>

        <div
          data-testid="vo2-nonlab-disclaimer"
          className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
        >
          {t.vo2NonLabDisclaimer}
        </div>

        {/* 5 Karvonen Heart Rate Zones */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t.hrZonesTitle}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {hrVo2.zones.map((z) => (
              <div
                key={z.zone}
                className={`rounded-xl p-3 space-y-1 ${HR_ZONE_PASTEL[z.zone]}`}
              >
                <div className="flex items-center justify-between gap-1 text-xs font-semibold">
                  <span>{z.zone} · {z.label}</span>
                </div>
                <p className="text-base font-bold font-mono tabular-nums">
                  {z.minBpm}–{z.maxBpm} bpm
                </p>
                <p className="text-[11px] font-mono tabular-nums opacity-75">
                  {z.pctRange}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Shoe Mileage Tracker Panel */}
      {activeProfileTab === 'shoes' && (
      <div
        data-testid="shoe-mileage-panel"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Footprints
                className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
                aria-hidden="true"
              />
              <span>{shoeCopy.heading}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {shoeCopy.subtitle}
            </p>
          </div>

          <span
            data-testid="shoe-status-badge"
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 self-start ${
              shoeAlertLevel === 'replace'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                : shoeAlertLevel === 'warning'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {shoeAlertLevel === 'replace'
              ? shoeCopy.replaceBadge
              : shoeAlertLevel === 'warning'
                ? shoeCopy.warningBadge
                : shoeCopy.healthyBadge}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="input-shoe-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
            >
              {shoeCopy.nameLabel}
            </label>
            <input
              id="input-shoe-name"
              data-testid="input-shoe-name"
              type="text"
              maxLength={60}
              value={profile.shoeName ?? 'Sepatu Lari Utama'}
              placeholder={shoeCopy.namePlaceholder}
              onChange={(e) =>
                onChangeProfile((p) => ({ ...p, shoeName: e.target.value }))
              }
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
            />
          </div>

          <div>
            <label
              htmlFor="input-shoe-current-km"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
            >
              {shoeCopy.currentKmLabel}
            </label>
            <input
              id="input-shoe-current-km"
              data-testid="input-shoe-current-km"
              type="number"
              min={0}
              max={10000}
              step={0.5}
              value={shoeCurrentKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChangeProfile((p) => ({
                  ...p,
                  shoeCurrentKm: Number.isFinite(val) ? Math.max(0, val) : 0,
                }));
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
            />
          </div>

          <div>
            <label
              htmlFor="input-shoe-max-km"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
            >
              {shoeCopy.maxKmLabel}
            </label>
            <input
              id="input-shoe-max-km"
              data-testid="input-shoe-max-km"
              type="number"
              min={200}
              max={2000}
              step={50}
              value={shoeMaxKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChangeProfile((p) => ({
                  ...p,
                  shoeMaxKm: Number.isFinite(val)
                    ? Math.min(2000, Math.max(200, val))
                    : 700,
                }));
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {shoeCopy.maxKmHint}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-100">
              {shoeCopy.usagePrefix}: {formatDecimalComma(shoeCurrentKm, 1, lang)} /{' '}
              {formatDecimalComma(shoeMaxKm, 0, lang)} km ({shoePct}%)
            </span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {shoeCopy.remainingPrefix}:{' '}
              {formatDecimalComma(shoeRemainingKm, 1, lang)} km
            </span>
          </div>

          <div
            role="progressbar"
            aria-label={shoeCopy.heading}
            aria-valuenow={Math.min(100, shoePct)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
          >
            <div
              style={{ width: `${Math.round(shoeBarRatio * 100)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                shoeAlertLevel === 'replace'
                  ? 'bg-rose-600 dark:bg-rose-500'
                  : shoeAlertLevel === 'warning'
                    ? 'bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-teal-600 dark:bg-teal-500'
              }`}
            />
          </div>
        </div>

        {shoeAlertLevel !== 'healthy' && (
          <div
            role="status"
            data-testid="shoe-wear-alert"
            className={`rounded-xl px-4 py-3 text-xs flex items-start gap-2.5 ${
              shoeAlertLevel === 'replace'
                ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {shoeAlertLevel === 'replace'
                ? shoeCopy.replaceText
                : shoeCopy.warningText}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          {latestRunKm > 0 && (
            <button
              type="button"
              onClick={() =>
                onChangeProfile((p) => ({
                  ...p,
                  shoeCurrentKm:
                    Math.round(((p.shoeCurrentKm ?? 0) + latestRunKm) * 10) / 10,
                }))
              }
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-900 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 whitespace-nowrap"
            >
              {shoeCopy.syncLatestRunBtn(
                formatDecimalComma(latestRunKm, 1, lang)
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              onChangeProfile((p) => ({
                ...p,
                shoeCurrentKm: Math.round(((p.shoeCurrentKm ?? 0) + 5) * 10) / 10,
              }))
            }
            data-testid="shoe-add-5km-btn"
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-300 whitespace-nowrap"
          >
            {shoeCopy.add5KmBtn}
          </button>
          <button
            type="button"
            onClick={() =>
              onChangeProfile((p) => ({ ...p, shoeCurrentKm: 0 }))
            }
            data-testid="shoe-reset-btn"
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-400 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{shoeCopy.resetNewShoeBtn}</span>
          </button>
        </div>

        <p
          data-testid="shoe-mileage-disclaimer"
          className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800"
        >
          {t.shoeDisclaimer}
        </p>
      </div>
      )}

      {/* Backup & Restore JSON Panel */}
      {activeProfileTab === 'account' && (
      <div className="space-y-5">
      {(onExportBackup || onRestoreBackup) && (
        <div
          data-testid="backup-restore-panel"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {backupCopy.heading}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {backupCopy.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {onExportBackup && (
                <button
                  type="button"
                  onClick={handleTriggerExport}
                  data-testid="export-backup-json-btn"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>{backupCopy.exportBtn}</span>
                </button>
              )}

              {onRestoreBackup && (
                <>
                  <input
                    ref={backupInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleBackupFileSelected}
                    className="hidden"
                    aria-label={backupCopy.importBtn}
                  />
                  <button
                    type="button"
                    onClick={() => backupInputRef.current?.click()}
                    disabled={isRestoringBackup}
                    data-testid="import-backup-json-btn"
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 disabled:opacity-60 inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>{backupCopy.importBtn}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {backupNotice && (
            <div
              role="status"
              data-testid="backup-notice"
              className={`rounded-xl px-4 py-3 text-xs sm:text-sm flex items-center gap-2 ${
                backupNotice.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              {backupNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>{backupNotice.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Privacy & Account Management Panel */}
      {(onOpenPrivacyModal || onOpenDeleteAccountModal) && (
        <div
          data-testid="account-security-panel"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
              {accountSec.heading}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {accountSec.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {onReopenWizard && (
              <button
                type="button"
                onClick={onReopenWizard}
                data-testid="reopen-wizard-btn"
                className="min-h-[42px] px-4 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/60 text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
              >
                {fullCopy.onboarding.reopenBtn}
              </button>
            )}
            {onOpenPrivacyModal && (
              <button
                type="button"
                onClick={onOpenPrivacyModal}
                data-testid="profile-privacy-btn"
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-800 dark:hover:text-teal-300 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
              >
                {accountSec.privacyBtn}
              </button>
            )}
            {onOpenDeleteAccountModal && (
              <button
                type="button"
                onClick={onOpenDeleteAccountModal}
                data-testid="open-delete-account-btn"
                className="min-h-[42px] px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/60 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{accountSec.deleteBtn}</span>
              </button>
            )}
          </div>
        </div>
      )}
      </div>
      )}

      {/* Verified Owner Admin Panel: Approve Buyer Payments & Generate Licenses */}
      {activeProfileTab === 'admin' && canShowOwnerAdmin && (
        <div
          data-testid="admin-access-panel"
          className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/70 rounded-2xl p-6 space-y-5"
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <KeyRound
                  className="w-5 h-5 text-indigo-700 dark:text-indigo-400 shrink-0"
                  aria-hidden="true"
                />
                <span>{adminCopy.heading}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {adminCopy.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-2">
                <label
                  htmlFor="admin-license-plan-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
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
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="lifetime">{adminCopy.planLifetime}</option>
                  <option value="pro">{adminCopy.planPro}</option>
                </select>
              </div>

              <div className="lg:col-span-4">
                <label
                  htmlFor="admin-license-custom-code"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
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
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="lg:col-span-3">
                <label
                  htmlFor="admin-license-buyer-note"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
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
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="lg:col-span-3">
                <button
                  type="button"
                  onClick={() => void handleCreateAccessCode()}
                  disabled={isGeneratingLicense}
                  data-testid="admin-generate-license-btn"
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-indigo-700 dark:bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-800 dark:hover:bg-indigo-500 disabled:opacity-60 whitespace-nowrap"
                >
                  {isGeneratingLicense
                    ? adminCopy.generatingBtn
                    : adminCopy.generateCodeBtn}
                </button>
              </div>
            </div>
          </div>

          {licenseGenError && (
            <p
              role="alert"
              className="text-xs text-rose-700 dark:text-rose-300"
            >
              {licenseGenError}
            </p>
          )}

          {generatedLicense && (
            <div className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  {adminCopy.generatedLabel}
                </p>
                <p className="text-xs font-mono text-slate-900 dark:text-slate-100 break-all">
                  {generatedLicense}
                </p>
                <p className="text-[11px] text-indigo-800/85 dark:text-indigo-200/80">
                  {adminCopy.singleUseHint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyCodeText(generatedLicense)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-xs font-semibold text-indigo-800 dark:text-indigo-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {copiedLicense ? adminCopy.copiedBtn : adminCopy.copyCodeBtn}
                </span>
              </button>
            </div>
          )}

          {/* Issued Single-Use access-codes List */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {adminCopy.licenseListTitle}
            </h4>
            {adminCodes.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {adminCopy.licenseEmptyList}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {adminCodes.slice(0, 15).map((lic) => (
                  <div
                    key={lic.codeId}
                    className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {lic.codeId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold ${
                            lic.status === 'unused'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                              : lic.status === 'used'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                          }`}
                        >
                          {adminCopy.licenseStatusLabels[lic.status]}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {lic.planType}
                        </span>
                        {lic.buyerNote && (
                          <span className="text-slate-600 dark:text-slate-300 truncate">
                            {lic.buyerNote}
                          </span>
                        )}
                      </div>
                      {lic.usedByUid && (
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          UID: {lic.usedByUid}
                        </p>
                      )}
                    </div>

                    {lic.status === 'unused' && (
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => void handleCopyCodeText(lic.codeId)}
                          className="min-h-[36px] px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-indigo-300 inline-flex items-center gap-1 whitespace-nowrap"
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {adminCopy.emptyList}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {adminGrants.map((grant) => (
                <div
                  key={grant.uid}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {grant.uid}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold ${
                          grant.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                            : grant.status === 'revoked'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200'
                        }`}
                      >
                        {adminCopy.statusLabels[grant.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
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
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-teal-800 whitespace-nowrap"
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
      )}
    </section>
  );
}
