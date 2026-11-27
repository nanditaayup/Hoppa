'use client';

import React, { useState } from 'react';
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
  const [showMacroDetails, setShowMacroDetails] = useState(false);

  return (
    <section
      id="nutrisi-pemulihan"
      aria-labelledby="nutrition-section-heading"
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2
          id="nutrition-section-heading"
          className="text-2xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight"
        >
          {t.headingPrefix} ({nutrition.targetRace})
        </h2>
        <p className="text-sm text-[#596866] dark:text-slate-300">
          {t.subtitleBeforeWeight}{' '}
          <span className="font-mono tabular-nums font-semibold text-[#202A2A] dark:text-slate-100">
            {formatDecimalComma(nutrition.weightKg, 1, lang)} kg
          </span>
          {t.subtitleAfterWeight}
        </p>
      </div>

      {/* Main Practical Surface */}
      <div className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#202A2A] dark:text-slate-100">
            {t.practicalHeading}
          </h3>

          {/* 3-slot practical timing schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 divide-y md:divide-y-0 md:divide-x divide-[#DFE7E2] dark:divide-slate-800">
            {nutrition.recoveryTimings.map((slot, idx) => (
              <div
                key={slot.key}
                className={`space-y-1.5 ${idx > 0 ? 'pt-4 md:pt-0 md:pl-5' : ''}`}
              >
                <p className="text-xs font-semibold text-[#087F73] dark:text-teal-400">
                  {slot.timingLabel}
                </p>
                <h4 className="text-base font-bold text-[#202A2A] dark:text-slate-100">
                  {slot.title}
                </h4>
                <p className="text-xs font-semibold text-[#202A2A] dark:text-slate-200">
                  {slot.macroFocus}
                </p>
                <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
                  {slot.detail}
                </p>
                <p className="text-xs text-[#596866] dark:text-slate-400 pt-1">
                  <span className="font-semibold text-[#202A2A] dark:text-slate-200">
                    {t.examplesLabel}{' '}
                  </span>
                  {slot.foodExamples}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual strategy note separated cleanly by hairline */}
        <div className="pt-5 border-t border-[#DFE7E2] dark:border-slate-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E6F3EE] dark:bg-teal-950/60 text-[#087F73] dark:text-teal-400 flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#202A2A] dark:text-slate-100">
              {t.strategyHeadingPrefix} · {nutrition.targetRace}
            </h3>
            <p className="text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
              {nutrition.bmiNutritionNote}
            </p>
          </div>
        </div>

        {/* Collapsible Macro & Hydration Rough Estimates (closed by default) */}
        <div className="pt-4 border-t border-[#DFE7E2] dark:border-slate-800 space-y-4">
          <button
            type="button"
            onClick={() => setShowMacroDetails((prev) => !prev)}
            aria-expanded={showMacroDetails}
            data-testid="toggle-nutrition-macros"
            className="min-h-[40px] px-4 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73]"
          >
            {showMacroDetails ? t.macroToggleHide : t.macroToggleShow}
          </button>

          {showMacroDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-[#F7F6F2] dark:bg-slate-800/70 border border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#596866] dark:text-slate-300">
                      {t.carbsLabel}
                    </span>
                    <Wheat
                      className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <p
                    data-testid="nutrition-carbs-range"
                    className="text-xl font-bold font-mono tabular-nums"
                  >
                    {nutrition.carbsMinG}–{nutrition.carbsMaxG} g
                  </p>
                  <p className="text-xs text-[#596866] dark:text-slate-400 font-mono tabular-nums">
                    {formatDecimalComma(nutrition.carbsPerKgMin, 1, lang)}–
                    {formatDecimalComma(nutrition.carbsPerKgMax, 1, lang)}{' '}
                    {t.carbsUnitNote}
                  </p>
                </div>

                <div className="rounded-xl bg-[#E6F3EE]/60 dark:bg-teal-950/40 border border-[#DFE7E2] dark:border-teal-800/60 text-[#202A2A] dark:text-teal-100 p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#087F73] dark:text-teal-300">
                      {t.proteinLabel}
                    </span>
                    <Beef
                      className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <p
                    data-testid="nutrition-protein-range"
                    className="text-xl font-bold font-mono tabular-nums"
                  >
                    {nutrition.proteinMinG}–{nutrition.proteinMaxG} g
                  </p>
                  <p className="text-xs text-[#596866] dark:text-teal-200/80 font-mono tabular-nums">
                    {formatDecimalComma(nutrition.proteinPerKgMin, 1, lang)}–
                    {formatDecimalComma(nutrition.proteinPerKgMax, 1, lang)}{' '}
                    {t.proteinUnitNote}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F7F6F2] dark:bg-slate-800/70 border border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#596866] dark:text-slate-300">
                      {t.hydrationLabel}
                    </span>
                    <Droplets
                      className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <p
                    data-testid="nutrition-hydration-range"
                    className="text-xl font-bold font-mono tabular-nums"
                  >
                    {formatDecimalComma(nutrition.hydrationLitersMin, 1, lang)}–
                    {formatDecimalComma(nutrition.hydrationLitersMax, 1, lang)} L
                  </p>
                  <p className="text-xs text-[#596866] dark:text-slate-400">
                    {t.hydrationUnitNote}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#596866] dark:text-slate-400 leading-relaxed">
                {t.macroCalcNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

