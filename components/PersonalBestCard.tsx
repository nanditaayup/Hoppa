'use client';

import React, { useState } from 'react';
import { Award, CheckCircle2, Sparkles, X } from 'lucide-react';
import {
  extractSuggestedPbsFromRuns,
  formatPbDuration,
  getProfilePersonalBests,
  parsePbDurationInput,
} from '@/lib/strava/personal-bests';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  AppLanguage,
  RaceDistanceKey,
  RunActivity,
  RunnerProfile,
} from '@/lib/strava/types';

interface PersonalBestCardProps {
  profile: RunnerProfile;
  runs: RunActivity[];
  lang: AppLanguage;
  onChangeProfile: (updater: (prev: RunnerProfile) => RunnerProfile) => void;
}

const PB_FIELD_MAP: Record<
  RaceDistanceKey,
  'pb5kSec' | 'pb10kSec' | 'pb21kSec' | 'pb42kSec'
> = {
  '5K': 'pb5kSec',
  '10K': 'pb10kSec',
  '21K': 'pb21kSec',
  '42K': 'pb42kSec',
};

export default function PersonalBestCard({
  profile,
  runs,
  lang,
  onChangeProfile,
}: PersonalBestCardProps) {
  const t = UI_COPY[lang].personalBests;
  const pbList = getProfilePersonalBests(profile);

  const [editingDrafts, setEditingDrafts] = useState<
    Partial<Record<RaceDistanceKey, string>>
  >({});
  const [invalidKeys, setInvalidKeys] = useState<
    Partial<Record<RaceDistanceKey, boolean>>
  >({});
  const [detectNotice, setDetectNotice] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  const getInputDisplayValue = (key: RaceDistanceKey, savedSec: number | null) => {
    if (editingDrafts[key] !== undefined) return editingDrafts[key]!;
    return savedSec !== null ? formatPbDuration(savedSec) : '';
  };

  const commitDraft = (key: RaceDistanceKey) => {
    const raw = editingDrafts[key];
    if (raw === undefined) return;
    const trimmed = raw.trim();

    if (!trimmed) {
      setEditingDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setInvalidKeys((prev) => ({ ...prev, [key]: false }));
      onChangeProfile((p) => ({ ...p, [PB_FIELD_MAP[key]]: null }));
      return;
    }

    const parsed = parsePbDurationInput(trimmed);
    if (parsed === null) {
      setInvalidKeys((prev) => ({ ...prev, [key]: true }));
      return;
    }

    setInvalidKeys((prev) => ({ ...prev, [key]: false }));
    setEditingDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    onChangeProfile((p) => ({ ...p, [PB_FIELD_MAP[key]]: parsed }));
  };

  const handleClearKey = (key: RaceDistanceKey) => {
    setEditingDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setInvalidKeys((prev) => ({ ...prev, [key]: false }));
    onChangeProfile((p) => ({ ...p, [PB_FIELD_MAP[key]]: null }));
  };

  const handleDetectFromRuns = () => {
    const suggested = extractSuggestedPbsFromRuns(runs);
    let updatedCount = 0;

    onChangeProfile((prev) => {
      const next = { ...prev };
      (Object.keys(suggested) as RaceDistanceKey[]).forEach((key) => {
        const cand = suggested[key];
        const field = PB_FIELD_MAP[key];
        const current = prev[field];
        if (cand !== undefined && (current == null || cand < current)) {
          next[field] = cand;
          updatedCount += 1;
        }
      });
      return next;
    });

    if (updatedCount > 0) {
      setEditingDrafts({});
      setInvalidKeys({});
      setDetectNotice({
        type: 'success',
        text: t.detectedNotice(updatedCount),
      });
    } else {
      setDetectNotice({
        type: 'info',
        text: t.noRunsDetectedNotice,
      });
    }
  };

  return (
    <div
      data-testid="personal-best-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award
              className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0"
              aria-hidden="true"
            />
            <span>{t.heading}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectFromRuns}
          data-testid="pb-detect-strava-btn"
          className="min-h-[42px] px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 text-xs font-semibold text-teal-900 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{t.detectBtn}</span>
        </button>
      </div>

      {detectNotice && (
        <div
          role="status"
          data-testid="pb-detect-notice"
          className={`rounded-xl px-4 py-3 text-xs flex items-center gap-2 ${
            detectNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{detectNotice.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {pbList.map((pb) => {
          const inputVal = getInputDisplayValue(pb.key, pb.seconds);
          const hasInvalid = Boolean(invalidKeys[pb.key]);
          return (
            <div
              key={pb.key}
              className="rounded-xl bg-[#F7F9FA] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor={`pb-input-${pb.key}`}
                  className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono tabular-nums"
                >
                  {pb.key}
                </label>
                {pb.seconds !== null && (
                  <button
                    type="button"
                    onClick={() => handleClearKey(pb.key)}
                    aria-label={`${t.clearBtn} ${pb.key}`}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 inline-flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                    <span>{t.clearBtn}</span>
                  </button>
                )}
              </div>

              <input
                id={`pb-input-${pb.key}`}
                data-testid={`pb-input-${pb.key}`}
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={inputVal}
                placeholder={t.placeholder}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingDrafts((prev) => ({ ...prev, [pb.key]: val }));
                  setInvalidKeys((prev) => ({ ...prev, [pb.key]: false }));
                }}
                onBlur={() => commitDraft(pb.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                  hasInvalid
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-teal-700 dark:focus:ring-teal-400'
                }`}
              />

              {hasInvalid && (
                <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-snug">
                  {t.invalidHint}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {t.saveHint}
      </p>
    </div>
  );
}
