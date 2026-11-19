'use client';

import React, { useMemo, useState } from 'react';
import { Search, RotateCcw, Footprints, RefreshCw } from 'lucide-react';
import {
  AppLanguage,
  KpiSummary,
  RunActivity,
  RunActivityType,
  WeeklyChartBucket,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  formatDecimalComma,
  formatKmValue,
  formatPace,
} from '@/lib/strava/transform';
import ImportActivitiesPanel, { ImportSourceKind } from './ImportActivitiesPanel';
import WeeklyVolumeChart from './WeeklyVolumeChart';
import WeeklyConsistencyAreaChart from './WeeklyConsistencyAreaChart';
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
  const t = UI_COPY[lang].strava;

  const filteredRuns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return runs.filter((run) => {
      if (typeFilter !== 'all' && run.type !== typeFilter) return false;
      if (q && !run.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [runs, typeFilter, searchQuery]);

  const handleResetFilters = () => {
    setTypeFilter('all');
    setSearchQuery('');
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
          className="text-2xl font-bold text-slate-900 tracking-tight"
        >
          {t.heading}
        </h2>
        <p className="text-sm text-slate-600">{t.subtitle}</p>
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
          className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-4 py-3 text-sm text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <span>{importNotice ?? t.syncToProgressDone}</span>
          {stravaSyncCount > 0 && (
            <button
              type="button"
              onClick={onSyncStravaToProgress}
              data-testid="strava-apply-progress-btn"
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              {t.syncToProgressBtn(stravaSyncCount)}
            </button>
          )}
        </div>
      )}

      {/* 4-column KPI strip with calm pastel accent */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500">
            {t.kpi4WeekTitle}
          </p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
            {formatDecimalComma(kpi.fourWeekAvgKm, 2, lang)}{' '}
            <span className="text-sm font-medium text-slate-500">
              {t.kpiPerWeekUnit}
            </span>
          </p>
          <p className="text-xs text-teal-700 mt-1">{t.kpi4WeekSub}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500">{t.kpi30DayTitle}</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
            {formatKmValue(kpi.thirtyDayTotalKm, 2, lang)}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            {kpi.runCount30Days} {t.kpi30DaySub}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500">{t.kpiPaceTitle}</p>
          <p className="text-2xl font-bold text-teal-700 font-mono tabular-nums mt-1.5">
            {kpi.thirtyDayAvgPaceSecPerKm > 0
              ? formatPace(kpi.thirtyDayAvgPaceSecPerKm)
              : '--:--/km'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{t.kpiPaceSub}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500">
            {t.kpiLongestTitle}
          </p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
            {formatKmValue(kpi.longestRunKm, 2, lang)}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            {t.kpiLongestSubPrefix} {kpi.totalActivitiesCount}{' '}
            {t.kpiLongestSubSuffix}
          </p>
        </div>
      </div>

      {/* 8-Week Volume Bar & Recharts Area Consistency Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyVolumeChart
          buckets={weeklyBuckets}
          fourWeekAvgKm={kpi.fourWeekAvgKm}
          lang={lang}
        />
        <WeeklyConsistencyAreaChart
          buckets={weeklyBuckets}
          fourWeekAvgKm={kpi.fourWeekAvgKm}
          lang={lang}
        />
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div
            role="group"
            aria-label={t.filterGroupAria}
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto"
          >
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTypeFilter(opt.key)}
                className={`min-h-[40px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  typeFilter === opt.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchAria}
                className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent"
              />
            </div>

            {(typeFilter !== 'all' || searchQuery.trim() !== '') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                {t.resetFilterBtn}
              </button>
            )}
          </div>
        </div>

        {/* Empty / Populated Activity Cards */}
        {runs.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3 border-t border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
              <Footprints className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">
                {t.emptyRunsTitle}
              </h3>
              <p className="text-sm text-slate-600">
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
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                {t.loadSampleBtn}
              </button>
            </div>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-3 border-t border-slate-100">
            <p className="text-sm text-slate-600">{t.emptyFilterDesc}</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.resetFilterBtn}
            </button>
          </div>
        ) : (
          <div
            data-testid="activity-cards-grid"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2 border-t border-slate-100"
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
