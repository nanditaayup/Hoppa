'use client';

import React, { useRef, useState } from 'react';
import { Activity, Flame, Gauge, Play } from 'lucide-react';
import { UI_COPY } from '@/lib/strava/i18n';
import { AppLanguage } from '@/lib/strava/types';

export interface VideoDemoShowcaseProps {
  lang: AppLanguage;
}

export default function VideoDemoShowcase({ lang }: VideoDemoShowcaseProps) {
  const L = UI_COPY[lang].landing;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<
    'progress' | 'calculator' | 'strava'
  >('progress');

  const chapters = L.videoDemoChapters;
  const activeChapter =
    chapters.find((c) => c.id === activeChapterId) ?? chapters[0];

  const handleSelectChapter = (
    chapterId: 'progress' | 'calculator' | 'strava',
    timeSec: number
  ) => {
    setActiveChapterId(chapterId);
    const el = videoRef.current;
    if (el) {
      el.currentTime = timeSec;
      el.play().catch(() => {
        // Native controls remain available if browser blocks programmatic play
      });
    }
  };

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    const t = el.currentTime;
    const sorted = [...chapters].sort((a, b) => b.timeSec - a.timeSec);
    const matched = sorted.find((c) => t >= c.timeSec);
    if (matched && matched.id !== activeChapterId) {
      setActiveChapterId(matched.id);
    }
  };

  const getChapterIcon = (id: 'progress' | 'calculator' | 'strava') => {
    if (id === 'calculator') return Gauge;
    if (id === 'strava') return Activity;
    return Flame;
  };

  return (
    <div
      id="video-demo"
      data-testid="landing-video-demo-card"
      className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 scroll-mt-20"
    >
      {/* Header + Unboxed Kicker */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#087F73] dark:text-teal-400">
            <Play className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{L.videoDemoBadge}</span>
            <span
              className="w-2 h-2 rounded-full bg-[#E9957D] shrink-0"
              aria-hidden="true"
            />
          </p>
          <h3 className="text-lg sm:text-xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight">
            {L.videoDemoTitle}
          </h3>
          <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
            {L.videoDemoDesc}
          </p>
        </div>

        {/* Interactive Feature Chapter Switcher */}
        <div
          role="group"
          aria-label={L.videoDemoTitle}
          className="inline-flex flex-wrap lg:flex-nowrap items-center gap-1 p-1 rounded-xl bg-[#F7F6F2] dark:bg-slate-800/80 border border-[#DFE7E2] dark:border-slate-700 self-start lg:self-auto lg:shrink-0"
        >
          {chapters.map((chapter) => {
            const Icon = getChapterIcon(chapter.id);
            const isActive = chapter.id === activeChapterId;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => handleSelectChapter(chapter.id, chapter.timeSec)}
                data-testid={`video-chapter-btn-${chapter.id}`}
                aria-pressed={isActive}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                  isActive
                    ? 'bg-[#087F73] dark:bg-teal-600 text-white'
                    : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{chapter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Recording Player */}
      <div className="overflow-hidden rounded-xl border border-[#DFE7E2] dark:border-slate-800 bg-[#202A2A]">
        <video
          ref={videoRef}
          data-testid="landing-video-demo"
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          className="w-full aspect-[16/10] block"
          src="/videos/pacecraft-demo.webm"
        >
          {L.videoDemoFallback}
        </video>
      </div>

      {/* Clean Hairline Caption Strip */}
      <div className="pt-3 border-t border-[#DFE7E2] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <p className="text-[#596866] dark:text-slate-300 leading-relaxed">
          <strong className="font-semibold text-[#202A2A] dark:text-slate-100">
            {activeChapter.label}:
          </strong>{' '}
          {activeChapter.caption}
        </p>
        <a
          href="#harga"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6F3EE] dark:bg-teal-950/60 border border-transparent hover:border-[#087F73] text-[#202A2A] dark:text-teal-200 font-semibold whitespace-nowrap shrink-0 self-start sm:self-auto transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
        >
          <span
            className="w-2 h-2 rounded-full bg-[#E9957D]"
            aria-hidden="true"
          />
          <span>{L.heroBuyCta}</span>
        </a>
      </div>
    </div>
  );
}
