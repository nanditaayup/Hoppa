'use client';

import React from 'react';
import { Check, CalendarCheck2, Sparkles, TrendingUp } from 'lucide-react';
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
  easy: 'bg-emerald-50/85 text-emerald-900',
  tempo: 'bg-sky-50/85 text-sky-900',
  interval: 'bg-indigo-50/85 text-indigo-900',
  long_run: 'bg-teal-50/85 text-teal-900',
  rest: 'bg-slate-100/80 text-slate-600',
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
  const t = UI_COPY[lang].training;
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
  const raceList: RaceDistanceKey[] = ['5K', '10K', '21K', '42K'];
  const dayOptions: Array<3 | 4 | 5 | 6> = [3, 4, 5, 6];

  return (
    <section
      id="menu-latihan"
      aria-labelledby="training-plan-heading"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="training-plan-heading"
            className="text-2xl font-bold text-slate-900 tracking-tight"
          >
            {t.heading}
          </h2>
          <p className="text-sm text-slate-600">
            {t.subtitlePrefix}
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {formatDecimalComma(plan.baselineFourWeekAvgKm, 1, lang)}{' '}
              {t.weekUnit}
            </span>
            {t.subtitleMiddle}{' '}
            <span className="font-mono tabular-nums font-semibold text-teal-700">
              {formatPace(plan.baselinePaceSecPerKm)}
            </span>
            {plan.isUsingDefaultBaseline
              ? t.defaultBaselineTag
              : t.stravaBaselineTag}
            .
          </p>
        </div>
      </div>

      {/* Target & Frequency Selector Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-2.5">
            <span className="block text-sm font-semibold text-slate-800">
              {t.step1Title}
            </span>
            <div
              role="group"
              aria-label={t.raceGroupAria}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
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
                    className={`min-h-[56px] px-3.5 py-2.5 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                      active
                        ? 'bg-teal-700 border-teal-700 text-white'
                        : 'bg-[#F7F9FA] border-slate-200 text-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <span className="block text-base font-bold font-mono tabular-nums">
                      {race.label}
                    </span>
                    <span
                      className={`block text-xs mt-0.5 ${
                        active ? 'text-teal-100' : 'text-slate-500'
                      }`}
                    >
                      {formatDecimalComma(race.distanceKm, 1, lang)} km
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              {raceTargets[profile.targetRace].description}
            </p>
          </div>

          <div className="lg:col-span-5 space-y-2.5">
            <span className="block text-sm font-semibold text-slate-800">
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
                    className={`min-h-[56px] px-2 py-2.5 rounded-xl border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                      active
                        ? 'bg-teal-50 border-teal-500 text-teal-900'
                        : 'bg-[#F7F9FA] border-slate-200 text-slate-700 hover:border-teal-300'
                    }`}
                  >
                    <span className="block text-lg font-bold font-mono tabular-nums">
                      {days}
                    </span>
                    <span className="block text-[11px]">
                      {t.daysPerWeekShort}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              {t.totalPlannedLabel}{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {formatDecimalComma(plan.totalPlannedWeekKm, 1, lang)} km
              </span>
            </p>
          </div>
        </div>

        {/* 4 Pace Zones */}
        <div className="pt-5 border-t border-slate-100 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            {t.paceZonesHeading}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      </div>

      {/* 4-Week Progression + 7-Day Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 4-Week Progression */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp
              className="w-5 h-5 text-teal-700 shrink-0"
              aria-hidden="true"
            />
            <h3 className="text-base font-bold text-slate-900">
              {t.progressionHeading}
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.progressionDescPrefix}{' '}
            <span className="font-mono tabular-nums font-semibold">
              +{plan.bmiResult.maxWeeklyIncreasePct}%
            </span>{' '}
            {t.progressionDescSuffix}
          </p>

          <div className="divide-y divide-slate-100">
            {plan.fourWeekProgression.map((wk) => (
              <div
                key={wk.weekNumber}
                className="py-3.5 first:pt-1 last:pb-1 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {wk.label}
                  </span>
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      wk.isCutback ? 'text-indigo-700' : 'text-teal-700'
                    }`}
                  >
                    {formatDecimalComma(wk.targetVolumeKm, 1, lang)} km
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {wk.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Schedule */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarCheck2
                className="w-5 h-5 text-teal-700 shrink-0"
                aria-hidden="true"
              />
              <h3 className="text-base font-bold text-slate-900">
                {t.scheduleHeadingPrefix} ({profile.targetRace})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {profile.trainingDaysPerWeek} {t.activeDaysUnit}
            </span>
          </div>

          {taperNotice && (
            <div
              data-testid="training-taper-notice"
              className="rounded-xl bg-indigo-50/80 border border-indigo-200/80 px-4 py-3 flex items-start gap-2.5 text-xs text-indigo-950"
            >
              <Sparkles
                className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-0.5">
                <p className="font-semibold text-indigo-950">
                  {taperNotice.title}
                </p>
                <p className="text-indigo-900/90 leading-relaxed">
                  {taperNotice.body}
                </p>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {plan.weeklySchedule.map((session) => {
              const isCompleted = completedDayIndices.has(session.dayIndex);
              const isRest = session.zone === 'rest';

              return (
                <div
                  key={session.dayIndex}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">
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
                          <span className="font-mono tabular-nums text-slate-700">
                            {session.paceRange}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-900">
                      {session.title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {session.guidance}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-sm font-bold font-mono tabular-nums text-slate-900 whitespace-nowrap">
                      {isRest
                        ? t.restLabel
                        : `${formatDecimalComma(session.targetDistanceKm, 1, lang)} km`}
                    </span>

                    {!isRest && (
                      <button
                        type="button"
                        onClick={() => onQuickLogSession(session)}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
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
      </div>
    </section>
  );
}
