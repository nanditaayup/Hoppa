'use client';

import React, { useState } from 'react';
import { Flame, CheckCircle2, Trash2, Award, RefreshCw } from 'lucide-react';
import {
  AppLanguage,
  DailyProgressEntry,
  DailySessionPlan,
  StravaSyncCandidate,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  computeDailyProgressStats,
  formatDecimalComma,
} from '@/lib/strava/transform';

interface DailyProgressTrackerProps {
  weeklySchedule: DailySessionPlan[];
  entries: DailyProgressEntry[];
  todayDateKey: string;
  selectedDayIndex: number;
  stravaMatches: StravaSyncCandidate[];
  stravaSyncNotice: string | null;
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

  const [comfortRating, setComfortRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [note, setNote] = useState('');
  const [savedDayIndex, setSavedDayIndex] = useState<number | null>(null);

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
    const entry: DailyProgressEntry = {
      dateKey: todayDateKey,
      dayIndex: selectedSession.dayIndex,
      sessionTitle: selectedSession.title,
      zone: selectedSession.zone,
      plannedKm: selectedSession.targetDistanceKm,
      actualKm: Math.round(parsedKm * 10) / 10,
      comfortRating,
      note: note.trim(),
      completedAt: new Date().toISOString(),
    };

    onAddEntry(entry);
    setNote('');
    setKmDraft(null);
    setSavedDayIndex(selectedSession.dayIndex);
  };

  const savedSession =
    savedDayIndex !== null
      ? weeklySchedule.find((s) => s.dayIndex === savedDayIndex)
      : null;

  const completedDaySet = new Set(entries.map((e) => e.dayIndex));

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
      className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="daily-progress-heading"
            className="text-xl font-bold text-slate-900 tracking-tight"
          >
            {t.heading}
          </h2>
          <p className="text-sm text-slate-600">{motivationMessage}</p>
        </div>

        {/* Motivation Metrics Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-indigo-50/90 text-indigo-900 flex items-center gap-2.5">
            <Flame
              className="w-5 h-5 text-indigo-600 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-[11px] opacity-80">{t.streakLabel}</p>
              <p
                data-testid="daily-streak-count"
                className="text-sm font-bold font-mono tabular-nums"
              >
                {stats.currentStreakDays} {t.daysUnit}
              </p>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-teal-50/90 text-teal-900 flex items-center gap-2.5">
            <Award
              className="w-5 h-5 text-teal-700 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-[11px] opacity-80">{t.thisWeekLabel}</p>
              <p
                data-testid="weekly-progress-ratio"
                className="text-sm font-bold font-mono tabular-nums"
              >
                {stats.completedThisWeekCount}/{stats.plannedRunSessionsCount}{' '}
                {t.sessionsUnit} ({stats.completionPct}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Automatic Strava -> Daily Progress Sync Offer */}
      {stravaMatches.length > 0 && (
        <div
          data-testid="strava-sync-progress-banner"
          className="rounded-xl bg-teal-50/80 border border-teal-200/80 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold text-teal-950">
              {t.stravaSyncTitle(stravaMatches.length)}
            </p>
            <p className="text-xs text-teal-900/90 leading-relaxed">
              {t.stravaSyncDesc}
            </p>
            <p className="text-xs font-mono tabular-nums text-teal-800">
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
            className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-semibold hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
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
          className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-4 py-2.5 text-xs font-medium text-emerald-900"
        >
          {stravaSyncNotice}
        </div>
      )}

      {/* Smooth Pastel Weekly Completion Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{t.weeklyAchievementLabel}</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800">
            {formatDecimalComma(stats.totalLoggedKm, 1, lang)} {t.kmLoggedUnit}
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={stats.completionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t.progressBarAria}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-400 transition-all duration-300"
            style={{ width: `${stats.completionPct}%` }}
          />
        </div>
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
              className={`min-h-[60px] p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/80 text-teal-950'
                  : isDone
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                    : 'border-slate-200 bg-[#F7F9FA] text-slate-700 hover:border-teal-300'
              }`}
            >
              <span className="text-xs font-semibold truncate max-w-full">
                {day.dayName.slice(0, 3)}
              </span>
              {isDone ? (
                <CheckCircle2
                  className="w-4 h-4 text-emerald-600"
                  aria-hidden="true"
                />
              ) : (
                <span className="text-[11px] font-mono tabular-nums opacity-80">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3 border-t border-slate-100 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-slate-500">
                {t.logSectionPrefix} · {selectedSession?.dayName}
              </p>
              <h3 className="text-base font-bold text-slate-900">
                {selectedSession?.title}
              </h3>
            </div>
            {selectedSession && selectedSession.targetDistanceKm > 0 && (
              <span className="text-xs font-mono tabular-nums text-slate-600">
                {t.targetLabel}{' '}
                {formatDecimalComma(selectedSession.targetDistanceKm, 1, lang)} km
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="input-actual-km"
                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
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
                    className={`min-h-[44px] rounded-xl border font-mono tabular-nums text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                      comfortRating === score
                        ? 'bg-teal-700 border-teal-700 text-white'
                        : 'bg-[#F7F9FA] border-slate-200 text-slate-700 hover:border-teal-300'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="input-progress-note"
              className="block text-sm font-medium text-slate-700 mb-1.5"
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
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 transition-colors"
            >
              {t.saveBtn}
            </button>
            {savedSession && (
              <span role="status" className="text-xs font-medium text-teal-700">
                {t.savedFeedback(savedSession.dayName, savedSession.title)}
              </span>
            )}
          </div>
        </form>

        {/* Recent Logs */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            {t.savedLogsHeading}
          </h3>

          {entries.length === 0 ? (
            <div className="rounded-xl bg-[#F7F9FA] p-5 text-sm text-slate-500">
              {t.emptyLogsBeforeBtn}{' '}
              <span className="font-semibold text-slate-700">
                {t.emptyLogsBtnName}
              </span>{' '}
              {t.emptyLogsAfterBtn}
            </div>
          ) : (
            <div
              data-testid="daily-progress-list"
              className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1"
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
                      <p className="text-xs text-slate-500 font-mono tabular-nums">
                        {entry.dateKey} · {t.feelingPrefix}{' '}
                        {entry.comfortRating}/5 (
                        {t.comfortRatings[entry.comfortRating]})
                      </p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {localizedScheduleTitle}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-mono tabular-nums font-semibold text-teal-700">
                          {formatDecimalComma(entry.actualKm, 1, lang)} km
                        </span>
                        {entry.note ? ` · ${entry.note}` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveEntry(entry.dateKey, entry.dayIndex)}
                      aria-label={`${t.deleteLogAria} ${localizedScheduleTitle}`}
                      className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 shrink-0"
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
    </section>
  );
}
