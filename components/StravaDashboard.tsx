'use client';

import React, { useMemo, useState } from 'react';
import { Search, RotateCcw, Footprints, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  AppLanguage,
  KpiSummary,
  RunActivity,
  RunActivityType,
  WeeklyChartBucket,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { assessRunDataQuality } from '@/lib/strava/import-parser';
import {
  formatDecimalComma,
  formatKmValue,
  formatPace,
} from '@/lib/strava/transform';
import ImportActivitiesPanel, { ImportSourceKind } from './ImportActivitiesPanel';
import WeeklyVolumeChart from './WeeklyVolumeChart';
import RunActivityCard from './RunActivityCard';

interface StravaDashboardProps {
  runs: RunActivity[];
  kpi: KpiSummary;
  weeklyBuckets: WeeklyChartBucket[];
  isOAuthConnected: boolean;
  importNotice: string | null;
  stravaSyncCount: number;
  lang: AppLanguage;
  onLoadSampleData: () => void;
  onImportRuns: (
    runs: RunActivity[],
    skippedNonRuns: number,
    sourceKind: ImportSourceKind,
    errors?: string[]
  ) => void;
  onSyncStravaOAuthRuns: (runs: RunActivity[]) => void;
  onSyncStravaToProgress: () => void;
  onOpenDisconnectModal: () => void;
  onSelectActivity: (activity: RunActivity) => void;
}

type TypeFilter = 'all' | RunActivityType;

export default function StravaDashboard({
  runs,
  kpi,
  weeklyBuckets,
  isOAuthConnected,
  importNotice,
  stravaSyncCount,
  lang,
  onLoadSampleData,
  onImportRuns,
  onSyncStravaOAuthRuns,
  onSyncStravaToProgress,
  onOpenDisconnectModal,
  onSelectActivity,
}: StravaDashboardProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const t = UI_COPY[lang].strava;

  const filteredRuns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return runs.filter((run) => {
      if (showAnomaliesOnly && !assessRunDataQuality(run).hasAnomaly) return false;
      if (typeFilter !== 'all' && run.type !== typeFilter) return false;
      if (q && !run.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [runs, typeFilter, searchQuery, showAnomaliesOnly]);

  const handleResetFilters = () => {
    setTypeFilter('all');
    setSearchQuery('');
    setShowAnomaliesOnly(false);
  };

  const filterOptions: Array<{ key: TypeFilter; label: string }> = [
    { key: 'all', label: t.filters.all },
    { key: 'Run', label: t.filters.Run },
    { key: 'TrailRun', label: t.filters.TrailRun },
    { key: 'VirtualRun', label: t.filters.VirtualRun },
  ];

  return (
    <section
      id="riwayat-strava"
      aria-labelledby="strava-section-heading"
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2
          id="strava-section-heading"
          className="text-2xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight"
        >
          {t.heading}
        </h2>
        <p className="text-sm text-[#596866] dark:text-slate-300">{t.subtitle}</p>
      </div>

      <ImportActivitiesPanel
        runsCount={runs.length}
        isOAuthConnected={isOAuthConnected}
        lang={lang}
        onLoadSampleData={onLoadSampleData}
        onImportRuns={onImportRuns}
        onOpenDisconnectModal={onOpenDisconnectModal}
        onSyncStravaOAuthRuns={onSyncStravaOAuthRuns}
      />

      {(importNotice || (runs.length > 0 && stravaSyncCount > 0)) && (
        <div
          role="status"
          className="rounded-xl bg-[#E6F3EE] dark:bg-emerald-950/50 border border-[#DFE7E2] dark:border-emerald-800/70 px-4 py-3 text-sm text-[#202A2A] dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <span>{importNotice ?? t.syncToProgressDone}</span>
          {stravaSyncCount > 0 && (
            <button
              type="button"
              onClick={onSyncStravaToProgress}
              data-testid="strava-apply-progress-btn"
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              {t.syncToProgressBtn(stravaSyncCount)}
            </button>
          )}
        </div>
      )}

      {(kpi.flaggedAnomalyCount ?? 0) > 0 && (
        <div
          role="status"
          data-testid="strava-flagged-anomaly-banner"
          className="rounded-xl bg-amber-50/85 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 px-4 py-3 text-xs sm:text-sm text-[#202A2A] dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>{t.flaggedBannerCompact(kpi.flaggedAnomalyCount ?? 0)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAnomaliesOnly((prev) => !prev)}
            data-testid="strava-review-anomalies-btn"
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-xs font-semibold text-[#202A2A] dark:text-amber-100 hover:border-[#087F73] whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            {showAnomaliesOnly ? t.showAllRunsBtn : t.reviewAnomaliesBtn}
          </button>
        </div>
      )}

      {/* Clean 4-column Summary Strip */}
      <div className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 lg:divide-x divide-[#DFE7E2] dark:divide-slate-800">
        <div className="pt-2 sm:pt-0 lg:pr-4">
          <p className="text-xs font-medium text-[#596866] dark:text-slate-400">
            {t.weeklyAvgSummaryLabel}
          </p>
          <p className="text-2xl font-bold text-[#202A2A] dark:text-slate-100 tabular-nums mt-1">
            {formatDecimalComma(kpi.fourWeekAvgKm, 2, lang)}{' '}
            <span className="text-sm font-medium text-[#596866] dark:text-slate-400">
              {t.kpiPerWeekUnit}
            </span>
          </p>
        </div>

        <div className="pt-2 sm:pt-0 lg:px-4">
          <p className="text-xs font-medium text-[#596866] dark:text-slate-400">
            {t.thirtyDayTotalSummaryLabel}
          </p>
          <p className="text-2xl font-bold text-[#202A2A] dark:text-slate-100 tabular-nums mt-1">
            {formatKmValue(kpi.thirtyDayTotalKm, 2, lang)}
          </p>
          <p className="text-xs text-[#596866] dark:text-slate-400 mt-0.5 tabular-nums">
            {kpi.runCount30Days} {t.sessionsCountLabel}
          </p>
        </div>

        <div className="pt-2 sm:pt-0 lg:px-4">
          <p className="text-xs font-medium text-[#596866] dark:text-slate-400">
            {t.kpiPaceTitle}
          </p>
          <p className="text-2xl font-bold text-[#087F73] dark:text-teal-400 font-mono tabular-nums mt-1">
            {kpi.thirtyDayAvgPaceSecPerKm > 0
              ? formatPace(kpi.thirtyDayAvgPaceSecPerKm)
              : '--:--/km'}
          </p>
        </div>

        <div className="pt-2 sm:pt-0 lg:pl-4">
          <p className="text-xs font-medium text-[#596866] dark:text-slate-400">
            {t.kpiLongestTitle}
          </p>
          <p className="text-2xl font-bold text-[#202A2A] dark:text-slate-100 tabular-nums mt-1">
            {formatKmValue(kpi.longestRunKm, 2, lang)}
          </p>
          <p className="text-xs text-[#596866] dark:text-slate-400 mt-0.5 tabular-nums">
            {t.kpiLongestSubPrefix} {kpi.totalActivitiesCount} {t.kpiLongestSubSuffix}
          </p>
        </div>
      </div>

      {/* Default Weekly Bar Chart (No Area/Bar Switcher Clutter) */}
      <WeeklyVolumeChart
        buckets={weeklyBuckets}
        fourWeekAvgKm={kpi.fourWeekAvgKm}
        lang={lang}
      />

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div
            role="group"
            aria-label={t.filterGroupAria}
            className="flex items-center gap-1 p-1 bg-[#F7F6F2] dark:bg-slate-800 rounded-xl overflow-x-auto"
          >
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTypeFilter(opt.key)}
                className={`min-h-[40px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] ${
                  typeFilter === opt.key
                    ? 'bg-white dark:bg-slate-700 text-[#202A2A] dark:text-white shadow-sm'
                    : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search
                className="w-4 h-4 text-[#596866] dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchAria}
                className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-[#F7F6F2]/70 dark:bg-slate-800/70 text-sm text-[#202A2A] dark:text-slate-100 placeholder:text-[#596866]/70 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F73]"
              />
            </div>

            {(typeFilter !== 'all' || searchQuery.trim() !== '' || showAnomaliesOnly) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:bg-[#F7F6F2] dark:hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73]"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                {t.resetFilterBtn}
              </button>
            )}
          </div>
        </div>

        {/* Empty / Populated Activity Cards */}
        {runs.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3 border-t border-[#DFE7E2] dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F3EE] dark:bg-teal-950/60 text-[#087F73] dark:text-teal-400 mx-auto flex items-center justify-center">
              <Footprints className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#202A2A] dark:text-slate-100">
                {t.emptyRunsTitle}
              </h3>
              <p className="text-sm text-[#596866] dark:text-slate-300">
                {t.emptyRunsDescBefore}{' '}
                <span className="font-mono text-xs">activities.csv</span>{' '}
                {t.emptyRunsDescMiddle}{' '}
                <span className="font-mono text-xs">.gpx</span>{' '}
                {t.emptyRunsDescAfter}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onLoadSampleData}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-sm font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73]"
              >
                {t.loadSampleBtn}
              </button>
            </div>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-3 border-t border-[#DFE7E2] dark:border-slate-800">
            <p className="text-sm text-[#596866] dark:text-slate-300">
              {t.emptyFilterDesc}
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DFE7E2] dark:border-slate-700 text-sm font-semibold text-[#202A2A] dark:text-slate-200 hover:bg-[#F7F6F2] dark:hover:bg-slate-800"
            >
              {t.resetFilterBtn}
            </button>
          </div>
        ) : (
          <div
            data-testid="activity-cards-grid"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2 border-t border-[#DFE7E2] dark:border-slate-800"
          >
            {filteredRuns.map((activity) => (
              <RunActivityCard
                key={activity.id}
                activity={activity}
                lang={lang}
                onSelect={onSelectActivity}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
