'use client';

import React, { useSyncExternalStore } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppLanguage, WeeklyChartBucket } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { formatDecimalComma } from '@/lib/strava/transform';

interface WeeklyConsistencyAreaChartProps {
  buckets: WeeklyChartBucket[];
  fourWeekAvgKm: number;
  lang: AppLanguage;
}

const emptySubscribe = () => () => {};

function AreaChartTooltip({
  active,
  payload,
  label,
  lang,
}: {
  active?: boolean;
  payload?: Array<{ payload: WeeklyChartBucket }>;
  label?: string;
  lang: AppLanguage;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  const t = UI_COPY[lang].strava;

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm text-xs space-y-0.5">
      <p className="font-semibold text-slate-900">
        {t.barChartWeekPrefix} {label}
      </p>
      <p className="font-mono tabular-nums text-teal-700 font-semibold">
        {formatDecimalComma(item.totalKm, 1, lang)} km
      </p>
      <p className="text-slate-500 font-mono tabular-nums">
        {item.runCount}{' '}
        {lang === 'en' && item.runCount === 1
          ? 'run'
          : t.areaChartTooltipSessions}
      </p>
    </div>
  );
}

export default function WeeklyConsistencyAreaChart({
  buckets,
  fourWeekAvgKm,
  lang,
}: WeeklyConsistencyAreaChartProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const t = UI_COPY[lang].strava;
  const activeWeeksCount = buckets.filter((b) => b.totalKm > 0).length;

  return (
    <div
      data-testid="weekly-area-chart-card"
      className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {t.areaChartTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{t.areaChartDesc}</p>
        </div>

        <span className="text-xs font-mono tabular-nums text-indigo-800 bg-indigo-50/80 px-3 py-1.5 rounded-lg self-start sm:self-auto whitespace-nowrap">
          {t.areaChartActiveWeeks(activeWeeksCount)}
        </span>
      </div>

      <div className="h-[220px] w-full">
        {isClient ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={buckets}
              margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="pacecraftAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.36} />
                  <stop offset="95%" stopColor="#CCFBF1" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="weekLabel"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val: number) => `${val}`}
              />
              <Tooltip content={<AreaChartTooltip lang={lang} />} />
              {fourWeekAvgKm > 0 && (
                <ReferenceLine
                  y={fourWeekAvgKm}
                  stroke="#0F766E"
                  strokeDasharray="4 4"
                  strokeOpacity={0.65}
                />
              )}
              <Area
                type="monotone"
                dataKey="totalKm"
                name={t.areaChartSeriesName}
                stroke="#0D9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#pacecraftAreaFill)"
                activeDot={{ r: 5, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full rounded-xl bg-slate-50 animate-pulse" />
        )}
      </div>
    </div>
  );
}
