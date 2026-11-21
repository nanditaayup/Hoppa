'use client';

import React, { useState } from 'react';
import {
  Check,
  CalendarCheck2,
  Dumbbell,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { RACE_TARGETS_BY_LANG } from '@/lib/strava/config';
import {
  AppLanguage,
  DailyProgressEntry,
  DailySessionPlan,
  RaceDistanceKey,
  RunnerProfile,
  TrainingPlanSummary,
  TrainingZoneType,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { formatDecimalComma, formatPace } from '@/lib/strava/transform';
import PaceCalculator from './PaceCalculator';

interface TrainingPlanSectionProps {
  profile: RunnerProfile;
  plan: TrainingPlanSummary;
  progressEntries: DailyProgressEntry[];
  countdownDaysRemaining: number;
  raceEventLabel: string;
  lang: AppLanguage;
  onChangeProfile: (updater: (prev: RunnerProfile) => RunnerProfile) => void;
  onQuickLogSession: (session: DailySessionPlan) => void;
}

const ZONE_PASTEL_MAP: Record<TrainingZoneType, string> = {
  easy: 'bg-emerald-50/85 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border border-transparent dark:border-emerald-800/60',
  tempo: 'bg-sky-50/85 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border border-transparent dark:border-sky-800/60',
  interval: 'bg-indigo-50/85 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-transparent dark:border-indigo-800/60',
  long_run: 'bg-teal-50/85 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 border border-transparent dark:border-teal-800/60',
  rest: 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300',
};

export default function TrainingPlanSection({
  profile,
  plan,
  progressEntries,
  countdownDaysRemaining,
  raceEventLabel,
  lang,
  onChangeProfile,
  onQuickLogSession,
}: TrainingPlanSectionProps) {
  const [subTab, setSubTab] = useState<'schedule' | 'zones' | 'calculator'>('schedule');
  const fullCopy = UI_COPY[lang];
  const t = fullCopy.training;
  const raceTargets = RACE_TARGETS_BY_LANG[lang];
  const reductionPct = Math.round((1 - plan.taperMultiplier) * 100);
  const taperNotice =
    plan.taperStatus === 'race_day'
      ? {
          title: t.raceDayNoticeTitle,
          body: t.raceDayNoticeBody(raceEventLabel),
        }
      : plan.taperStatus === 'race_week'
        ? {
            title: t.raceWeekNoticeTitle,
            body: t.raceWeekNoticeBody(
              Math.max(1, countdownDaysRemaining),
              raceEventLabel
            ),
          }
        : plan.taperStatus === 'tapering'
          ? {
              title: t.taperNoticeTitle,
              body: t.taperNoticeBody(
                countdownDaysRemaining,
                reductionPct,
                raceEventLabel
              ),
            }
          : null;
  const completedDayIndices = new Set(progressEntries.map((e) => e.dayIndex));
  const strengthCount = plan.weeklySchedule.filter((s) =>
    Boolean(s.strengthSession)
  ).length;
  const raceList: RaceDistanceKey[] = ['5K', '10K', '21K', '42K'];
  const dayOptions: Array<3 | 4 | 5 | 6> = [3, 4, 5, 6];

  return (
    <section
      id="menu-latihan"
      aria-labelledby="training-plan-heading"
      className="space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="space-y-1">
          <h2
            id="training-plan-heading"
            className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
          >
            {t.heading}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.subtitlePrefix}
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-100">
              {formatDecimalComma(plan.baselineFourWeekAvgKm, 1, lang)}{' '}
              {t.weekUnit}
            </span>
            {t.subtitleMiddle}{' '}
            <span className="font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
              {formatPace(plan.baselinePaceSecPerKm)}
            </span>
            {plan.isUsingCustomTargetPace ? (
              <>
                {' '}
                <span className="font-semibold text-teal-800 dark:text-teal-300">
                  ({t.customPaceBadge})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChangeProfile((p) => ({
                      ...p,
                      customTargetPaceSecPerKm: null,
                    }))
                  }
                  className="ml-2 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  {t.resetCustomPaceBtn}
                </button>
              </>
            ) : plan.isUsingDefaultBaseline ? (
              t.defaultBaselineTag
            ) : (
              t.stravaBaselineTag
            )}
            .
          </p>
        </div>
      </div>

      {/* Compact Target & Frequency Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-2">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t.step1Title}
            </span>
            <div
              role="group"
              aria-label={t.raceGroupAria}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {raceList.map((key) => {
                const race = raceTargets[key];
                const active = profile.targetRace === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      onChangeProfile((p) => ({ ...p, targetRace: key }))
                    }
                    className={`min-h-[52px] px-3 py-2 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                      active
                        ? 'bg-teal-700 dark:bg-teal-600 border-teal-700 dark:border-teal-500 text-white'
                        : 'bg-[#F7F9FA] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-teal-300 dark:hover:border-teal-600'
                    }`}
                  >
                    <span className="block text-sm font-bold font-mono tabular-nums">
                      {race.label}
                    </span>
                    <span
                      className={`block text-[11px] mt-0.5 ${
                        active
                          ? 'text-teal-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {formatDecimalComma(race.distanceKm, 1, lang)} km
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-2">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t.step2Title}
            </span>
            <div
              role="group"
              aria-label={t.freqGroupAria}
              className="grid grid-cols-4 gap-2"
            >
              {dayOptions.map((days) => {
                const active = profile.trainingDaysPerWeek === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() =>
                      onChangeProfile((p) => ({
                        ...p,
                        trainingDaysPerWeek: days,
                      }))
                    }
                    className={`min-h-[52px] px-2 py-2 rounded-xl border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                      active
                        ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 dark:border-teal-500 text-teal-900 dark:text-teal-100'
                        : 'bg-[#F7F9FA] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600'
                    }`}
                  >
                    <span className="block text-base font-bold font-mono tabular-nums">
                      {days}
                    </span>
                    <span className="block text-[11px]">
                      {t.daysPerWeekShort}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.totalPlannedLabel}{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                {formatDecimalComma(plan.totalPlannedWeekKm, 1, lang)} km
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Clean 3-Tab Sub-Navigation (Weekly Schedule vs Pace Zones vs Pace Calculator) */}
      <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setSubTab('schedule')}
          data-testid="training-tab-schedule"
          className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            subTab === 'schedule'
              ? 'bg-teal-700 dark:bg-teal-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.viewScheduleTab}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('zones')}
          data-testid="training-tab-zones"
          className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            subTab === 'zones'
              ? 'bg-teal-700 dark:bg-teal-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.viewZonesTab}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('calculator')}
          data-testid="training-tab-calculator"
          className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            subTab === 'calculator'
              ? 'bg-teal-700 dark:bg-teal-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {fullCopy.paceCalculator.heading}
        </button>
      </div>

      {subTab === 'calculator' ? (
        <PaceCalculator
          initialRace={profile.targetRace}
          activeCustomPaceSecPerKm={profile.customTargetPaceSecPerKm}
          lang={lang}
          onApplyTargetPace={(race, paceSecPerKm) =>
            onChangeProfile((p) => ({
              ...p,
              targetRace: race,
              customTargetPaceSecPerKm: paceSecPerKm,
            }))
          }
          onResetCustomPace={() =>
            onChangeProfile((p) => ({
              ...p,
              customTargetPaceSecPerKm: null,
            }))
          }
        />
      ) : subTab === 'schedule' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarCheck2
                className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
                aria-hidden="true"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.scheduleHeadingPrefix} ({profile.targetRace})
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {profile.trainingDaysPerWeek} {t.activeDaysUnit}{' '}
              {strengthCount > 0 && (
                <span
                  data-testid="strength-header-tag"
                  className="text-indigo-700 dark:text-indigo-300 font-semibold"
                >
                  {t.strengthHeaderTag(strengthCount)}
                </span>
              )}
            </span>
          </div>

          {taperNotice && (
            <div
              data-testid="training-taper-notice"
              className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/70 px-4 py-3 flex items-start gap-2.5 text-xs text-indigo-950 dark:text-indigo-100"
            >
              <Sparkles
                className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-0.5">
                <p className="font-semibold text-indigo-950 dark:text-indigo-100">
                  {taperNotice.title}
                </p>
                <p className="text-indigo-900/90 dark:text-indigo-200/90 leading-relaxed">
                  {taperNotice.body}
                </p>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {plan.weeklySchedule.map((session) => {
              const isCompleted = completedDayIndices.has(session.dayIndex);
              const isRest = session.zone === 'rest';

              return (
                <div
                  key={session.dayIndex}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {session.dayName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-medium ${ZONE_PASTEL_MAP[session.zone]}`}
                      >
                        {t.zoneLabels[session.zone]}
                      </span>
                      {!isRest && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {session.paceRange}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {session.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {session.guidance}
                    </p>
                    {session.strengthSession && (
                      <div
                        data-testid={`strength-session-${session.dayIndex}`}
                        className="mt-1.5 rounded-lg bg-indigo-50/75 dark:bg-indigo-950/50 border border-transparent dark:border-indigo-800/60 px-3 py-2 text-xs text-indigo-950 dark:text-indigo-100 flex items-start gap-2"
                      >
                        <Dumbbell
                          className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold">
                            {t.strengthBadgePrefix} ·{' '}
                            {session.strengthSession.title} (
                            <span className="font-mono tabular-nums">
                              {session.strengthSession.durationMin}{' '}
                              {t.minuteShort}
                            </span>
                            )
                          </span>
                          <span className="block text-[11px] text-indigo-800/90 dark:text-indigo-200/85 mt-0.5">
                            {session.strengthSession.exercises}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {isRest
                        ? t.restLabel
                        : `${formatDecimalComma(session.targetDistanceKm, 1, lang)} km`}
                    </span>

                    {!isRest && (
                      <button
                        type="button"
                        onClick={() => onQuickLogSession(session)}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                          isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        {isCompleted ? t.loggedBtn : t.logCompleteBtn}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.paceZonesHeading}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.paceZones.map((zone) => (
                <div
                  key={zone.key}
                  className={`rounded-xl p-4 space-y-1.5 ${ZONE_PASTEL_MAP[zone.key]}`}
                >
                  <p className="text-xs font-semibold">{zone.label}</p>
                  <p className="text-lg font-bold font-mono tabular-nums">
                    {zone.formattedRange}
                  </p>
                  <p className="text-xs opacity-85 leading-relaxed">
                    {zone.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp
                className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
                aria-hidden="true"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.progressionHeading}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.progressionDescPrefix}{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                +{plan.bmiResult.maxWeeklyIncreasePct}%
              </span>{' '}
              {t.progressionDescSuffix}
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {plan.fourWeekProgression.map((wk) => (
                <div
                  key={wk.weekNumber}
                  className="py-3 first:pt-1 last:pb-1 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {wk.label}
                    </span>
                    <span
                      className={`text-sm font-bold font-mono tabular-nums ${
                        wk.isCutback
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-teal-700 dark:text-teal-400'
                      }`}
                    >
                      {formatDecimalComma(wk.targetVolumeKm, 1, lang)} km
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {wk.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
