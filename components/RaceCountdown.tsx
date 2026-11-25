'use client';

import React, { useState } from 'react';
import { Calendar, Flag, PencilLine, RotateCcw } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const t = UI_COPY[lang].countdown;
  const raceMeta = RACE_TARGETS_BY_LANG[lang][targetRace];
  const trimmedName = customRaceName.trim();
  const targetEventLabel = trimmedName
    ? `${trimmedName} (${targetRace})`
    : `${targetRace} ${raceMeta.fullName}`;
  const showReset = hasCustomDate || Boolean(trimmedName);

  const accentNumberClass =
    countdown.status === 'race_day'
      ? 'text-[#087F73] dark:text-emerald-400'
      : countdown.status === 'passed'
        ? 'text-[#596866] dark:text-slate-400'
        : 'text-[#087F73] dark:text-teal-400';

  const statusTextClass =
    countdown.status === 'race_day'
      ? 'text-[#087F73] dark:text-emerald-400'
      : 'text-[#087F73] dark:text-teal-300';

  const weeksBreakdown =
    countdown.daysRemaining > 0
      ? t.weeksDaysFormat(countdown.weeksRemaining, countdown.remainderDays)
      : null;

  return (
    <div data-testid="race-countdown" className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Calm Race Countdown Metric & Motivation */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 min-w-0">
          <div className="flex items-baseline gap-2 shrink-0">
            <Flag
              className="w-4 h-4 text-[#087F73] dark:text-teal-400 self-center shrink-0"
              aria-hidden="true"
            />
            {countdown.status === 'race_day' ? (
              <span
                data-testid="race-countdown-days"
                className={`text-xl sm:text-2xl font-bold tracking-tight ${accentNumberClass}`}
              >
                {t.todayLabel}
              </span>
            ) : countdown.status === 'passed' ? (
              <>
                <span
                  data-testid="race-countdown-days"
                  className={`text-2xl font-bold tabular-nums tracking-tight ${accentNumberClass}`}
                >
                  {Math.abs(countdown.daysRemaining)}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#596866] dark:text-slate-300">
                  {t.passedDaysSuffix}
                </span>
              </>
            ) : (
              <>
                <span
                  data-testid="race-countdown-days"
                  className={`text-2xl font-bold tabular-nums tracking-tight ${accentNumberClass}`}
                >
                  {countdown.daysRemaining}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#202A2A] dark:text-slate-300">
                  {t.daysLeftUnit}
                </span>
              </>
            )}
          </div>

          <div className="sm:border-l sm:border-[#DFE7E2] dark:sm:border-teal-800/60 sm:pl-5 space-y-0.5 min-w-0">
            <p
              data-testid="race-countdown-title"
              className="text-xs sm:text-sm font-semibold text-[#202A2A] dark:text-slate-100"
            >
              {t.badgeLabel}: {t.untilPrefix} {targetEventLabel}
            </p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span className={`font-semibold ${statusTextClass}`}>
                {countdown.phaseLabel}
              </span>
              {weeksBreakdown && (
                <>
                  <span className="text-[#596866]/60 dark:text-slate-500" aria-hidden="true">
                    ·
                  </span>
                  <span className="tabular-nums text-[#596866] dark:text-slate-300 whitespace-nowrap">
                    {weeksBreakdown}
                  </span>
                </>
              )}
              <span className="text-[#596866]/60 dark:text-slate-500" aria-hidden="true">
                ·
              </span>
              <span className="tabular-nums text-[#596866] dark:text-slate-300 whitespace-nowrap">
                {countdown.formattedRaceDate}
              </span>
            </div>

            <p className="text-xs text-[#596866] dark:text-slate-300 leading-relaxed">
              {countdown.motivationTip}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing((prev) => !prev)}
          data-testid="race-countdown-edit-toggle"
          aria-expanded={isEditing}
          className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-teal-800 bg-white dark:bg-slate-900/80 text-xs font-semibold text-[#202A2A] dark:text-teal-200 hover:border-[#087F73] dark:hover:border-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
        >
          <PencilLine className="w-3.5 h-3.5 text-[#087F73] dark:text-teal-400" aria-hidden="true" />
          {isEditing ? t.doneEditBtn : t.editEventBtn}
        </button>
      </div>

      {/* Collapsible Event Customization Row */}
      {isEditing && (
        <div className="pt-3 border-t border-[#DFE7E2] dark:border-teal-800/50 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="input-race-name"
              className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap"
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
              className="w-44 sm:w-52 min-h-[40px] px-3 py-1.5 rounded-xl border border-teal-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="input-race-date"
              className="text-xs font-medium text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
              {t.dateInputLabel}
            </label>
            <input
              id="input-race-date"
              type="date"
              aria-label={t.dateInputAria}
              data-testid="race-countdown-date-input"
              value={countdown.raceDateKey}
              onChange={(e) => onChangeRaceDate(e.target.value)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-teal-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-mono tabular-nums text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400"
            />
          </div>

          {showReset && (
            <button
              type="button"
              onClick={onResetRaceMeta}
              data-testid="race-countdown-reset-btn"
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-800 dark:hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              {t.resetDateBtn}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
