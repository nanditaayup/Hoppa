'use client';

import React, { useMemo, useState } from 'react';
import {
  Check,
  CalendarPlus,
  Dumbbell,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  PencilLine,
  Utensils,
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
import {
  formatDecimalComma,
  formatPace,
  generateTrainingPlan,
  predictRaceFinishTimes,
  scaleScheduleForWeek,
} from '@/lib/strava/transform';
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
  raceDateLabel?: string;
  todayDateKey?: string;
  todayDayIndex?: number;
  lang: AppLanguage;
  onChangeProfile: (updater: (prev: RunnerProfile) => RunnerProfile) => void;
  onQuickLogSession: (session: DailySessionPlan) => void;
  onNavigateNutrition?: () => void;
}

const ZONE_PASTEL_MAP: Record<TrainingZoneType, string> = {
  easy: 'bg-[#E6F3EE] dark:bg-emerald-950/50 text-[#087F73] dark:text-emerald-200 border border-[#DFE7E2] dark:border-emerald-800/60',
  tempo: 'bg-[#F7F6F2] dark:bg-sky-950/50 text-[#202A2A] dark:text-sky-200 border border-[#DFE7E2] dark:border-sky-800/60',
  interval: 'bg-[#FFF5F2] dark:bg-amber-950/50 text-[#202A2A] dark:text-amber-200 border border-[#E9957D]/60 dark:border-amber-800/60',
  long_run: 'bg-[#E6F3EE] dark:bg-teal-950/50 text-[#087F73] dark:text-teal-200 border border-[#087F73]/25 dark:border-teal-800/60',
  rest: 'bg-[#F7F6F2] dark:bg-slate-800/80 text-[#596866] dark:text-slate-300 border border-[#DFE7E2] dark:border-slate-700',
};

const EMPTY_KPI: KpiSummary = {
  fourWeekAvgKm: 0,
  thirtyDayTotalKm: 0,
  thirtyDayAvgPaceSecPerKm: 0,
  longestRunKm: 0,
  runCount30Days: 0,
  totalActivitiesCount: 0,
  flaggedAnomalyCount: 0,
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
  raceDateLabel,
  todayDateKey,
  todayDayIndex,
  lang,
  onChangeProfile,
  onQuickLogSession,
  onNavigateNutrition,
}: TrainingPlanSectionProps) {
  const [subTab, setSubTab] = useState<'schedule' | 'zones' | 'calculator'>('schedule');
  const [selectedBlockWeek, setSelectedBlockWeek] = useState<1 | 2 | 3 | 4>(1);
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(
    typeof todayDayIndex === 'number' ? todayDayIndex : null
  );
  const [showBasisDisclosure, setShowBasisDisclosure] = useState(false);
  const [showAdaptiveDrawer, setShowAdaptiveDrawer] = useState(false);

  // Edit plan preview -> confirm state
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [draftRace, setDraftRace] = useState<RaceDistanceKey>(profile.targetRace);
  const [draftDays, setDraftDays] = useState<3 | 4 | 5 | 6>(profile.trainingDaysPerWeek);

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
  const raceList: RaceDistanceKey[] = ['5K', '10K', '21K', '42K'];
  const dayOptions: Array<3 | 4 | 5 | 6> = [3, 4, 5, 6];

  const previewPlan = useMemo(() => {
    if (!isEditingPlan) return null;
    return generateTrainingPlan(
      {
        ...profile,
        targetRace: draftRace,
        trainingDaysPerWeek: draftDays,
      },
      kpi ?? EMPTY_KPI,
      lang,
      plan.taperStatus
    );
  }, [isEditingPlan, profile, draftRace, draftDays, kpi, lang, plan.taperStatus]);

  const activeWeekView = useMemo(
    () => scaleScheduleForWeek(plan, selectedBlockWeek, lang),
    [plan, selectedBlockWeek, lang]
  );

  const racePredictions = useMemo(
    () =>
      predictRaceFinishTimes(
        plan.baselinePaceSecPerKm,
        profile.targetRace,
        plan.paceZoneBasis
      ),
    [plan.baselinePaceSecPerKm, profile.targetRace, plan.paceZoneBasis]
  );

  const weeklySessionCounts = useMemo(() => {
    const sched = activeWeekView.schedule;
    return {
      easyCount: sched.filter((s) => s.zone === 'easy').length,
      qualityCount: sched.filter((s) => s.zone === 'tempo' || s.zone === 'interval').length,
      longCount: sched.filter((s) => s.zone === 'long_run').length,
      strengthCount: sched.filter((s) => Boolean(s.strengthSession)).length,
    };
  }, [activeWeekView.schedule]);

  const handleOpenEditPlan = () => {
    setDraftRace(profile.targetRace);
    setDraftDays(profile.trainingDaysPerWeek);
    setIsEditingPlan(true);
  };

  const handleConfirmPlanEdit = () => {
    onChangeProfile((p) => ({
      ...p,
      targetRace: draftRace,
      trainingDaysPerWeek: draftDays,
    }));
    setIsEditingPlan(false);
  };

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

  const hasPlanChanges =
    draftRace !== profile.targetRace || draftDays !== profile.trainingDaysPerWeek;

  return (
    <section
      id="menu-latihan"
      aria-labelledby="training-plan-heading"
      className="space-y-5"
    >
      {/* Schedule-first Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="training-plan-heading"
            className="text-2xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight"
          >
            {t.planHeading(profile.targetRace)}
          </h2>
          <p className="text-sm text-[#596866] dark:text-slate-300">
            {t.planMetaLine(
              profile.trainingDaysPerWeek,
              raceDateLabel || raceEventLabel
            )}
            {' · '}
            <span className="font-semibold text-[#202A2A] dark:text-slate-100 tabular-nums">
              {formatDecimalComma(plan.totalPlannedWeekKm, 1, lang)} km
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!isEditingPlan && (
            <button
              type="button"
              onClick={handleOpenEditPlan}
              data-testid="training-edit-plan-btn"
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-700 text-xs font-semibold text-[#202A2A] dark:text-slate-100 hover:border-[#087F73] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73]"
            >
              <PencilLine className="w-3.5 h-3.5 text-[#087F73] dark:text-teal-400" aria-hidden="true" />
              <span>{t.editPlanBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Preview -> Confirm Plan Editor (Hidden by default until user taps "Ubah rencana") */}
      {isEditingPlan && (
        <div
          data-testid="training-edit-plan-panel"
          className="bg-white dark:bg-slate-900 border border-[#087F73]/40 dark:border-teal-700 rounded-2xl p-5 sm:p-6 space-y-5"
        >
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
                  const active = draftRace === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDraftRace(key)}
                      data-testid={`draft-race-${key}`}
                      className={`min-h-[52px] px-3 py-2 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] ${
                        active
                          ? 'bg-[#087F73] dark:bg-teal-600 border-[#087F73] dark:border-teal-500 text-white'
                          : 'bg-[#F7F6F2] dark:bg-slate-800/70 border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 hover:border-[#087F73]'
                      }`}
                    >
                      <span className="block text-sm font-bold">{race.label}</span>
                      <span
                        className={`block text-[11px] mt-0.5 ${
                          active ? 'text-white/90' : 'text-[#596866] dark:text-slate-400'
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
                  const active = draftDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDraftDays(days)}
                      data-testid={`draft-days-${days}`}
                      className={`min-h-[52px] px-2 py-2 rounded-xl border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] ${
                        active
                          ? 'bg-[#E6F3EE] dark:bg-teal-950/70 border-[#087F73] dark:border-teal-500 text-[#202A2A] dark:text-teal-100'
                          : 'bg-[#F7F6F2] dark:bg-slate-800/70 border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-200 hover:border-[#087F73]'
                      }`}
                    >
                      <span className="block text-base font-bold">{days}</span>
                      <span className="block text-[11px] text-[#596866] dark:text-slate-300">
                        {t.daysPerWeekShort}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {previewPlan && (
            <div className="rounded-xl bg-[#E6F3EE] dark:bg-teal-950/50 border border-[#DFE7E2] dark:border-teal-800/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="space-y-0.5">
                <p className="font-semibold text-[#087F73] dark:text-teal-300">
                  {t.previewHeading}
                </p>
                <p className="text-[#202A2A] dark:text-slate-100">
                  {draftRace} · {draftDays} {t.activeDaysUnit} ·{' '}
                  <span className="font-semibold tabular-nums">
                    {formatDecimalComma(previewPlan.totalPlannedWeekKm, 1, lang)} km
                  </span>
                  /minggu · Pace dasar{' '}
                  <span className="font-mono tabular-nums font-semibold">
                    {formatPace(previewPlan.baselinePaceSecPerKm)}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingPlan(false)}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-[#596866] dark:text-slate-300 hover:text-[#202A2A]"
                >
                  {t.cancelEditPlanBtn}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPlanEdit}
                  disabled={!hasPlanChanges}
                  data-testid="training-confirm-plan-btn"
                  className="min-h-[40px] px-4 py-1.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] disabled:opacity-50 transition-colors"
                >
                  {t.confirmPlanBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3-Tab Sub-Navigation: Minggu ini | Progres program | Simulasi Target */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            {t.viewSimulatorTab}
          </button>
        </div>

        {/* Quiet status line for recovery adjustment */}
        {adaptiveAdjustment && (
          <button
            type="button"
            onClick={() => setShowAdaptiveDrawer((prev) => !prev)}
            data-testid="training-adaptive-status-btn"
            className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-2 transition-colors ${
              adaptiveAdjustment.triggered
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-[#202A2A] dark:text-amber-100'
                : 'bg-white dark:bg-slate-900 border-[#DFE7E2] dark:border-slate-800 text-[#596866] dark:text-slate-300 hover:border-[#087F73]'
            }`}
          >
            {adaptiveAdjustment.triggered ? (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
            ) : (
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#087F73] dark:text-teal-400 shrink-0" aria-hidden="true" />
            )}
            <span>
              {adaptiveAdjustment.triggered
                ? adaptiveAdjustment.headline
                : `${t.adaptiveStatusNormal} · `}
              {!adaptiveAdjustment.triggered && (
                <span className="text-[#087F73] dark:text-teal-300 font-semibold">
                  {t.adaptiveAdjustCta}
                </span>
              )}
            </span>
          </button>
        )}
      </div>

      {/* Expanded Adjustment Drawer (only opens when status line is clicked) */}
      {adaptiveAdjustment && showAdaptiveDrawer && (
        <div
          data-testid="training-adaptive-rules-card"
          className={`rounded-2xl border p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            adaptiveAdjustment.triggered
              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-[#202A2A] dark:text-amber-100'
              : 'bg-white dark:bg-slate-900 border-[#DFE7E2] dark:border-slate-800 text-[#202A2A] dark:text-slate-100'
          }`}
        >
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-bold">
              {t.adaptiveHeading} · {adaptiveAdjustment.headline}
            </p>
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
                className={`min-h-[42px] px-4 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] ${
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
        <div className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
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

          {icsExportNotice && (
            <div
              role="status"
              data-testid="export-ics-notice"
              className="rounded-xl bg-[#E6F3EE] dark:bg-emerald-950/50 border border-[#DFE7E2] dark:border-emerald-800/70 px-4 py-2.5 text-xs text-[#202A2A] dark:text-emerald-200 leading-relaxed"
            >
              {t.exportedIcsNotice}
            </div>
          )}

          {/* Runna-Style 4-Week Block Selector & Session Mix */}
          <div className="pb-4 border-b border-[#DFE7E2] dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#596866] dark:text-slate-400">
                {t.blockWeeksHeading} ·{' '}
                <span className="text-[#202A2A] dark:text-slate-200">
                  {t.weeklyMixSummary(
                    weeklySessionCounts.easyCount,
                    weeklySessionCounts.qualityCount,
                    weeklySessionCounts.longCount,
                    weeklySessionCounts.strengthCount
                  )}
                </span>
              </span>
              <span className="text-xs font-mono tabular-nums font-bold text-[#087F73] dark:text-teal-300">
                {formatDecimalComma(activeWeekView.totalKm, 1, lang)} km
              </span>
            </div>

            <div
              role="tablist"
              aria-label={t.blockWeeksHeading}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {plan.fourWeekProgression.map((wk) => {
                const weekNum = wk.weekNumber as 1 | 2 | 3 | 4;
                const active = selectedBlockWeek === weekNum;
                return (
                  <button
                    key={wk.weekNumber}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedBlockWeek(weekNum)}
                    data-testid={`block-week-tab-${wk.weekNumber}`}
                    className={`min-h-[46px] px-3 py-2 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] ${
                      active
                        ? 'bg-[#E6F3EE] dark:bg-teal-950/60 border-[#087F73] dark:border-teal-500 text-[#202A2A] dark:text-teal-100'
                        : 'bg-[#F7F6F2]/60 dark:bg-slate-800/50 border-[#DFE7E2] dark:border-slate-700 text-[#596866] dark:text-slate-300 hover:border-[#087F73]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[#202A2A] dark:text-slate-100">
                        {t.weekChipLabel(wk.weekNumber)}
                      </span>
                      {wk.weekNumber === 1 && (
                        <span className="text-[10px] font-semibold text-[#087F73] dark:text-teal-300">
                          {t.activeWeekTag}
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] font-mono tabular-nums text-[#596866] dark:text-slate-400 mt-0.5">
                      {formatDecimalComma(wk.targetVolumeKm, 1, lang)} km
                    </span>
                  </button>
                );
              })}
            </div>

            {activeWeekView.weekInfo && (
              <p className="text-xs text-[#596866] dark:text-slate-400 leading-relaxed">
                <strong className="text-[#202A2A] dark:text-slate-200">
                  {activeWeekView.weekInfo.label}:
                </strong>{' '}
                {activeWeekView.weekInfo.note}
              </p>
            )}
          </div>

          {/* Clean Clickable Daily Rows */}
          <div className="divide-y divide-[#DFE7E2] dark:divide-slate-800">
            {activeWeekView.schedule.map((session) => {
              const isCompleted =
                selectedBlockWeek === 1 && completedDayIndices.has(session.dayIndex);
              const isRest = session.zone === 'rest';
              const isExpanded = expandedDayIndex === session.dayIndex;
              const hasStrength = Boolean(session.strengthSession);

              const rowSummaryMetric = isRest
                ? hasStrength && session.strengthSession
                  ? `${session.strengthSession.durationMin} ${t.minuteShort}`
                  : t.restLabel
                : `${formatDecimalComma(session.targetDistanceKm, 1, lang)} km`;

              const rowPrimaryLabel =
                isRest && hasStrength
                  ? t.strengthBadgePrefix
                  : t.zoneLabels[session.zone];

              return (
                <div key={session.dayIndex} className="py-3.5 first:pt-1 last:pb-1">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDayIndex((prev) =>
                          prev === session.dayIndex ? null : session.dayIndex
                        )
                      }
                      aria-expanded={isExpanded}
                      className="flex-1 min-w-0 text-left flex items-center gap-2.5 sm:gap-3 py-1 rounded-lg hover:bg-[#F7F6F2]/70 dark:hover:bg-slate-800/50 px-1.5 -mx-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73]"
                    >
                      <span className="text-sm font-bold text-[#202A2A] dark:text-slate-100 w-14 sm:w-20 shrink-0">
                        {session.dayName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${ZONE_PASTEL_MAP[session.zone]}`}
                      >
                        {rowPrimaryLabel}
                      </span>
                      <span className="text-sm font-semibold text-[#202A2A] dark:text-slate-200 tabular-nums truncate">
                        {rowSummaryMetric}
                      </span>
                      {!isRest && session.estimatedDurationMin && (
                        <span className="hidden sm:inline text-xs font-mono tabular-nums text-[#596866] dark:text-slate-400 shrink-0">
                          {t.estDurationShort(session.estimatedDurationMin)}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#596866] shrink-0 ml-auto" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#596866] shrink-0 ml-auto" aria-hidden="true" />
                      )}
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isRest && selectedBlockWeek === 1 && (
                        <button
                          type="button"
                          onClick={() => onQuickLogSession(session)}
                          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] ${
                            isCompleted
                              ? 'bg-[#E6F3EE] dark:bg-teal-950/60 text-[#087F73] dark:text-teal-200 border border-[#087F73]/25'
                              : 'bg-white dark:bg-slate-800 text-[#202A2A] dark:text-slate-200 border border-[#DFE7E2] dark:border-slate-700 hover:border-[#087F73]'
                          }`}
                        >
                          {isCompleted ? t.loggedBtn : t.logCompleteBtn}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 ml-1 sm:ml-20 pl-3 border-l-2 border-[#DFE7E2] dark:border-slate-700 space-y-2.5 text-xs text-[#596866] dark:text-slate-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#202A2A] dark:text-slate-100">
                          {session.title}
                        </span>
                        {!isRest && (
                          <span className="font-mono tabular-nums text-[#087F73] dark:text-teal-300 font-semibold">
                            · {session.paceRange}
                          </span>
                        )}
                        {!isRest && session.estimatedDurationMin && (
                          <span className="font-mono tabular-nums text-[#596866] dark:text-slate-400">
                            · {t.estDurationShort(session.estimatedDurationMin)}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed">{session.guidance}</p>

                      {session.workoutSteps && session.workoutSteps.length > 0 && (
                        <div
                          data-testid={`workout-steps-${session.dayIndex}`}
                          className="pt-1 space-y-1.5"
                        >
                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#596866] dark:text-slate-400">
                            {t.workoutStepsHeading}
                          </p>
                          <div className="divide-y divide-[#DFE7E2]/70 dark:divide-slate-800">
                            {session.workoutSteps.map((step, sIdx) => (
                              <div
                                key={`${step.phase}-${sIdx}`}
                                className="py-1.5 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                      step.phase === 'main'
                                        ? 'bg-[#E6F3EE] dark:bg-teal-950/60 text-[#087F73] dark:text-teal-200'
                                        : 'bg-[#F7F6F2] dark:bg-slate-800 text-[#596866] dark:text-slate-300'
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                  <span className="text-[#202A2A] dark:text-slate-200 font-medium">
                                    {step.targetText}
                                  </span>
                                </div>
                                {step.paceText && (
                                  <span className="font-mono tabular-nums text-[#087F73] dark:text-teal-300 font-semibold shrink-0">
                                    {step.paceText}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {session.coachNote && (
                        <p className="text-[#596866] dark:text-slate-400 leading-relaxed">
                          <span className="font-semibold text-[#202A2A] dark:text-slate-200">
                            {t.coachCueLabel}:
                          </span>{' '}
                          {session.coachNote}
                        </p>
                      )}

                      {session.strengthSession && (
                        <div
                          data-testid={`strength-session-${session.dayIndex}`}
                          className="pt-1 space-y-1 text-[#202A2A] dark:text-slate-200"
                        >
                          <p className="inline-flex items-center gap-1.5 font-semibold">
                            <Dumbbell className="w-3.5 h-3.5 text-[#087F73] shrink-0" aria-hidden="true" />
                            <span>
                              {session.strengthSession.title} ({session.strengthSession.durationMin} {t.minuteShort})
                            </span>
                          </p>
                          <p className="text-[#596866] dark:text-slate-400 leading-relaxed">
                            {session.strengthSession.exercises}
                          </p>
                        </div>
                      )}

                      {onNavigateNutrition && !isRest && (
                        <button
                          type="button"
                          onClick={onNavigateNutrition}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087F73] dark:text-teal-300 hover:underline pt-0.5"
                        >
                          <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.nutritionLinkLabel}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiet Footer Actions: Export .ics & Collapsed Recommendation Basis */}
          <div className="pt-3 border-t border-[#DFE7E2] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowBasisDisclosure((prev) => !prev)}
              aria-expanded={showBasisDisclosure}
              data-testid="training-basis-disclosure-btn"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#596866] dark:text-slate-300 hover:text-[#087F73]"
            >
              <span>{t.basisDisclosureLabel}</span>
              {showBasisDisclosure ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={handleExportScheduleIcs}
              data-testid="export-ics-btn"
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#F7F6F2] dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#087F73] dark:text-teal-400" aria-hidden="true" />
              <span>{t.exportIcsBtn}</span>
            </button>
          </div>

          {showBasisDisclosure && (
            <div
              data-testid="training-basis-panel"
              className="rounded-xl bg-[#F7F6F2] dark:bg-slate-800/60 border border-[#DFE7E2] dark:border-slate-700 p-4 text-xs space-y-2 text-[#596866] dark:text-slate-300"
            >
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                <span>
                  {t.paceBasisLabel}:{' '}
                  <strong className="text-[#202A2A] dark:text-slate-100">
                    {t.paceBasisTags[plan.paceZoneBasis]}
                  </strong>
                </span>
                <span>
                  {t.baselineVolumeChip}:{' '}
                  <strong className="text-[#202A2A] dark:text-slate-100 tabular-nums">
                    {formatDecimalComma(plan.baselineFourWeekAvgKm, 1, lang)} {t.weekUnit}
                  </strong>
                </span>
                <span>
                  {t.baselinePaceChip}:{' '}
                  <strong className="font-mono tabular-nums text-[#087F73] dark:text-teal-300">
                    {formatPace(plan.baselinePaceSecPerKm)}
                  </strong>
                </span>
              </div>
              {plan.isUsingCustomTargetPace && (
                <button
                  type="button"
                  onClick={() =>
                    onChangeProfile((p) => ({
                      ...p,
                      customTargetPaceSecPerKm: null,
                    }))
                  }
                  className="text-xs font-semibold text-[#087F73] dark:text-teal-300 hover:underline inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.resetCustomPaceBtn}</span>
                </button>
              )}
            </div>
          )}
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

          {/* Race Finish Predictor (5K–42K) */}
          <div
            data-testid="race-finish-predictor-card"
            className="lg:col-span-12 bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#202A2A] dark:text-slate-100">
                {t.predictorHeading}
              </h3>
              <p className="text-xs text-[#596866] dark:text-slate-300 leading-relaxed">
                {t.predictorSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DFE7E2] dark:divide-slate-800 border-t border-b border-[#DFE7E2] dark:border-slate-800">
              {racePredictions.map((pred) => (
                <div
                  key={pred.race}
                  data-testid={`predictor-item-${pred.race}`}
                  className={`py-4 sm:px-5 first:sm:pl-1 last:sm:pr-1 space-y-1 ${
                    pred.isCurrentTarget
                      ? 'bg-[#E6F3EE]/50 dark:bg-teal-950/30 sm:px-4'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#202A2A] dark:text-slate-100">
                      {pred.race}
                    </span>
                    {pred.isCurrentTarget && (
                      <span className="px-2 py-0.5 rounded bg-[#E6F3EE] dark:bg-teal-950 text-[#087F73] dark:text-teal-300 text-[10px] font-bold">
                        {t.predictorCurrentTargetBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold font-mono tabular-nums text-[#087F73] dark:text-teal-300">
                    {pred.formattedTime}
                  </p>
                  <p className="text-xs font-mono tabular-nums text-[#596866] dark:text-slate-400">
                    {pred.formattedPace}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#596866] dark:text-slate-400 leading-relaxed">
              {t.predictorDisclaimer}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
