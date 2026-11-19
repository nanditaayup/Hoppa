'use client';

import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import {
  AppLanguage,
  BmiResult,
  InjuryStatus,
  RunnerProfile,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';

interface ProfileBmiCalculatorProps {
  profile: RunnerProfile;
  bmiResult: BmiResult;
  lang: AppLanguage;
  onChangeProfile: (updater: (prev: RunnerProfile) => RunnerProfile) => void;
}

export default function ProfileBmiCalculator({
  profile,
  bmiResult,
  lang,
  onChangeProfile,
}: ProfileBmiCalculatorProps) {
  const t = UI_COPY[lang].bmi;

  const categorySurface: Record<BmiResult['category'], string> = {
    kurus: 'bg-sky-50/80 border-sky-200 text-sky-900',
    ideal: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
    berlebih: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
    obesitas: 'bg-rose-50/80 border-rose-200 text-rose-900',
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
          className="text-2xl font-bold text-slate-900 tracking-tight"
        >
          {t.heading}
        </h2>
        <p className="text-sm text-slate-600">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Form Inputs Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-500">
              {t.methodLabel}
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() =>
                  onChangeProfile((p) => ({ ...p, useDirectBmi: false }))
                }
                className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  !profile.useDirectBmi
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                  className="block text-sm font-medium text-slate-700 mb-1.5"
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
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <p className="text-xs text-slate-500 mt-1">{t.weightHint}</p>
              </div>

              <div>
                <label
                  htmlFor="input-height-cm"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
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
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <p className="text-xs text-slate-500 mt-1">{t.heightHint}</p>
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="input-direct-bmi"
                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="input-age"
                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label
                htmlFor="select-injury-status"
                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
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

          <div className="pt-4 border-t border-black/10 grid grid-cols-2 gap-3 text-xs">
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
    </section>
  );
}
