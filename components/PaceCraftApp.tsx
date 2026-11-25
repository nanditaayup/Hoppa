'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  CloudDownload,
  Flame,
  Gauge,
  HeartPulse,
  Languages,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Sparkles,
  Timer,
  Utensils,
  X,
} from 'lucide-react';
import { SAMPLE_STRAVA_RUNS } from '@/lib/strava/config';
import { buildDemoWorkspaceSnapshot } from '@/lib/strava/demo-data';
import { mergeAndDeduplicateRuns } from '@/lib/strava/import-parser';
import {
  buildProgressEntriesFromMatches,
  calculateBmi,
  computeAdaptivePlanAdjustment,
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
  BackupPayloadV1,
  DailyProgressEntry,
  DailySessionPlan,
  RunActivity,
  RunnerProfile,
  WorkspaceTabId,
} from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { buildBackupPayload } from '@/lib/strava/backup';
import { getProfilePersonalBests } from '@/lib/strava/personal-bests';
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
  restoreCloudBackup,
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
import MonthlyIntensityCalendar from './MonthlyIntensityCalendar';
import StravaDashboard from './StravaDashboard';
import { ImportSourceKind } from './ImportActivitiesPanel';
import ActivityDetailModal from './ActivityDetailModal';
import DisconnectModal from './DisconnectModal';
import OnboardingWizardModal from './OnboardingWizardModal';
import PrivacyTermsModal from './PrivacyTermsModal';
import { OfflineIndicator, PWAInstallButton } from './PWAInstallButton';
import DeleteAccountModal from './DeleteAccountModal';
import ThemeToggle from './ThemeToggle';

interface PaceCraftAppProps {
  user: User | null;
  initialPreferredLang: AppLanguage;
  authBusy: boolean;
  isOwnerAdmin?: boolean;
  isDemoMode?: boolean;
  onExitDemo?: (goToSignIn?: boolean) => void;
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

function formatReadableTodayDate(dateKey: string, lang: AppLanguage): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return dateKey;
  }
  const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(utcDate);
}

function noopSubscribe() {
  return () => {};
}

function readAutostartParam(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
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
  isOwnerAdmin = false,
  isDemoMode = false,
  onExitDemo,
  onSignOut,
  onFinalizeAccountDeletion,
}: PaceCraftAppProps) {
  const [initialDemoSnapshot] = useState(() =>
    isDemoMode
      ? buildDemoWorkspaceSnapshot(
          getLocalTodayKeyAndDayIndex().dateKey,
          initialPreferredLang
        )
      : null
  );

  const [runs, setRuns] = useState<RunActivity[]>(
    () => initialDemoSnapshot?.runs ?? []
  );
  const [profile, setProfile] = useState<RunnerProfile>(
    () => initialDemoSnapshot?.profile ?? DEFAULT_RUNNER_PROFILE
  );
  const [progressEntries, setProgressEntries] = useState<DailyProgressEntry[]>(
    () => initialDemoSnapshot?.progressEntries ?? []
  );
  const [lang, setLangState] = useState<AppLanguage>(initialPreferredLang);
  const [customRaceDate, setCustomRaceDateState] = useState<string | null>(
    () => initialDemoSnapshot?.customRaceDate ?? null
  );
  const [customRaceName, setCustomRaceNameState] = useState<string>(
    () => initialDemoSnapshot?.customRaceName ?? ''
  );
  const [migratedFromLocal, setMigratedFromLocal] = useState(false);

  const [cloudWorkspaceReady, setCloudWorkspaceReady] = useState(isDemoMode);
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
  const [wizardManuallyOpened, setWizardManuallyOpened] = useState(false);
  const [wizardDismissedThisSession, setWizardDismissedThisSession] =
    useState(false);
  const hasAutostartParam = useSyncExternalStore(
    noopSubscribe,
    readAutostartParam,
    () => false
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
  const [manualFatigueMode, setManualFatigueMode] = useState(false);

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

  // Subscribe to per-user Firestore collections (bypassed completely in Demo Mode)
  useEffect(() => {
    if (isDemoMode || !user) return;
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
            latestWorkspaceRef.current = {
              language: cloudState.language,
              customRaceDate: cloudState.customRaceDate,
              customRaceName: cloudState.customRaceName,
              migratedFromLocal: cloudState.migratedFromLocal,
              profile: cloudState.profile,
            };
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
  }, [user, isDemoMode, initialPreferredLang]);

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
      if (isDemoMode || !user) return;
      lastWorkspaceWriteAtRef.current = Date.now();
      if (workspaceWriteTimerRef.current) {
        clearTimeout(workspaceWriteTimerRef.current);
      }

      const uid = user.uid;
      const executeWrite = () => {
        const exists = workspaceExistsRef.current;
        workspaceExistsRef.current = true;
        void createOrUpdateUserWorkspace(
          uid,
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
    [user, isDemoMode]
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
    if (isDemoMode || !user || !pendingMigration || isMigratingLocal) return;
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
    if (isDemoMode || !user) return;
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
    if (isDemoMode || !user) return;
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
        todayInfo.dateKey,
        safeLang
      ),
    [runs, trainingPlan.weeklySchedule, progressEntries, todayInfo.dateKey, safeLang]
  );
  const adaptiveAdjustment = useMemo(
    () =>
      computeAdaptivePlanAdjustment({
        weeklySchedule: trainingPlan.weeklySchedule,
        progressEntries,
        dailyStats: dailyProgressStats,
        todayDateKey: todayInfo.dateKey,
        todayDayIndex: todayInfo.dayIndex,
        manualFatigueMode,
        lang: safeLang,
      }),
    [
      trainingPlan.weeklySchedule,
      progressEntries,
      dailyProgressStats,
      todayInfo.dateKey,
      todayInfo.dayIndex,
      manualFatigueMode,
      safeLang,
    ]
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
  const todaySession =
    trainingPlan.weeklySchedule.find(
      (s) => s.dayIndex === todayInfo.dayIndex
    ) ?? trainingPlan.weeklySchedule[0];
  const isTodayLogged = progressEntries.some(
    (e) => e.dateKey === todayInfo.dateKey
  );
  const volumeProgressRatio =
    trainingPlan.totalPlannedWeekKm > 0 && dailyProgressStats.totalLoggedKm > 0
      ? Math.min(
          1,
          dailyProgressStats.totalLoggedKm / trainingPlan.totalPlannedWeekKm
        )
      : Math.min(1, dailyProgressStats.completionPct / 100);
  const volumeProgressPct = dailyProgressStats.actualVsPlannedPct;

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
    if (!isDemoMode && user) {
      void saveCloudRunsBatch(user.uid, SAMPLE_STRAVA_RUNS);
    }
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
    if (!isDemoMode && user) {
      void saveCloudRunsBatch(user.uid, incoming);
    }
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
    if (!isDemoMode && user) {
      void saveCloudRunsBatch(user.uid, incoming);
    }
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
    if (!isDemoMode && user) {
      await clearAllCloudRuns(user.uid);
    }
  };

  const handleAddDailyProgress = (entry: DailyProgressEntry) => {
    setProgressEntries((prev) => {
      const filtered = prev.filter(
        (item) =>
          !(item.dateKey === entry.dateKey && item.dayIndex === entry.dayIndex)
      );
      return [entry, ...filtered];
    });
    if (!isDemoMode && user) {
      void saveCloudDailyProgress(user.uid, entry);
    }
  };

  const handleRemoveDailyProgress = (dateKey: string, dayIndex: number) => {
    setProgressEntries((prev) =>
      prev.filter(
        (item) => !(item.dateKey === dateKey && item.dayIndex === dayIndex)
      )
    );
    if (!isDemoMode && user) {
      void deleteCloudDailyProgress(user.uid, dateKey, dayIndex);
    }
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
      if (!isDemoMode && user) {
        void saveCloudDailyProgressBatch(user.uid, filteredNew);
      }
    }

    setStravaSyncNoticeCount(syncedCount);
    if (openProgressTab) {
      handleSelectTab('progress');
    }
  };

  const handleExportBackup = () => {
    const payload = buildBackupPayload({
      language: safeLang,
      customRaceDate,
      customRaceName,
      profile,
      progressEntries,
      runs,
    });
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pacecraft-backup-${todayInfo.dateKey}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = async (backup: BackupPayloadV1) => {
    setProfile(backup.profile);
    setLangState(backup.language);
    setCustomRaceDateState(backup.customRaceDate);
    setCustomRaceNameState(backup.customRaceName);
    if (backup.progressEntries.length > 0) {
      setProgressEntries(backup.progressEntries);
    }
    if (backup.runs.length > 0) {
      setRuns(backup.runs);
    }
    if (!isDemoMode && user) {
      const exists = workspaceExistsRef.current;
      workspaceExistsRef.current = true;
      await restoreCloudBackup(user.uid, exists, backup);
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

  const userInitials = isDemoMode
    ? 'DM'
    : getInitials(user?.displayName ?? null, user?.email ?? null);

  const renderSidebarNavContent = () => (
    <div className="flex flex-col h-full justify-between p-4 gap-6">
      <div className="space-y-6">
        <div className="px-2 pt-1 flex items-center justify-between gap-2">
          <div>
            <button
              type="button"
              onClick={() => handleSelectTab('overview')}
              className="text-xl font-bold tracking-tight text-[#202A2A] dark:text-slate-100 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 rounded-md"
            >
              PaceCraft
            </button>
            <p className="text-[11px] text-[#596866] dark:text-slate-400 mt-0.5">
              {t.sidebar.workspaceCaption}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label={t.sidebar.closeMenuAria}
            className="lg:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-[#596866] dark:text-slate-400 hover:bg-[#F7F6F2] dark:hover:bg-slate-800"
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
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                  isActive
                    ? 'bg-[#E6F3EE] dark:bg-teal-950/60 text-[#202A2A] dark:text-teal-100'
                    : 'text-[#596866] dark:text-slate-300 hover:bg-[#F7F6F2] dark:hover:bg-slate-800/70 hover:text-[#202A2A] dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isActive
                      ? 'text-[#087F73] dark:text-teal-400'
                      : 'text-[#596866] dark:text-slate-500'
                  }`}
                  aria-hidden={true}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold truncate">
                    {item.label}
                  </span>
                  <span
                    className={`block text-[11px] truncate mt-0.5 ${
                      isActive
                        ? 'text-[#087F73] dark:text-teal-300/85'
                        : 'text-[#596866] dark:text-slate-400'
                    }`}
                  >
                    {item.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Target & Authenticated Account Block */}
      <div className="space-y-3 pt-4 border-t border-[#DFE7E2] dark:border-slate-800">
        <div className="px-2 flex items-center justify-between text-xs">
          <span className="text-[#596866] dark:text-slate-400">
            {t.hero.raceTargetLabel}
          </span>
          <span className="font-semibold text-[#087F73] dark:text-teal-300">
            {profile.targetRace} · {profile.trainingDaysPerWeek}{' '}
            {t.hero.daysPerWeekUnit}
          </span>
        </div>

        <div
          data-testid="sidebar-account-card"
          className="rounded-xl bg-[#F7F6F2] dark:bg-slate-800/70 border border-[#DFE7E2] dark:border-slate-700 p-3 space-y-2.5"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {!isDemoMode && user?.photoURL && !avatarLoadError ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'Runner avatar'}
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                onError={() => setAvatarLoadError(true)}
                className="w-8 h-8 rounded-full object-cover border border-[#DFE7E2] dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#E6F3EE] dark:bg-teal-900/60 text-[#087F73] dark:text-teal-200 text-xs font-bold flex items-center justify-center shrink-0">
                {userInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p
                data-testid="account-display-name"
                className="text-xs font-semibold text-[#202A2A] dark:text-slate-100 truncate"
              >
                {isDemoMode
                  ? t.demoMode.sidebarName
                  : user?.displayName || t.auth.accountLabel}
              </p>
              <p
                data-testid="account-email"
                className="text-[11px] text-[#596866] dark:text-slate-400 truncate"
              >
                {isDemoMode
                  ? t.demoMode.sidebarEmail
                  : user?.email || ''}
              </p>
            </div>
          </div>

          {isDemoMode ? (
            <button
              type="button"
              onClick={() => onExitDemo?.(false)}
              data-testid="exit-demo-btn"
              className="w-full min-h-[36px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] hover:text-[#087F73] dark:hover:text-teal-300 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t.demoMode.exitSidebarBtn}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onSignOut()}
              disabled={authBusy}
              data-testid="sign-out-btn"
              className="w-full min-h-[36px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-700 dark:hover:text-rose-300 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{authBusy ? t.auth.signingOutBtn : t.auth.signOutBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F6F2] dark:bg-slate-950 text-[#202A2A] dark:text-slate-100">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-[#DFE7E2] dark:border-slate-800 sticky top-0 h-screen overflow-y-auto">
        {renderSidebarNavContent()}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex bg-[#202A2A]/35 dark:bg-black/70 backdrop-blur-[1px]"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t.sidebar.ariaLabel}
            className="w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full border-r border-[#DFE7E2] dark:border-slate-800 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarNavContent()}
          </aside>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Contextual Top Workspace Header */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-[#F7F6F2]/95 dark:bg-slate-950/90 backdrop-blur-sm border-b border-[#DFE7E2] dark:border-slate-800 px-3 sm:px-8 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label={t.sidebar.openMenuAria}
              data-testid="mobile-menu-btn"
              className="lg:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-[#DFE7E2] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] dark:hover:border-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 shrink-0"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-sm min-w-0 flex-1">
              <button
                type="button"
                onClick={() => handleSelectTab('overview')}
                className="hidden sm:inline font-semibold text-[#596866] dark:text-slate-400 hover:text-[#202A2A] dark:hover:text-slate-100 whitespace-nowrap"
              >
                PaceCraft
              </button>
              <ChevronRight
                className="hidden sm:inline w-4 h-4 text-[#596866] dark:text-slate-500 shrink-0"
                aria-hidden="true"
              />
              <span
                data-testid="active-tab-heading"
                className="font-bold text-[#202A2A] dark:text-slate-100 truncate"
              >
                {activeNavMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <ThemeToggle lang={safeLang} testId="workspace-theme-toggle" />

            <div
              role="group"
              aria-label={t.nav.languageGroupLabel}
              data-testid="language-switcher"
              className="inline-flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-700"
            >
              <Languages
                className="hidden sm:inline w-3.5 h-3.5 text-[#087F73] dark:text-teal-400 ml-1.5 mr-0.5 shrink-0"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setLangAndSync('id')}
                data-testid="lang-btn-id"
                aria-pressed={safeLang === 'id'}
                className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                  safeLang === 'id'
                    ? 'bg-[#087F73] dark:bg-teal-600 text-white'
                    : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-slate-100'
                }`}
              >
                {t.nav.idButton}
              </button>
              <button
                type="button"
                onClick={() => setLangAndSync('en')}
                data-testid="lang-btn-en"
                aria-pressed={safeLang === 'en'}
                className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                  safeLang === 'en'
                    ? 'bg-[#087F73] dark:bg-teal-600 text-white'
                    : 'text-[#596866] dark:text-slate-300 hover:text-[#202A2A] dark:hover:text-slate-100'
                }`}
              >
                {t.nav.enButton}
              </button>
            </div>

            {activeTab !== 'progress' && (
              <button
                type="button"
                onClick={() => handleSelectTab('progress')}
                className="hidden sm:inline-flex min-h-[40px] px-4 py-2 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
              >
                {t.overview.quickLogBtn}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        {/* Focused Single-Feature Viewport */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-6">
          <OfflineIndicator lang={safeLang} />

          {isDemoMode && (
            <div
              data-testid="demo-mode-banner"
              className="rounded-2xl bg-[#E6F3EE] dark:bg-teal-950/60 border border-[#DFE7E2] dark:border-teal-800 px-4 sm:px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E9957D] text-[#202A2A] text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{t.demoMode.badge}</span>
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#202A2A] dark:text-slate-100">
                  {t.demoMode.title}
                </p>
                <p className="text-xs text-[#596866] dark:text-slate-300 leading-relaxed">
                  {t.demoMode.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onExitDemo?.(true)}
                  data-testid="demo-signin-cta"
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
                >
                  {t.demoMode.signInCta}
                </button>
                <button
                  type="button"
                  onClick={() => onExitDemo?.(false)}
                  data-testid="demo-back-home-btn"
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
                >
                  {t.demoMode.backHomeBtn}
                </button>
              </div>
            </div>
          )}

          {/* Mobile 1-Tap Quick Tab Bar */}
          <nav
            aria-label={t.nav.mobileAriaLabel}
            data-testid="mobile-quick-tabs"
            className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  data-testid={`mobile-tab-${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 ${
                    isActive
                      ? 'bg-[#087F73] dark:bg-teal-600 border-[#087F73] dark:border-teal-500 text-white'
                      : 'bg-white dark:bg-slate-900 border-[#DFE7E2] dark:border-slate-800 text-[#202A2A] dark:text-slate-200 hover:border-[#087F73] dark:hover:border-teal-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden={true} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* First-Login Local Data Migration Offer */}
          {cloudWorkspaceReady && pendingMigration && (
            <div
              data-testid="local-migration-banner"
              className="rounded-2xl bg-[#E6F3EE] dark:bg-teal-950/50 border border-[#DFE7E2] dark:border-teal-800/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <CloudDownload
                  className="w-5 h-5 text-[#087F73] dark:text-teal-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#202A2A] dark:text-slate-100">
                    {t.migration.title}
                  </p>
                  <p className="text-xs sm:text-sm text-[#596866] dark:text-slate-300 leading-relaxed">
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
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 disabled:opacity-60 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
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
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-xs font-semibold text-[#202A2A] dark:text-slate-200 hover:bg-[#F7F6F2] dark:hover:bg-slate-700 disabled:opacity-60 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400"
                >
                  {t.migration.startFreshBtn}
                </button>
              </div>
            </div>
          )}

          {migrationSuccessNotice && (
            <div
              data-testid="migration-success-notice"
              className="rounded-xl bg-[#E6F3EE] dark:bg-emerald-950/50 border border-[#DFE7E2] dark:border-emerald-800/70 px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#202A2A] dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-[#087F73] dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span>{t.migration.importedNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setMigrationSuccessNotice(false)}
                className="text-[#087F73] dark:text-emerald-400 hover:text-[#202A2A] dark:hover:text-emerald-100 p-1 rounded-lg"
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
                {/* 1. Primary Hero: Warm Sport Today's Workout Centerpiece */}
                {(() => {
                  const formattedTodayDate = formatReadableTodayDate(
                    todayInfo.dateKey,
                    safeLang
                  );
                  const warmHeadline =
                    todaySession.zone === 'easy'
                      ? t.overview.todayWarmHeadlines.easy
                      : todaySession.zone === 'tempo'
                        ? t.overview.todayWarmHeadlines.tempo
                        : todaySession.zone === 'interval'
                          ? t.overview.todayWarmHeadlines.interval
                          : todaySession.zone === 'long_run'
                            ? t.overview.todayWarmHeadlines.long
                            : t.overview.todayWarmHeadlines.rest;

                  const ZoneWarmIcon =
                    todaySession.zone === 'easy' || todaySession.zone === 'rest'
                      ? Leaf
                      : todaySession.zone === 'tempo' ||
                          todaySession.zone === 'interval'
                        ? Gauge
                        : Timer;

                  return (
                    <section
                      data-testid="overview-today-hero"
                      className="rounded-2xl bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 p-6 sm:p-8 space-y-5"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#596866] dark:text-slate-300">
                          <span className="font-semibold text-[#202A2A] dark:text-slate-100">
                            {formattedTodayDate}
                          </span>
                          {todaySession.zone !== 'rest' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#E6F3EE] dark:bg-teal-950/70 text-[#202A2A] dark:text-teal-200 font-medium">
                                {t.training.zoneLabels[todaySession.zone]}
                              </span>
                            </>
                          )}
                          {isTodayLogged && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E9957D] text-[#202A2A] font-semibold">
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                              {t.overview.todayDoneBadge}
                            </span>
                          )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-[#202A2A] dark:text-slate-100 tracking-tight flex items-center gap-2.5 flex-wrap">
                          <span>{warmHeadline}</span>
                          <ZoneWarmIcon
                            className="w-6 h-6 text-[#087F73] dark:text-teal-400 shrink-0"
                            aria-hidden="true"
                          />
                        </h1>

                        {todaySession.zone === 'rest' ? (
                          <p className="text-sm sm:text-base text-[#596866] dark:text-slate-300 leading-relaxed max-w-2xl">
                            {t.overview.todayRestDesc}
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-base sm:text-lg font-semibold text-[#202A2A] dark:text-slate-100">
                              {formatDecimalComma(todaySession.targetDistanceKm, 1, safeLang)}{' '}
                              km · {t.overview.paceGuidePrefix}{' '}
                              <span className="font-mono tabular-nums font-bold text-[#087F73] dark:text-teal-300">
                                {todaySession.paceRange}
                              </span>
                            </p>
                            <p className="text-sm text-[#596866] dark:text-slate-300 leading-relaxed max-w-2xl">
                              {todaySession.guidance}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleSelectTab('training')}
                          data-testid="overview-today-view-workout-btn"
                          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-sm font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                        >
                          <CalendarCheck2 className="w-4 h-4" aria-hidden="true" />
                          {t.overview.todayLookWorkoutBtn}
                        </button>

                        {!isTodayLogged && todaySession.zone !== 'rest' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickLogSession(todaySession)}
                            data-testid="overview-today-quicklog-btn"
                            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 text-sm font-semibold hover:bg-[#E6F3EE] hover:border-[#087F73] dark:hover:border-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#087F73]" aria-hidden="true" />
                            {t.overview.todayQuickLogBtn}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectTab('progress')}
                            data-testid="overview-today-progress-btn"
                            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DFE7E2] dark:border-slate-700 text-[#202A2A] dark:text-slate-100 text-sm font-semibold hover:bg-[#E6F3EE] hover:border-[#087F73] dark:hover:border-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                          >
                            <Flame className="w-4 h-4 text-[#087F73]" aria-hidden="true" />
                            {t.overview.todayViewProgressBtn}
                          </button>
                        )}
                      </div>

                      {adaptiveAdjustment.triggered && (
                        <div
                          role="status"
                          data-testid="overview-adaptive-notice"
                          className="pt-4 border-t border-[#DFE7E2] dark:border-slate-800 flex items-start gap-2.5 text-xs text-[#202A2A] dark:text-amber-100"
                        >
                          <AlertTriangle
                            className="w-4 h-4 text-rose-700 dark:text-amber-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-bold">{adaptiveAdjustment.headline}</p>
                            <p className="leading-relaxed text-[#596866] dark:text-slate-300">
                              {adaptiveAdjustment.nextSessionAction}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-[#DFE7E2] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-[#596866] dark:text-slate-400">
                        <span>
                          {t.overview.activePlanLabel}:{' '}
                          <strong className="font-semibold text-[#202A2A] dark:text-slate-100">
                            {profile.targetRace} · {profile.trainingDaysPerWeek}{' '}
                            {t.hero.daysPerWeekUnit}
                          </strong>
                        </span>
                        <span>
                          {todaySession.title}
                        </span>
                      </div>
                    </section>
                  );
                })()}

                {/* 2. Weekly Progress Summary (Single White Card, Hairline Dividers, Zero Nested Boxes) */}
                <section
                  data-testid="overview-card-progress"
                  className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Flame
                        className="w-4 h-4 text-[#087F73] dark:text-teal-400 shrink-0"
                        aria-hidden="true"
                      />
                      <h2 className="text-sm font-bold text-[#202A2A] dark:text-slate-100">
                        {t.overview.cards.progressTitle}
                      </h2>
                      {volumeProgressPct >= 100 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E9957D] text-[#202A2A] text-[11px] font-bold">
                          100%+
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectTab('progress')}
                      className="text-xs font-semibold text-[#087F73] dark:text-teal-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      {t.overview.cards.progressAction}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#DFE7E2] dark:divide-slate-800">
                    <div className="pb-3 sm:pb-0 sm:pr-5 space-y-1">
                      <p className="text-xs text-[#596866] dark:text-slate-400">
                        {t.overview.weeklyProgressRunSessions}
                      </p>
                      <p className="text-xl font-bold text-[#202A2A] dark:text-slate-100">
                        {dailyProgressStats.completedThisWeekCount}/
                        {dailyProgressStats.plannedRunSessionsCount}{' '}
                        <span className="text-xs font-semibold text-[#087F73] dark:text-teal-400">
                          ({dailyProgressStats.completionPct}%)
                        </span>
                      </p>
                    </div>

                    <div className="py-3 sm:py-0 sm:px-5 space-y-1">
                      <p className="text-xs text-[#596866] dark:text-slate-400">
                        {t.overview.weeklyProgressDistance}
                      </p>
                      <p
                        data-testid="hero-volume-progress-text"
                        className="text-xl font-bold text-[#087F73] dark:text-teal-400"
                      >
                        {formatDecimalComma(
                          dailyProgressStats.totalLoggedKm,
                          1,
                          safeLang
                        )}{' '}
                        / {formatDecimalComma(dailyProgressStats.plannedWeekKm, 1, safeLang)}{' '}
                        km ({volumeProgressPct}%)
                      </p>
                    </div>

                    <div className="pt-3 sm:pt-0 sm:pl-5 space-y-1">
                      <p className="text-xs text-[#596866] dark:text-slate-400">
                        {t.overview.weeklyProgressCrossTrain}
                      </p>
                      <p className="text-sm font-semibold text-[#202A2A] dark:text-slate-100 mt-1">
                        {dailyProgressStats.completedCrossTrainCount} strength ·{' '}
                        {dailyProgressStats.loggedRestDaysCount} rest ·{' '}
                        {dailyProgressStats.currentStreakDays} {t.dailyProgress.daysUnit}
                      </p>
                    </div>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={t.hero.progressBarAria}
                    aria-valuenow={Math.min(100, volumeProgressPct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    data-testid="hero-volume-progress-bar"
                    className="h-2 w-full rounded-full bg-[#E6F3EE] dark:bg-teal-950 overflow-hidden"
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
                      className="h-full w-full rounded-full bg-[#087F73]"
                    />
                  </div>

                  {dailyProgressStats.isVolumeSignificantlyOverPlan && (
                    <div
                      role="status"
                      data-testid="overview-overload-caution"
                      className="pt-3 border-t border-[#DFE7E2] dark:border-slate-800 flex items-start gap-2 text-xs text-[#202A2A] dark:text-amber-100"
                    >
                      <AlertTriangle
                        className="w-4 h-4 text-rose-700 dark:text-amber-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="font-bold">
                          {t.overview.overloadAlertTitle}:{' '}
                        </span>
                        <span className="text-[#596866] dark:text-slate-200">
                          {t.overview.overloadAlertBody(
                            dailyProgressStats.actualVsPlannedPct
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </section>

                {/* 3. Race Target & Countdown (Calm Secondary Section) */}
                <section
                  data-testid="overview-countdown-section"
                  className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl p-5 sm:p-6"
                >
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
                </section>

                {/* 4. Additional Metrics (Unified Single White Card with Hairline Dividers) */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-[#596866] dark:text-slate-400 px-1">
                    {t.overview.extraMetricsHeading}
                  </h2>

                  <div className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#DFE7E2] dark:divide-slate-800 overflow-hidden">
                    {/* Cell 1: Training Plan */}
                    <button
                      type="button"
                      onClick={() => handleSelectTab('training')}
                      data-testid="overview-card-training"
                      className="text-left p-5 hover:bg-[#F7F6F2]/70 dark:hover:bg-slate-800/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-[#596866] dark:text-slate-400">
                            {t.overview.cards.trainingTitle}
                          </p>
                          <p className="text-lg font-bold text-[#202A2A] dark:text-slate-100 mt-1">
                            {profile.targetRace} · {profile.trainingDaysPerWeek}{' '}
                            {t.hero.daysPerWeekUnit}
                          </p>
                        </div>
                        <CalendarCheck2
                          className="w-5 h-5 text-[#087F73] dark:text-teal-400 shrink-0"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#596866] dark:text-slate-300">
                          {formatDecimalComma(
                            trainingPlan.totalPlannedWeekKm,
                            1,
                            safeLang
                          )}{' '}
                          km ·{' '}
                          <span className="font-mono tabular-nums text-[#202A2A] dark:text-slate-200">
                            {formatPace(trainingPlan.baselinePaceSecPerKm)}
                          </span>
                        </span>
                        <span className="font-semibold text-[#087F73] dark:text-teal-400 inline-flex items-center gap-1 whitespace-nowrap">
                          {t.overview.cards.trainingAction}
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </button>

                    {/* Cell 2: Profile, BMI & Est. VO2max */}
                    <button
                      type="button"
                      onClick={() => handleSelectTab('profile')}
                      data-testid="overview-card-profile"
                      className="text-left p-5 hover:bg-[#F7F6F2]/70 dark:hover:bg-slate-800/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-[#596866] dark:text-slate-400">
                            {t.overview.cards.profileTitle}
                          </p>
                          <p className="text-lg font-bold text-[#202A2A] dark:text-slate-100 mt-1">
                            BMI {bmiResult.formattedBmi} · {t.overview.estVo2Short}{' '}
                            {formatDecimalComma(hrVo2Summary.vo2Max, 1, safeLang)}
                          </p>
                        </div>
                        <HeartPulse
                          className="w-5 h-5 text-[#087F73] dark:text-teal-400 shrink-0"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#596866] dark:text-slate-300 truncate">
                          {bmiResult.categoryLabel} · {hrVo2Summary.vo2MaxCategory}
                        </span>
                        <span className="font-semibold text-[#087F73] dark:text-teal-400 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                          {t.overview.cards.profileAction}
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </button>

                    {/* Cell 3: Nutrition with Explicit Carbs/Protein Labels */}
                    <button
                      type="button"
                      onClick={() => handleSelectTab('nutrition')}
                      data-testid="overview-card-nutrition"
                      className="text-left p-5 hover:bg-[#F7F6F2]/70 dark:hover:bg-slate-800/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-[#596866] dark:text-slate-400">
                            {t.overview.cards.nutritionTitle}
                          </p>
                          <p className="text-sm sm:text-base font-bold text-[#202A2A] dark:text-slate-100 mt-1">
                            {t.overview.carbsShort}: {nutritionRecommendation.carbsMinG}–
                            {nutritionRecommendation.carbsMaxG} g · {t.overview.proteinShort}:{' '}
                            {nutritionRecommendation.proteinMinG}–
                            {nutritionRecommendation.proteinMaxG} g
                          </p>
                        </div>
                        <Utensils
                          className="w-5 h-5 text-[#087F73] dark:text-teal-400 shrink-0"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#596866] dark:text-slate-300 truncate">
                          {t.overview.hydrationEstPrefix}:{' '}
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
                          L
                        </span>
                        <span className="font-semibold text-[#087F73] dark:text-teal-400 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                          {t.overview.cards.nutritionAction}
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quiet Personal Best Summary Strip (if any PB saved) */}
                {(() => {
                  const savedPbs = getProfilePersonalBests(profile).filter(
                    (item) => item.seconds !== null
                  );
                  if (savedPbs.length === 0) return null;
                  return (
                    <div
                      data-testid="overview-pb-summary"
                      className="bg-white dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 text-xs font-bold text-[#202A2A] dark:text-slate-100">
                        <span className="w-6 h-6 rounded-full bg-[#E9957D] text-[#202A2A] inline-flex items-center justify-center shrink-0">
                          <Award className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                        <span>{t.personalBests.overviewLabel}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {savedPbs.map((pb) => (
                          <span
                            key={pb.key}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E6F3EE] dark:bg-slate-800 text-xs"
                          >
                            <span className="font-semibold text-[#596866] dark:text-slate-400">
                              {pb.key}
                            </span>
                            <span className="font-mono tabular-nums font-bold text-[#202A2A] dark:text-slate-100">
                              {pb.formatted}
                            </span>
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleSelectTab('profile')}
                          className="text-xs font-semibold text-[#087F73] dark:text-teal-400 hover:underline whitespace-nowrap"
                        >
                          {t.overview.cards.profileAction}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Quiet Strava quick-start banner if no runs yet */}
                {runs.length === 0 && (
                  <div className="bg-[#E6F3EE] dark:bg-slate-900 border border-[#DFE7E2] dark:border-slate-800 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-[#202A2A] dark:text-slate-300">
                      {t.overview.stravaEmptyBanner}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleLoadSampleData}
                        className="min-h-[40px] px-4 py-2 rounded-xl bg-[#087F73] dark:bg-teal-600 text-white text-xs font-semibold hover:bg-[#06685E] dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F73] dark:focus-visible:ring-teal-400 inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                        {t.overview.stravaLoadSampleShort}
                      </button>
                    </div>
                  </div>
                )}

                <PWAInstallButton
                  lang={safeLang}
                  variant="banner"
                  testId="overview-pwa-install-btn"
                />
              </div>
            )}

            {activeTab === 'training' && (
              <TrainingPlanSection
                profile={profile}
                plan={trainingPlan}
                kpi={kpi}
                adaptiveAdjustment={adaptiveAdjustment}
                manualFatigueMode={manualFatigueMode}
                onToggleManualFatigue={() =>
                  setManualFatigueMode((prev) => !prev)
                }
                progressEntries={progressEntries}
                countdownDaysRemaining={raceCountdown.daysRemaining}
                raceEventLabel={raceEventLabel}
                todayDateKey={todayInfo.dateKey}
                todayDayIndex={todayInfo.dayIndex}
                lang={safeLang}
                onChangeProfile={setProfileAndSync}
                onQuickLogSession={handleQuickLogSession}
              />
            )}

            {activeTab === 'progress' && (
              <div className="space-y-6">
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

                <MonthlyIntensityCalendar
                  entries={progressEntries}
                  runs={runs}
                  weeklySchedule={trainingPlan.weeklySchedule}
                  paceZones={trainingPlan.paceZones}
                  hrZones={hrVo2Summary.zones}
                  todayDateKey={todayInfo.dateKey}
                  lang={safeLang}
                  onJumpToLogWeekday={(dayIndex) => {
                    setSelectedDayIndex(dayIndex);
                    if (typeof document !== 'undefined') {
                      document
                        .getElementById('progres-harian')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileBmiCalculator
                profile={profile}
                bmiResult={bmiResult}
                hrVo2={hrVo2Summary}
                runs={runs}
                lang={safeLang}
                latestRunKm={
                  runs[0]
                    ? Math.round((runs[0].distanceMeters / 1000) * 10) / 10
                    : 0
                }
                isOwnerAdmin={isDemoMode ? false : isOwnerAdmin}
                firebaseUser={isDemoMode ? null : user}
                onChangeProfile={setProfileAndSync}
                onExportBackup={handleExportBackup}
                onRestoreBackup={handleRestoreBackup}
                onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
                onOpenDeleteAccountModal={
                  isDemoMode
                    ? undefined
                    : () => {
                        setDeleteAccountError(null);
                        setIsDeleteAccountOpen(true);
                      }
                }
                onReopenWizard={() => setWizardManuallyOpened(true)}
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

        {/* Health Disclaimer & App Footer */}
        <footer
          data-testid="health-disclaimer-footer"
          className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-5 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <span>{t.disclaimer.text}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
            {t.footer.right}
          </span>
        </footer>
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

      {(() => {
        const shouldAutoOpen =
          cloudWorkspaceReady &&
          !profile.onboardingCompleted &&
          !pendingMigration &&
          runs.length === 0 &&
          progressEntries.length === 0 &&
          !wizardDismissedThisSession &&
          !hasAutostartParam;
        const isWizardOpen = wizardManuallyOpened || shouldAutoOpen;
        if (!isWizardOpen) return null;
        return (
          <OnboardingWizardModal
            key={`${profile.targetRace}-${wizardManuallyOpened ? 'manual' : 'auto'}`}
            isOpen={isWizardOpen}
            lang={safeLang}
            initialProfile={profile}
            initialRaceDate={customRaceDate}
            initialRaceName={customRaceName}
            todayDateKey={todayInfo.dateKey}
            kpi={kpi}
            onComplete={({ profile: updatedProfile, raceDate, raceName }) => {
              setProfileAndSync(updatedProfile);
              setRaceDateAndSync(raceDate);
              setRaceNameAndSync(raceName);
              setWizardManuallyOpened(false);
              setWizardDismissedThisSession(true);
            }}
            onSkip={() => {
              setProfileAndSync((p) => ({ ...p, onboardingCompleted: true }));
              setWizardManuallyOpened(false);
              setWizardDismissedThisSession(true);
            }}
          />
        );
      })()}
    </div>
  );
}
