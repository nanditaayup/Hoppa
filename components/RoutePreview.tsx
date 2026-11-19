'use client';

import React from 'react';
import { Route } from 'lucide-react';
import { decodePolyline } from '@/lib/strava/transform';
import { AppLanguage } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';

interface RoutePreviewProps {
  polyline: string | null;
  activityName: string;
  heightClass?: string;
  showMarkers?: boolean;
  lang?: AppLanguage;
}

export default function RoutePreview({
  polyline,
  activityName,
  heightClass = 'h-24',
  showMarkers = false,
  lang = 'id',
}: RoutePreviewProps) {
  const points = React.useMemo(() => decodePolyline(polyline), [polyline]);
  const t = UI_COPY[lang].strava;

  if (points.length < 2) {
    return (
      <div
        className={`${heightClass} w-full rounded-xl bg-[#F2F6F7] border border-slate-200/70 flex items-center justify-center gap-2 px-3 text-xs text-slate-500`}
      >
        <Route className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="truncate">{t.noGpsRoute}</span>
      </div>
    );
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const width = 240;
  const height = 100;
  const pad = 12;

  const latSpan = maxLat - minLat || 0.001;
  const lngSpan = maxLng - minLng || 0.001;

  const scale = Math.min(
    (width - pad * 2) / lngSpan,
    (height - pad * 2) / latSpan
  );

  const xOffset = (width - lngSpan * scale) / 2;
  const yOffset = (height - latSpan * scale) / 2;

  const svgPoints = points.map((p) => {
    const x = xOffset + (p.lng - minLng) * scale;
    const y = height - (yOffset + (p.lat - minLat) * scale);
    return { x, y };
  });

  const polylineStr = svgPoints
    .map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(' ');

  const start = svgPoints[0];
  const end = svgPoints[svgPoints.length - 1];

  return (
    <div
      className={`${heightClass} w-full rounded-xl bg-[#EFF7F6] border border-teal-100/90 overflow-hidden flex items-center justify-center`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        role="img"
        aria-label={`${t.routePreviewAria} ${activityName}`}
      >
        <polyline
          fill="none"
          stroke="#0D9488"
          strokeWidth={showMarkers ? 3.2 : 2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylineStr}
        />
        {showMarkers && (() => {
          const isLoopOverlap =
            Math.hypot(end.x - start.x, end.y - start.y) < 7;
          const startX = isLoopOverlap ? start.x - 4 : start.x;
          const endX = isLoopOverlap ? end.x + 4 : end.x;
          return (
            <>
              <circle
                cx={startX}
                cy={start.y}
                r={5.5}
                fill="#16A34A"
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
              <circle
                cx={endX}
                cy={end.y}
                r={5.5}
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
            </>
          );
        })()}
      </svg>
    </div>
  );
}
