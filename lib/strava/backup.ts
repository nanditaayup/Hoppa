import {
  sanitizeRaceDateString,
  sanitizeRaceNameString,
  sanitizeRunnerProfile,
} from '@/lib/firebase/firestore-sync';
import {
  AppLanguage,
  BackupPayloadV1,
  DailyProgressEntry,
  RunActivity,
  RunActivityType,
  RunnerProfile,
  TrainingZoneType,
} from './types';

export function buildBackupPayload(input: {
  language: AppLanguage;
  customRaceDate: string | null;
  customRaceName: string;
  profile: RunnerProfile;
  progressEntries: DailyProgressEntry[];
  runs: RunActivity[];
}): BackupPayloadV1 {
  return {
    app: 'PaceCraft',
    version: 1,
    exportedAt: new Date().toISOString(),
    language: input.language === 'en' ? 'en' : 'id',
    customRaceDate: sanitizeRaceDateString(input.customRaceDate) || null,
    customRaceName: sanitizeRaceNameString(input.customRaceName),
    profile: sanitizeRunnerProfile(input.profile),
    progressEntries: input.progressEntries.slice(0, 500),
    runs: input.runs.slice(0, 500),
  };
}

export type ParseBackupResult =
  | { ok: true; data: BackupPayloadV1 }
  | { ok: false; errorCode: 'invalid_json' | 'invalid_schema' };

export function parseAndValidateBackupJson(rawText: string): ParseBackupResult {
  if (!rawText || typeof rawText !== 'string' || rawText.length > 5_000_000) {
    return { ok: false, errorCode: 'invalid_json' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, errorCode: 'invalid_json' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, errorCode: 'invalid_schema' };
  }

  const obj = parsed as Record<string, unknown>;
  if (obj.app !== 'PaceCraft' || obj.version !== 1) {
    return { ok: false, errorCode: 'invalid_schema' };
  }
  if (!obj.profile || typeof obj.profile !== 'object' || Array.isArray(obj.profile)) {
    return { ok: false, errorCode: 'invalid_schema' };
  }

  const language: AppLanguage = obj.language === 'en' ? 'en' : 'id';
  const customRaceDate =
    typeof obj.customRaceDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(obj.customRaceDate)
      ? obj.customRaceDate
      : null;
  const customRaceName =
    typeof obj.customRaceName === 'string'
      ? sanitizeRaceNameString(obj.customRaceName)
      : '';

  const profile = sanitizeRunnerProfile(obj.profile as RunnerProfile);

  const validZones: TrainingZoneType[] = [
    'easy',
    'tempo',
    'interval',
    'long_run',
    'rest',
  ];
  const rawProgress = Array.isArray(obj.progressEntries)
    ? obj.progressEntries.slice(0, 500)
    : [];
  const progressEntries: DailyProgressEntry[] = rawProgress
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => {
      const dateKey =
        typeof item.dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dateKey)
          ? item.dateKey
          : new Date().toISOString().slice(0, 10);
      const dayIndexRaw = Number(item.dayIndex);
      const dayIndex = Number.isFinite(dayIndexRaw)
        ? Math.min(6, Math.max(0, Math.round(dayIndexRaw)))
        : 0;
      const comfortRaw = Number(item.comfortRating);
      const comfortRating = (
        comfortRaw >= 1 && comfortRaw <= 5 ? Math.round(comfortRaw) : 4
      ) as 1 | 2 | 3 | 4 | 5;
      const paceRaw = Number(item.paceSecPerKm);
      const hrRaw = Number(item.avgHeartRateBpm);

      return {
        dateKey,
        dayIndex,
        sessionTitle:
          typeof item.sessionTitle === 'string' && item.sessionTitle.trim()
            ? item.sessionTitle.trim().slice(0, 120)
            : 'Sesi Lari',
        zone: validZones.includes(item.zone as TrainingZoneType)
          ? (item.zone as TrainingZoneType)
          : 'easy',
        plannedKm: Math.min(300, Math.max(0, Number(item.plannedKm) || 0)),
        actualKm: Math.min(300, Math.max(0, Number(item.actualKm) || 0)),
        paceSecPerKm:
          typeof item.paceSecPerKm === 'number' && Number.isFinite(paceRaw)
            ? Math.min(1800, Math.max(120, Math.round(paceRaw)))
            : null,
        avgHeartRateBpm:
          typeof item.avgHeartRateBpm === 'number' && Number.isFinite(hrRaw)
            ? Math.min(240, Math.max(35, Math.round(hrRaw)))
            : null,
        comfortRating,
        note:
          typeof item.note === 'string' ? item.note.trim().slice(0, 280) : '',
        completedAt:
          typeof item.completedAt === 'string' && item.completedAt.length >= 10
            ? item.completedAt.slice(0, 40)
            : new Date().toISOString(),
      };
    });

  const validTypes: RunActivityType[] = ['Run', 'TrailRun', 'VirtualRun'];
  const validSources = ['sample', 'csv', 'gpx', 'strava_oauth'] as const;
  const rawRuns = Array.isArray(obj.runs) ? obj.runs.slice(0, 500) : [];
  const runs: RunActivity[] = rawRuns
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, idx) => ({
      id:
        typeof item.id === 'string' && item.id.trim()
          ? item.id.trim().slice(0, 120)
          : `restored_${idx}`,
      name:
        typeof item.name === 'string' && item.name.trim()
          ? item.name.trim().slice(0, 160)
          : 'Sesi Lari',
      type: validTypes.includes(item.type as RunActivityType)
        ? (item.type as RunActivityType)
        : 'Run',
      startDate:
        typeof item.startDate === 'string' && item.startDate.length >= 10
          ? item.startDate.slice(0, 40)
          : new Date().toISOString(),
      distanceMeters: Math.min(500000, Math.max(0, Number(item.distanceMeters) || 0)),
      movingTimeSeconds: Math.min(604800, Math.max(0, Number(item.movingTimeSeconds) || 0)),
      elapsedTimeSeconds: Math.min(604800, Math.max(0, Number(item.elapsedTimeSeconds) || 0)),
      elevationGainMeters: Math.min(30000, Math.max(0, Number(item.elevationGainMeters) || 0)),
      averageHeartRate:
        typeof item.averageHeartRate === 'number' &&
        Number.isFinite(item.averageHeartRate) &&
        item.averageHeartRate >= 35 &&
        item.averageHeartRate <= 240
          ? Math.round(item.averageHeartRate)
          : null,
      maxSpeedMps: Math.min(30, Math.max(0, Number(item.maxSpeedMps) || 0)),
      averageSpeedMps: Math.min(30, Math.max(0, Number(item.averageSpeedMps) || 0)),
      summaryPolyline:
        typeof item.summaryPolyline === 'string' && item.summaryPolyline.length > 0
          ? item.summaryPolyline.slice(0, 50000)
          : null,
      source: validSources.includes(item.source as RunActivity['source'])
        ? (item.source as RunActivity['source'])
        : 'csv',
    }));

  return {
    ok: true,
    data: {
      app: 'PaceCraft',
      version: 1,
      exportedAt:
        typeof obj.exportedAt === 'string'
          ? obj.exportedAt
          : new Date().toISOString(),
      language,
      customRaceDate,
      customRaceName,
      profile,
      progressEntries,
      runs,
    },
  };
}
