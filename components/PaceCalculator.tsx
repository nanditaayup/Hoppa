'use client';

import React, { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, RotateCcw } from 'lucide-react';
import {
  RACE_DISTANCES,
  calculateTrainingPaces,
  formatCalculatorDecimal,
  formatCalculatorPace,
} from '@/lib/strava/pace-calculator';
import { UI_COPY } from '@/lib/strava/i18n';
import { AppLanguage, RaceDistanceKey } from '@/lib/strava/types';

interface PaceCalculatorProps {
  initialRace: RaceDistanceKey;
  activeCustomPaceSecPerKm?: number | null;
  lang: AppLanguage;
  onApplyTargetPace: (race: RaceDistanceKey, paceSecPerKm: number) => void;
  onResetCustomPace: () => void;
}

const RACE_KEYS: RaceDistanceKey[] = ['5K', '10K', '21K', '42K'];

export default function PaceCalculator({
  initialRace,
  activeCustomPaceSecPerKm = null,
  lang,
  onApplyTargetPace,
  onResetCustomPace,
}: PaceCalculatorProps) {
  const t = UI_COPY[lang].paceCalculator;
  const [selectedDistance, setSelectedDistance] =
    useState<RaceDistanceKey>(initialRace);
  const [hours, setHours] = useState<number>(
    RACE_DISTANCES[initialRace].defaultHours
  );
  const [minutes, setMinutes] = useState<number>(
    RACE_DISTANCES[initialRace].defaultMinutes
  );
  const [seconds, setSeconds] = useState<number>(
    RACE_DISTANCES[initialRace].defaultSeconds
  );
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const handleSelectDistance = (key: RaceDistanceKey) => {
    setSelectedDistance(key);
    setHours(RACE_DISTANCES[key].defaultHours);
    setMinutes(RACE_DISTANCES[key].defaultMinutes);
    setSeconds(RACE_DISTANCES[key].defaultSeconds);
    setAppliedNotice(null);
  };

  const handleReset = () => {
    handleSelectDistance(selectedDistance);
  };

  const result = useMemo(
    () =>
      calculateTrainingPaces(
        selectedDistance,
        hours,
        minutes,
        seconds,
        lang
      ),
    [selectedDistance, hours, minutes, seconds, lang]
  );

  const handleApply = () => {
    onApplyTargetPace(selectedDistance, result.racePaceSec);
    setAppliedNotice(
      t.appliedNotice(selectedDistance, result.racePaceFormatted)
    );
  };

  return (
    <section
      data-testid="pace-calculator-section"
      aria-labelledby="pace-calculator-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <h3
            id="pace-calculator-heading"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
          >
            <Calculator
              className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
              aria-hidden="true"
            />
            <span>{t.heading}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          data-testid="pace-calc-reset-btn"
          className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-800 dark:hover:text-teal-300 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.resetBtn}</span>
        </button>
      </div>

      {activeCustomPaceSecPerKm && activeCustomPaceSecPerKm > 0 && (
        <div
          data-testid="active-custom-pace-banner"
          className="rounded-xl bg-teal-50/85 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-teal-950 dark:text-teal-100"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0"
              aria-hidden="true"
            />
            <span>
              {t.activeCustomBanner(
                formatCalculatorPace(activeCustomPaceSecPerKm)
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onResetCustomPace();
              setAppliedNotice(null);
            }}
            data-testid="clear-custom-pace-btn"
            className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-700 text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-100/60 dark:hover:bg-slate-700 whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            {t.useStravaBaselineBtn}
          </button>
        </div>
      )}

      {/* Distance Selection */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
          {t.distanceLabel}
        </span>
        <div
          role="group"
          aria-label={t.distanceLabel}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
        >
          {RACE_KEYS.map((key) => {
            const opt = RACE_DISTANCES[key];
            const active = selectedDistance === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectDistance(key)}
                data-testid={`pace-calc-dist-${key}`}
                aria-pressed={active}
                className={`min-h-[52px] px-3.5 py-2.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                  active
                    ? 'bg-teal-700 dark:bg-teal-600 border-teal-700 dark:border-teal-500 text-white'
                    : 'bg-[#F7F9FA] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-teal-300 dark:hover:border-teal-600'
                }`}
              >
                <span className="block text-sm font-bold">{key}</span>
                <span
                  className={`block text-xs font-mono tabular-nums mt-0.5 ${
                    active
                      ? 'text-teal-100'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {formatCalculatorDecimal(opt.km, 2, lang)} km
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Finish Time Inputs */}
      <div className="grid grid-cols-3 gap-3 max-w-md">
        <div>
          <label
            htmlFor="pace-calc-hours"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {t.hoursLabel}
          </label>
          <input
            id="pace-calc-hours"
            data-testid="pace-calc-hours"
            type="number"
            min={0}
            max={24}
            value={hours}
            onChange={(e) => {
              const val = Number(e.target.value);
              setHours(Number.isFinite(val) ? Math.min(24, Math.max(0, Math.floor(val))) : 0);
              setAppliedNotice(null);
            }}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums text-center focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
          />
        </div>

        <div>
          <label
            htmlFor="pace-calc-minutes"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {t.minutesLabel}
          </label>
          <input
            id="pace-calc-minutes"
            data-testid="pace-calc-minutes"
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMinutes(Number.isFinite(val) ? Math.min(59, Math.max(0, Math.floor(val))) : 0);
              setAppliedNotice(null);
            }}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums text-center focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
          />
        </div>

        <div>
          <label
            htmlFor="pace-calc-seconds"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {t.secondsLabel}
          </label>
          <input
            id="pace-calc-seconds"
            data-testid="pace-calc-seconds"
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSeconds(Number.isFinite(val) ? Math.min(59, Math.max(0, Math.floor(val))) : 0);
              setAppliedNotice(null);
            }}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 font-mono tabular-nums text-center focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
          />
        </div>
      </div>

      {/* Primary Race Pace Output & Apply Action */}
      <div className="rounded-xl bg-gradient-to-br from-[#EAF6F3] via-[#F4F8FB] to-[#EEF2FB] dark:from-teal-950/60 dark:via-slate-800/80 dark:to-indigo-950/50 border border-teal-200/80 dark:border-teal-800/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs font-medium text-teal-900 dark:text-teal-200">
              {t.racePaceLabel} ({selectedDistance})
            </p>
            <p
              data-testid="pace-calc-race-pace"
              className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5"
            >
              {result.racePaceFormatted}
            </p>
          </div>
          <div className="pl-0 sm:pl-6 sm:border-l border-teal-200/70 dark:border-teal-800/60">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {t.speedLabel}
            </p>
            <p
              data-testid="pace-calc-speed"
              className="text-lg sm:text-xl font-bold font-mono tabular-nums text-teal-800 dark:text-teal-300 mt-0.5"
            >
              {result.speedKmhFormatted}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          data-testid="pace-calc-apply-btn"
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
        >
          {t.applyToPlanBtn}
        </button>
      </div>

      {appliedNotice && (
        <div
          role="status"
          data-testid="pace-calc-applied-notice"
          className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 px-4 py-3 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2"
        >
          <CheckCircle2
            className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0"
            aria-hidden="true"
          />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* 3 Training Zone Summary Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50/85 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 p-4 space-y-1">
          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
            {t.easyTitle}
          </p>
          <p
            data-testid="pace-calc-easy"
            className="text-base font-bold font-mono tabular-nums text-emerald-950 dark:text-emerald-100"
          >
            {result.easyRange}
          </p>
          <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
            {t.easyNote}
          </p>
        </div>

        <div className="rounded-xl bg-sky-50/85 dark:bg-sky-950/50 border border-sky-200/70 dark:border-sky-800/60 p-4 space-y-1">
          <p className="text-xs font-semibold text-sky-900 dark:text-sky-200">
            {t.tempoTitle}
          </p>
          <p
            data-testid="pace-calc-tempo"
            className="text-base font-bold font-mono tabular-nums text-sky-950 dark:text-sky-100"
          >
            {result.tempoRange}
          </p>
          <p className="text-[11px] text-sky-900/80 dark:text-sky-200/80 leading-relaxed">
            {t.tempoNote}
          </p>
        </div>

        <div className="rounded-xl bg-indigo-50/85 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 p-4 space-y-1">
          <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
            {t.intervalTitle}
          </p>
          <p
            data-testid="pace-calc-interval"
            className="text-base font-bold font-mono tabular-nums text-indigo-950 dark:text-indigo-100"
          >
            {result.intervalRange}
          </p>
          <p className="text-[11px] text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
            {t.intervalNote}
          </p>
        </div>
      </div>
    </section>
  );
}
