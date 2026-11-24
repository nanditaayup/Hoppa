import {
  AppLanguage,
  CalendarDayData,
  CalendarSessionItem,
  DailyProgressEntry,
  DailySessionPlan,
  HeartRateZone,
  MonthlyCalendarGrid,
  PaceZoneSummary,
  RunActivity,
  TrainingIntensityLevel,
  TrainingIntensityTier,
  TrainingZoneType,
} from './types';
import { computePaceSecPerKm } from './transform';

const MONTHS_ID_FULL = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MONTHS_EN_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatMonthHeading(
  year: number,
  monthIndex: number,
  lang: AppLanguage = 'id'
): string {
  const safeIdx = ((monthIndex % 12) + 12) % 12;
  const name = lang === 'en' ? MONTHS_EN_FULL[safeIdx] : MONTHS_ID_FULL[safeIdx];
  return `${name} ${year}`;
}

export function formatFullDateLabel(
  dateKey: string,
  lang: AppLanguage = 'id'
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!match) return dateKey;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const day = Number(match[3]);
  const monthName =
    lang === 'en'
      ? (MONTHS_EN_FULL[monthIdx] ?? '')
      : (MONTHS_ID_FULL[monthIdx] ?? '');
  return `${day} ${monthName} ${year}`;
}

export function shiftMonthYear(
  year: number,
  monthIndex: number,
  deltaMonths: number
): { year: number; monthIndex: number } {
  const total = year * 12 + monthIndex + deltaMonths;
  const nextYear = Math.floor(total / 12);
  const nextMonthIndex = ((total % 12) + 12) % 12;
  return { year: nextYear, monthIndex: nextMonthIndex };
}

function getWibDateKeyAndDayIndex(
  isoDate: string
): { dateKey: string; dayIndex: number } | null {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return null;
  const wib = new Date(parsed.getTime() + 7 * 60 * 60 * 1000);
  const dateKey = wib.toISOString().slice(0, 10);
  const utcDay = wib.getUTCDay();
  const dayIndex = utcDay === 0 ? 6 : utcDay - 1;
  return { dateKey, dayIndex };
}

function inferZoneFromMetrics(
  distanceKm: number,
  paceSecPerKm: number | null,
  avgHr: number | null,
  paceZones: PaceZoneSummary[],
  hrZones: HeartRateZone[],
  title: string
): TrainingZoneType {
  if (distanceKm <= 0) return 'rest';

  const z4Min = hrZones.find((z) => z.zone === 'Z4')?.minBpm ?? 160;
  const z5Min = hrZones.find((z) => z.zone === 'Z5')?.minBpm ?? 172;
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('interval') || lowerTitle.includes('track')) {
    return 'interval';
  }
  if (lowerTitle.includes('tempo') || lowerTitle.includes('threshold')) {
    return 'tempo';
  }
  if (avgHr && avgHr >= z5Min) return 'interval';
  if (avgHr && avgHr >= z4Min) return 'tempo';

  const intervalZone = paceZones.find((p) => p.zone === 'interval');
  const tempoZone = paceZones.find((p) => p.zone === 'tempo');
  if (paceSecPerKm && intervalZone && paceSecPerKm <= intervalZone.maxPaceSecPerKm) {
    return 'interval';
  }
  if (paceSecPerKm && tempoZone && paceSecPerKm <= tempoZone.maxPaceSecPerKm) {
    return 'tempo';
  }
  if (distanceKm >= 14) return 'long_run';
  return 'easy';
}

export function classifyIntensityTier(
  distanceKm: number,
  zone: TrainingZoneType,
  avgHr: number | null,
  hrZones: HeartRateZone[]
): TrainingIntensityTier {
  if (distanceKm <= 0 || zone === 'rest') return 0;

  const z4Min = hrZones.find((z) => z.zone === 'Z4')?.minBpm ?? 160;
  const z5Min = hrZones.find((z) => z.zone === 'Z5')?.minBpm ?? 172;

  if (
    distanceKm >= 18 ||
    zone === 'interval' ||
    (avgHr !== null && avgHr >= z5Min)
  ) {
    return 4;
  }

  if (
    distanceKm >= 12 ||
    zone === 'tempo' ||
    (avgHr !== null && avgHr >= z4Min)
  ) {
    return 3;
  }

  if (distanceKm >= 6 || zone === 'long_run') {
    return 2;
  }

  return 1;
}

export function tierToLevel(tier: TrainingIntensityTier): TrainingIntensityLevel {
  switch (tier) {
    case 4:
      return 'peak';
    case 3:
      return 'high';
    case 2:
      return 'moderate';
    case 1:
      return 'light';
    default:
      return 'rest';
  }
}

export function buildMonthlyIntensityGrid(params: {
  year: number;
  monthIndex: number; // 0..11
  todayDateKey: string;
  entries: DailyProgressEntry[];
  runs: RunActivity[];
  weeklySchedule: DailySessionPlan[];
  paceZones: PaceZoneSummary[];
  hrZones: HeartRateZone[];
}): MonthlyCalendarGrid {
  const {
    year,
    monthIndex,
    todayDateKey,
    entries,
    runs,
    paceZones,
    hrZones,
  } = params;

  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const firstDayUtc = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const firstWeekdayMon0 =
    firstDayUtc.getUTCDay() === 0 ? 6 : firstDayUtc.getUTCDay() - 1;
  const totalCells = Math.ceil((firstWeekdayMon0 + daysInMonth) / 7) * 7;

  // Group sessions per YYYY-MM-DD by combining DailyProgressEntry + non-duplicate Strava runs
  const sessionsByDate = new Map<string, CalendarSessionItem[]>();
  const hasRestLogByDate = new Set<string>();

  const appendSession = (dateKey: string, session: CalendarSessionItem) => {
    const list = sessionsByDate.get(dateKey) ?? [];
    list.push(session);
    sessionsByDate.set(dateKey, list);
  };

  for (const entry of entries) {
    if (entry.zone === 'rest' || entry.actualKm <= 0) {
      hasRestLogByDate.add(entry.dateKey);
    }
    const tier = classifyIntensityTier(
      entry.actualKm,
      entry.zone,
      entry.avgHeartRateBpm ?? null,
      hrZones
    );
    const movingTimeSeconds =
      entry.paceSecPerKm && entry.actualKm > 0
        ? Math.round(entry.paceSecPerKm * entry.actualKm)
        : null;
    appendSession(entry.dateKey, {
      id: `log-${entry.dateKey}-${entry.dayIndex}`,
      title: entry.sessionTitle,
      source: 'daily_log',
      zone: entry.zone,
      distanceKm: Math.round(entry.actualKm * 100) / 100,
      movingTimeSeconds,
      paceSecPerKm: entry.paceSecPerKm ?? null,
      avgHeartRateBpm: entry.avgHeartRateBpm ?? null,
      elevationGainMeters: null,
      comfortRating: entry.comfortRating,
      note: entry.note,
      tier,
      dayIndex: entry.dayIndex,
      timestampIso: entry.completedAt,
    });
  }

  for (const run of runs) {
    const wib = getWibDateKeyAndDayIndex(run.startDate);
    if (!wib) continue;
    const distanceKm = Math.round((run.distanceMeters / 1000) * 100) / 100;
    const existing = sessionsByDate.get(wib.dateKey) ?? [];

    // Avoid double counting if a daily_log with matching distance & source tag already exists on this date
    const isAlreadyMirrored = existing.some(
      (s) =>
        s.source === 'daily_log' &&
        (s.note.toLowerCase().includes(run.name.toLowerCase()) ||
          Math.abs(s.distanceKm - distanceKm) <= 0.25)
    );
    if (isAlreadyMirrored) continue;

    const paceSecPerKm =
      run.movingTimeSeconds > 0 && run.distanceMeters > 0
        ? computePaceSecPerKm(run.distanceMeters, run.movingTimeSeconds)
        : null;
    const zone = inferZoneFromMetrics(
      distanceKm,
      paceSecPerKm,
      run.averageHeartRate,
      paceZones,
      hrZones,
      run.name
    );
    const tier = classifyIntensityTier(
      distanceKm,
      zone,
      run.averageHeartRate,
      hrZones
    );
    const source: CalendarSessionItem['source'] =
      run.source === 'csv'
        ? 'strava_csv'
        : run.source === 'gpx'
          ? 'strava_gpx'
          : run.source === 'strava_oauth'
            ? 'strava_oauth'
            : 'strava_sample';

    appendSession(wib.dateKey, {
      id: `strava-${run.id}`,
      title: run.name,
      source,
      activityType: run.type,
      zone,
      distanceKm,
      movingTimeSeconds: run.movingTimeSeconds,
      paceSecPerKm,
      avgHeartRateBpm: run.averageHeartRate,
      elevationGainMeters: run.elevationGainMeters,
      comfortRating: null,
      note: '',
      tier,
      dayIndex: wib.dayIndex,
      timestampIso: run.startDate,
    });
  }

  const days: CalendarDayData[] = [];
  let activeDaysCount = 0;
  let restLoggedDaysCount = 0;
  let totalSessionsCount = 0;
  let totalDistanceKmSum = 0;
  let highOrPeakDaysCount = 0;
  const monthPaces: number[] = [];
  const monthHrs: number[] = [];

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(
      Date.UTC(year, monthIndex, 1 - firstWeekdayMon0 + i)
    );
    const dateKey = cellDate.toISOString().slice(0, 10);
    const utcDay = cellDate.getUTCDay();
    const dayIndex = utcDay === 0 ? 6 : utcDay - 1;
    const isCurrentMonth =
      cellDate.getUTCFullYear() === year &&
      cellDate.getUTCMonth() === monthIndex;
    const sessions = (sessionsByDate.get(dateKey) ?? []).slice();

    const totalDistanceKm =
      Math.round(sessions.reduce((sum, s) => sum + s.distanceKm, 0) * 100) /
      100;
    const totalMovingTimeSeconds = sessions.reduce(
      (sum, s) => sum + (s.movingTimeSeconds ?? 0),
      0
    );

    const maxSessionTier = sessions.reduce<TrainingIntensityTier>(
      (max, s) => (s.tier > max ? s.tier : max),
      0
    );
    const dominantZone =
      sessions.find((s) => s.zone !== 'rest')?.zone ??
      (sessions[0]?.zone ?? null);

    let intensityTier: TrainingIntensityTier = maxSessionTier;
    if (totalDistanceKm >= 18 && intensityTier < 4) intensityTier = 4;
    else if (totalDistanceKm >= 12 && intensityTier < 3) intensityTier = 3;
    else if (totalDistanceKm >= 6 && intensityTier < 2) intensityTier = 2;

    const hasRestLog = hasRestLogByDate.has(dateKey);

    if (isCurrentMonth) {
      if (totalDistanceKm > 0) {
        activeDaysCount++;
        totalDistanceKmSum += totalDistanceKm;
        if (intensityTier >= 3) highOrPeakDaysCount++;
      } else if (hasRestLog) {
        restLoggedDaysCount++;
      }
      totalSessionsCount += sessions.length;
      for (const s of sessions) {
        if (s.paceSecPerKm && s.paceSecPerKm > 0) {
          monthPaces.push(s.paceSecPerKm);
        }
        if (s.avgHeartRateBpm && s.avgHeartRateBpm > 0) {
          monthHrs.push(s.avgHeartRateBpm);
        }
      }
    }

    days.push({
      dateKey,
      dayNumber: cellDate.getUTCDate(),
      dayIndex,
      isCurrentMonth,
      isToday: dateKey === todayDateKey,
      totalDistanceKm,
      totalMovingTimeSeconds,
      intensityTier,
      intensityLevel: tierToLevel(intensityTier),
      hasRestLog,
      sessions,
      dominantZone,
    });
  }

  return {
    monthKey,
    year,
    monthIndex,
    days,
    summary: {
      monthKey,
      year,
      monthIndex,
      activeDaysCount,
      restLoggedDaysCount,
      totalSessionsCount,
      totalDistanceKm: Math.round(totalDistanceKmSum * 10) / 10,
      highOrPeakDaysCount,
      avgPaceSecPerKm:
        monthPaces.length > 0
          ? Math.round(
              monthPaces.reduce((a, b) => a + b, 0) / monthPaces.length
            )
          : null,
      avgHeartRateBpm:
        monthHrs.length > 0
          ? Math.round(monthHrs.reduce((a, b) => a + b, 0) / monthHrs.length)
          : null,
    },
  };
}
