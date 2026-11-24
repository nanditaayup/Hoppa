'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import { RACE_TARGETS_BY_LANG } from '@/lib/strava/config';
import {
  RACE_DISTANCES,
  calculateTrainingPaces,
} from '@/lib/strava/pace-calculator';
import {
  calculateBmi,
  formatDecimalComma,
  formatPace,
  generateTrainingPlan,
  getDefaultRaceDateKey,
} from '@/lib/strava/transform';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  AppLanguage,
  InjuryStatus,
  KpiSummary,
  RaceDistanceKey,
  RunnerProfile,
} from '@/lib/strava/types';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  lang: AppLanguage;
  initialProfile: RunnerProfile;
  initialRaceDate: string | null;
  initialRaceName: string;
  todayDateKey: string;
  kpi: KpiSummary;
  onComplete: (payload: {
    profile: RunnerProfile;
    raceDate: string | null;
    raceName: string;
  }) => void;
  onSkip: () => void;
}

const RACE_KEYS: RaceDistanceKey[] = ['5K', '10K', '21K', '42K'];
const DAY_OPTIONS: Array<3 | 4 | 5 | 6> = [3, 4, 5, 6];

export default function OnboardingWizardModal({
  isOpen,
  lang,
  initialProfile,
  initialRaceDate,
  initialRaceName,
  todayDateKey,
  kpi,
  onComplete,
  onSkip,
}: OnboardingWizardModalProps) {
  const fullCopy = UI_COPY[lang];
  const t = fullCopy.onboarding;
  const raceTargets = RACE_TARGETS_BY_LANG[lang];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetRace, setTargetRace] = useState<RaceDistanceKey>(
    initialProfile.targetRace
  );
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<3 | 4 | 5 | 6>(
    initialProfile.trainingDaysPerWeek
  );
  const [raceName, setRaceName] = useState(initialRaceName);
  const [raceDate, setRaceDate] = useState(
    initialRaceDate || getDefaultRaceDateKey(todayDateKey, initialProfile.targetRace)
  );
  const [weightKg, setWeightKg] = useState<number>(initialProfile.weightKg);
  const [heightCm, setHeightCm] = useState<number>(initialProfile.heightCm);
  const [age, setAge] = useState<number>(initialProfile.age);
  const [injuryStatus, setInjuryStatus] = useState<InjuryStatus>(
    initialProfile.injuryStatus
  );

  const [useCustomTargetTime, setUseCustomTargetTime] = useState<boolean>(
    Boolean(initialProfile.customTargetPaceSecPerKm)
  );
  const [goalHours, setGoalHours] = useState<number>(
    RACE_DISTANCES[initialProfile.targetRace].defaultHours
  );
  const [goalMinutes, setGoalMinutes] = useState<number>(
    RACE_DISTANCES[initialProfile.targetRace].defaultMinutes
  );

  const handleSelectRace = (race: RaceDistanceKey) => {
    setTargetRace(race);
    setRaceDate(getDefaultRaceDateKey(todayDateKey, race));
    setGoalHours(RACE_DISTANCES[race].defaultHours);
    setGoalMinutes(RACE_DISTANCES[race].defaultMinutes);
  };

  const paceResult = useMemo(
    () => calculateTrainingPaces(targetRace, goalHours, goalMinutes, 0, lang),
    [targetRace, goalHours, goalMinutes, lang]
  );

  const draftProfile: RunnerProfile = useMemo(
    () => ({
      ...initialProfile,
      weightKg,
      heightCm,
      age,
      injuryStatus,
      targetRace,
      trainingDaysPerWeek,
      customTargetPaceSecPerKm: useCustomTargetTime ? paceResult.racePaceSec : null,
      onboardingCompleted: true,
    }),
    [
      initialProfile,
      weightKg,
      heightCm,
      age,
      injuryStatus,
      targetRace,
      trainingDaysPerWeek,
      useCustomTargetTime,
      paceResult.racePaceSec,
    ]
  );

  const previewBmi = useMemo(
    () =>
      calculateBmi(
        draftProfile.weightKg,
        draftProfile.heightCm,
        draftProfile.directBmi,
        false,
        lang
      ),
    [draftProfile, lang]
  );

  const previewPlan = useMemo(
    () => generateTrainingPlan(draftProfile, kpi, lang),
    [draftProfile, kpi, lang]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 dark:bg-black/75 backdrop-blur-[2px] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-wizard-title"
        data-testid="onboarding-wizard-modal"
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 max-h-[92vh] overflow-y-auto"
      >
        {/* Header & Step Progress */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                {t.badge}
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {t.stepOf(step, 3)}
              </span>
            </div>
            <h2
              id="onboarding-wizard-title"
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              {step === 1
                ? t.titleStep1
                : step === 2
                  ? t.titleStep2
                  : t.titleStep3}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {step === 1
                ? t.subtitleStep1
                : step === 2
                  ? t.subtitleStep2
                  : t.subtitleStep3}
            </p>
          </div>

          <button
            type="button"
            onClick={onSkip}
            aria-label={t.skipBtn}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual 3-Step Indicator Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-colors ${
                idx <= step
                  ? 'bg-teal-700 dark:bg-teal-500'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Race Target, Days/Week, Date */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {t.raceLabel}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RACE_KEYS.map((key) => {
                  const active = targetRace === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectRace(key)}
                      data-testid={`wizard-race-${key}`}
                      className={`min-h-[52px] px-3 py-2 rounded-xl border text-left transition-colors ${
                        active
                          ? 'bg-teal-700 dark:bg-teal-600 border-teal-700 text-white'
                          : 'bg-[#F7F9FA] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <span className="block text-sm font-bold font-mono tabular-nums">
                        {raceTargets[key].label}
                      </span>
                      <span
                        className={`block text-[11px] ${
                          active
                            ? 'text-teal-100'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {formatDecimalComma(raceTargets[key].distanceKm, 1, lang)} km
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {t.freqLabel}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {DAY_OPTIONS.map((days) => {
                  const active = trainingDaysPerWeek === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTrainingDaysPerWeek(days)}
                      data-testid={`wizard-days-${days}`}
                      className={`min-h-[48px] px-2 py-2 rounded-xl border text-center font-mono tabular-nums text-sm font-bold transition-colors ${
                        active
                          ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-600 text-teal-900 dark:text-teal-100'
                          : 'bg-[#F7F9FA] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {days}x
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="wizard-event-name"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.eventNameLabel}
                </label>
                <input
                  id="wizard-event-name"
                  type="text"
                  maxLength={80}
                  value={raceName}
                  onChange={(e) => setRaceName(e.target.value)}
                  placeholder={t.eventNamePlaceholder}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="wizard-event-date"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.eventDateLabel}
                </label>
                <input
                  id="wizard-event-date"
                  type="date"
                  value={raceDate}
                  onChange={(e) => setRaceDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Weight, Height, Age, Injury & Optional Finish Goal */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="wizard-weight-kg"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {fullCopy.bmi.weightLabel}
                </label>
                <input
                  id="wizard-weight-kg"
                  data-testid="wizard-weight-input"
                  type="number"
                  min={30}
                  max={200}
                  step={0.5}
                  value={weightKg}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setWeightKg(Number.isFinite(v) ? v : 65);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label
                  htmlFor="wizard-height-cm"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {fullCopy.bmi.heightLabel}
                </label>
                <input
                  id="wizard-height-cm"
                  data-testid="wizard-height-input"
                  type="number"
                  min={120}
                  max={230}
                  value={heightCm}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setHeightCm(Number.isFinite(v) ? v : 170);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label
                  htmlFor="wizard-age"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {fullCopy.bmi.ageLabel}
                </label>
                <input
                  id="wizard-age"
                  type="number"
                  min={14}
                  max={85}
                  value={age}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setAge(Number.isFinite(v) ? v : 30);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="wizard-injury-select"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                {fullCopy.bmi.injuryLabel}
              </label>
              <select
                id="wizard-injury-select"
                value={injuryStatus}
                onChange={(e) => setInjuryStatus(e.target.value as InjuryStatus)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="none">{fullCopy.bmi.injuryOptions.none}</option>
                <option value="recovering">{fullCopy.bmi.injuryOptions.recovering}</option>
                <option value="active">{fullCopy.bmi.injuryOptions.active}</option>
              </select>
            </div>

            <div className="rounded-xl bg-[#F7F9FA] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomTargetTime}
                  onChange={(e) => setUseCustomTargetTime(e.target.checked)}
                  className="w-4 h-4 rounded accent-teal-700"
                />
                <span>{t.targetTimeToggle}</span>
              </label>

              {useCustomTargetTime && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      aria-label={fullCopy.paceCalculator.hoursLabel}
                      min={0}
                      max={10}
                      value={goalHours}
                      onChange={(e) =>
                        setGoalHours(Math.max(0, Math.min(10, Number(e.target.value) || 0)))
                      }
                      className="w-20 min-h-[40px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono tabular-nums text-center text-sm"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {fullCopy.paceCalculator.hoursLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      aria-label={fullCopy.paceCalculator.minutesLabel}
                      min={0}
                      max={59}
                      value={goalMinutes}
                      onChange={(e) =>
                        setGoalMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))
                      }
                      className="w-20 min-h-[40px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono tabular-nums text-center text-sm"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {fullCopy.paceCalculator.minutesLabel}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300">
                    {t.targetPacePreview} {paceResult.racePaceFormatted}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Live Summary Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#EAF6F3] via-[#F4F8FB] to-[#EEF2FB] dark:from-teal-950/60 dark:via-slate-800/80 dark:to-indigo-950/50 border border-teal-200/80 dark:border-teal-800/60 p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-300">
                <CalendarCheck2 className="w-4 h-4" aria-hidden="true" />
                <span>{t.previewSummaryHeading}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 p-3.5">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.previewBmiLabel}
                  </p>
                  <p className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                    {previewBmi.formattedBmi} · +{previewBmi.maxWeeklyIncreasePct}%
                  </p>
                  <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5">
                    {previewBmi.categoryLabel}
                  </p>
                </div>

                <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 p-3.5">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.previewVolumeLabel}
                  </p>
                  <p className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                    {formatDecimalComma(previewPlan.totalPlannedWeekKm, 1, lang)} km
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {targetRace} · {trainingDaysPerWeek} {fullCopy.training.daysPerWeekShort}
                  </p>
                </div>

                <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 p-3.5">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.previewPaceLabel}
                  </p>
                  <p className="text-base font-bold font-mono tabular-nums text-teal-700 dark:text-teal-300 mt-1">
                    {formatPace(previewPlan.baselinePaceSecPerKm)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Easy {previewPlan.paceZones[0]?.formattedRange}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {step === 1 ? (
            <button
              type="button"
              onClick={onSkip}
              data-testid="wizard-skip-btn"
              className="min-h-[42px] px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {t.skipBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(step === 3 ? 2 : 1)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-300 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>{t.backBtn}</span>
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step === 1 ? 2 : 3)}
              data-testid="wizard-next-btn"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{t.nextBtn}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onComplete({
                  profile: draftProfile,
                  raceDate: raceDate || null,
                  raceName: raceName.trim(),
                })
              }
              data-testid="wizard-submit-btn"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 inline-flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>{t.submitBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
