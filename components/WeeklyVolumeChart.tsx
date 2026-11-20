'use client';

import React, { useState } from 'react';
import { AppLanguage, WeeklyChartBucket } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { formatDecimalComma } from '@/lib/strava/transform';

interface WeeklyVolumeChartProps {
  buckets: WeeklyChartBucket[];
  fourWeekAvgKm: number;
  lang: AppLanguage;
}

export default function WeeklyVolumeChart({
  buckets,
  fourWeekAvgKm,
  lang,
}: WeeklyVolumeChartProps) {
  const [activeWeekKey, setActiveWeekKey] = useState<string | null>(null);
  const t = UI_COPY[lang].strava;

  const maxKm = Math.max(
    10,
    fourWeekAvgKm * 1.2,
    ...buckets.map((b) => b.totalKm)
  );
  const selectedBucket =
    buckets.find((b) => b.weekKey === activeWeekKey) ||
    buckets[buckets.length - 1];

  const avgLinePercent = Math.min(96, Math.max(4, (fourWeekAvgKm / maxKm) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.barChartTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.barChartDescBefore}
            <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-200">
              {formatDecimalComma(fourWeekAvgKm, 1, lang)} {t.barChartDescUnit}
            </span>
            ).
          </p>
        </div>

        {selectedBucket && (
          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums bg-teal-50/80 dark:bg-teal-950/60 px-3 py-1.5 rounded-lg self-start sm:self-auto whitespace-nowrap shrink-0">
            {t.barChartWeekPrefix} {selectedBucket.weekLabel}:{' '}
            <span className="font-semibold text-teal-800 dark:text-teal-300">
              {formatDecimalComma(selectedBucket.totalKm, 1, lang)} km
            </span>{' '}
            · {selectedBucket.runCount}{' '}
            {lang === 'en' && selectedBucket.runCount === 1
              ? 'run'
              : t.barChartSessionsUnit}
          </div>
        )}
      </div>

      <div className="relative pt-6 pb-2">
        {/* 4-week average reference line */}
        {fourWeekAvgKm > 0 && (
          <div
            className="absolute left-0 right-0 border-t border-dashed border-teal-500/75 dark:border-teal-400/70 pointer-events-none z-10"
            style={{ bottom: `calc(28px + ${(avgLinePercent / 100) * 144}px)` }}
            aria-hidden="true"
          />
        )}

        <div className="grid grid-cols-8 gap-1.5 sm:gap-3 items-end h-44">
          {buckets.map((bucket, idx) => {
            const barHeightPx =
              bucket.totalKm > 0
                ? Math.max(10, Math.round((bucket.totalKm / maxKm) * 144))
                : 4;
            const isSelected = selectedBucket?.weekKey === bucket.weekKey;
            const isLatest = idx === buckets.length - 1;

            return (
              <button
                key={bucket.weekKey}
                type="button"
                onClick={() => setActiveWeekKey(bucket.weekKey)}
                onMouseEnter={() => setActiveWeekKey(bucket.weekKey)}
                aria-label={`${t.barChartWeekPrefix} ${bucket.weekLabel}: ${formatDecimalComma(bucket.totalKm, 1, lang)} km, ${bucket.runCount} ${t.barChartSessionsUnit}`}
                className="group flex flex-col items-center justify-end h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 rounded-lg"
              >
                <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mb-1.5 whitespace-nowrap">
                  {bucket.totalKm > 0 ? formatDecimalComma(bucket.totalKm, 1, lang) : '0'}
                </span>
                <div className="w-full flex items-end justify-center h-[144px]">
                  <div
                    style={{ height: `${barHeightPx}px` }}
                    className={`w-full max-w-[38px] rounded-t-lg transition-colors ${
                      bucket.totalKm === 0
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : isSelected || isLatest
                          ? 'bg-teal-500 dark:bg-teal-400 group-hover:bg-teal-600 dark:group-hover:bg-teal-300'
                          : 'bg-teal-200/80 dark:bg-teal-800/70 group-hover:bg-teal-400 dark:group-hover:bg-teal-600'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate max-w-full">
                  {bucket.weekLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
