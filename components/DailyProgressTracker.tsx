'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  Award,
  RefreshCw,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  AppLanguage,
  DailyProgressEntry,
  DailySessionPlan,
  HeartRateVo2Summary,
  StravaSyncCandidate,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  computeDailyProgressStats,
  formatDecimalComma,
  formatPace,
  parsePaceInputToSecPerKm,
} from '@/lib/strava/transform';
import ShareProgressModal from './ShareProgressModal';

interface DailyProgressTrackerProps {
  weeklySchedule: DailySessionPlan[];
  entries: DailyProgressEntry[];
  todayDateKey: string;
  selectedDayIndex: number;
  stravaMatches: StravaSyncCandidate[];
  stravaSyncNotice: string | null;
  hrVo2: HeartRateVo2Summary;
  raceEventLabel: string;
  lang: AppLanguage;
  onSelectDayIndex: (dayIndex: number) => void;
  onAddEntry: (entry: DailyProgressEntry) => void;
  onRemoveEntry: (dateKey: string, dayIndex: number) => void;
  onSyncStravaProgress: () => void;
}

export default function DailyProgressTracker({
  weeklySchedule,
  entries,
  todayDateKey,
  selectedDayIndex,
  stravaMatches,
  stravaSyncNotice,
  hrVo2,
  raceEventLabel,
  lang,
  onSelectDayIndex,
  onAddEntry,
  onRemoveEntry,
  onSyncStravaProgress,
}: DailyProgressTrackerProps) {
  const t = UI_COPY[lang].dailyProgress;

  const selectedSession =
    weeklySchedule.find((s) => s.dayIndex === selectedDayIndex) ??
    weeklySchedule[0];

  const targetKm = selectedSession?.targetDistanceKm ?? 0;
  const draftKey = `${selectedDayIndex}-${targetKm}`;
  const [kmDraft, setKmDraft] = useState<{ key: string; value: string } | null>(
    null
  );
  const actualKmInput =
    kmDraft && kmDraft.key === draftKey ? kmDraft.value : String(targetKm);

  const [paceInput, setPaceInput] = useState('');
  const [hrInput, setHrInput] = useState('');
  const [comfortRating, setComfortRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [note, setNote] = useState('');
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [savedDayIndex, setSavedDayIndex] = useState<number | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleSelectDay = (dayIndex: number) => {
    onSelectDayIndex(dayIndex);
    setSavedDayIndex(null);
  };

  const stats = computeDailyProgressStats(
    entries,
    weeklySchedule,
    todayDateKey
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    const parsedKm = Math.max(0, Number(actualKmInput.replace(',', '.')) || 0);
    const parsedPace = parsePaceInputToSecPerKm(paceInput);
    const rawHr = Number(hrInput);
    const parsedHr =
      hrInput.trim() && Number.isFinite(rawHr) && rawHr >= 35 && rawHr <= 230
        ? Math.round(rawHr)
        : null;

    const entry: DailyProgressEntry = {
      dateKey: todayDateKey,
      dayIndex: selectedSession.dayIndex,
      sessionTitle: selectedSession.title,
      zone: selectedSession.zone,
      plannedKm: selectedSession.targetDistanceKm,
      actualKm: Math.round(parsedKm * 10) / 10,
      paceSecPerKm: parsedPace,
      avgHeartRateBpm: parsedHr,
      comfortRating,
      note: note.trim(),
      completedAt: new Date().toISOString(),
    };

    onAddEntry(entry);
    setPaceInput('');
    setHrInput('');
    setNote('');
    setKmDraft(null);
    setSavedDayIndex(selectedSession.dayIndex);
  };

  const savedSession =
    savedDayIndex !== null
      ? weeklySchedule.find((s) => s.dayIndex === savedDayIndex)
      : null;

  const weekBounds = (() => {
    const parts = todayDateKey.split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
      return { weekStartKey: todayDateKey, weekEndKey: todayDateKey };
    }
    const utcMs = Date.UTC(parts[0], parts[1] - 1, parts[2]);
    const utcDay = new Date(utcMs).getUTCDay();
    const weekdayIdx = utcDay === 0 ? 6 : utcDay - 1;
    const weekStartKey = new Date(utcMs - weekdayIdx * 86400000)
      .toISOString()
      .slice(0, 10);
    const weekEndKey = new Date(utcMs + (6 - weekdayIdx) * 86400000)
      .toISOString()
      .slice(0, 10);
    return { weekStartKey, weekEndKey };
  })();

  const completedDaySet = new Set(
    entries
      .filter(
        (e) =>
          e.dateKey >= weekBounds.weekStartKey &&
          e.dateKey <= weekBounds.weekEndKey
      )
      .map((e) => e.dayIndex)
  );

  const motivationMessage =
    stats.completionPct >= 100
      ? t.motivationDone
      : stats.currentStreakDays >= 3
        ? t.motivationStreak(stats.currentStreakDays)
        : stats.completedThisWeekCount > 0
          ? t.motivationStarted
          : t.motivationEmpty;

  return (
    <section
      id="progres-harian"
      aria-labelledby="daily-progress-heading"
      className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 space-y-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="daily-progress-heading"
            className="text-xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight"
          >
            {t.heading}
          </h2>
          <p className="text-sm text-[#596866] dark:text-slate-300">
            {motivationMessage}
          </p>
          <p className="text-xs text-[#596866] dark:text-slate-400">
            {t.streakRestNote}
          </p>
        </div>

        {/* Motivation Metrics Strip + Share Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center divide-x divide-[#DFE7E2] dark:divide-slate-700 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70">
            <div className="px-3.5 py-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#E9957D] text-[#202A2A] inline-flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] text-[#596866] dark:text-slate-400">
                  {t.streakLabel}
                </p>
                <p
                  data-testid="daily-streak-count"
                  className="text-sm font-bold text-[#202A2A] dark:text-slate-100"
                >
                  {stats.currentStreakDays} {t.daysUnit}
                </p>
              </div>
            </div>

            <div className="px-3.5 py-2 flex items-center gap-2">
              <Award
                className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-[11px] text-[#596866] dark:text-slate-400">
                  {t.thisWeekLabel}
                </p>
                <p
                  data-testid="weekly-progress-ratio"
                  className="text-sm font-bold text-[#202A2A] dark:text-slate-100"
                >
                  {stats.completedThisWeekCount}/{stats.plannedRunSessionsCount}{' '}
                  {t.sessionsUnit} ({stats.completionPct}%)
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            data-testid="share-progress-btn"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            {t.shareBtn}
          </button>
        </div>
      </div>

      {/* Automatic Strava -> Daily Progress Sync Offer */}
      {stravaMatches.length > 0 && (
        <div
          data-testid="strava-sync-progress-banner"
          className="rounded-xl bg-[#E6F3EE] dark:bg-teal-950/50 border border-[#DFE7E2] dark:border-teal-800/70 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold text-[#202A2A] dark:text-teal-100">
              {t.stravaSyncTitle(stravaMatches.length)}
            </p>
            <p className="text-xs text-[#596866] dark:text-teal-200/90 leading-relaxed">
              {t.stravaSyncDesc}
            </p>
            <p className="text-xs font-medium text-[#087F73] dark:text-teal-300">
              {stravaMatches
                .map(
                  (m) =>
                    `${m.dayName.slice(0, 3)} (${m.dateKey}): ${formatDecimalComma(m.actualKm, 1, lang)} km`
                )
                .join(' · ')}
            </p>
          </div>

          <button
            type="button"
            onClick={onSyncStravaProgress}
            data-testid="sync-strava-progress-btn"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {t.stravaSyncBtn(stravaMatches.length)}
          </button>
        </div>
      )}

      {stravaSyncNotice && (
        <div
          role="status"
          data-testid="strava-sync-progress-status"
          className="rounded-xl bg-[#E6F3EE] dark:bg-emerald-950/50 border border-[#DFE7E2] dark:border-emerald-800/70 px-4 py-2.5 text-xs font-medium text-[#202A2A] dark:text-emerald-200"
        >
          {stravaSyncNotice}
        </div>
      )}

      {/* Warm Sport Weekly Completion Bar + Separated Session vs Volume Breakdown */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#596866] dark:text-slate-300">
          <span>
            {t.runSessionsLabel}:{' '}
            <strong className="font-bold text-[#202A2A] dark:text-slate-100">
              {stats.completedThisWeekCount}/{stats.plannedRunSessionsCount} ({stats.completionPct}%)
            </strong>
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[#202A2A] dark:text-slate-300">
            {stats.avgPaceSecPerKm && (
              <span>
                {t.avgPaceLabel}:{' '}
                <strong className="font-mono tabular-nums text-[#087F73] dark:text-teal-300">
                  {formatPace(stats.avgPaceSecPerKm)}
                </strong>
              </span>
            )}
            {stats.avgHeartRateBpm && (
              <span>
                {t.avgHrLabel}:{' '}
                <strong className="font-mono tabular-nums text-[#202A2A] dark:text-slate-200">
                  {stats.avgHeartRateBpm} bpm
                </strong>
              </span>
            )}
            <span
              data-testid="daily-progress-distance-summary"
              className="font-semibold text-[#202A2A] dark:text-slate-100"
            >
              {t.runDistanceLabel}: {formatDecimalComma(stats.totalLoggedKm, 1, lang)} /{' '}
              {formatDecimalComma(stats.plannedWeekKm, 1, lang)} km ({stats.actualVsPlannedPct}%)
            </span>
          </div>
        </div>
        <div
          className="w-full h-2.5 rounded-full bg-[#E6F3EE] dark:bg-slate-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={stats.completionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t.progressBarAria}
        >
          <div
            className="h-full rounded-full bg-[#087F73] transition-all duration-300"
            style={{ width: `${stats.completionPct}%` }}
          />
        </div>

        {(stats.completedCrossTrainCount > 0 || stats.loggedRestDaysCount > 0) && (
          <p className="text-xs text-[#596866] dark:text-slate-400">
            {t.strengthRestSummary(stats.completedCrossTrainCount, stats.loggedRestDaysCount)}
          </p>
        )}

        {stats.isVolumeSignificantlyOverPlan && (
          <div
            role="status"
            data-testid="daily-progress-overload-caution"
            className="rounded-xl bg-[#F7F6F2] dark:bg-amber-950/60 border border-[#DFE7E2] dark:border-amber-800 px-3.5 py-2.5 flex items-start gap-2 text-xs text-[#202A2A] dark:text-amber-100"
          >
            <AlertTriangle
              className="w-4 h-4 text-rose-700 dark:text-amber-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>
              {t.overloadCautionBanner(
                stats.actualVsPlannedPct,
                formatDecimalComma(stats.plannedWeekKm, 1, lang),
                formatDecimalComma(stats.totalLoggedKm, 1, lang)
              )}
            </span>
          </div>
        )}
      </div>

      {/* Interactive 7-day Selector Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {weeklySchedule.map((day) => {
          const isSelected = day.dayIndex === selectedDayIndex;
          const isDone = completedDaySet.has(day.dayIndex);
          const isRest = day.zone === 'rest';

          return (
            <button
              key={day.dayIndex}
              type="button"
              onClick={() => handleSelectDay(day.dayIndex)}
              aria-label={`${t.selectDayPrefix} ${day.dayName}${isDone ? t.dayAriaDone : ''}`}
              className={`min-h-[60px] p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                isSelected
                  ? 'border-[#087F73] dark:border-teal-500 bg-[#E6F3EE] dark:bg-teal-950/60 text-[#202A2A] dark:text-teal-100'
                  : isDone
                    ? 'border-[#DFE7E2] dark:border-emerald-800 bg-[#E6F3EE]/60 dark:bg-emerald-950/50 text-[#087F73] dark:text-emerald-200'
                    : 'border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] dark:hover:border-teal-600'
              }`}
            >
              <span className="text-xs font-semibold truncate max-w-full">
                {day.dayName.slice(0, 3)}
              </span>
              {isDone ? (
                <CheckCircle2
                  className="w-4 h-4 text-[#087F73] dark:text-emerald-400"
                  aria-hidden="true"
                />
              ) : (
                <span className="text-[11px] text-[#596866] dark:text-slate-300">
                  {isRest
                    ? t.restShort
                    : `${formatDecimalComma(day.targetDistanceKm, 1, lang)}k`}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Check-in Form & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-[#DFE7E2] dark:border-slate-800 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-[#596866] dark:text-slate-400">
                {t.logSectionPrefix} · {selectedSession?.dayName}
              </p>
              <h3 className="text-base font-bold text-[#202A2A] dark:text-slate-100">
                {selectedSession?.title}
              </h3>
            </div>
            {selectedSession && selectedSession.targetDistanceKm > 0 && (
              <span className="text-xs font-medium text-[#596866] dark:text-slate-300">
                {t.targetLabel}{' '}
                {formatDecimalComma(selectedSession.targetDistanceKm, 1, lang)} km
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="input-actual-km"
                className="block text-sm font-medium text-[#202A2A] dark:text-slate-200 mb-1.5"
              >
                {t.actualDistanceLabel}
              </label>
              <input
                id="input-actual-km"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={actualKmInput}
                onChange={(e) =>
                  setKmDraft({ key: draftKey, value: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-[#202A2A] dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F73] dark:focus:ring-teal-400"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-[#202A2A] dark:text-slate-200 mb-1.5">
                {t.comfortLabel} ({t.comfortRatings[comfortRating]})
              </span>
              <div
                role="group"
                aria-label={t.comfortGroupAria}
                className="grid grid-cols-5 gap-1.5"
              >
                {([1, 2, 3, 4, 5] as const).map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setComfortRating(score)}
                    aria-label={`${t.comfortScoreAria} ${score}: ${t.comfortRatings[score]}`}
                    className={`min-h-[44px] rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                      comfortRating === score
                        ? 'bg-[#087F73] dark:bg-teal-600 border-[#087F73] dark:border-teal-500 text-white'
                        : 'bg-[#F7F6F2] dark:bg-slate-800/70 border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] dark:hover:border-teal-600'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowOptionalDetails((prev) => !prev)}
              aria-expanded={showOptionalDetails}
              data-testid="toggle-optional-progress-details"
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] dark:hover:border-teal-600 inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
            >
              {showOptionalDetails ? (
                <ChevronUp className="w-4 h-4 text-[#087F73] dark:text-teal-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#087F73] dark:text-teal-400" aria-hidden="true" />
              )}
              <span>
                {showOptionalDetails
                  ? t.optionalDetailsHide
                  : t.optionalDetailsShow}
              </span>
            </button>
          </div>

          {showOptionalDetails && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="input-progress-pace"
                    className="block text-sm font-medium text-[#202A2A] dark:text-slate-200 mb-1.5"
                  >
                    {t.paceInputLabel}
                  </label>
                  <input
                    id="input-progress-pace"
                    data-testid="input-progress-pace"
                    type="text"
                    maxLength={10}
                    value={paceInput}
                    onChange={(e) => setPaceInput(e.target.value)}
                    placeholder={t.paceInputPlaceholder}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-[#202A2A] dark:text-slate-100 font-mono tabular-nums placeholder:text-[#596866] dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F73] dark:focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="input-progress-hr"
                    className="block text-sm font-medium text-[#202A2A] dark:text-slate-200 mb-1.5"
                  >
                    {t.hrInputLabel}
                  </label>
                  <input
                    id="input-progress-hr"
                    data-testid="input-progress-hr"
                    type="number"
                    min={35}
                    max={230}
                    step={1}
                    value={hrInput}
                    onChange={(e) => setHrInput(e.target.value)}
                    placeholder={t.hrInputPlaceholder}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-[#202A2A] dark:text-slate-100 font-mono tabular-nums placeholder:text-[#596866] dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F73] dark:focus:ring-teal-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="input-progress-note"
                  className="block text-sm font-medium text-[#202A2A] dark:text-slate-200 mb-1.5"
                >
                  {t.noteLabel}
                </label>
                <input
                  id="input-progress-note"
                  type="text"
                  maxLength={120}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.notePlaceholder}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2] dark:bg-slate-800/70 text-sm text-[#202A2A] dark:text-slate-100 placeholder:text-[#596866] dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F73] dark:focus:ring-teal-400"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-sm font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 transition-colors"
            >
              {t.saveBtn}
            </button>
            {savedSession && (
              <span
                role="status"
                className="text-xs font-medium text-[#087F73] dark:text-teal-400"
              >
                {t.savedFeedback(savedSession.dayName, savedSession.title)}
              </span>
            )}
          </div>
        </form>

        {/* Recent Logs */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-[#202A2A] dark:text-slate-100">
            {t.savedLogsHeading}
          </h3>

          {entries.length === 0 ? (
            <div className="rounded-xl bg-[#F7F6F2] dark:bg-slate-800/70 p-5 text-sm text-[#596866] dark:text-slate-400">
              {t.emptyLogsBeforeBtn}{' '}
              <span className="font-semibold text-[#202A2A] dark:text-slate-200">
                {t.emptyLogsBtnName}
              </span>{' '}
              {t.emptyLogsAfterBtn}
            </div>
          ) : (
            <div
              data-testid="daily-progress-list"
              className="divide-y divide-[#DFE7E2] dark:divide-slate-800 max-h-72 overflow-y-auto pr-1"
            >
              {entries.map((entry) => {
                const localizedScheduleTitle =
                  weeklySchedule.find((s) => s.dayIndex === entry.dayIndex)
                    ?.title ?? entry.sessionTitle;
                return (
                  <div
                    key={`${entry.dateKey}-${entry.dayIndex}`}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs text-[#596866] dark:text-slate-400">
                        {entry.dateKey} · {t.feelingPrefix}{' '}
                        {entry.comfortRating}/5 (
                        {t.comfortRatings[entry.comfortRating]})
                      </p>
                      <p className="text-sm font-semibold text-[#202A2A] dark:text-slate-100 truncate">
                        {localizedScheduleTitle}
                      </p>
                      <p className="text-xs text-[#596866] dark:text-slate-300">
                        <span className="font-semibold text-[#087F73] dark:text-teal-400">
                          {formatDecimalComma(entry.actualKm, 1, lang)} km
                        </span>
                        {entry.paceSecPerKm ? (
                          <span className="font-mono tabular-nums text-[#202A2A] dark:text-sky-300">
                            {' '}
                            · {formatPace(entry.paceSecPerKm)}
                          </span>
                        ) : null}
                        {entry.avgHeartRateBpm ? (
                          <span className="font-mono tabular-nums text-[#596866] dark:text-rose-400">
                            {' '}
                            · {entry.avgHeartRateBpm} bpm
                          </span>
                        ) : null}
                        {entry.note ? ` · ${entry.note}` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveEntry(entry.dateKey, entry.dayIndex)}
                      aria-label={`${t.deleteLogAria} ${localizedScheduleTitle}`}
                      className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-[#596866] dark:text-slate-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ShareProgressModal
        isOpen={isShareOpen}
        lang={lang}
        raceEventLabel={raceEventLabel}
        streakDays={stats.currentStreakDays}
        completedSessions={stats.completedThisWeekCount}
        plannedSessions={stats.plannedRunSessionsCount}
        completionPct={stats.completionPct}
        totalLoggedKm={stats.totalLoggedKm}
        avgPaceSecPerKm={stats.avgPaceSecPerKm}
        avgHeartRateBpm={stats.avgHeartRateBpm}
        hrVo2={hrVo2}
        onClose={() => setIsShareOpen(false)}
      />
    </section>
  );
}
