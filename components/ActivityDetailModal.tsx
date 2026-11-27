'use client';

import React, { useEffect, useState } from 'react';
import { X, Clock, Gauge, Heart, Mountain, AlertTriangle, PencilLine, Trash2 } from 'lucide-react';
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
  updateRunActivityDistanceAndTime,
} from '@/lib/strava/transform';
import RoutePreview from './RoutePreview';

interface ActivityDetailModalProps {
  activity: RunActivity | null;
  lang: AppLanguage;
  onClose: () => void;
  onUpdateRun?: (updated: RunActivity) => void;
  onDeleteRun?: (runId: string) => void;
}

export default function ActivityDetailModal({
  activity,
  lang,
  onClose,
  onUpdateRun,
  onDeleteRun,
}: ActivityDetailModalProps) {
  if (!activity) return null;

  return (
    <ActivityDetailModalInner
      key={activity.id}
      activity={activity}
      lang={lang}
      onClose={onClose}
      onUpdateRun={onUpdateRun}
      onDeleteRun={onDeleteRun}
    />
  );
}

interface ActivityDetailModalInnerProps {
  activity: RunActivity;
  lang: AppLanguage;
  onClose: () => void;
  onUpdateRun?: (updated: RunActivity) => void;
  onDeleteRun?: (runId: string) => void;
}

function ActivityDetailModalInner({
  activity,
  lang,
  onClose,
  onUpdateRun,
  onDeleteRun,
}: ActivityDetailModalInnerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [distanceKmInput, setDistanceKmInput] = useState(
    () => (activity.distanceMeters / 1000).toFixed(2)
  );
  const [durationMinInput, setDurationMinInput] = useState(
    () => String(Math.max(1, Math.round(activity.movingTimeSeconds / 60)))
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const t = UI_COPY[lang].detailModal;
  const paceSec = computePaceSecPerKm(
    activity.distanceMeters,
    activity.movingTimeSeconds,
    activity.averageSpeedMps
  );
  const quality = assessRunDataQuality(activity);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateRun) return;
    const parsedKm = Number(distanceKmInput.replace(',', '.'));
    const parsedMin = Number(durationMinInput.replace(',', '.'));
    if (!Number.isFinite(parsedKm) || parsedKm <= 0 || !Number.isFinite(parsedMin) || parsedMin <= 0) {
      return;
    }
    const updated = updateRunActivityDistanceAndTime(
      activity,
      Math.round(parsedKm * 1000),
      Math.round(parsedMin * 60)
    );
    onUpdateRun(updated);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!onDeleteRun) return;
    onDeleteRun(activity.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#202A2A]/45 dark:bg-black/70 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-detail-title"
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-[#596866] dark:text-slate-400">
              {getRunTypeLabel(activity.type, lang)}
              <span aria-hidden="true"> · </span>
              {formatIndonesianDate(activity.startDate, true, lang)}
            </p>
            <h2
              id="activity-detail-title"
              className="text-xl font-bold text-[#202A2A] dark:text-slate-100 leading-snug"
            >
              {activity.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeAria}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[#DFE7E2] dark:border-slate-700 text-[#596866] dark:text-slate-300 hover:bg-[#F7F6F2] dark:hover:bg-slate-800 hover:text-[#202A2A] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {quality.hasAnomaly && (
          <div
            role="status"
            data-testid="activity-detail-anomaly-notice"
            className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 px-4 py-3 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5"
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
            <div className="flex items-center justify-between text-xs text-[#596866] dark:text-slate-300 px-1">
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#087F73] dark:bg-emerald-400 inline-block"
                  aria-hidden="true"
                />
                {t.startPoint}
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#202A2A] dark:bg-slate-100 inline-block"
                  aria-hidden="true"
                />
                {t.endPoint}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-[#DFE7E2] dark:border-slate-800">
          <div>
            <p className="text-xs text-[#596866] dark:text-slate-400">{t.distance}</p>
            <p className="text-lg font-bold text-[#202A2A] dark:text-slate-100 tabular-nums mt-0.5">
              {formatDistanceKm(activity.distanceMeters, lang)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#596866] dark:text-slate-400">{t.avgPace}</p>
            <p className="text-lg font-bold text-[#087F73] dark:text-teal-400 font-mono tabular-nums mt-0.5">
              {formatPace(paceSec)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#596866] dark:text-slate-400">{t.movingTime}</p>
            <p className="text-lg font-bold text-[#202A2A] dark:text-slate-100 font-mono tabular-nums mt-0.5">
              {formatDuration(activity.movingTimeSeconds)}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#596866] dark:text-slate-400 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#596866] dark:text-slate-500" aria-hidden="true" />
              {t.elapsedTime}
            </p>
            <p className="text-base font-semibold text-[#202A2A] dark:text-slate-200 font-mono tabular-nums mt-0.5">
              {formatDuration(activity.elapsedTimeSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#596866] dark:text-slate-400 inline-flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#596866] dark:text-slate-500" aria-hidden="true" />
              {t.maxSpeed}
            </p>
            <p className="text-base font-semibold text-[#202A2A] dark:text-slate-200 font-mono tabular-nums mt-0.5">
              {formatSpeedKmh(activity.maxSpeedMps, lang)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#596866] dark:text-slate-400 inline-flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-[#596866] dark:text-slate-500" aria-hidden="true" />
              {t.elevationHr}
            </p>
            <p className="text-base font-semibold text-[#202A2A] dark:text-slate-200 font-mono tabular-nums mt-0.5">
              +{activity.elevationGainMeters} m
              <span aria-hidden="true"> · </span>
              {activity.averageHeartRate ? `${activity.averageHeartRate} bpm` : '-'}
            </p>
          </div>
        </div>

        {/* Edit / Delete Activity Controls */}
        {(onUpdateRun || onDeleteRun) && (
          <div className="pt-3 border-t border-[#DFE7E2] dark:border-slate-800 space-y-3">
            {isEditing ? (
              <form
                onSubmit={handleSaveEdit}
                data-testid="activity-edit-form"
                className="rounded-xl bg-[#F7F6F2] dark:bg-slate-800/70 border border-[#DFE7E2] dark:border-slate-700 p-4 space-y-3"
              >
                <p className="text-xs font-bold text-[#202A2A] dark:text-slate-100">
                  {t.editSectionHeading}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="edit-run-distance"
                      className="block text-xs font-medium text-[#596866] dark:text-slate-300 mb-1"
                    >
                      {t.editDistanceLabel}
                    </label>
                    <input
                      id="edit-run-distance"
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="500"
                      value={distanceKmInput}
                      onChange={(e) => setDistanceKmInput(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm text-[#202A2A] dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-run-duration"
                      className="block text-xs font-medium text-[#596866] dark:text-slate-300 mb-1"
                    >
                      {t.editDurationMinLabel}
                    </label>
                    <input
                      id="edit-run-duration"
                      type="number"
                      step="1"
                      min="1"
                      max="10080"
                      value={durationMinInput}
                      onChange={(e) => setDurationMinInput(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm text-[#202A2A] dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-[#596866] dark:text-slate-300"
                  >
                    {t.cancelEditBtn}
                  </button>
                  <button
                    type="submit"
                    data-testid="activity-save-edit-btn"
                    className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E]"
                  >
                    {t.saveEditBtn}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {onUpdateRun && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      data-testid="activity-edit-open-btn"
                      className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#DFE7E2] dark:border-slate-700 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] inline-flex items-center gap-1.5"
                    >
                      <PencilLine className="w-3.5 h-3.5 text-[#087F73]" aria-hidden="true" />
                      <span>{t.editSectionHeading}</span>
                    </button>
                  )}

                  {onDeleteRun && (
                    confirmDelete ? (
                      <button
                        type="button"
                        onClick={handleDelete}
                        data-testid="activity-delete-confirm-btn"
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.confirmDeleteActivityBtn}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        data-testid="activity-delete-open-btn"
                        className="min-h-[38px] px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.deleteActivityBtn}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-[#DFE7E2] dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#596866] dark:text-slate-400">
            <Heart className="w-3.5 h-3.5 text-[#E9957D]" aria-hidden="true" />
            {t.dataSourcePrefix} {t.sources[activity.source]}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-sm font-medium hover:bg-[#06685E] dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73]"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
