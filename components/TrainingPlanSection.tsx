'use client';

import React, { useState } from 'react';
import {
  Check,
  CalendarCheck2,
  CalendarPlus,
  Dumbbell,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RACE_TARGETS_BY_LANG } from '@/lib/strava/config';
import {
  AdaptivePlanAdjustment,
  AppLanguage,
  DailyProgressEntry,
  DailySessionPlan,
  KpiSummary,
  RaceDistanceKey,
  RunnerProfile,
  TrainingPlanSummary,
  TrainingZoneType,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { formatDecimalComma, formatPace } from '@/lib/strava/transform';
import { buildWeeklyScheduleIcs } from '@/lib/strava/ics-export';
import PaceCalculator from './PaceCalculator';

interface TrainingPlanSectionProps {
  profile: RunnerProfile;
  plan: TrainingPlanSummary;
  kpi?: KpiSummary;
  adaptiveAdjustment?: AdaptivePlanAdjustment;
  manualFatigueMode?: boolean;
  onToggleManualFatigue?: () => void;
  progressEntries: DailyProgressEntry[];
  countdownDaysRemaining: number;
  raceEventLabel: string;
  todayDateKey?: string;
  todayDayIndex?: number;
  lang: AppLanguage;
  onChangeProfile: (updater: (prev: RunnerProfile) => RunnerProfile) => void;
  onQuickLogSession: (session: DailySessionPlan) => void;
}

const ZONE_PASTEL_MAP: Record<TrainingZoneType, string> = {
  easy: 'bg-[#E6F3EE] dark:bg-emerald-950/50 text-[#202A2A] dark:text-emerald-200 border border-[#DFE7E2] dark:border-emerald-800/60',
  tempo: 'bg-[#F7F6F2] dark:bg-sky-950/50 text-[#202A2A] dark:text-sky-200 border border-[#DFE7E2] dark:border-sky-800/60',
  interval: 'bg-[#E9957D]/25 dark:bg-amber-950/50 text-[#202A2A] dark:text-amber-200 border border-[#E9957D]/60 dark:border-amber-800/60',
  long_run: 'bg-[#E6F3EE] dark:bg-teal-950/50 text-[#087F73] dark:text-teal-200 border border-[#087F73]/25 dark:border-teal-800/60',
  rest: 'bg-[#F7F6F2] dark:bg-slate-800/80 text-[#596866] dark:text-slate-300 border border-[#DFE7E2] dark:border-slate-700',
};

export default function TrainingPlanSection({
  profile,
  plan,
  kpi,
  adaptiveAdjustment,
  manualFatigueMode = false,
  onToggleManualFatigue,
  progressEntries,
  countdownDaysRemaining,
  raceEventLabel,
  todayDateKey,
  todayDayIndex,
  lang,
  onChangeProfile,
  onQuickLogSession,
}: TrainingPlanSectionProps) {
  const [subTab, setSubTab] = useState<'schedule' | 'zones' | 'calculator'>('schedule');
  const [expandedStrengthDays, setExpandedStrengthDays] = useState<
    Record<number, boolean>
  >({});
  const [icsExportNotice, setIcsExportNotice] = useState(false);
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

  const handleExportScheduleIcs = () => {
    if (typeof document === 'undefined') return;
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const fallbackDateKey = wib.toISOString().slice(0, 10);
    const utcDay = wib.getUTCDay();
    const fallbackDayIndex = utcDay === 0 ? 6 : utcDay - 1;

    const icsBody = buildWeeklyScheduleIcs({
      weeklySchedule: plan.weeklySchedule,
      todayDateKey: todayDateKey || fallbackDateKey,
      todayDayIndex: typeof todayDayIndex === 'number' ? todayDayIndex : fallbackDayIndex,
      targetRace: profile.targetRace,
      raceEventLabel,
      lang,
    });

    const blob = new Blob([icsBody], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pacecraft-jadwal-${profile.targetRace.toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIcsExportNotice(true);
    setTimeout(() => setIcsExportNotice(false), 5000);
  };

  return (
    <section
      id="menu-latihan"
      aria-labelledby="training-plan-heading"
      className="space-y-5"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="training-plan-heading"
            className="text-2xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight"
          >
            {t.heading}
          </h2>
          <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300">
            {plan.isUsingCustomTargetPace
              ? t.customPaceBadge
              : plan.isUsingDefaultBaseline
                ? t.defaultBaselineTag.replace(/^\s*\(|\)\s*$/g, '')
                : t.stravaBaselineTag.replace(/^\s*\(|\)\s*$/g, '')}
            {plan.isUsingCustomTargetPace && (
              <button
                type="button"
                onClick={() =>
                  onChangeProfile((p) => ({
                    ...p,
                    customTargetPaceSecPerKm: null,
                  }))
                }
                className="ml-2 text-xs font-semibold text-[#087F73] dark:text-teal-400 hover:underline"
              >
                · {t.resetCustomPaceBtn}
              </button>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            data-testid="training-pace-basis-badge"
            className="px-3 py-1.5 rounded-xl bg-[#E6F3EE] dark:bg-teal-950/60 border border-[#DFE7E2] dark:border-teal-800 text-xs"
          >
            <span className="text-[#596866] dark:text-teal-300/80">
              {t.paceBasisLabel}:{' '}
            </span>
            <span className="font-semibold text-[#202A2A] dark:text-teal-100">
              {t.paceBasisTags[plan.paceZoneBasis]}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 text-xs">
            <span className="text-[#596866] dark:text-slate-400">
              {t.baselineVolumeChip}:{' '}
            </span>
            <span className="font-bold text-[#202A2A] dark:text-slate-100">
              {formatDecimalComma(plan.baselineFourWeekAvgKm, 1, lang)} {t.weekUnit}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 text-xs">
            <span className="text-[#596866] dark:text-slate-400">
              {t.baselinePaceChip}:{' '}
            </span>
            <span className="font-mono tabular-nums font-bold text-[#087F73] dark:text-teal-400">
              {formatPace(plan.baselinePaceSecPerKm)}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Target & Frequency Selector */}
      <div className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-2">
            <span className="block text-xs font-semibold text-[#202A2A] dark:text-slate-200">
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
                    className={`min-h-[52px] px-3 py-2 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                      active
                        ? 'bg-[#087F73] dark:bg-teal-600 border-[#087F73] dark:border-teal-500 text-white'
                        : 'bg-[#F7F6F2] dark:bg-slate-800/70 border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 hover:border-[#087F73] dark:hover:border-teal-600'
                    }`}
                  >
                    <span className="block text-sm font-bold">
                      {race.label}
                    </span>
                    <span
                      className={`block text-[11px] mt-0.5 ${
                        active
                          ? 'text-white/90'
                          : 'text-[#596866] dark:text-slate-400'
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
            <span className="block text-xs font-semibold text-[#202A2A] dark:text-slate-200">
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
                    className={`min-h-[52px] px-2 py-2 rounded-xl border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                      active
                        ? 'bg-[#E6F3EE] dark:bg-teal-950/70 border-[#087F73] dark:border-teal-500 text-[#202A2A] dark:text-teal-100'
                        : 'bg-[#F7F6F2] dark:bg-slate-800/70 border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] dark:hover:border-teal-600'
                    }`}
                  >
                    <span className="block text-base font-bold">
                      {days}
                    </span>
                    <span className="block text-[11px] text-[#596866] dark:text-slate-300">
                      {t.daysPerWeekShort}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#596866] dark:text-slate-400">
              {t.totalPlannedLabel}{' '}
              <span className="font-semibold text-[#202A2A] dark:text-slate-100">
                {formatDecimalComma(plan.totalPlannedWeekKm, 1, lang)} km
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Clean 3-Tab Sub-Navigation (Weekly Schedule vs Pace Zones vs Pace Calculator) */}
      <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setSubTab('schedule')}
          data-testid="training-tab-schedule"
          className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            subTab === 'schedule'
              ? 'bg-[#087F73] dark:bg-teal-600 text-white'
              : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-white'
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
              ? 'bg-[#087F73] dark:bg-teal-600 text-white'
              : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-white'
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
              ? 'bg-[#087F73] dark:bg-teal-600 text-white'
              : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-white'
          }`}
        >
          {fullCopy.paceCalculator.heading}
        </button>
      </div>

      {adaptiveAdjustment && (
        <div
          data-testid="training-adaptive-rules-card"
          className={`rounded-2xl border p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            adaptiveAdjustment.triggered
              ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-[#202A2A] dark:text-rose-100'
              : 'bg-white dark:bg-slate-900 border-[#DFE7E2] dark:border-slate-800 text-[#202A2A] dark:text-slate-100'
          }`}
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold">
              {adaptiveAdjustment.triggered ? (
                <ShieldAlert
                  className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <SlidersHorizontal
                  className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0"
                  aria-hidden="true"
                />
              )}
              <span>{t.adaptiveHeading}</span>
              <span aria-hidden="true">·</span>
              <span>{adaptiveAdjustment.headline}</span>
            </div>
            <p className="text-xs text-[#596866] dark:text-slate-300 leading-relaxed">
              {adaptiveAdjustment.summary}
            </p>
            <p className="text-xs font-semibold leading-relaxed">
              {adaptiveAdjustment.nextSessionAction}
            </p>
          </div>

          {onToggleManualFatigue && (
            <div className="shrink-0 space-y-1 lg:max-w-xs">
              <button
                type="button"
                onClick={onToggleManualFatigue}
                aria-pressed={manualFatigueMode}
                data-testid="toggle-manual-fatigue-btn"
                className={`min-h-[42px] px-4 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                  manualFatigueMode
                    ? 'bg-rose-700 dark:bg-rose-600 border-rose-700 text-white'
                    : 'bg-[#F7F6F2] dark:bg-slate-800 border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 hover:border-[#087F73]'
                }`}
              >
                {t.adaptiveToggleLabel}: {manualFatigueMode ? 'ON' : 'OFF'}
              </button>
              <p className="text-[11px] text-[#596866] dark:text-slate-400 leading-snug">
                {t.adaptiveToggleHint}
              </p>
            </div>
          )}
        </div>
      )}

      {subTab === 'calculator' ? (
        <PaceCalculator
          initialRace={profile.targetRace}
          activeCustomPaceSecPerKm={profile.customTargetPaceSecPerKm}
          kpi={kpi}
          daysToRace={countdownDaysRemaining}
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
        <div className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarCheck2
                className="w-5 h-5 text-[#087F73] dark:text-teal-400 shrink-0"
                aria-hidden="true"
              />
              <h3 className="text-base font-bold text-[#202A2A] dark:text-slate-100">
                {t.scheduleHeadingPrefix} ({profile.targetRace})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs text-[#596866] dark:text-slate-400">
                {profile.trainingDaysPerWeek} {t.activeDaysUnit}{' '}
                {strengthCount > 0 && (
                  <span
                    data-testid="strength-header-tag"
                    className="text-[#087F73] dark:text-teal-300 font-semibold"
                  >
                    {t.strengthHeaderTag(strengthCount)}
                  </span>
                )}
              </span>

              <button
                type="button"
                onClick={handleExportScheduleIcs}
                data-testid="export-ics-btn"
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#E6F3EE] dark:bg-teal-950/60 border border-[#DFE7E2] dark:border-teal-800/80 text-xs font-semibold text-[#202A2A] dark:text-teal-200 hover:border-[#087F73] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
              >
                <CalendarPlus className="w-3.5 h-3.5 shrink-0 text-[#087F73]" aria-hidden="true" />
                <span>{t.exportIcsBtn}</span>
              </button>
            </div>
          </div>

          {icsExportNotice && (
            <div
              role="status"
              data-testid="export-ics-notice"
              className="rounded-xl bg-[#E6F3EE] dark:bg-emerald-950/50 border border-[#DFE7E2] dark:border-emerald-800/70 px-4 py-2.5 text-xs text-[#202A2A] dark:text-emerald-200 leading-relaxed"
            >
              {t.exportedIcsNotice}
            </div>
          )}

          {taperNotice && (
            <div
              data-testid="training-taper-notice"
              className="rounded-xl bg-[#E6F3EE] dark:bg-teal-950/50 border border-[#DFE7E2] dark:border-teal-800/70 px-4 py-3 flex items-start gap-2.5 text-xs text-[#202A2A] dark:text-teal-100"
            >
              <Sparkles
                className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-0.5">
                <p className="font-semibold text-[#202A2A] dark:text-teal-100">
                  {taperNotice.title}
                </p>
                <p className="text-[#596866] dark:text-teal-200/90 leading-relaxed">
                  {taperNotice.body}
                </p>
              </div>
            </div>
          )}

          <div className="divide-y divide-[#DFE7E2] dark:divide-slate-800">
            {plan.weeklySchedule.map((session) => {
              const isCompleted = completedDayIndices.has(session.dayIndex);
              const isRest = session.zone === 'rest';

              return (
                <div
                  key={session.dayIndex}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#596866] dark:text-slate-400">
                      <span className="font-semibold text-[#202A2A] dark:text-slate-100">
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
                          <span className="font-mono tabular-nums text-[#202A2A] dark:text-slate-300">
                            {session.paceRange}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-[#202A2A] dark:text-slate-100">
                      {session.title}
                    </p>
                    <p className="text-xs text-[#596866] dark:text-slate-400 leading-relaxed">
                      {session.guidance}
                    </p>
                    {session.strengthSession && (
                      <div
                        data-testid={`strength-session-${session.dayIndex}`}
                        className="mt-2 border-l-2 border-[#087F73] dark:border-teal-500 pl-3 py-0.5 text-xs text-[#202A2A] dark:text-slate-100 space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 font-semibold">
                            <Dumbbell
                              className="w-3.5 h-3.5 text-[#087F73] dark:text-teal-400 shrink-0"
                              aria-hidden="true"
                            />
                            <span>
                              {t.strengthBadgePrefix} ·{' '}
                              {session.strengthSession.title} (
                              {session.strengthSession.durationMin}{' '}
                              {t.minuteShort})
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedStrengthDays((prev) => ({
                                ...prev,
                                [session.dayIndex]: !prev[session.dayIndex],
                              }))
                            }
                            aria-expanded={Boolean(
                              expandedStrengthDays[session.dayIndex]
                            )}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087F73] dark:text-teal-300 hover:underline"
                          >
                            <span>
                              {expandedStrengthDays[session.dayIndex]
                                ? t.strengthToggleHide
                                : t.strengthToggleShow}
                            </span>
                            {expandedStrengthDays[session.dayIndex] ? (
                              <ChevronUp className="w-3 h-3" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="w-3 h-3" aria-hidden="true" />
                            )}
                          </button>
                        </div>

                        {expandedStrengthDays[session.dayIndex] && (
                          <p className="text-[11px] text-[#596866] dark:text-slate-300 leading-relaxed">
                            {session.strengthSession.exercises}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-sm font-bold text-[#202A2A] dark:text-slate-100 whitespace-nowrap">
                      {isRest
                        ? t.restLabel
                        : `${formatDecimalComma(session.targetDistanceKm, 1, lang)} km`}
                    </span>

                    {!isRest && (
                      <button
                        type="button"
                        onClick={() => onQuickLogSession(session)}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                          isCompleted
                            ? 'bg-[#E9957D] text-[#202A2A]'
                            : 'bg-[#E6F3EE] dark:bg-teal-950/60 text-[#087F73] dark:text-teal-200 border border-[#DFE7E2] dark:border-teal-800 hover:border-[#087F73]'
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
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#202A2A] dark:text-slate-100">
              {t.paceZonesHeading}
            </h3>
            <div className="divide-y divide-[#DFE7E2] dark:divide-slate-800">
              {plan.paceZones.map((zone) => (
                <div
                  key={zone.key}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${ZONE_PASTEL_MAP[zone.key]}`}
                    >
                      {zone.label}
                    </span>
                    <p className="text-xs text-[#596866] dark:text-slate-300 leading-relaxed">
                      {zone.description}
                    </p>
                  </div>
                  <p className="text-base font-bold font-mono tabular-nums text-[#202A2A] dark:text-slate-100 whitespace-nowrap shrink-0">
                    {zone.formattedRange}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp
                className="w-5 h-5 text-[#087F73] dark:text-teal-400 shrink-0"
                aria-hidden="true"
              />
              <h3 className="text-base font-bold text-[#202A2A] dark:text-slate-100">
                {t.progressionHeading}
              </h3>
            </div>
            <p className="text-xs text-[#596866] dark:text-slate-300 leading-relaxed">
              {t.progressionDescPrefix}{' '}
              <span className="font-semibold text-[#202A2A] dark:text-slate-100">
                +{plan.bmiResult.maxWeeklyIncreasePct}%
              </span>{' '}
              {t.progressionDescSuffix}
            </p>

            <div className="divide-y divide-[#DFE7E2] dark:divide-slate-800">
              {plan.fourWeekProgression.map((wk) => (
                <div
                  key={wk.weekNumber}
                  className="py-3 first:pt-1 last:pb-1 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#202A2A] dark:text-slate-100">
                      {wk.label}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        wk.isCutback
                          ? 'text-[#596866] dark:text-slate-300'
                          : 'text-[#087F73] dark:text-teal-400'
                      }`}
                    >
                      {formatDecimalComma(wk.targetVolumeKm, 1, lang)} km
                    </span>
                  </div>
                  <p className="text-xs text-[#596866] dark:text-slate-400 leading-relaxed">
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
