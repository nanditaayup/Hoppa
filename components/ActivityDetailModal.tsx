'use client';

import React, { useEffect } from 'react';
import { X, Clock, Gauge, Heart, Mountain, AlertTriangle } from 'lucide-react';
import { AppLanguage, RunActivity } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { assessRunDataQuality } from '@/lib/strava/import-parser';
import {
  computePaceSecPerKm,
  formatDistanceKm,
  formatDuration,
  formatIndonesianDate,
  formatPace,
  formatSpeedKmh,
  getRunTypeLabel,
} from '@/lib/strava/transform';
import RoutePreview from './RoutePreview';

interface ActivityDetailModalProps {
  activity: RunActivity | null;
  lang: AppLanguage;
  onClose: () => void;
}

export default function ActivityDetailModal({
  activity,
  lang,
  onClose,
}: ActivityDetailModalProps) {
  useEffect(() => {
    if (!activity) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activity, onClose]);

  if (!activity) return null;

  const t = UI_COPY[lang].detailModal;
  const paceSec = computePaceSecPerKm(
    activity.distanceMeters,
    activity.movingTimeSeconds,
    activity.averageSpeedMps
  );
  const quality = assessRunDataQuality(activity);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-detail-title"
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getRunTypeLabel(activity.type, lang)}
              <span aria-hidden="true"> · </span>
              {formatIndonesianDate(activity.startDate, true, lang)}
            </p>
            <h2
              id="activity-detail-title"
              className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug"
            >
              {activity.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeAria}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {quality.hasAnomaly && (
          <div
            role="status"
            data-testid="activity-detail-anomaly-notice"
            className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 px-4 py-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5"
          >
            <AlertTriangle
              className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-0.5">
              <p className="font-semibold">{t.anomalyTitle}</p>
              <p className="leading-relaxed">
                {t.anomalyBody(
                  formatPace(quality.computedPaceSecPerKm),
                  quality.reportedPaceSecPerKm &&
                    quality.reportedPaceSecPerKm !== quality.computedPaceSecPerKm
                    ? formatPace(quality.reportedPaceSecPerKm)
                    : null,
                  quality.reason
                )}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <RoutePreview
            polyline={activity.summaryPolyline}
            activityName={activity.name}
            heightClass="h-48"
            showMarkers={true}
            lang={lang}
          />
          {activity.summaryPolyline && (
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1">
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-emerald-400 inline-block"
                  aria-hidden="true"
                />
                {t.startPoint}
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-100 inline-block"
                  aria-hidden="true"
                />
                {t.endPoint}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.distance}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
              {formatDistanceKm(activity.distanceMeters, lang)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.avgPace}</p>
            <p className="text-lg font-bold text-teal-700 dark:text-teal-400 font-mono tabular-nums mt-0.5">
              {formatPace(paceSec)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.movingTime}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
              {formatDuration(activity.movingTimeSeconds)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              {t.elapsedTime}
            </p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums mt-0.5">
              {formatDuration(activity.elapsedTimeSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              {t.maxSpeed}
            </p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums mt-0.5">
              {formatSpeedKmh(activity.maxSpeedMps, lang)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              {t.elevationHr}
            </p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums mt-0.5">
              +{activity.elevationGainMeters} m
              <span aria-hidden="true"> · </span>
              {activity.averageHeartRate ? `${activity.averageHeartRate} bpm` : '-'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Heart className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
            {t.dataSourcePrefix} {t.sources[activity.source]}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-medium hover:bg-teal-800 dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
