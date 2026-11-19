'use client';

import React from 'react';
import { ChevronRight, Heart, Mountain } from 'lucide-react';
import { AppLanguage, RunActivity } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
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

  return (
    <button
      type="button"
      onClick={() => onSelect(activity)}
      aria-label={`${t.cardViewAria} ${activity.name}`}
      className="group w-full text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-300 hover:bg-teal-50/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 transition-colors flex flex-col justify-between gap-4"
    >
      <div className="space-y-3 w-full">
        {/* Quiet unboxed metadata line */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span className="truncate">
            {getRunTypeLabel(activity.type, lang)}
            <span aria-hidden="true"> · </span>
            {formatIndonesianDate(activity.startDate, true, lang)}
          </span>
          <ChevronRight
            className="w-4 h-4 text-slate-400 group-hover:text-teal-700 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>

        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
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
      <div className="pt-3 border-t border-slate-100 w-full space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-slate-500">{t.cardDistance}</p>
            <p className="text-sm font-semibold text-slate-900 font-mono tabular-nums mt-0.5">
              {formatDistanceKm(activity.distanceMeters, lang)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t.cardPace}</p>
            <p className="text-sm font-semibold text-teal-700 font-mono tabular-nums mt-0.5">
              {formatPace(paceSec)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t.cardTime}</p>
            <p className="text-sm font-semibold text-slate-900 font-mono tabular-nums mt-0.5">
              {formatDuration(activity.movingTimeSeconds)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Mountain className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
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
