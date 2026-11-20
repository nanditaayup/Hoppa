'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  CloudDownload,
  Flame,
  HeartPulse,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Utensils,
  X,
} from 'lucide-react';
import { SAMPLE_STRAVA_RUNS } from '@/lib/strava/config';
import { mergeAndDeduplicateRuns } from '@/lib/strava/import-parser';
import {
  buildProgressEntriesFromMatches,
  calculateBmi,
  computeDailyProgressStats,
  computeHeartRateAndVo2Max,
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
  WorkspaceTabId,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import {
  clearAllCloudRuns,
  clearLegacyLocalData,
  createOrUpdateUserWorkspace,
  DEFAULT_RUNNER_PROFILE,
  deleteAllCloudUserData,
  deleteCloudDailyProgress,
  isLocalMigrationHandled,
  LegacyLocalSnapshot,
  markLocalMigrationHandled,
  readLegacyLocalSnapshot,
  saveCloudDailyProgress,
  saveCloudDailyProgressBatch,
  saveCloudRunsBatch,
  subscribeToUserProgress,
  subscribeToUserRuns,
  subscribeToUserWorkspace,
} from '@/lib/firebase/firestore-sync';
import ProfileBmiCalculator from './ProfileBmiCalculator';
import RaceCountdown from './RaceCountdown';
import TrainingPlanSection from './TrainingPlanSection';
import NutritionRecoverySection from './NutritionRecoverySection';
import DailyProgressTracker from './DailyProgressTracker';
import StravaDashboard from './StravaDashboard';
import { ImportSourceKind } from './ImportActivitiesPanel';
import ActivityDetailModal from './ActivityDetailModal';
import DisconnectModal from './DisconnectModal';
import PrivacyTermsModal from './PrivacyTermsModal';
import DeleteAccountModal from './DeleteAccountModal';
import ThemeToggle from './ThemeToggle';

interface PaceCraftAppProps {
  user: User;
  initialPreferredLang: AppLanguage;
  authBusy: boolean;
  onSignOut: () => Promise<void>;
  onFinalizeAccountDeletion: () => Promise<void>;
}

function getLocalTodayKeyAndDayIndex(): { dateKey: string; dayIndex: number } {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const dateKey = wib.toISOString().slice(0, 10);
  const utcDay = wib.getUTCDay();
  const dayIndex = utcDay === 0 ? 6 : utcDay - 1;
  return { dateKey, dayIndex };
}

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

function getInitials(displayName: string | null, email: string | null): string {
  const source = (displayName || email || 'PC').trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function PaceCraftApp({
  user,
  initialPreferredLang,
  authBusy,
  onSignOut,
  onFinalizeAccountDeletion,
}: PaceCraftAppProps) {
  const [runs, setRuns] = useState<RunActivity[]>([]);
  const [profile, setProfile] = useState<RunnerProfile>(DEFAULT_RUNNER_PROFILE);
  const [progressEntries, setProgressEntries] = useState<DailyProgressEntry[]>(
    []
  );
  const [lang, setLangState] = useState<AppLanguage>(initialPreferredLang);
  const [customRaceDate, setCustomRaceDateState] = useState<string | null>(
    null
  );
  const [customRaceName, setCustomRaceNameState] = useState<string>('');
  const [migratedFromLocal, setMigratedFromLocal] = useState(false);

  const [cloudWorkspaceReady, setCloudWorkspaceReady] = useState(false);
  const [pendingMigration, setPendingMigration] =
    useState<LegacyLocalSnapshot | null>(null);
  const [isMigratingLocal, setIsMigratingLocal] = useState(false);
  const [migrationSuccessNotice, setMigrationSuccessNotice] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null
  );

  const workspaceExistsRef = useRef(false);
  const lastWorkspaceWriteAtRef = useRef(0);
  const workspaceWriteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const latestWorkspaceRef = useRef({
    language: initialPreferredLang,
    customRaceDate: null as string | null,
    customRaceName: '',
    migratedFromLocal: false,
    profile: DEFAULT_RUNNER_PROFILE,
  });

  useEffect(() => {
    latestWorkspaceRef.current = {
      language: lang,
      customRaceDate,
      customRaceName,
      migratedFromLocal,
      profile,
    };
  }, [lang, customRaceDate, customRaceName, migratedFromLocal, profile]);

  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileSidebarOpen]);

  // Subscribe to per-user Firestore collections
  useEffect(() => {
    const uid = user.uid;
    let initHandled = false;

    const unsubWorkspace = subscribeToUserWorkspace(
      uid,
      (cloudState, hasPendingWrites) => {
        workspaceExistsRef.current = cloudState.exists;
        setCloudWorkspaceReady(true);

        if (cloudState.exists) {
          setPendingMigration(null);
          if (
            !hasPendingWrites &&
            Date.now() - lastWorkspaceWriteAtRef.current > 900
          ) {
            setProfile(cloudState.profile);
            setLangState(cloudState.language);
            setCustomRaceDateState(cloudState.customRaceDate);
            setCustomRaceNameState(cloudState.customRaceName);
            setMigratedFromLocal(cloudState.migratedFromLocal);
          }
          return;
        }

        if (!initHandled) {
          initHandled = true;
          const legacy = readLegacyLocalSnapshot();
          if (legacy.hasData && !isLocalMigrationHandled(uid)) {
            setPendingMigration(legacy);
          } else {
            markLocalMigrationHandled(uid);
            const initialPayload = {
              language: initialPreferredLang,
              customRaceDate: null,
              customRaceName: '',
              migratedFromLocal: false,
              profile: DEFAULT_RUNNER_PROFILE,
            };
            workspaceExistsRef.current = true;
            void createOrUpdateUserWorkspace(uid, false, initialPayload);
          }
        }
      }
    );

    const unsubProgress = subscribeToUserProgress(uid, (cloudEntries) => {
      setProgressEntries(cloudEntries);
    });

    const unsubRuns = subscribeToUserRuns(uid, (cloudRuns) => {
      setRuns(cloudRuns);
    });

    return () => {
      unsubWorkspace();
      unsubProgress();
      unsubRuns();
      if (workspaceWriteTimerRef.current) {
        clearTimeout(workspaceWriteTimerRef.current);
      }
    };
  }, [user.uid, initialPreferredLang]);

  const scheduleWorkspaceSave = useCallback(
    (
      changedFields: Partial<{
        language: AppLanguage;
        customRaceDate: string | null;
        customRaceName: string;
        migratedFromLocal: boolean;
        profile: RunnerProfile;
      }>,
      immediate = false
    ) => {
      lastWorkspaceWriteAtRef.current = Date.now();
      if (workspaceWriteTimerRef.current) {
        clearTimeout(workspaceWriteTimerRef.current);
      }

      const executeWrite = () => {
        const exists = workspaceExistsRef.current;
        workspaceExistsRef.current = true;
        void createOrUpdateUserWorkspace(
          user.uid,
          exists,
          latestWorkspaceRef.current,
          changedFields
        );
      };

      if (immediate) {
        executeWrite();
      } else {
        workspaceWriteTimerRef.current = setTimeout(executeWrite, 350);
      }
    },
    [user.uid]
  );

  const setProfileAndSync = useCallback(
    (updater: RunnerProfile | ((prev: RunnerProfile) => RunnerProfile)) => {
      setProfile((prev) => {
        const next =
          typeof updater === 'function' ? updater(prev) : updater;
        latestWorkspaceRef.current = {
          ...latestWorkspaceRef.current,
          profile: next,
        };
        scheduleWorkspaceSave({ profile: next }, false);
        return next;
      });
    },
    [scheduleWorkspaceSave]
  );

  const setLangAndSync = useCallback(
    (nextLang: AppLanguage) => {
      setLangState(nextLang);
      latestWorkspaceRef.current = {
        ...latestWorkspaceRef.current,
        language: nextLang,
      };
      scheduleWorkspaceSave({ language: nextLang }, true);
    },
    [scheduleWorkspaceSave]
  );

  const setRaceDateAndSync = useCallback(
    (nextDate: string | null) => {
      setCustomRaceDateState(nextDate);
      latestWorkspaceRef.current = {
        ...latestWorkspaceRef.current,
        customRaceDate: nextDate,
      };
      scheduleWorkspaceSave({ customRaceDate: nextDate }, true);
    },
    [scheduleWorkspaceSave]
  );

  const setRaceNameAndSync = useCallback(
    (nextName: string) => {
      setCustomRaceNameState(nextName);
      latestWorkspaceRef.current = {
        ...latestWorkspaceRef.current,
        customRaceName: nextName,
      };
      scheduleWorkspaceSave({ customRaceName: nextName }, false);
    },
    [scheduleWorkspaceSave]
  );

  const handleImportLocalToCloud = async () => {
    if (!pendingMigration || isMigratingLocal) return;
    setIsMigratingLocal(true);
    try {
      const legacy = pendingMigration;
      setProfile(legacy.profile);
      setLangState(legacy.language);
      setCustomRaceDateState(legacy.customRaceDate);
      setCustomRaceNameState(legacy.customRaceName);
      setMigratedFromLocal(true);

      const exists = workspaceExistsRef.current;
      workspaceExistsRef.current = true;
      await createOrUpdateUserWorkspace(
        user.uid,
        exists,
        {
          language: legacy.language,
          customRaceDate: legacy.customRaceDate,
          customRaceName: legacy.customRaceName,
          migratedFromLocal: true,
          profile: legacy.profile,
        },
        {
          language: legacy.language,
          customRaceDate: legacy.customRaceDate,
          customRaceName: legacy.customRaceName,
          migratedFromLocal: true,
          profile: legacy.profile,
        }
      );

      if (legacy.progressEntries.length > 0) {
        setProgressEntries(legacy.progressEntries);
        await saveCloudDailyProgressBatch(user.uid, legacy.progressEntries);
      }
      if (legacy.runs.length > 0) {
        setRuns(legacy.runs);
        await saveCloudRunsBatch(user.uid, legacy.runs);
      }

      markLocalMigrationHandled(user.uid);
      clearLegacyLocalData();
      setPendingMigration(null);
      setMigrationSuccessNotice(true);
    } finally {
      setIsMigratingLocal(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setDeleteAccountError(null);
    setIsDeletingAccount(true);
    try {
      await deleteAllCloudUserData(user.uid);
      clearLegacyLocalData();
      markLocalMigrationHandled(user.uid);
      setIsDeleteAccountOpen(false);
      await onFinalizeAccountDeletion();
    } catch {
      setDeleteAccountError(t.accountSecurity.errorNotice);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleStartFreshWorkspace = async () => {
    markLocalMigrationHandled(user.uid);
    setPendingMigration(null);
    const exists = workspaceExistsRef.current;
    workspaceExistsRef.current = true;
    await createOrUpdateUserWorkspace(user.uid, exists, {
      language: safeLang,
      customRaceDate: null,
      customRaceName: '',
      migratedFromLocal: false,
      profile: DEFAULT_RUNNER_PROFILE,
    });
  };

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

  const chartReferenceNow = useMemo(() => new Date(), []);
  const kpi = useMemo(
    () => computeKpiSummary(runs, chartReferenceNow),
    [runs, chartReferenceNow]
  );
  const weeklyBuckets = useMemo(
    () =>
      computeWeeklyChartBuckets(runs, 8, chartReferenceNow, safeLang),
    [runs, chartReferenceNow, safeLang]
  );
  const effectiveRaceDateKey =
    customRaceDate ||
    getDefaultRaceDateKey(todayInfo.dateKey, profile.targetRace);
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
    () => generateTrainingPlan(profile, kpi, safeLang, raceCountdown.status),
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
  const hrVo2Summary = useMemo(
    () => computeHeartRateAndVo2Max(profile, runs, progressEntries, safeLang),
    [profile, runs, progressEntries, safeLang]
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
    void saveCloudRunsBatch(user.uid, SAMPLE_STRAVA_RUNS);
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
    void saveCloudRunsBatch(user.uid, incoming);
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
    void saveCloudRunsBatch(user.uid, incoming);
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
    await clearAllCloudRuns(user.uid);
  };

  const handleAddDailyProgress = (entry: DailyProgressEntry) => {
    setProgressEntries((prev) => {
      const filtered = prev.filter(
        (item) =>
          !(item.dateKey === entry.dateKey && item.dayIndex === entry.dayIndex)
      );
      return [entry, ...filtered];
    });
    void saveCloudDailyProgress(user.uid, entry);
  };

  const handleRemoveDailyProgress = (dateKey: string, dayIndex: number) => {
    setProgressEntries((prev) =>
      prev.filter(
        (item) => !(item.dateKey === dateKey && item.dayIndex === dayIndex)
      )
    );
    void deleteCloudDailyProgress(user.uid, dateKey, dayIndex);
  };

  const handleSelectTab = (tabId: WorkspaceTabId) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      paceSecPerKm:
        session.zone !== 'rest' ? trainingPlan.baselinePaceSecPerKm : null,
      avgHeartRateBpm: null,
      comfortRating: 4,
      note: t.dailyProgress.quickLogDefaultNote,
      completedAt: new Date().toISOString(),
    });
    handleSelectTab('progress');
  };

  const handleSyncStravaToDailyProgress = (openProgressTab = false) => {
    if (stravaSyncMatches.length === 0) return;
    const syncedCount = stravaSyncMatches.length;
    const newEntries = buildProgressEntriesFromMatches(
      stravaSyncMatches,
      t.dailyProgress.stravaSyncedTag
    );
    const existingKeys = new Set(
      progressEntries.map((item) => `${item.dateKey}-${item.dayIndex}`)
    );
    const filteredNew = newEntries.filter(
      (item) => !existingKeys.has(`${item.dateKey}-${item.dayIndex}`)
    );

    if (filteredNew.length > 0) {
      setProgressEntries((prev) => [...filteredNew, ...prev]);
      void saveCloudDailyProgressBatch(user.uid, filteredNew);
    }

    setStravaSyncNoticeCount(syncedCount);
    if (openProgressTab) {
      handleSelectTab('progress');
    }
  };

  const sidebarItems: Array<{
    id: WorkspaceTabId;
    label: string;
    hint: string;
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  }> = [
    {
      id: 'overview',
      label: t.sidebar.items.overview.label,
      hint: t.sidebar.items.overview.hint,
      icon: LayoutDashboard,
    },
    {
      id: 'training',
      label: t.sidebar.items.training.label,
      hint: t.sidebar.items.training.hint,
      icon: CalendarCheck2,
    },
    {
      id: 'progress',
      label: t.sidebar.items.progress.label,
      hint: t.sidebar.items.progress.hint,
      icon: Flame,
    },
    {
      id: 'profile',
      label: t.sidebar.items.profile.label,
      hint: t.sidebar.items.profile.hint,
      icon: HeartPulse,
    },
    {
      id: 'nutrition',
      label: t.sidebar.items.nutrition.label,
      hint: t.sidebar.items.nutrition.hint,
      icon: Utensils,
    },
    {
      id: 'strava',
      label: t.sidebar.items.strava.label,
      hint: t.sidebar.items.strava.hint,
      icon: Activity,
    },
  ];

  const activeNavMeta =
    sidebarItems.find((item) => item.id === activeTab) ?? sidebarItems[0];

  const userInitials = getInitials(user.displayName, user.email);

  const renderSidebarNavContent = () => (
    <div className="flex flex-col h-full justify-between p-4 gap-6">
      <div className="space-y-6">
        <div className="px-2 pt-1 flex items-center justify-between gap-2">
          <div>
            <button
              type="button"
              onClick={() => handleSelectTab('overview')}
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 rounded-md"
            >
              PaceCraft
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t.sidebar.workspaceCaption}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label={t.sidebar.closeMenuAria}
            className="lg:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label={t.sidebar.ariaLabel} className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                data-testid={`sidebar-nav-${item.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                  isActive
                    ? 'bg-teal-50/90 dark:bg-teal-950/60 text-teal-950 dark:text-teal-100 border border-teal-200/80 dark:border-teal-800/70'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-teal-700 dark:text-teal-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                  aria-hidden={true}
                />
                <span className="text-sm font-semibold truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Target & Authenticated Account Block */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="px-2 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {t.hero.raceTargetLabel}
          </span>
          <span className="font-mono tabular-nums font-bold text-teal-800 dark:text-teal-300">
            {profile.targetRace} · {profile.trainingDaysPerWeek}{' '}
            {t.hero.daysPerWeekUnit}
          </span>
        </div>

        <div
          data-testid="sidebar-account-card"
          className="rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 p-3 space-y-2.5"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {user.photoURL && !avatarLoadError ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'Runner avatar'}
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                onError={() => setAvatarLoadError(true)}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center justify-center shrink-0">
                {userInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p
                data-testid="account-display-name"
                className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate"
              >
                {user.displayName || t.auth.accountLabel}
              </p>
              {user.email && (
                <p
                  data-testid="account-email"
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                >
                  {user.email}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onSignOut()}
            disabled={authBusy}
            data-testid="sign-out-btn"
            className="w-full min-h-[36px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-700 dark:hover:text-rose-300 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{authBusy ? t.auth.signingOutBtn : t.auth.signOutBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 sticky top-0 h-screen overflow-y-auto">
        {renderSidebarNavContent()}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex bg-slate-900/35 dark:bg-black/70 backdrop-blur-[1px]"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t.sidebar.ariaLabel}
            className="w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarNavContent()}
          </aside>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Contextual Top Workspace Header */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-[#F7F9FA]/95 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label={t.sidebar.openMenuAria}
              data-testid="mobile-menu-btn"
              className="lg:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 shrink-0"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <button
                type="button"
                onClick={() => handleSelectTab('overview')}
                className="font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
              >
                PaceCraft
              </button>
              <ChevronRight
                className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0"
                aria-hidden="true"
              />
              <span
                data-testid="active-tab-heading"
                className="font-bold text-slate-900 dark:text-slate-100 truncate"
              >
                {activeNavMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle lang={safeLang} testId="workspace-theme-toggle" />

            <div
              role="group"
              aria-label={t.nav.languageGroupLabel}
              data-testid="language-switcher"
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            >
              <Languages
                className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 ml-1.5 mr-0.5 shrink-0"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setLangAndSync('id')}
                data-testid="lang-btn-id"
                aria-pressed={safeLang === 'id'}
                className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                  safeLang === 'id'
                    ? 'bg-teal-700 dark:bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t.nav.idButton}
              </button>
              <button
                type="button"
                onClick={() => setLangAndSync('en')}
                data-testid="lang-btn-en"
                aria-pressed={safeLang === 'en'}
                className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 ${
                  safeLang === 'en'
                    ? 'bg-teal-700 dark:bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t.nav.enButton}
              </button>
            </div>

            {activeTab !== 'progress' && (
              <button
                type="button"
                onClick={() => handleSelectTab('progress')}
                className="hidden sm:inline-flex min-h-[40px] px-4 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
              >
                {t.overview.quickLogBtn}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        {/* Focused Single-Feature Viewport */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-5">
          {/* First-Login Local Data Migration Offer */}
          {cloudWorkspaceReady && pendingMigration && (
            <div
              data-testid="local-migration-banner"
              className="rounded-2xl bg-[#EEF2FB] dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <CloudDownload
                  className="w-5 h-5 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.migration.title}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.migration.desc(
                      pendingMigration.runs.length,
                      pendingMigration.progressEntries.length
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => void handleImportLocalToCloud()}
                  disabled={isMigratingLocal}
                  data-testid="migration-import-btn"
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 disabled:opacity-60 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
                >
                  {isMigratingLocal
                    ? t.migration.importingBtn
                    : t.migration.importBtn}
                </button>
                <button
                  type="button"
                  onClick={() => void handleStartFreshWorkspace()}
                  disabled={isMigratingLocal}
                  data-testid="migration-fresh-btn"
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
                >
                  {t.migration.startFreshBtn}
                </button>
              </div>
            </div>
          )}

          {migrationSuccessNotice && (
            <div
              data-testid="migration-success-notice"
              className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span>{t.migration.importedNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setMigrationSuccessNotice(false)}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-100 p-1 rounded-lg"
                aria-label={t.detailModal.closeAria}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <motion.div
            key={activeTab}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <div data-testid="overview-panel" className="space-y-6">
                {/* Calm Pastel Hero Card */}
                <section className="rounded-2xl bg-gradient-to-br from-[#EAF6F3] via-[#F4F8FB] to-[#EEF2FB] dark:from-teal-950/60 dark:via-slate-900 dark:to-indigo-950/50 border border-teal-100/90 dark:border-teal-800/60 p-6 sm:p-8 space-y-6">
                  <RaceCountdown
                    targetRace={profile.targetRace}
                    countdown={raceCountdown}
                    customRaceName={customRaceName}
                    hasCustomDate={Boolean(customRaceDate)}
                    lang={safeLang}
                    onChangeRaceName={(name) => setRaceNameAndSync(name)}
                    onChangeRaceDate={(dateKey) =>
                      setRaceDateAndSync(dateKey || null)
                    }
                    onResetRaceMeta={() => {
                      setRaceDateAndSync(null);
                      setRaceNameAndSync('');
                    }}
                  />

                  <div className="pt-4 border-t border-teal-200/60 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight text-balance">
                      {t.overview.greetingTitle}
                    </h1>

                    <button
                      type="button"
                      onClick={() => handleSelectTab('training')}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <CalendarCheck2 className="w-4 h-4" aria-hidden="true" />
                      {t.overview.quickPlanBtn}
                    </button>
                  </div>
                </section>

                {/* 4 Clean Summary Cards Linking Into Sidebar Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Training Plan */}
                  <button
                    type="button"
                    onClick={() => handleSelectTab('training')}
                    data-testid="overview-card-training"
                    className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-teal-300 dark:hover:border-teal-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t.overview.cards.trainingTitle}
                        </p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
                          {profile.targetRace} · {profile.trainingDaysPerWeek}{' '}
                          {t.hero.daysPerWeekUnit}
                        </p>
                      </div>
                      <CalendarCheck2
                        className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDecimalComma(
                          trainingPlan.totalPlannedWeekKm,
                          1,
                          safeLang
                        )}{' '}
                        km · {formatPace(trainingPlan.baselinePaceSecPerKm)}
                      </span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 whitespace-nowrap">
                        {t.overview.cards.trainingAction}
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </button>

                  {/* Card 2: Weekly Progress */}
                  <button
                    type="button"
                    onClick={() => handleSelectTab('progress')}
                    data-testid="overview-card-progress"
                    className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-teal-300 dark:hover:border-teal-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t.overview.cards.progressTitle}
                        </p>
                        <p
                          data-testid="hero-volume-progress-text"
                          className="text-xl font-bold text-teal-700 dark:text-teal-400 font-mono tabular-nums mt-1"
                        >
                          {formatDecimalComma(
                            dailyProgressStats.totalLoggedKm,
                            1,
                            safeLang
                          )}{' '}
                          km ({volumeProgressPct}%)
                        </p>
                      </div>
                      <Flame
                        className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <div
                      role="progressbar"
                      aria-label={t.hero.progressBarAria}
                      aria-valuenow={volumeProgressPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      data-testid="hero-volume-progress-bar"
                      className="h-2 w-full rounded-full bg-teal-100/90 dark:bg-teal-950 overflow-hidden"
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
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {dailyProgressStats.completedThisWeekCount}/
                        {dailyProgressStats.plannedRunSessionsCount}{' '}
                        {t.hero.sessionsUnit} · {dailyProgressStats.currentStreakDays}{' '}
                        {t.dailyProgress.daysUnit}
                      </span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 whitespace-nowrap">
                        {t.overview.cards.progressAction}
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </button>

                  {/* Card 3: Profile, BMI & VO2max */}
                  <button
                    type="button"
                    onClick={() => handleSelectTab('profile')}
                    data-testid="overview-card-profile"
                    className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-teal-300 dark:hover:border-teal-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t.overview.cards.profileTitle}
                        </p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
                          BMI {bmiResult.formattedBmi} · VO2{' '}
                          {formatDecimalComma(hrVo2Summary.vo2Max, 1, safeLang)}
                        </p>
                      </div>
                      <HeartPulse
                        className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-600 dark:text-slate-300">
                        {bmiResult.categoryLabel} · {hrVo2Summary.vo2MaxCategory}
                      </span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 whitespace-nowrap">
                        {t.overview.cards.profileAction}
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </button>

                  {/* Card 4: Nutrition */}
                  <button
                    type="button"
                    onClick={() => handleSelectTab('nutrition')}
                    data-testid="overview-card-nutrition"
                    className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-teal-300 dark:hover:border-teal-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t.overview.cards.nutritionTitle}
                        </p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
                          {nutritionRecommendation.carbsMinG}–
                          {nutritionRecommendation.carbsMaxG} g ·{' '}
                          {nutritionRecommendation.proteinMinG}–
                          {nutritionRecommendation.proteinMaxG} g
                        </p>
                      </div>
                      <Utensils
                        className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDecimalComma(
                          nutritionRecommendation.hydrationLitersMin,
                          1,
                          safeLang
                        )}
                        –
                        {formatDecimalComma(
                          nutritionRecommendation.hydrationLitersMax,
                          1,
                          safeLang
                        )}{' '}
                        L {t.nutrition.hydrationLabel}
                      </span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 whitespace-nowrap">
                        {t.overview.cards.nutritionAction}
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </button>
                </div>

                {/* Quiet Strava quick-start banner if no runs yet */}
                {runs.length === 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {t.overview.stravaEmptyBanner}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleLoadSampleData}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/70 text-teal-900 dark:text-teal-200 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                        {t.overview.stravaLoadSampleShort}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'training' && (
              <TrainingPlanSection
                profile={profile}
                plan={trainingPlan}
                progressEntries={progressEntries}
                countdownDaysRemaining={raceCountdown.daysRemaining}
                raceEventLabel={raceEventLabel}
                lang={safeLang}
                onChangeProfile={setProfileAndSync}
                onQuickLogSession={handleQuickLogSession}
              />
            )}

            {activeTab === 'progress' && (
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
                hrVo2={hrVo2Summary}
                raceEventLabel={raceEventLabel}
                lang={safeLang}
                onSelectDayIndex={setSelectedDayIndex}
                onAddEntry={handleAddDailyProgress}
                onRemoveEntry={handleRemoveDailyProgress}
                onSyncStravaProgress={() =>
                  handleSyncStravaToDailyProgress(false)
                }
              />
            )}

            {activeTab === 'profile' && (
              <ProfileBmiCalculator
                profile={profile}
                bmiResult={bmiResult}
                hrVo2={hrVo2Summary}
                lang={safeLang}
                onChangeProfile={setProfileAndSync}
                onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
                onOpenDeleteAccountModal={() => {
                  setDeleteAccountError(null);
                  setIsDeleteAccountOpen(true);
                }}
              />
            )}

            {activeTab === 'nutrition' && (
              <NutritionRecoverySection
                nutrition={nutritionRecommendation}
                lang={safeLang}
              />
            )}

            {activeTab === 'strava' && (
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
                onSyncStravaToProgress={() =>
                  handleSyncStravaToDailyProgress(true)
                }
                onOpenDisconnectModal={() => setIsDisconnectOpen(true)}
                onSelectActivity={setSelectedActivity}
              />
            )}
          </motion.div>
        </main>
      </div>

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

      <PrivacyTermsModal
        isOpen={isPrivacyOpen}
        lang={safeLang}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        isDeleting={isDeletingAccount}
        errorMessage={deleteAccountError}
        lang={safeLang}
        onCancel={() => {
          if (!isDeletingAccount) setIsDeleteAccountOpen(false);
        }}
        onConfirmDelete={handleConfirmDeleteAccount}
      />
    </div>
  );
}
