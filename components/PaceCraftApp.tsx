'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Activity, Languages } from 'lucide-react';
import {
  DAILY_PROGRESS_STORAGE_KEY,
  IMPORTED_RUNS_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  RACE_DATE_STORAGE_KEY,
  RACE_NAME_STORAGE_KEY,
  RUNNER_PROFILE_STORAGE_KEY,
  SAMPLE_STRAVA_RUNS,
} from '@/lib/strava/config';
import { mergeAndDeduplicateRuns } from '@/lib/strava/import-parser';
import {
  buildProgressEntriesFromMatches,
  calculateBmi,
  computeDailyProgressStats,
  computeKpiSummary,
  computeNutritionRecommendation,
  computeRaceCountdown,
  computeWeeklyChartBuckets,
  findStravaProgressMatches,
  formatDecimalComma,
  formatPace,
  generateTrainingPlan,
  getDefaultRaceDateKey,
} from '@/lib/strava/transform';
import {
  AppLanguage,
  DailyProgressEntry,
  DailySessionPlan,
  RunActivity,
  RunnerProfile,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import ProfileBmiCalculator from './ProfileBmiCalculator';
import RaceCountdown from './RaceCountdown';
import TrainingPlanSection from './TrainingPlanSection';
import NutritionRecoverySection from './NutritionRecoverySection';
import DailyProgressTracker from './DailyProgressTracker';
import StravaDashboard from './StravaDashboard';
import { ImportSourceKind } from './ImportActivitiesPanel';
import ActivityDetailModal from './ActivityDetailModal';
import DisconnectModal from './DisconnectModal';

const DEFAULT_PROFILE: RunnerProfile = {
  weightKg: 68,
  heightCm: 170,
  directBmi: null,
  useDirectBmi: false,
  age: 29,
  injuryStatus: 'none',
  targetRace: '10K',
  trainingDaysPerWeek: 4,
};

function getLocalTodayKeyAndDayIndex(): { dateKey: string; dayIndex: number } {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const dateKey = wib.toISOString().slice(0, 10);
  const utcDay = wib.getUTCDay(); // 0 = Sun..6 = Sat
  const dayIndex = utcDay === 0 ? 6 : utcDay - 1; // 0 = Mon..6 = Sun
  return { dateKey, dayIndex };
}

const LOCAL_STORAGE_EVENT = 'pacecraft-local-storage-change';

function subscribeLocalStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(LOCAL_STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(LOCAL_STORAGE_EVENT, callback);
  };
}

function readLocalStorageRaw(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorageJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT));
  } catch {
    // Storage quota safeguard
  }
}

function useStoredJson<T>(
  key: string,
  fallback: T
): [T, (updater: T | ((prev: T) => T)) => void] {
  const raw = React.useSyncExternalStore(
    subscribeLocalStorage,
    () => readLocalStorageRaw(key),
    () => null
  );

  const value = useMemo<T>(() => {
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback)) {
        return (Array.isArray(parsed) ? parsed : fallback) as T;
      }
      if (typeof fallback === 'object' && fallback !== null) {
        return { ...fallback, ...(parsed as Record<string, unknown>) } as T;
      }
      return parsed as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);

  const setValue = React.useCallback(
    (updater: T | ((prev: T) => T)) => {
      const latestRaw = readLocalStorageRaw(key);
      let current = fallback;
      if (latestRaw) {
        try {
          const parsed = JSON.parse(latestRaw);
          if (Array.isArray(fallback)) {
            current = (Array.isArray(parsed) ? parsed : fallback) as T;
          } else if (typeof fallback === 'object' && fallback !== null) {
            current = {
              ...fallback,
              ...(parsed as Record<string, unknown>),
            } as T;
          } else {
            current = parsed as T;
          }
        } catch {
          current = fallback;
        }
      }
      const next =
        typeof updater === 'function'
          ? (updater as (prev: T) => T)(current)
          : updater;
      writeLocalStorageJson(key, next);
    },
    [key, fallback]
  );

  return [value, setValue];
}

const EMPTY_RUNS: RunActivity[] = [];
const EMPTY_PROGRESS: DailyProgressEntry[] = [];

type ImportNoticeState =
  | { type: 'sample' }
  | {
      type: 'import';
      count: number;
      sourceKind: ImportSourceKind;
      skippedNonRuns: number;
    }
  | { type: 'oauth'; count: number }
  | { type: 'cleared' }
  | { type: 'error'; message: string }
  | null;

export default function PaceCraftApp() {
  const [runs, setRuns] = useStoredJson<RunActivity[]>(
    IMPORTED_RUNS_STORAGE_KEY,
    EMPTY_RUNS
  );
  const [profile, setProfile] = useStoredJson<RunnerProfile>(
    RUNNER_PROFILE_STORAGE_KEY,
    DEFAULT_PROFILE
  );
  const [progressEntries, setProgressEntries] = useStoredJson<
    DailyProgressEntry[]
  >(DAILY_PROGRESS_STORAGE_KEY, EMPTY_PROGRESS);
  const [lang, setLang] = useStoredJson<AppLanguage>(LANGUAGE_STORAGE_KEY, 'id');
  const [customRaceDate, setCustomRaceDate] = useStoredJson<string | null>(
    RACE_DATE_STORAGE_KEY,
    null
  );
  const [customRaceName, setCustomRaceName] = useStoredJson<string>(
    RACE_NAME_STORAGE_KEY,
    ''
  );
  const [stravaSyncNoticeCount, setStravaSyncNoticeCount] = useState<
    number | null
  >(null);

  const safeLang: AppLanguage = lang === 'en' ? 'en' : 'id';
  const t = UI_COPY[safeLang];

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = safeLang;
    }
  }, [safeLang]);

  const [selectedActivity, setSelectedActivity] = useState<RunActivity | null>(
    null
  );
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const [oauthConnectedOverride, setOauthConnectedOverride] = useState(false);
  const isOAuthConnected =
    oauthConnectedOverride || runs.some((r) => r.source === 'strava_oauth');
  const [importNoticeState, setImportNoticeState] =
    useState<ImportNoticeState>(null);

  const todayInfo = useMemo(() => getLocalTodayKeyAndDayIndex(), []);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(
    todayInfo.dayIndex
  );

  const bmiResult = useMemo(
    () =>
      calculateBmi(
        profile.weightKg,
        profile.heightCm,
        profile.directBmi,
        profile.useDirectBmi,
        safeLang
      ),
    [profile, safeLang]
  );

  const kpi = useMemo(() => computeKpiSummary(runs), [runs]);
  const weeklyBuckets = useMemo(
    () =>
      computeWeeklyChartBuckets(
        runs,
        8,
        new Date('2026-11-19T12:00:00+07:00'),
        safeLang
      ),
    [runs, safeLang]
  );
  const effectiveRaceDateKey =
    customRaceDate || getDefaultRaceDateKey(todayInfo.dateKey, profile.targetRace);
  const raceCountdown = useMemo(
    () =>
      computeRaceCountdown(
        effectiveRaceDateKey,
        profile.targetRace,
        todayInfo.dateKey,
        safeLang
      ),
    [effectiveRaceDateKey, profile.targetRace, todayInfo.dateKey, safeLang]
  );
  const raceEventLabel = customRaceName.trim()
    ? `${customRaceName.trim()} (${profile.targetRace})`
    : profile.targetRace;
  const trainingPlan = useMemo(
    () =>
      generateTrainingPlan(profile, kpi, safeLang, raceCountdown.status),
    [profile, kpi, safeLang, raceCountdown.status]
  );
  const dailyProgressStats = useMemo(
    () =>
      computeDailyProgressStats(
        progressEntries,
        trainingPlan.weeklySchedule,
        todayInfo.dateKey
      ),
    [progressEntries, trainingPlan.weeklySchedule, todayInfo.dateKey]
  );
  const stravaSyncMatches = useMemo(
    () =>
      findStravaProgressMatches(
        runs,
        trainingPlan.weeklySchedule,
        progressEntries,
        todayInfo.dateKey
      ),
    [runs, trainingPlan.weeklySchedule, progressEntries, todayInfo.dateKey]
  );
  const nutritionRecommendation = useMemo(
    () => computeNutritionRecommendation(profile, bmiResult, safeLang),
    [profile, bmiResult, safeLang]
  );
  const shouldReduceMotion = useReducedMotion();
  const volumeProgressRatio =
    trainingPlan.totalPlannedWeekKm > 0 && dailyProgressStats.totalLoggedKm > 0
      ? Math.min(
          1,
          dailyProgressStats.totalLoggedKm / trainingPlan.totalPlannedWeekKm
        )
      : Math.min(1, dailyProgressStats.completionPct / 100);
  const volumeProgressPct = Math.round(volumeProgressRatio * 100);

  const resolvedImportNotice = useMemo(() => {
    if (!importNoticeState) return null;
    if (importNoticeState.type === 'sample') return t.strava.sampleLoadedNotice;
    if (importNoticeState.type === 'cleared') return t.strava.clearedRunsNotice;
    if (importNoticeState.type === 'oauth')
      return t.strava.oauthSyncedNotice(importNoticeState.count);
    if (importNoticeState.type === 'error') return importNoticeState.message;
    const sourceLabel =
      importNoticeState.sourceKind === 'both'
        ? t.strava.csvAndGpxLabel
        : importNoticeState.sourceKind === 'csv'
          ? t.strava.csvStravaLabel
          : t.strava.gpxFileLabel;
    return t.strava.importNotice(
      importNoticeState.count,
      sourceLabel,
      importNoticeState.skippedNonRuns
    );
  }, [importNoticeState, t]);

  const handleLoadSampleData = () => {
    setRuns((prev) => mergeAndDeduplicateRuns(prev, SAMPLE_STRAVA_RUNS));
    setImportNoticeState({ type: 'sample' });
  };

  const handleImportRuns = (
    incoming: RunActivity[],
    skippedNonRuns: number,
    sourceKind: ImportSourceKind,
    errors: string[] = []
  ) => {
    if (incoming.length === 0 && errors.length > 0) {
      setImportNoticeState({ type: 'error', message: errors[0] });
      return;
    }

    setRuns((prev) => mergeAndDeduplicateRuns(prev, incoming));
    setImportNoticeState({
      type: 'import',
      count: incoming.length,
      sourceKind,
      skippedNonRuns,
    });
  };

  const handleSyncStravaOAuthRuns = (incoming: RunActivity[]) => {
    setOauthConnectedOverride(true);
    setRuns((prev) => mergeAndDeduplicateRuns(prev, incoming));
    setImportNoticeState({ type: 'oauth', count: incoming.length });
  };

  const handleConfirmClearRuns = async () => {
    if (isOAuthConnected) {
      try {
        await fetch('/api/strava/disconnect', { method: 'POST' });
      } catch {
        // Ignore network error during disconnect cleanup
      }
    }
    setRuns([]);
    setOauthConnectedOverride(false);
    setIsDisconnectOpen(false);
    setImportNoticeState({ type: 'cleared' });
  };

  const handleAddDailyProgress = (entry: DailyProgressEntry) => {
    setProgressEntries((prev) => {
      const filtered = prev.filter(
        (item) =>
          !(item.dateKey === entry.dateKey && item.dayIndex === entry.dayIndex)
      );
      return [entry, ...filtered];
    });
  };

  const handleRemoveDailyProgress = (dateKey: string, dayIndex: number) => {
    setProgressEntries((prev) =>
      prev.filter(
        (item) => !(item.dateKey === dateKey && item.dayIndex === dayIndex)
      )
    );
  };

  const handleQuickLogSession = (session: DailySessionPlan) => {
    setSelectedDayIndex(session.dayIndex);
    handleAddDailyProgress({
      dateKey: todayInfo.dateKey,
      dayIndex: session.dayIndex,
      sessionTitle: session.title,
      zone: session.zone,
      plannedKm: session.targetDistanceKm,
      actualKm: session.targetDistanceKm,
      comfortRating: 4,
      note: t.dailyProgress.quickLogDefaultNote,
      completedAt: new Date().toISOString(),
    });
    const el = document.getElementById('progres-harian');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSyncStravaToDailyProgress = (scrollToSection = false) => {
    if (stravaSyncMatches.length === 0) return;
    const syncedCount = stravaSyncMatches.length;
    const newEntries = buildProgressEntriesFromMatches(
      stravaSyncMatches,
      t.dailyProgress.stravaSyncedTag
    );
    setProgressEntries((prev) => {
      const existingKeys = new Set(
        prev.map((item) => `${item.dateKey}-${item.dayIndex}`)
      );
      const filteredNew = newEntries.filter(
        (item) => !existingKeys.has(`${item.dateKey}-${item.dayIndex}`)
      );
      return [...filteredNew, ...prev];
    });
    setStravaSyncNoticeCount(syncedCount);
    if (scrollToSection) {
      const el = document.getElementById('progres-harian');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FA]">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F7F9FA]/95 backdrop-blur-sm border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-md"
          >
            PaceCraft
          </a>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label={t.nav.mainAriaLabel}
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#profil-bmi"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.profileBmi}
            </a>
            <a
              href="#menu-latihan"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.trainingPlan}
            </a>
            <a
              href="#nutrisi-pemulihan"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.nutrition}
            </a>
            <a
              href="#progres-harian"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.dailyProgress}
            </a>
            <a
              href="#riwayat-strava"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.stravaHistory}
            </a>
          </nav>

          {/* Zone 3: 1 primary CTA button */}
          <div className="flex items-center shrink-0">
            <a
              href="#menu-latihan"
              className="min-h-[40px] px-4 py-2 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-semibold hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              {t.nav.buildMenuCta}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      {/* Mobile quick navigation strip */}
      <nav
        aria-label={t.nav.mobileAriaLabel}
        className="md:hidden border-b border-slate-200/80 bg-white px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium text-slate-600"
      >
        <a
          href="#profil-bmi"
          className="py-1.5 whitespace-nowrap shrink-0 hover:text-teal-700"
        >
          {t.nav.profileBmi}
        </a>
        <a
          href="#menu-latihan"
          className="py-1.5 whitespace-nowrap shrink-0 hover:text-teal-700"
        >
          {t.nav.trainingPlan}
        </a>
        <a
          href="#nutrisi-pemulihan"
          className="py-1.5 whitespace-nowrap shrink-0 hover:text-teal-700"
        >
          {t.nav.nutrition}
        </a>
        <a
          href="#progres-harian"
          className="py-1.5 whitespace-nowrap shrink-0 hover:text-teal-700"
        >
          {t.nav.dailyProgress}
        </a>
        <a
          href="#riwayat-strava"
          className="py-1.5 whitespace-nowrap shrink-0 hover:text-teal-700"
        >
          {t.nav.stravaHistory}
        </a>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Soft Pastel Sage-Sky-Lavender Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl bg-gradient-to-br from-[#EAF6F3] via-[#F4F8FB] to-[#EEF2FB] border border-teal-100/90 p-6 sm:p-10 space-y-6"
        >
          {/* Hero Top Bar with Bilingual Language Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-teal-700 tracking-wide">
              {t.hero.eyebrow}
            </p>

            <div
              role="group"
              aria-label={t.nav.languageGroupLabel}
              data-testid="language-switcher"
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/85 border border-teal-200/70"
            >
              <Languages
                className="w-3.5 h-3.5 text-teal-700 ml-2 mr-1 shrink-0"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setLang('id')}
                data-testid="lang-btn-id"
                aria-pressed={safeLang === 'id'}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  safeLang === 'id'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.nav.idButton}
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                data-testid="lang-btn-en"
                aria-pressed={safeLang === 'en'}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  safeLang === 'en'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.nav.enButton}
              </button>
            </div>
          </div>

          <RaceCountdown
            targetRace={profile.targetRace}
            countdown={raceCountdown}
            customRaceName={customRaceName}
            hasCustomDate={Boolean(customRaceDate)}
            lang={safeLang}
            onChangeRaceName={(name) => setCustomRaceName(name)}
            onChangeRaceDate={(dateKey) => setCustomRaceDate(dateKey || null)}
            onResetRaceMeta={() => {
              setCustomRaceDate(null);
              setCustomRaceName('');
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight text-balance">
                {t.hero.title}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                {t.hero.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <Activity className="w-4 h-4" aria-hidden="true" />
                  {t.hero.loadSampleBtn}
                </button>
                <a
                  href="#progres-harian"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-semibold hover:border-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 inline-flex items-center transition-colors whitespace-nowrap shrink-0"
                >
                  {t.hero.logTodayBtn}
                </a>
              </div>
            </div>

            {/* Right-hand live snapshot inside the hero */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 pt-4 lg:pt-0 lg:pl-8 lg:border-l border-teal-200/70">
              <div>
                <p className="text-xs text-slate-500">
                  {t.hero.raceTargetLabel}
                </p>
                <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                  {profile.targetRace}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {profile.trainingDaysPerWeek} {t.hero.daysPerWeekUnit}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.hero.currentBmiLabel}</p>
                <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                  {bmiResult.formattedBmi}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {t.hero.categoryPrefix} {bmiResult.categoryLabel}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  {t.hero.weeklyVolumeLabel}
                </p>
                <p className="text-2xl font-bold text-teal-700 font-mono tabular-nums mt-1">
                  {formatDecimalComma(
                    trainingPlan.totalPlannedWeekKm,
                    1,
                    safeLang
                  )}{' '}
                  km
                </p>
                <div
                  role="progressbar"
                  aria-label={t.hero.progressBarAria}
                  aria-valuenow={volumeProgressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  data-testid="hero-volume-progress-bar"
                  className="mt-2 h-2 w-full rounded-full bg-teal-100/90 overflow-hidden"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: volumeProgressRatio }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ transformOrigin: 'left' }}
                    data-testid="hero-volume-progress-fill"
                    className="h-full w-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-400"
                  />
                </div>
                <p
                  data-testid="hero-volume-progress-text"
                  className="text-xs text-slate-600 font-mono tabular-nums mt-1.5"
                >
                  {formatDecimalComma(
                    dailyProgressStats.totalLoggedKm,
                    1,
                    safeLang
                  )}{' '}
                  km · {dailyProgressStats.completedThisWeekCount}/
                  {dailyProgressStats.plannedRunSessionsCount}{' '}
                  {t.hero.sessionsUnit} ({volumeProgressPct}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  {t.hero.baselinePaceLabel}
                </p>
                <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                  {formatPace(trainingPlan.baselinePaceSecPerKm)}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {runs.length > 0
                    ? `${runs.length} ${t.hero.stravaSessionsUnit}`
                    : t.hero.defaultBaselineHint}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FT-01: Profile & BMI Calculator */}
        <ProfileBmiCalculator
          profile={profile}
          bmiResult={bmiResult}
          lang={safeLang}
          onChangeProfile={setProfile}
        />

        {/* FT-02: Training Plan & Pace Zones */}
        <TrainingPlanSection
          profile={profile}
          plan={trainingPlan}
          progressEntries={progressEntries}
          countdownDaysRemaining={raceCountdown.daysRemaining}
          raceEventLabel={raceEventLabel}
          lang={safeLang}
          onChangeProfile={setProfile}
          onQuickLogSession={handleQuickLogSession}
        />

        {/* Daily Nutrition & Recovery Recommendation */}
        <NutritionRecoverySection
          nutrition={nutritionRecommendation}
          lang={safeLang}
        />

        {/* Daily Progress Tracking */}
        <DailyProgressTracker
          weeklySchedule={trainingPlan.weeklySchedule}
          entries={progressEntries}
          todayDateKey={todayInfo.dateKey}
          selectedDayIndex={selectedDayIndex}
          stravaMatches={stravaSyncMatches}
          stravaSyncNotice={
            stravaSyncNoticeCount
              ? t.dailyProgress.stravaSyncSuccess(stravaSyncNoticeCount)
              : null
          }
          lang={safeLang}
          onSelectDayIndex={setSelectedDayIndex}
          onAddEntry={handleAddDailyProgress}
          onRemoveEntry={handleRemoveDailyProgress}
          onSyncStravaProgress={() => handleSyncStravaToDailyProgress(false)}
        />

        {/* FT-03 to FT-07: Strava Dashboard & Activity Cards */}
        <StravaDashboard
          runs={runs}
          kpi={kpi}
          weeklyBuckets={weeklyBuckets}
          isOAuthConnected={isOAuthConnected}
          importNotice={resolvedImportNotice}
          stravaSyncCount={stravaSyncMatches.length}
          lang={safeLang}
          onLoadSampleData={handleLoadSampleData}
          onImportRuns={handleImportRuns}
          onSyncStravaOAuthRuns={handleSyncStravaOAuthRuns}
          onSyncStravaToProgress={() => handleSyncStravaToDailyProgress(true)}
          onOpenDisconnectModal={() => setIsDisconnectOpen(true)}
          onSelectActivity={setSelectedActivity}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>{t.footer.left}</span>
          <span>{t.footer.right}</span>
        </div>
      </footer>

      {/* Modals */}
      <ActivityDetailModal
        activity={selectedActivity}
        lang={safeLang}
        onClose={() => setSelectedActivity(null)}
      />

      <DisconnectModal
        isOpen={isDisconnectOpen}
        hasStravaOAuth={isOAuthConnected}
        runsCount={runs.length}
        lang={safeLang}
        onCancel={() => setIsDisconnectOpen(false)}
        onConfirmClear={handleConfirmClearRuns}
      />
    </div>
  );
}
