'use client';

import React from 'react';
import { Utensils, Droplets, Wheat, Beef } from 'lucide-react';
import { AppLanguage, NutritionRecommendation } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { formatDecimalComma } from '@/lib/strava/transform';

interface NutritionRecoverySectionProps {
  nutrition: NutritionRecommendation;
  lang: AppLanguage;
}

export default function NutritionRecoverySection({
  nutrition,
  lang,
}: NutritionRecoverySectionProps) {
  const t = UI_COPY[lang].nutrition;

  return (
    <section
      id="nutrisi-pemulihan"
      aria-labelledby="nutrition-section-heading"
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2
          id="nutrition-section-heading"
          className="text-2xl font-bold text-slate-900 tracking-tight"
        >
          {t.headingPrefix} ({nutrition.targetRace})
        </h2>
        <p className="text-sm text-slate-600">
          {t.subtitleBeforeWeight}{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-800">
            {formatDecimalComma(nutrition.weightKg, 1, lang)} kg
          </span>{' '}
          {t.subtitleAfterWeight}
        </p>
      </div>

      {/* Main Nutrition Surface (single elevation card, soft pastel columns) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-indigo-50/80 text-indigo-950 p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-indigo-800">
                {t.carbsLabel}
              </span>
              <Wheat
                className="w-4 h-4 text-indigo-700 shrink-0"
                aria-hidden="true"
              />
            </div>
            <p
              data-testid="nutrition-carbs-range"
              className="text-2xl font-bold font-mono tabular-nums"
            >
              {nutrition.carbsMinG}–{nutrition.carbsMaxG} g
            </p>
            <p className="text-xs text-indigo-900/80 font-mono tabular-nums">
              {formatDecimalComma(nutrition.carbsPerKgMin, 1, lang)}–
              {formatDecimalComma(nutrition.carbsPerKgMax, 1, lang)}{' '}
              {t.carbsUnitNote}
            </p>
          </div>

          <div className="rounded-xl bg-teal-50/80 text-teal-950 p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-teal-800">
                {t.proteinLabel}
              </span>
              <Beef
                className="w-4 h-4 text-teal-700 shrink-0"
                aria-hidden="true"
              />
            </div>
            <p
              data-testid="nutrition-protein-range"
              className="text-2xl font-bold font-mono tabular-nums"
            >
              {nutrition.proteinMinG}–{nutrition.proteinMaxG} g
            </p>
            <p className="text-xs text-teal-900/80 font-mono tabular-nums">
              {formatDecimalComma(nutrition.proteinPerKgMin, 1, lang)}–
              {formatDecimalComma(nutrition.proteinPerKgMax, 1, lang)}{' '}
              {t.proteinUnitNote}
            </p>
          </div>

          <div className="rounded-xl bg-sky-50/80 text-sky-950 p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-sky-800">
                {t.hydrationLabel}
              </span>
              <Droplets
                className="w-4 h-4 text-sky-700 shrink-0"
                aria-hidden="true"
              />
            </div>
            <p
              data-testid="nutrition-hydration-range"
              className="text-2xl font-bold font-mono tabular-nums"
            >
              {formatDecimalComma(nutrition.hydrationLitersMin, 1, lang)}–
              {formatDecimalComma(nutrition.hydrationLitersMax, 1, lang)} L
            </p>
            <p className="text-xs text-sky-900/80">{t.hydrationUnitNote}</p>
          </div>
        </div>

        {/* BMI-tailored nutrition note separated cleanly by hairline */}
        <div className="pt-4 border-t border-slate-100 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {t.strategyHeadingPrefix} {nutrition.targetRace}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {nutrition.bmiNutritionNote}
            </p>
          </div>
        </div>

        {/* 3-phase recovery timing schedule */}
        <div className="pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          {nutrition.recoveryTimings.map((slot) => (
            <div key={slot.key} className="space-y-1.5">
              <p className="text-xs font-medium text-teal-700">
                {slot.timingLabel}
              </p>
              <h4 className="text-base font-bold text-slate-900">{slot.title}</h4>
              <p className="text-xs font-semibold text-slate-700">
                {slot.macroFocus}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {slot.detail}
              </p>
              <p className="text-xs text-slate-500 pt-1">
                <span className="font-semibold text-slate-700">
                  {t.examplesLabel}{' '}
                </span>
                {slot.foodExamples}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
