'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertCircle,
  HeartPulse,
  Gauge,
  Shield,
  Trash2,
} from 'lucide-react';
import {
  AppLanguage,
  BmiResult,
  HeartRateVo2Summary,
  HeartRateZone,
  InjuryStatus,
  RunnerProfile,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { formatDecimalComma } from '@/lib/strava/transform';

interface ProfileBmiCalculatorProps {
  profile: RunnerProfile;
  bmiResult: BmiResult;
  hrVo2: HeartRateVo2Summary;
  lang: AppLanguage;
  onChangeProfile: (updater: (prev: RunnerProfile) => RunnerProfile) => void;
  onOpenPrivacyModal?: () => void;
  onOpenDeleteAccountModal?: () => void;
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
  lang,
  onChangeProfile,
  onOpenPrivacyModal,
  onOpenDeleteAccountModal,
}: ProfileBmiCalculatorProps) {
  const t = UI_COPY[lang].bmi;
  const accountSec = UI_COPY[lang].accountSecurity;
  const autoTanakaMaxHr = Math.round(208 - 0.7 * Math.min(85, Math.max(14, profile.age)));

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

      {/* Heart Rate Tracking & Estimated VO2max Panel */}
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
    </section>
  );
}
