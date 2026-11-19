'use client';

import React from 'react';
import { Calendar, Flag, RotateCcw } from 'lucide-react';
import { RACE_TARGETS_BY_LANG } from '@/lib/strava/config';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  AppLanguage,
  RaceCountdownInfo,
  RaceDistanceKey,
} from '@/lib/strava/types';

interface RaceCountdownProps {
  targetRace: RaceDistanceKey;
  countdown: RaceCountdownInfo;
  customRaceName: string;
  hasCustomDate: boolean;
  lang: AppLanguage;
  onChangeRaceName: (name: string) => void;
  onChangeRaceDate: (dateKey: string) => void;
  onResetRaceMeta: () => void;
}

export default function RaceCountdown({
  targetRace,
  countdown,
  customRaceName,
  hasCustomDate,
  lang,
  onChangeRaceName,
  onChangeRaceDate,
  onResetRaceMeta,
}: RaceCountdownProps) {
  const t = UI_COPY[lang].countdown;
  const raceMeta = RACE_TARGETS_BY_LANG[lang][targetRace];
  const trimmedName = customRaceName.trim();
  const targetEventLabel = trimmedName
    ? `${trimmedName} (${targetRace})`
    : `${targetRace} ${raceMeta.fullName}`;
  const showReset = hasCustomDate || Boolean(trimmedName);

  const accentNumberClass =
    countdown.status === 'race_day'
      ? 'text-emerald-700'
      : countdown.status === 'race_week' || countdown.status === 'tapering'
        ? 'text-indigo-700'
        : countdown.status === 'passed'
          ? 'text-slate-600'
          : 'text-teal-700';

  const statusTextClass =
    countdown.status === 'race_day'
      ? 'text-emerald-700'
      : countdown.status === 'race_week' || countdown.status === 'tapering'
        ? 'text-indigo-700'
        : 'text-teal-700';

  const weeksBreakdown =
    countdown.daysRemaining > 0
      ? t.weeksDaysFormat(countdown.weeksRemaining, countdown.remainderDays)
      : null;

  return (
    <div
      data-testid="race-countdown"
      className="border-y border-teal-200/70 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      {/* Left: Race Countdown Metric & Motivation */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
        <div className="flex items-baseline gap-2.5 shrink-0">
          <Flag
            className="w-4 h-4 text-teal-700 self-center shrink-0"
            aria-hidden="true"
          />
          {countdown.status === 'race_day' ? (
            <span
              data-testid="race-countdown-days"
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${accentNumberClass}`}
            >
              {t.todayLabel}
            </span>
          ) : countdown.status === 'passed' ? (
            <>
              <span
                data-testid="race-countdown-days"
                className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight ${accentNumberClass}`}
              >
                {Math.abs(countdown.daysRemaining)}
              </span>
              <span className="text-sm font-medium text-slate-600">
                {t.passedDaysSuffix}
              </span>
            </>
          ) : (
            <>
              <span
                data-testid="race-countdown-days"
                className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight ${accentNumberClass}`}
              >
                {countdown.daysRemaining}
              </span>
              <span className="text-sm font-medium text-slate-700">
                {t.daysLeftUnit}
              </span>
            </>
          )}
        </div>

        <div className="sm:border-l sm:border-teal-200/70 sm:pl-5 space-y-1 min-w-0">
          <p
            data-testid="race-countdown-title"
            className="text-xs sm:text-sm font-semibold text-slate-900"
          >
            {t.badgeLabel}: {t.untilPrefix} {targetEventLabel}
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className={`font-semibold ${statusTextClass}`}>
              {countdown.phaseLabel}
            </span>
            {weeksBreakdown && (
              <>
                <span className="text-slate-400" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono tabular-nums text-slate-600 whitespace-nowrap">
                  {weeksBreakdown}
                </span>
              </>
            )}
            <span className="text-slate-400" aria-hidden="true">
              ·
            </span>
            <span className="font-mono tabular-nums text-slate-600 whitespace-nowrap">
              {countdown.formattedRaceDate}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {countdown.motivationTip}
          </p>
        </div>
      </div>

      {/* Right: Custom Event Name, Date Picker & Reset */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <label
            htmlFor="input-race-name"
            className="text-xs font-medium text-slate-600 whitespace-nowrap"
          >
            {t.nameInputLabel}
          </label>
          <input
            id="input-race-name"
            type="text"
            maxLength={40}
            aria-label={t.nameInputAria}
            data-testid="race-countdown-name-input"
            value={customRaceName}
            onChange={(e) => onChangeRaceName(e.target.value)}
            placeholder={t.nameInputPlaceholder}
            className="w-40 sm:w-44 min-h-[44px] px-3 py-1.5 rounded-xl border border-teal-200/80 bg-white/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="input-race-date"
            className="text-xs font-medium text-slate-600 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
            {t.dateInputLabel}
          </label>
          <input
            id="input-race-date"
            type="date"
            aria-label={t.dateInputAria}
            data-testid="race-countdown-date-input"
            value={countdown.raceDateKey}
            onChange={(e) => onChangeRaceDate(e.target.value)}
            className="min-h-[44px] px-3 py-1.5 rounded-xl border border-teal-200/80 bg-white/90 text-xs sm:text-sm font-mono tabular-nums text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        {showReset && (
          <button
            type="button"
            onClick={onResetRaceMeta}
            data-testid="race-countdown-reset-btn"
            className="min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white/90 text-xs font-medium text-slate-700 hover:border-teal-300 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {t.resetDateBtn}
          </button>
        )}
      </div>
    </div>
  );
}
