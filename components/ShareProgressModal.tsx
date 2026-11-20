'use client';

import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Flame,
  HeartPulse,
  Share2,
  X,
} from 'lucide-react';
import { AppLanguage, HeartRateVo2Summary } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { formatDecimalComma, formatPace } from '@/lib/strava/transform';

interface ShareProgressModalProps {
  isOpen: boolean;
  lang: AppLanguage;
  raceEventLabel: string;
  streakDays: number;
  completedSessions: number;
  plannedSessions: number;
  completionPct: number;
  totalLoggedKm: number;
  avgPaceSecPerKm: number | null;
  avgHeartRateBpm: number | null;
  hrVo2: HeartRateVo2Summary;
  onClose: () => void;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function ShareProgressModal({
  isOpen,
  lang,
  raceEventLabel,
  streakDays,
  completedSessions,
  plannedSessions,
  completionPct,
  totalLoggedKm,
  avgPaceSecPerKm,
  avgHeartRateBpm,
  hrVo2,
  onClose,
}: ShareProgressModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const t = UI_COPY[lang].dailyProgress;
  const sm = t.shareModal;

  const formattedKm = `${formatDecimalComma(totalLoggedKm, 1, lang)} km`;
  const formattedPace = avgPaceSecPerKm ? formatPace(avgPaceSecPerKm) : '--:--/km';
  const effectiveHr = avgHeartRateBpm ?? hrVo2.avgLoggedHrBpm;
  const formattedHr = effectiveHr ? `${effectiveHr} bpm` : '-- bpm';
  const formattedVo2 = `${formatDecimalComma(hrVo2.vo2Max, 1, lang)} ${UI_COPY[lang].bmi.vo2MaxUnit}`;
  const formattedSessions = `${completedSessions}/${plannedSessions} ${t.sessionsUnit} (${completionPct}%)`;
  const formattedStreak = `${streakDays} ${t.daysUnit}`;

  const summaryText = [
    sm.captionHeader(raceEventLabel),
    `• ${sm.streakMetric}: ${formattedStreak}`,
    `• ${sm.sessionsMetric}: ${formattedSessions}`,
    `• ${sm.distanceMetric}: ${formattedKm}`,
    `• ${sm.paceMetric}: ${formattedPace}`,
    `• ${sm.hrMetric}: ${formattedHr}`,
    `• ${sm.vo2Metric}: ${formattedVo2} (${hrVo2.vo2MaxCategory})`,
    '',
    sm.captionFooter,
  ].join('\n');

  const handleCopyText = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownloadPng = () => {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Soft sage-teal to pastel lavender-sky background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, '#EAF6F3');
    bgGrad.addColorStop(0.55, '#F4F8FB');
    bgGrad.addColorStop(1, '#EEF2FB');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Outer white summary card
    ctx.fillStyle = '#FFFFFF';
    drawRoundedRect(ctx, 72, 72, 936, 936, 40);
    ctx.fill();
    ctx.strokeStyle = '#CCFBF1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Brand header
    ctx.fillStyle = '#0F766E';
    ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
    ctx.fillText('PaceCraft', 128, 152);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(sm.cardBadge.toUpperCase(), 128, 198);

    // Event heading
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillText(raceEventLabel.slice(0, 28), 128, 272);

    // Progress track
    drawRoundedRect(ctx, 128, 316, 824, 24, 12);
    ctx.fillStyle = '#F1F5F9';
    ctx.fill();

    const barWidth = Math.max(24, Math.round((824 * completionPct) / 100));
    const barGrad = ctx.createLinearGradient(128, 316, 128 + barWidth, 316);
    barGrad.addColorStop(0, '#14B8A6');
    barGrad.addColorStop(1, '#818CF8');
    drawRoundedRect(ctx, 128, 316, barWidth, 24, 12);
    ctx.fillStyle = barGrad;
    ctx.fill();

    // 6 Metric tiles (2 cols x 3 rows)
    const tiles = [
      { label: sm.streakMetric, value: formattedStreak, bg: '#EEF2FF', fg: '#312E81' },
      { label: sm.sessionsMetric, value: formattedSessions, bg: '#F0FDFA', fg: '#134E4A' },
      { label: sm.distanceMetric, value: formattedKm, bg: '#ECFDF5', fg: '#064E3B' },
      { label: sm.paceMetric, value: formattedPace, bg: '#F0F9FF', fg: '#0C4A6E' },
      { label: sm.hrMetric, value: formattedHr, bg: '#FFF1F2', fg: '#881337' },
      {
        label: sm.vo2Metric,
        value: `${formatDecimalComma(hrVo2.vo2Max, 1, lang)} (${hrVo2.vo2MaxCategory})`,
        bg: '#F0FDFA',
        fg: '#0F766E',
      },
    ];

    tiles.forEach((tile, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 128 + col * 424;
      const y = 384 + row * 170;
      drawRoundedRect(ctx, x, y, 400, 144, 24);
      ctx.fillStyle = tile.bg;
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.font = '600 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(tile.label, x + 28, y + 48);

      ctx.fillStyle = tile.fg;
      ctx.font = 'bold 34px ui-monospace, monospace';
      ctx.fillText(tile.value.slice(0, 22), x + 28, y + 104);
    });

    // Footer tagline
    ctx.fillStyle = '#475569';
    ctx.font = '500 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(sm.captionFooter, 128, 946);

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pacecraft-progres.png';
    link.click();
  };

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: `PaceCraft — ${raceEventLabel}`,
        text: summaryText,
      });
    } catch {
      // User dismissed share sheet
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-progress-modal-title"
        data-testid="share-progress-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="share-progress-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {sm.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {sm.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={sm.closeAria}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social Preview Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#EAF6F3] via-[#F4F8FB] to-[#EEF2FB] dark:from-teal-950/60 dark:via-slate-900 dark:to-indigo-950/50 border border-teal-200/80 dark:border-teal-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 tracking-wide">
              PaceCraft · {sm.cardBadge}
            </span>
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 font-mono tabular-nums">
              {completionPct}%
            </span>
          </div>

          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {raceEventLabel}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                {sm.streakMetric}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
                {formattedStreak}
              </p>
            </div>
            <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sm.sessionsMetric}
              </p>
              <p className="text-sm font-bold text-teal-800 dark:text-teal-300 font-mono tabular-nums mt-0.5">
                {formattedSessions}
              </p>
            </div>
            <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sm.distanceMetric}
              </p>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 font-mono tabular-nums mt-0.5">
                {formattedKm}
              </p>
            </div>
            <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sm.paceMetric}
              </p>
              <p className="text-sm font-bold text-sky-900 dark:text-sky-300 font-mono tabular-nums mt-0.5">
                {formattedPace}
              </p>
            </div>
            <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                {sm.hrMetric}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
                {formattedHr}
              </p>
            </div>
            <div className="rounded-xl bg-white/90 dark:bg-slate-900/80 px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sm.vo2Metric}
              </p>
              <p className="text-sm font-bold text-teal-800 dark:text-teal-300 font-mono tabular-nums mt-0.5">
                {formatDecimalComma(hrVo2.vo2Max, 1, lang)} · {hrVo2.vo2MaxCategory}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {sm.captionFooter}
          </p>
        </div>

        {/* Share Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyText}
            data-testid="share-copy-btn"
            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            {copied ? (
              <Check className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
            {copied ? sm.copiedTextBtn : sm.copyTextBtn}
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            data-testid="share-download-btn"
            className="min-h-[44px] px-4 py-2 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 text-xs sm:text-sm font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {sm.downloadPngBtn}
          </button>

          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold hover:border-teal-300 dark:hover:border-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              {sm.nativeShareBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
