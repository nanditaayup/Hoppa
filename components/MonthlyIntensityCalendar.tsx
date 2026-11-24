'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  HeartPulse,
  Mountain,
  Star,
} from 'lucide-react';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  buildMonthlyIntensityGrid,
  formatFullDateLabel,
  formatMonthHeading,
  shiftMonthYear,
} from '@/lib/strava/monthly-calendar';
import {
  formatDecimalComma,
  formatMovingTime,
  formatPace,
} from '@/lib/strava/transform';
import {
  AppLanguage,
  CalendarDayData,
  DailyProgressEntry,
  DailySessionPlan,
  HeartRateZone,
  PaceZoneSummary,
  RunActivity,
  TrainingIntensityTier,
} from '@/lib/strava/types';

interface MonthlyIntensityCalendarProps {
  entries: DailyProgressEntry[];
  runs: RunActivity[];
  weeklySchedule: DailySessionPlan[];
  paceZones: PaceZoneSummary[];
  hrZones: HeartRateZone[];
  todayDateKey: string;
  lang: AppLanguage;
  onJumpToLogWeekday?: (dayIndex: number) => void;
}

const TIER_CELL_CLASSES: Record<TrainingIntensityTier, string> = {
  0: 'bg-slate-50/90 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300',
  1: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
  2: 'bg-teal-100/85 dark:bg-teal-900/60 border-teal-300 dark:border-teal-700 text-teal-950 dark:text-teal-100',
  3: 'bg-amber-100/90 dark:bg-amber-900/55 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100',
  4: 'bg-rose-100/90 dark:bg-rose-900/55 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100',
};

const TIER_DOT_CLASSES: Record<TrainingIntensityTier, string> = {
  0: 'bg-slate-300 dark:bg-slate-600',
  1: 'bg-emerald-500 dark:bg-emerald-400',
  2: 'bg-teal-600 dark:bg-teal-400',
  3: 'bg-amber-500 dark:bg-amber-400',
  4: 'bg-rose-600 dark:bg-rose-400',
};

const TIER_KEYS: TrainingIntensityTier[] = [0, 1, 2, 3, 4];

export default function MonthlyIntensityCalendar({
  entries,
  runs,
  weeklySchedule,
  paceZones,
  hrZones,
  todayDateKey,
  lang,
  onJumpToLogWeekday,
}: MonthlyIntensityCalendarProps) {
  const t = UI_COPY[lang].monthlyCalendar;
  const zoneLabels = UI_COPY[lang].training.zoneLabels;
  const dayNames = weeklySchedule.map((s) => s.dayName);

  const todayParts = useMemo(() => {
    const [y, m] = todayDateKey.split('-').map(Number);
    return {
      year: Number.isFinite(y) ? y : 2026,
      monthIndex: Number.isFinite(m) ? Math.max(0, Math.min(11, m - 1)) : 10,
    };
  }, [todayDateKey]);

  const [viewMonth, setViewMonth] = useState<{ year: number; monthIndex: number }>(
    todayParts
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayDateKey);

  const grid = useMemo(
    () =>
      buildMonthlyIntensityGrid({
        year: viewMonth.year,
        monthIndex: viewMonth.monthIndex,
        todayDateKey,
        entries,
        runs,
        weeklySchedule,
        paceZones,
        hrZones,
      }),
    [
      viewMonth.year,
      viewMonth.monthIndex,
      todayDateKey,
      entries,
      runs,
      weeklySchedule,
      paceZones,
      hrZones,
    ]
  );

  const selectedDay: CalendarDayData = useMemo(() => {
    const exactMatch = grid.days.find((d) => d.dateKey === selectedDateKey);
    if (exactMatch) return exactMatch;
    const todayMatch = grid.days.find((d) => d.dateKey === todayDateKey);
    if (todayMatch) return todayMatch;
    const firstActiveInMonth = grid.days.find(
      (d) => d.isCurrentMonth && d.sessions.length > 0
    );
    return (
      firstActiveInMonth ??
      grid.days.find((d) => d.isCurrentMonth) ??
      grid.days[0]
    );
  }, [grid.days, selectedDateKey, todayDateKey]);

  const handleShiftMonth = (delta: number) => {
    setViewMonth((prev) => {
      const next = shiftMonthYear(prev.year, prev.monthIndex, delta);
      const nextMonthKey = `${next.year}-${String(next.monthIndex + 1).padStart(2, '0')}`;
      setSelectedDateKey(
        todayDateKey.startsWith(nextMonthKey)
          ? todayDateKey
          : `${nextMonthKey}-01`
      );
      return next;
    });
  };

  const handleResetToCurrentMonth = () => {
    setViewMonth(todayParts);
    setSelectedDateKey(todayDateKey);
  };

  const selectedDayPlan = weeklySchedule.find(
    (s) => s.dayIndex === selectedDay.dayIndex
  );

  const selectedWeekdayName =
    dayNames[selectedDay.dayIndex] ?? selectedDayPlan?.dayName ?? '';

  return (
    <section
      id="kalender-intensitas"
      data-testid="monthly-intensity-calendar"
      aria-labelledby="monthly-calendar-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 scroll-mt-20"
    >
      {/* Header & Month Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3
            id="monthly-calendar-heading"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
          >
            <CalendarDays
              className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
              aria-hidden="true"
            />
            <span>{t.heading}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => handleShiftMonth(-1)}
            aria-label={t.prevMonthAria}
            data-testid="calendar-prev-month-btn"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <span
            data-testid="calendar-month-heading"
            className="min-w-[132px] text-center text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap"
          >
            {formatMonthHeading(viewMonth.year, viewMonth.monthIndex, lang)}
          </span>

          <button
            type="button"
            onClick={() => handleShiftMonth(1)}
            aria-label={t.nextMonthAria}
            data-testid="calendar-next-month-btn"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          {(viewMonth.year !== todayParts.year ||
            viewMonth.monthIndex !== todayParts.monthIndex) && (
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              data-testid="calendar-today-month-btn"
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900 whitespace-nowrap"
            >
              {t.thisMonthBtn}
            </button>
          )}
        </div>
      </div>

      {/* Monthly KPI Summary Strip (border-b clean cells, no nested card borders) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-3.5 px-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60">
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.activeDaysLabel}
          </p>
          <p className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {grid.summary.activeDaysCount} {t.daysUnit}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.monthlyTotalKmLabel}
          </p>
          <p className="text-base sm:text-lg font-bold font-mono tabular-nums text-teal-700 dark:text-teal-400 mt-0.5">
            {formatDecimalComma(grid.summary.totalDistanceKm, 1, lang)} km
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.highIntensityDaysLabel}
          </p>
          <p className="text-base sm:text-lg font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400 mt-0.5">
            {grid.summary.highOrPeakDaysCount} {t.daysUnit}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.avgPaceLabel}
          </p>
          <p className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {grid.summary.avgPaceSecPerKm
              ? formatPace(grid.summary.avgPaceSecPerKm)
              : '—'}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.avgHrLabel}
          </p>
          <p className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {grid.summary.avgHeartRateBpm
              ? `${grid.summary.avgHeartRateBpm} bpm`
              : '—'}
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {t.weekdayHeadersShort.map((hdr) => (
            <div
              key={hdr}
              className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 py-1"
            >
              {hdr}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {grid.days.map((day) => {
            const isSelected = day.dateKey === selectedDay.dateKey;
            const intensityLabel = t.intensityLabels[day.intensityLevel];
            const kmText = formatDecimalComma(day.totalDistanceKm, 1, lang);

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(day.dateKey)}
                data-testid={`calendar-day-${day.dateKey}`}
                aria-label={t.dayCellAria(
                  formatFullDateLabel(day.dateKey, lang),
                  intensityLabel,
                  kmText,
                  day.sessions.length
                )}
                aria-pressed={isSelected}
                className={`min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                  TIER_CELL_CLASSES[day.intensityTier]
                } ${!day.isCurrentMonth ? 'opacity-45' : ''} ${
                  isSelected
                    ? 'ring-2 ring-teal-700 dark:ring-teal-400 ring-offset-1 dark:ring-offset-slate-900'
                    : 'hover:border-teal-400 dark:hover:border-teal-500'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={`text-xs font-bold font-mono tabular-nums ${
                      day.isToday
                        ? 'px-1.5 py-0.5 rounded-md bg-teal-700 dark:bg-teal-500 text-white'
                        : ''
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      TIER_DOT_CLASSES[day.intensityTier]
                    }`}
                    aria-hidden="true"
                  />
                </div>

                {day.totalDistanceKm > 0 ? (
                  <div className="space-y-0.5">
                    <span className="block text-[11px] sm:text-xs font-bold font-mono tabular-nums truncate">
                      {kmText} km
                    </span>
                    <span className="hidden sm:block text-[10px] font-medium opacity-85 truncate">
                      {intensityLabel}
                    </span>
                  </div>
                ) : day.hasRestLog ? (
                  <span className="hidden sm:block text-[10px] font-medium opacity-80 truncate">
                    {t.restLoggedTag}
                  </span>
                ) : (
                  <span className="sr-only">{intensityLabel}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensity Scale Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {t.legendTitle}
        </span>
        {TIER_KEYS.map((tier) => {
          const level =
            tier === 4
              ? 'peak'
              : tier === 3
                ? 'high'
                : tier === 2
                  ? 'moderate'
                  : tier === 1
                    ? 'light'
                    : 'rest';
          return (
            <span
              key={tier}
              title={t.intensityDescriptions[level]}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className={`w-3 h-3 rounded-sm border ${TIER_CELL_CLASSES[tier]}`}
                aria-hidden="true"
              />
              <span>{t.intensityLabels[level]}</span>
            </span>
          );
        })}
      </div>

      {/* Inline Detail Panel Below Calendar */}
      <div
        data-testid="calendar-day-detail-panel"
        className="pt-5 border-t border-slate-200/80 dark:border-slate-800 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
              {t.detailPanelHeading}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedWeekdayName
                  ? `${selectedWeekdayName}, ${formatFullDateLabel(selectedDay.dateKey, lang)}`
                  : formatFullDateLabel(selectedDay.dateKey, lang)}
              </h4>
              {selectedDay.isToday && (
                <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/70 text-teal-800 dark:text-teal-200 text-[11px] font-semibold">
                  {t.todayTag}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold">
                {t.intensityLabels[selectedDay.intensityLevel]}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">
                {t.selectedTotalLabel}:
              </span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                {formatDecimalComma(selectedDay.totalDistanceKm, 2, lang)} km
              </span>
            </div>
            {selectedDay.totalMovingTimeSeconds > 0 && (
              <div>
                <span className="text-slate-500 dark:text-slate-400 mr-1.5">
                  {t.selectedDurationLabel}:
                </span>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                  {formatMovingTime(selectedDay.totalMovingTimeSeconds)}
                </span>
              </div>
            )}
          </div>
        </div>

        {selectedDay.sessions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl bg-slate-50/75 dark:bg-slate-800/50 px-4">
            {selectedDay.sessions.map((session) => (
              <div
                key={session.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {session.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 text-[11px] font-semibold">
                      {t.sourceLabels[session.source]}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                      {zoneLabels[session.zone]}
                    </span>
                  </div>
                  {session.note && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {session.note}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs shrink-0">
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                    <Flame className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                    {formatDecimalComma(session.distanceKm, 2, lang)} km
                  </span>

                  {session.paceSecPerKm && session.paceSecPerKm > 0 && (
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-700 dark:text-slate-200">
                      <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      {formatPace(session.paceSecPerKm)}
                    </span>
                  )}

                  {session.movingTimeSeconds && session.movingTimeSeconds > 0 && (
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {formatMovingTime(session.movingTimeSeconds)}
                    </span>
                  )}

                  {session.avgHeartRateBpm && session.avgHeartRateBpm > 0 && (
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums text-rose-700 dark:text-rose-400">
                      <HeartPulse className="w-3.5 h-3.5" aria-hidden="true" />
                      {session.avgHeartRateBpm} bpm
                    </span>
                  )}

                  {session.elevationGainMeters !== null &&
                    session.elevationGainMeters > 0 && (
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        <Mountain className="w-3.5 h-3.5" aria-hidden="true" />
                        +{Math.round(session.elevationGainMeters)} m
                      </span>
                    )}

                  {session.comfortRating !== null && (
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums text-amber-700 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5" aria-hidden="true" />
                      {session.comfortRating}/5
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50/75 dark:bg-slate-800/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t.emptyDayTitle}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedDayPlan
                  ? selectedDayPlan.zone === 'rest'
                    ? t.emptyDayRestHint
                    : t.emptyDayPlannedHint(
                        selectedDayPlan.title,
                        formatDecimalComma(selectedDayPlan.targetDistanceKm, 1, lang)
                      )
                  : t.emptyDayDefaultHint}
              </p>
            </div>

            {onJumpToLogWeekday && (
              <button
                type="button"
                onClick={() => onJumpToLogWeekday(selectedDay.dayIndex)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold hover:border-teal-400 whitespace-nowrap shrink-0 self-start sm:self-center"
              >
                {t.logForWeekdayBtn(selectedWeekdayName || t.weekdayHeadersShort[selectedDay.dayIndex])}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
