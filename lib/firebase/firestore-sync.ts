import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  DAILY_PROGRESS_STORAGE_KEY,
  IMPORTED_RUNS_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  RACE_DATE_STORAGE_KEY,
  RACE_NAME_STORAGE_KEY,
  RUNNER_PROFILE_STORAGE_KEY,
} from '@/lib/strava/config';
import {
  AppLanguage,
  DailyProgressEntry,
  InjuryStatus,
  RaceDistanceKey,
  RunActivity,
  RunActivityType,
  RunnerProfile,
  TrainingZoneType,
} from '@/lib/strava/types';
import { db, handleFirestoreError, OperationType } from './client';

export const DEFAULT_RUNNER_PROFILE: RunnerProfile = {
  weightKg: 68,
  heightCm: 170,
  directBmi: null,
  useDirectBmi: false,
  age: 29,
  injuryStatus: 'none',
  targetRace: '10K',
  trainingDaysPerWeek: 4,
  restingHrBpm: 60,
  maxHrBpm: null,
};

export interface CloudWorkspaceState {
  exists: boolean;
  language: AppLanguage;
  customRaceDate: string | null;
  customRaceName: string;
  migratedFromLocal: boolean;
  profile: RunnerProfile;
}

export interface LegacyLocalSnapshot {
  hasData: boolean;
  language: AppLanguage;
  customRaceDate: string | null;
  customRaceName: string;
  profile: RunnerProfile;
  progressEntries: DailyProgressEntry[];
  runs: RunActivity[];
}

const LOCAL_MIGRATION_DISMISSED_PREFIX = 'pacecraft_local_migration_done_';

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function sanitizeFirestoreId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `id_${Date.now()}`;
}

export function sanitizeRunnerProfile(profile: RunnerProfile): RunnerProfile {
  const injuryStatus: InjuryStatus =
    profile.injuryStatus === 'recovering' || profile.injuryStatus === 'active'
      ? profile.injuryStatus
      : 'none';
  const targetRace: RaceDistanceKey =
    profile.targetRace === '5K' ||
    profile.targetRace === '10K' ||
    profile.targetRace === '21K' ||
    profile.targetRace === '42K'
      ? profile.targetRace
      : '10K';
  const trainingDaysPerWeek: 3 | 4 | 5 | 6 =
    profile.trainingDaysPerWeek === 3 ||
    profile.trainingDaysPerWeek === 4 ||
    profile.trainingDaysPerWeek === 5 ||
    profile.trainingDaysPerWeek === 6
      ? profile.trainingDaysPerWeek
      : 4;

  const directBmi =
    typeof profile.directBmi === 'number' && Number.isFinite(profile.directBmi)
      ? Math.round(clampNumber(profile.directBmi, 10, 60, 23.5) * 10) / 10
      : null;

  const maxHrBpm =
    typeof profile.maxHrBpm === 'number' && Number.isFinite(profile.maxHrBpm)
      ? Math.round(clampNumber(profile.maxHrBpm, 120, 230, 188))
      : null;

  return {
    weightKg: Math.round(clampNumber(profile.weightKg, 30, 200, 68) * 10) / 10,
    heightCm: Math.round(clampNumber(profile.heightCm, 120, 230, 170) * 10) / 10,
    directBmi,
    useDirectBmi: Boolean(profile.useDirectBmi),
    age: Math.round(clampNumber(profile.age, 12, 100, 29)),
    injuryStatus,
    targetRace,
    trainingDaysPerWeek,
    restingHrBpm: Math.round(
      clampNumber(profile.restingHrBpm ?? 60, 35, 110, 60)
    ),
    maxHrBpm,
  };
}

export function sanitizeRaceDateString(dateKey: string | null | undefined): string {
  if (!dateKey || typeof dateKey !== 'string') return '';
  const trimmed = dateKey.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : '';
}

export function sanitizeRaceNameString(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return '';
  return name.trim().slice(0, 80);
}

export function buildProgressDocId(dateKey: string, dayIndex: number): string {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
    ? dateKey
    : new Date().toISOString().slice(0, 10);
  const safeDay = Math.min(6, Math.max(0, Math.round(dayIndex)));
  return `${safeDate}_${safeDay}`;
}

export function buildDailyProgressPayload(
  uid: string,
  entry: DailyProgressEntry
): { progressId: string; payload: Record<string, unknown> } {
  const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(entry.dateKey)
    ? entry.dateKey
    : new Date().toISOString().slice(0, 10);
  const dayIndex = Math.min(6, Math.max(0, Math.round(entry.dayIndex)));
  const progressId = buildProgressDocId(dateKey, dayIndex);
  const validZones: TrainingZoneType[] = [
    'easy',
    'tempo',
    'interval',
    'long_run',
    'rest',
  ];
  const zone: TrainingZoneType = validZones.includes(entry.zone)
    ? entry.zone
    : 'easy';
  const comfortRating =
    entry.comfortRating >= 1 && entry.comfortRating <= 5
      ? (Math.round(entry.comfortRating) as 1 | 2 | 3 | 4 | 5)
      : 4;

  const paceSecPerKm =
    typeof entry.paceSecPerKm === 'number' &&
    Number.isFinite(entry.paceSecPerKm)
      ? Math.round(clampNumber(entry.paceSecPerKm, 120, 1800, 360))
      : null;

  const avgHeartRateBpm =
    typeof entry.avgHeartRateBpm === 'number' &&
    Number.isFinite(entry.avgHeartRateBpm)
      ? Math.round(clampNumber(entry.avgHeartRateBpm, 35, 240, 145))
      : null;

  const sessionTitle =
    (entry.sessionTitle || 'Sesi Lari').trim().slice(0, 120) || 'Sesi Lari';
  const note = (entry.note || '').trim().slice(0, 280);
  const completedAt =
    typeof entry.completedAt === 'string' && entry.completedAt.length >= 10
      ? entry.completedAt.slice(0, 40)
      : new Date().toISOString();

  return {
    progressId,
    payload: {
      uid: sanitizeFirestoreId(uid),
      dateKey,
      dayIndex,
      sessionTitle,
      zone,
      plannedKm: Math.round(clampNumber(entry.plannedKm, 0, 300, 0) * 100) / 100,
      actualKm: Math.round(clampNumber(entry.actualKm, 0, 300, 0) * 100) / 100,
      paceSecPerKm,
      avgHeartRateBpm,
      comfortRating,
      note,
      completedAt,
      updatedAt: serverTimestamp(),
    },
  };
}

export function buildRunActivityPayload(
  uid: string,
  run: RunActivity
): { runId: string; payload: Record<string, unknown> } {
  const runId = sanitizeFirestoreId(run.id);
  const validTypes: RunActivityType[] = ['Run', 'TrailRun', 'VirtualRun'];
  const type: RunActivityType = validTypes.includes(run.type) ? run.type : 'Run';
  const validSources = ['sample', 'csv', 'gpx', 'strava_oauth'] as const;
  const source = validSources.includes(run.source) ? run.source : 'csv';
  const name = (run.name || 'Sesi Lari').trim().slice(0, 160) || 'Sesi Lari';
  const startDate =
    typeof run.startDate === 'string' && run.startDate.length >= 10
      ? run.startDate.slice(0, 40)
      : new Date().toISOString();
  const averageHeartRate =
    typeof run.averageHeartRate === 'number' &&
    Number.isFinite(run.averageHeartRate) &&
    run.averageHeartRate >= 35 &&
    run.averageHeartRate <= 240
      ? Math.round(run.averageHeartRate)
      : null;
  const summaryPolyline =
    typeof run.summaryPolyline === 'string' && run.summaryPolyline.length > 0
      ? run.summaryPolyline.slice(0, 50000)
      : null;

  return {
    runId,
    payload: {
      uid: sanitizeFirestoreId(uid),
      id: runId,
      name,
      type,
      startDate,
      distanceMeters: clampNumber(run.distanceMeters, 0, 500000, 0),
      movingTimeSeconds: clampNumber(run.movingTimeSeconds, 0, 604800, 0),
      elapsedTimeSeconds: clampNumber(run.elapsedTimeSeconds, 0, 604800, 0),
      elevationGainMeters: clampNumber(run.elevationGainMeters, 0, 30000, 0),
      averageHeartRate,
      maxSpeedMps: clampNumber(run.maxSpeedMps, 0, 30, 0),
      averageSpeedMps: clampNumber(run.averageSpeedMps, 0, 30, 0),
      summaryPolyline,
      source,
      updatedAt: serverTimestamp(),
    },
  };
}

export function subscribeToUserWorkspace(
  uid: string,
  onData: (state: CloudWorkspaceState, hasPendingWrites: boolean) => void
): Unsubscribe {
  const path = `users/${uid}`;
  const docRef = doc(db, 'users', uid);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(
          {
            exists: false,
            language: 'id',
            customRaceDate: null,
            customRaceName: '',
            migratedFromLocal: false,
            profile: DEFAULT_RUNNER_PROFILE,
          },
          snapshot.metadata.hasPendingWrites
        );
        return;
      }

      const data = snapshot.data();
      const rawProfile = (data.profile ?? {}) as Partial<RunnerProfile>;
      const mergedProfile = sanitizeRunnerProfile({
        ...DEFAULT_RUNNER_PROFILE,
        ...rawProfile,
      });

      const language: AppLanguage = data.language === 'en' ? 'en' : 'id';
      const customRaceDate =
        typeof data.customRaceDate === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(data.customRaceDate)
          ? data.customRaceDate
          : null;
      const customRaceName =
        typeof data.customRaceName === 'string' ? data.customRaceName : '';

      onData(
        {
          exists: true,
          language,
          customRaceDate,
          customRaceName,
          migratedFromLocal: Boolean(data.migratedFromLocal),
          profile: mergedProfile,
        },
        snapshot.metadata.hasPendingWrites
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToUserProgress(
  uid: string,
  onData: (entries: DailyProgressEntry[]) => void
): Unsubscribe {
  const path = `users/${uid}/progress`;
  const q = query(collection(db, 'users', uid, 'progress'), where('uid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: DailyProgressEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          dateKey: String(d.dateKey ?? ''),
          dayIndex: Number(d.dayIndex ?? 0),
          sessionTitle: String(d.sessionTitle ?? 'Sesi Lari'),
          zone: (d.zone ?? 'easy') as TrainingZoneType,
          plannedKm: Number(d.plannedKm ?? 0),
          actualKm: Number(d.actualKm ?? 0),
          paceSecPerKm:
            typeof d.paceSecPerKm === 'number' ? d.paceSecPerKm : null,
          avgHeartRateBpm:
            typeof d.avgHeartRateBpm === 'number' ? d.avgHeartRateBpm : null,
          comfortRating: (Number(d.comfortRating ?? 4) || 4) as 1 | 2 | 3 | 4 | 5,
          note: String(d.note ?? ''),
          completedAt: String(d.completedAt ?? new Date().toISOString()),
        };
      });

      entries.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
      onData(entries);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToUserRuns(
  uid: string,
  onData: (runs: RunActivity[]) => void
): Unsubscribe {
  const path = `users/${uid}/runs`;
  const q = query(collection(db, 'users', uid, 'runs'), where('uid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const runs: RunActivity[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: String(d.id ?? docSnap.id),
          name: String(d.name ?? 'Sesi Lari'),
          type: (d.type ?? 'Run') as RunActivityType,
          startDate: String(d.startDate ?? ''),
          distanceMeters: Number(d.distanceMeters ?? 0),
          movingTimeSeconds: Number(d.movingTimeSeconds ?? 0),
          elapsedTimeSeconds: Number(d.elapsedTimeSeconds ?? 0),
          elevationGainMeters: Number(d.elevationGainMeters ?? 0),
          averageHeartRate:
            typeof d.averageHeartRate === 'number' ? d.averageHeartRate : null,
          maxSpeedMps: Number(d.maxSpeedMps ?? 0),
          averageSpeedMps: Number(d.averageSpeedMps ?? 0),
          summaryPolyline:
            typeof d.summaryPolyline === 'string' ? d.summaryPolyline : null,
          source: (d.source ?? 'csv') as RunActivity['source'],
        };
      });

      runs.sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      onData(runs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createOrUpdateUserWorkspace(
  uid: string,
  workspaceExists: boolean,
  fullState: {
    language: AppLanguage;
    customRaceDate: string | null;
    customRaceName: string;
    migratedFromLocal: boolean;
    profile: RunnerProfile;
  },
  changedFields?: Partial<{
    language: AppLanguage;
    customRaceDate: string | null;
    customRaceName: string;
    migratedFromLocal: boolean;
    profile: RunnerProfile;
  }>
): Promise<void> {
  const path = `users/${uid}`;
  const docRef = doc(db, 'users', uid);

  try {
    if (!workspaceExists) {
      await setDoc(docRef, {
        uid: sanitizeFirestoreId(uid),
        language: fullState.language === 'en' ? 'en' : 'id',
        customRaceDate: sanitizeRaceDateString(fullState.customRaceDate),
        customRaceName: sanitizeRaceNameString(fullState.customRaceName),
        migratedFromLocal: Boolean(fullState.migratedFromLocal),
        profile: sanitizeRunnerProfile(fullState.profile),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    const patch: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (changedFields?.language !== undefined) {
      patch.language = changedFields.language === 'en' ? 'en' : 'id';
    }
    if (changedFields?.customRaceDate !== undefined) {
      patch.customRaceDate = sanitizeRaceDateString(changedFields.customRaceDate);
    }
    if (changedFields?.customRaceName !== undefined) {
      patch.customRaceName = sanitizeRaceNameString(changedFields.customRaceName);
    }
    if (changedFields?.migratedFromLocal !== undefined) {
      patch.migratedFromLocal = Boolean(changedFields.migratedFromLocal);
    }
    if (changedFields?.profile !== undefined) {
      patch.profile = sanitizeRunnerProfile(changedFields.profile);
    }

    await updateDoc(docRef, patch);
  } catch (error) {
    handleFirestoreError(
      error,
      workspaceExists ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function saveCloudDailyProgress(
  uid: string,
  entry: DailyProgressEntry
): Promise<void> {
  const { progressId, payload } = buildDailyProgressPayload(uid, entry);
  const path = `users/${uid}/progress/${progressId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'progress', progressId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCloudDailyProgressBatch(
  uid: string,
  entries: DailyProgressEntry[]
): Promise<void> {
  if (entries.length === 0) return;
  const path = `users/${uid}/progress`;
  try {
    for (let i = 0; i < entries.length; i += 400) {
      const chunk = entries.slice(i, i + 400);
      const batch = writeBatch(db);
      for (const entry of chunk) {
        const { progressId, payload } = buildDailyProgressPayload(uid, entry);
        batch.set(doc(db, 'users', uid, 'progress', progressId), payload);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCloudDailyProgress(
  uid: string,
  dateKey: string,
  dayIndex: number
): Promise<void> {
  const progressId = buildProgressDocId(dateKey, dayIndex);
  const path = `users/${uid}/progress/${progressId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'progress', progressId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCloudRunsBatch(
  uid: string,
  runs: RunActivity[]
): Promise<void> {
  if (runs.length === 0) return;
  const path = `users/${uid}/runs`;
  try {
    for (let i = 0; i < runs.length; i += 400) {
      const chunk = runs.slice(i, i + 400);
      const batch = writeBatch(db);
      for (const run of chunk) {
        const { runId, payload } = buildRunActivityPayload(uid, run);
        batch.set(doc(db, 'users', uid, 'runs', runId), payload);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function clearAllCloudRuns(uid: string): Promise<void> {
  const path = `users/${uid}/runs`;
  try {
    const q = query(collection(db, 'users', uid, 'runs'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) return;
    for (let i = 0; i < snap.docs.length; i += 400) {
      const chunk = snap.docs.slice(i, i + 400);
      const batch = writeBatch(db);
      for (const d of chunk) {
        batch.delete(d.ref);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteAllCloudUserData(uid: string): Promise<void> {
  await clearAllCloudRuns(uid);

  const progressPath = `users/${uid}/progress`;
  try {
    const progressQuery = query(
      collection(db, 'users', uid, 'progress'),
      where('uid', '==', uid)
    );
    const progressSnap = await getDocs(progressQuery);
    if (!progressSnap.empty) {
      for (let i = 0; i < progressSnap.docs.length; i += 400) {
        const chunk = progressSnap.docs.slice(i, i + 400);
        const batch = writeBatch(db);
        for (const d of chunk) {
          batch.delete(d.ref);
        }
        await batch.commit();
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, progressPath);
  }

  const userPath = `users/${uid}`;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, userPath);
  }
}

export function clearLegacyLocalData(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(IMPORTED_RUNS_STORAGE_KEY);
    window.localStorage.removeItem(DAILY_PROGRESS_STORAGE_KEY);
    window.localStorage.removeItem(RUNNER_PROFILE_STORAGE_KEY);
    window.localStorage.removeItem(RACE_DATE_STORAGE_KEY);
    window.localStorage.removeItem(RACE_NAME_STORAGE_KEY);
  } catch {
    // Ignore storage removal errors
  }
}

export function isLocalMigrationHandled(uid: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return (
      window.localStorage.getItem(`${LOCAL_MIGRATION_DISMISSED_PREFIX}${uid}`) ===
      '1'
    );
  } catch {
    return false;
  }
}

export function markLocalMigrationHandled(uid: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${LOCAL_MIGRATION_DISMISSED_PREFIX}${uid}`, '1');
  } catch {
    // Ignore storage error
  }
}

export function readLegacyLocalSnapshot(): LegacyLocalSnapshot {
  const empty: LegacyLocalSnapshot = {
    hasData: false,
    language: 'id',
    customRaceDate: null,
    customRaceName: '',
    profile: DEFAULT_RUNNER_PROFILE,
    progressEntries: [],
    runs: [],
  };

  if (typeof window === 'undefined') return empty;

  try {
    const rawRuns = window.localStorage.getItem(IMPORTED_RUNS_STORAGE_KEY);
    const rawProgress = window.localStorage.getItem(DAILY_PROGRESS_STORAGE_KEY);
    const rawProfile = window.localStorage.getItem(RUNNER_PROFILE_STORAGE_KEY);
    const rawLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const rawRaceDate = window.localStorage.getItem(RACE_DATE_STORAGE_KEY);
    const rawRaceName = window.localStorage.getItem(RACE_NAME_STORAGE_KEY);

    const runs: RunActivity[] = rawRuns ? JSON.parse(rawRuns) : [];
    const progressEntries: DailyProgressEntry[] = rawProgress
      ? JSON.parse(rawProgress)
      : [];
    const parsedProfile = rawProfile
      ? { ...DEFAULT_RUNNER_PROFILE, ...JSON.parse(rawProfile) }
      : DEFAULT_RUNNER_PROFILE;
    const language: AppLanguage =
      rawLang && JSON.parse(rawLang) === 'en' ? 'en' : 'id';
    const customRaceDate: string | null = rawRaceDate
      ? JSON.parse(rawRaceDate)
      : null;
    const customRaceName: string = rawRaceName ? JSON.parse(rawRaceName) : '';

    const hasProfileChange =
      rawProfile !== null &&
      JSON.stringify(sanitizeRunnerProfile(parsedProfile)) !==
        JSON.stringify(DEFAULT_RUNNER_PROFILE);

    const hasData =
      (Array.isArray(runs) && runs.length > 0) ||
      (Array.isArray(progressEntries) && progressEntries.length > 0) ||
      hasProfileChange ||
      Boolean(customRaceDate) ||
      Boolean(customRaceName);

    return {
      hasData,
      language,
      customRaceDate,
      customRaceName,
      profile: sanitizeRunnerProfile(parsedProfile),
      progressEntries: Array.isArray(progressEntries) ? progressEntries : [],
      runs: Array.isArray(runs) ? runs : [],
    };
  } catch {
    return empty;
  }
}
