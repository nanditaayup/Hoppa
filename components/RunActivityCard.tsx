'use client';

import React from 'react';
import { ChevronRight, Heart, Mountain, AlertTriangle } from 'lucide-react';
import { AppLanguage, RunActivity } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { assessRunDataQuality } from '@/lib/strava/import-parser';
import {
  computePaceSecPerKm,
  formatDistanceKm,
  formatDuration,
  formatIndonesianDate,
  formatPace,
  getRunTypeLabel,
} from '@/lib/strava/transform';
import RoutePreview from './RoutePreview';

interface RunActivityCardProps {
  activity: RunActivity;
  lang: AppLanguage;
  onSelect: (activity: RunActivity) => void;
}

export default function RunActivityCard({
  activity,
  lang,
  onSelect,
}: RunActivityCardProps) {
  const t = UI_COPY[lang].strava;
  const paceSec = computePaceSecPerKm(
    activity.distanceMeters,
    activity.movingTimeSeconds,
    activity.averageSpeedMps
  );
  const quality = assessRunDataQuality(activity);

  return (
    <button
      type="button"
      onClick={() => onSelect(activity)}
      aria-label={`${t.cardViewAria} ${activity.name}`}
      className="group w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/25 dark:hover:bg-slate-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 transition-colors flex flex-col justify-between gap-4"
    >
      <div className="space-y-3 w-full">
        {/* Quiet unboxed metadata line */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">
            {getRunTypeLabel(activity.type, lang)}
            <span aria-hidden="true"> · </span>
            {formatIndonesianDate(activity.startDate, true, lang)}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {quality.hasAnomaly && (
              <span
                data-testid="run-card-anomaly-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/70 text-[11px] font-semibold whitespace-nowrap"
              >
                <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
                {t.anomalyBadge}
              </span>
            )}
            <ChevronRight
              className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-teal-700 dark:group-hover:text-teal-400 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
          {activity.name}
        </h3>

        <RoutePreview
          polyline={activity.summaryPolyline}
          activityName={activity.name}
          heightClass="h-24"
          lang={lang}
        />
      </div>

      {/* Primary metrics separated by subtle hairline divider */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 w-full space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.cardDistance}
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
              {formatDistanceKm(activity.distanceMeters, lang)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.cardPace}
            </p>
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-400 font-mono tabular-nums mt-0.5">
              {formatPace(paceSec)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.cardTime}
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
              {formatDuration(activity.movingTimeSeconds)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Mountain className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            +{activity.elevationGainMeters} m
          </span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Heart className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
            {activity.averageHeartRate ? `${activity.averageHeartRate} bpm` : '-'}
          </span>
        </div>
      </div>
    </button>
  );
}
