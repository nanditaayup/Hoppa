import {
  BMI_ZONES_BY_LANG,
  DAY_NAMES_BY_LANG,
  DEFAULT_RACE_COUNTDOWN_DAYS,
  RACE_TARGETS_BY_LANG,
  RUN_TYPE_LABELS_BY_LANG,
} from './config';
import { assessRunDataQuality } from './import-parser';
import {
  AdaptivePlanAdjustment,
  AppLanguage,
  BmiCategoryKey,
  BmiResult,
  DailyProgressEntry,
  DailyProgressStats,
  DailySessionPlan,
  HeartRateVo2Summary,
  HeartRateZone,
  KpiSummary,
  NutritionRecommendation,
  NutritionRecoveryTiming,
  PaceZoneRange,
  RaceCountdownInfo,
  RaceCountdownStatus,
  RaceDistanceKey,
  RacePredictionItem,
  RoutePoint,
  RunActivity,
  RunnerProfile,
  StravaSyncCandidate,
  TargetPaceReadinessAssessment,
  TrainingPlanSummary,
  WeeklyChartBucket,
  WeeklyVolumeProgression,
  WorkoutStepBlock,
} from './types';

const MONTHS_ID_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const MONTHS_EN_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function formatDecimalComma(
  value: number,
  decimals: number,
  lang: AppLanguage = 'id'
): string {
  if (!Number.isFinite(value)) return '0';
  const fixed = value.toFixed(decimals);
  return lang === 'id' ? fixed.replace('.', ',') : fixed;
}

export function formatDistanceKm(
  distanceMeters: number,
  lang: AppLanguage = 'id'
): string {
  const km = Math.max(0, distanceMeters) / 1000;
  return `${formatDecimalComma(km, 2, lang)} km`;
}

export function formatKmValue(
  km: number,
  decimals = 2,
  lang: AppLanguage = 'id'
): string {
  return `${formatDecimalComma(Math.max(0, km), decimals, lang)} km`;
}

export function computePaceSecPerKm(
  distanceMeters: number,
  movingTimeSeconds: number,
  averageSpeedMps?: number
): number {
  const km = distanceMeters / 1000;
  if (km > 0 && movingTimeSeconds > 0) {
    return Math.round(movingTimeSeconds / km);
  }
  if (averageSpeedMps && averageSpeedMps > 0.2) {
    return Math.round(1000 / averageSpeedMps);
  }
  return 0;
}

export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '--:--/km';
  const totalSec = Math.round(secPerKm);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}/km`;
}

/**
 * Parses pace strings like "06:15", "6:15", or "5.45" into seconds per km.
 * Returns null when blank or invalid.
 */
export function parsePaceInputToSecPerKm(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;
  const match = /^(\d{1,2})[:.](\d{1,2})$/.exec(cleaned);
  if (!match) return null;
  const mins = Number(match[1]);
  const secs = Number(match[2]);
  if (!Number.isFinite(mins) || !Number.isFinite(secs) || secs >= 60) {
    return null;
  }
  const total = mins * 60 + secs;
  if (total < 150 || total > 1200) return null;
  return total;
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '00:00';
  const sec = Math.round(totalSeconds);
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remSec = sec % 60;
  if (hours >= 1) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
}

export function formatSpeedKmh(mps: number, lang: AppLanguage = 'id'): string {
  const unit = lang === 'en' ? 'km/h' : 'km/jam';
  if (!Number.isFinite(mps) || mps <= 0) {
    return `${lang === 'id' ? '0,0' : '0.0'} ${unit}`;
  }
  const kmh = mps * 3.6;
  return `${formatDecimalComma(kmh, 1, lang)} ${unit}`;
}

/**
 * Formats an ISO date string into deterministic short format:
 * ID: "16 Nov 2026, 06.00", EN: "16 Nov 2026, 06:00".
 * Uses Asia/Jakarta (UTC+7) deterministically so server & client renders match identically.
 */
export function formatIndonesianDate(
  isoString: string,
  includeTime = true,
  lang: AppLanguage = 'id'
): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';

  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wib = new Date(date.getTime() + wibOffsetMs);

  const day = wib.getUTCDate();
  const months = lang === 'en' ? MONTHS_EN_SHORT : MONTHS_ID_SHORT;
  const month = months[wib.getUTCMonth()];
  const year = wib.getUTCFullYear();
  if (!includeTime) {
    return `${day} ${month} ${year}`;
  }
  const hh = String(wib.getUTCHours()).padStart(2, '0');
  const mm = String(wib.getUTCMinutes()).padStart(2, '0');
  const sep = lang === 'en' ? ':' : '.';
  return `${day} ${month} ${year}, ${hh}${sep}${mm}`;
}

export function getRunTypeLabel(
  type: RunActivity['type'],
  lang: AppLanguage = 'id'
): string {
  const labels = RUN_TYPE_LABELS_BY_LANG[lang];
  return labels[type] ?? labels.Run;
}

export function calculateBmi(
  weightKg: number,
  heightCm: number,
  directBmi: number | null = null,
  useDirectBmi = false,
  lang: AppLanguage = 'id'
): BmiResult {
  let rawBmi: number;
  if (useDirectBmi && directBmi !== null && Number.isFinite(directBmi) && directBmi > 0) {
    rawBmi = clampNumber(directBmi, 10, 60);
  } else {
    const safeWeight = clampNumber(weightKg, 30, 200);
    const safeHeightM = clampNumber(heightCm, 120, 230) / 100;
    rawBmi = safeWeight / (safeHeightM * safeHeightM);
  }

  const bmi = Math.round(rawBmi * 10) / 10;

  let category: BmiCategoryKey = 'ideal';
  if (bmi < 18.5) category = 'kurus';
  else if (bmi < 25.0) category = 'ideal';
  else if (bmi < 30.0) category = 'berlebih';
  else category = 'obesitas';

  const zone = BMI_ZONES_BY_LANG[lang][category];

  return {
    bmi,
    formattedBmi: formatDecimalComma(bmi, 1, lang),
    category,
    categoryLabel: zone.label,
    safetyNote: zone.safetyNote,
    maxWeeklyIncreasePct: zone.maxWeeklyIncreasePct,
    extraEasyRatioPct: zone.extraEasyRatioPct,
    requireLowImpactPhase: zone.requireLowImpactPhase,
  };
}

export function decodePolyline(encoded: string | null): RoutePoint[] {
  if (!encoded) return [];
  const points: RoutePoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b = 0;
    let shift = 0;
    let result = 0;
    do {
      if (index >= encoded.length) break;
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      if (index >= encoded.length) break;
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}

/**
 * Computes KPI summary over a 30-day / 4-week window anchored to the reference date
 * (or the latest run date if all imported runs are older than 30 days from today).
 */
export function computeKpiSummary(
  runs: RunActivity[],
  referenceNow: Date = new Date()
): KpiSummary {
  if (runs.length === 0) {
    return {
      fourWeekAvgKm: 0,
      thirtyDayTotalKm: 0,
      thirtyDayAvgPaceSecPerKm: 0,
      longestRunKm: 0,
      runCount30Days: 0,
      totalActivitiesCount: 0,
      flaggedAnomalyCount: 0,
    };
  }

  const sorted = [...runs].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Anchor to referenceNow if the newest run is within the last 30 days,
  // or anchor to newestRunTime if all runs are older than 30 days or newer than referenceNow.
  const newestRunTime = new Date(sorted[0].startDate).getTime();
  const refTime = referenceNow.getTime();
  const anchorMs =
    newestRunTime <= refTime && refTime - newestRunTime <= 30 * 24 * 60 * 60 * 1000
      ? refTime
      : newestRunTime;

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const twentyEightDaysMs = 28 * 24 * 60 * 60 * 1000;

  const runs30Days = sorted.filter((r) => {
    const t = new Date(r.startDate).getTime();
    return t <= anchorMs && anchorMs - t <= thirtyDaysMs;
  });

  const runs4Weeks = sorted.filter((r) => {
    const t = new Date(r.startDate).getTime();
    return t <= anchorMs && anchorMs - t <= twentyEightDaysMs;
  });

  const fourWeekTotalKm =
    runs4Weeks.reduce((acc, r) => acc + r.distanceMeters, 0) / 1000;
  const fourWeekAvgKm = Math.round((fourWeekTotalKm / 4) * 100) / 100;

  const thirtyDayTotalMeters = runs30Days.reduce((acc, r) => acc + r.distanceMeters, 0);
  const thirtyDayTotalKm = Math.round((thirtyDayTotalMeters / 1000) * 100) / 100;

  const validPaceRuns30Days = runs30Days.filter((r) => {
    const pace = computePaceSecPerKm(
      r.distanceMeters,
      r.movingTimeSeconds,
      r.averageSpeedMps
    );
    const quality = assessRunDataQuality(r);
    return (
      pace >= 140 &&
      pace <= 1800 &&
      quality.reason !== 'implausible_fast' &&
      quality.reason !== 'implausible_slow'
    );
  });

  const validPaceMeters = validPaceRuns30Days.reduce(
    (acc, r) => acc + r.distanceMeters,
    0
  );
  const validPaceSeconds = validPaceRuns30Days.reduce(
    (acc, r) => acc + r.movingTimeSeconds,
    0
  );

  const thirtyDayAvgPaceSecPerKm =
    validPaceMeters > 0
      ? Math.round(validPaceSeconds / (validPaceMeters / 1000))
      : 0;

  const longestMeters = sorted.reduce(
    (max, r) => Math.max(max, r.distanceMeters),
    0
  );
  const longestRunKm = Math.round((longestMeters / 1000) * 100) / 100;
  const flaggedAnomalyCount = sorted.filter(
    (r) => assessRunDataQuality(r).hasAnomaly
  ).length;

  return {
    fourWeekAvgKm,
    thirtyDayTotalKm,
    thirtyDayAvgPaceSecPerKm,
    longestRunKm,
    runCount30Days: runs30Days.length,
    totalActivitiesCount: sorted.length,
    flaggedAnomalyCount,
  };
}

/**
 * Returns ISO week Monday timestamp in WIB for grouping runs into 8 weekly buckets.
 */
function getWeekStartWib(date: Date): Date {
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wib = new Date(date.getTime() + wibOffsetMs);
  const day = wib.getUTCDay(); // 0 = Sun, 1 = Mon .. 6 = Sat
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mondayUtc = Date.UTC(
    wib.getUTCFullYear(),
    wib.getUTCMonth(),
    wib.getUTCDate() + diffToMon
  );
  return new Date(mondayUtc);
}

export function computeWeeklyChartBuckets(
  runs: RunActivity[],
  weeks = 8,
  referenceNow: Date = new Date(),
  lang: AppLanguage = 'id'
): WeeklyChartBucket[] {
  const anchorDate =
    runs.length > 0
      ? (() => {
          const newest = Math.max(
            ...runs.map((r) => new Date(r.startDate).getTime())
          );
          const refMs = referenceNow.getTime();
          return newest <= refMs && refMs - newest <= 56 * 24 * 60 * 60 * 1000
            ? referenceNow
            : new Date(newest);
        })()
      : referenceNow;

  const currentMonday = getWeekStartWib(anchorDate);
  const buckets: WeeklyChartBucket[] = [];
  const months = lang === 'en' ? MONTHS_EN_SHORT : MONTHS_ID_SHORT;

  for (let i = weeks - 1; i >= 0; i--) {
    const startMs = currentMonday.getTime() - i * 7 * 24 * 60 * 60 * 1000;
    const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
    const startDate = new Date(startMs);
    const label = `${startDate.getUTCDate()} ${months[startDate.getUTCMonth()]}`;
    const key = startDate.toISOString().slice(0, 10);

    const matching = runs.filter((r) => {
      const rWeek = getWeekStartWib(new Date(r.startDate)).getTime();
      return rWeek >= startMs && rWeek < endMs;
    });

    const totalKm =
      Math.round(
        (matching.reduce((sum, r) => sum + r.distanceMeters, 0) / 1000) * 10
      ) / 10;

    buckets.push({
      weekKey: key,
      weekLabel: label,
      totalKm,
      runCount: matching.length,
    });
  }

  return buckets;
}

export function computePaceZones(
  baselinePaceSecPerKm: number,
  lang: AppLanguage = 'id',
  options?: {
    basis?: 'default' | 'strava_baseline' | 'race_goal';
    targetRace?: RaceDistanceKey;
  }
): PaceZoneRange[] {
  const base = clampNumber(
    baselinePaceSecPerKm > 0 ? baselinePaceSecPerKm : 365,
    150,
    900
  );

  const easyMin = base + 45;
  const easyMax = base + 75;

  let tempoFast = Math.max(150, base - 25);
  let tempoSlow = Math.max(165, base - 15);
  let intervalFast = Math.max(135, base - 50);
  let intervalSlow = Math.max(150, base - 35);

  if (options?.basis === 'race_goal') {
    const race = options.targetRace ?? '10K';
    if (race === '21K') {
      tempoFast = Math.max(120, base - 5);
      tempoSlow = Math.max(130, base + 5);
    } else if (race === '42K') {
      tempoFast = Math.max(120, base - 25);
      tempoSlow = Math.max(130, base - 15);
    } else {
      // 5K & 10K goal pace is faster than lactate threshold tempo pace
      tempoFast = Math.max(120, base + 10);
      tempoSlow = Math.max(130, base + 20);
    }
    const intervalBase = Math.min(base, tempoFast);
    intervalFast = Math.max(90, intervalBase - 25);
    intervalSlow = Math.max(95, intervalBase - 12);
  }

  return [
    {
      key: 'easy',
      label: 'Easy Pace',
      description:
        lang === 'en'
          ? 'Relaxed conversational pace where breathing stays comfortable.'
          : 'Lari santai dengan napas nyaman dan masih bisa berbicara penuh.',
      minPaceSecPerKm: easyMin,
      maxPaceSecPerKm: easyMax,
      formattedRange: `${formatPace(easyMin).replace('/km', '')}–${formatPace(easyMax)}`,
    },
    {
      key: 'tempo',
      label: 'Tempo Pace',
      description:
        lang === 'en'
          ? 'Comfortably hard steady effort to raise your aerobic threshold.'
          : 'Kecepatan stabil menantang namun tetap terkontrol untuk daya tahan.',
      minPaceSecPerKm: tempoFast,
      maxPaceSecPerKm: tempoSlow,
      formattedRange: `${formatPace(tempoFast).replace('/km', '')}–${formatPace(tempoSlow)}`,
    },
    {
      key: 'interval',
      label: 'Interval',
      description:
        lang === 'en'
          ? 'Short fast repeats paired with walk or jog recovery for VO2max.'
          : 'Repetisi cepat singkat dengan jeda jalan/jogging untuk VO2max.',
      minPaceSecPerKm: intervalFast,
      maxPaceSecPerKm: intervalSlow,
      formattedRange: `${formatPace(intervalFast).replace('/km', '')}–${formatPace(intervalSlow)}`,
    },
    {
      key: 'long_run',
      label: 'Long Run',
      description:
        lang === 'en'
          ? 'Weekend distance run kept inside Easy Pace for muscular adaptation.'
          : 'Lari jarak jauh akhir pekan di rentang Easy Pace untuk adaptasi otot.',
      minPaceSecPerKm: easyMin,
      maxPaceSecPerKm: easyMax,
      formattedRange: `${formatPace(easyMin).replace('/km', '')}–${formatPace(easyMax)}`,
    },
  ];
}

export function generateTrainingPlan(
  profile: RunnerProfile,
  kpi: KpiSummary,
  lang: AppLanguage = 'id',
  countdownStatus: RaceCountdownStatus = 'upcoming'
): TrainingPlanSummary {
  const race = RACE_TARGETS_BY_LANG[lang][profile.targetRace];
  const bmiResult = calculateBmi(
    profile.weightKg,
    profile.heightCm,
    profile.directBmi,
    profile.useDirectBmi,
    lang
  );

  const hasRunHistory = kpi.fourWeekAvgKm > 0 && kpi.thirtyDayAvgPaceSecPerKm > 0;
  const baselineFourWeekAvgKm = hasRunHistory
    ? Math.max(6, kpi.fourWeekAvgKm)
    : race.defaultBaselineWeeklyKm;

  const hasCustomTargetPace =
    typeof profile.customTargetPaceSecPerKm === 'number' &&
    Number.isFinite(profile.customTargetPaceSecPerKm) &&
    profile.customTargetPaceSecPerKm >= 120 &&
    profile.customTargetPaceSecPerKm <= 1800;

  const baselinePaceSecPerKm = hasCustomTargetPace
    ? Math.round(profile.customTargetPaceSecPerKm!)
    : hasRunHistory
      ? kpi.thirtyDayAvgPaceSecPerKm
      : 365; // default 06:05/km

  const paceZoneBasis: TrainingPlanSummary['paceZoneBasis'] = hasCustomTargetPace
    ? 'race_goal'
    : hasRunHistory
      ? 'strava_baseline'
      : 'default';

  const paceZones = computePaceZones(baselinePaceSecPerKm, lang, {
    basis: paceZoneBasis,
    targetRace: profile.targetRace,
  });
  const easyZone = paceZones.find((z) => z.key === 'easy')!;
  const tempoZone = paceZones.find((z) => z.key === 'tempo')!;
  const intervalZone = paceZones.find((z) => z.key === 'interval')!;
  const longRunZone = paceZones.find((z) => z.key === 'long_run')!;

  // Determine safe weekly increase % considering BMI, Age >= 50, and Injury Status
  let weeklyIncreasePct = bmiResult.maxWeeklyIncreasePct;
  if (profile.age >= 50) {
    weeklyIncreasePct = Math.min(weeklyIncreasePct, 7);
  }
  if (profile.injuryStatus === 'recovering') {
    weeklyIncreasePct = Math.min(weeklyIncreasePct, 5);
  } else if (profile.injuryStatus === 'active') {
    weeklyIncreasePct = 0;
  }

  // Week 1 starts from baselineFourWeekAvgKm (scaled down if active injury)
  const week1Km =
    profile.injuryStatus === 'active'
      ? Math.round(baselineFourWeekAvgKm * 0.6 * 10) / 10
      : Math.round(baselineFourWeekAvgKm * 10) / 10;
  const rate = 1 + weeklyIncreasePct / 100;
  const week2Km = Math.round(week1Km * rate * 10) / 10;
  const week3Km = Math.round(week2Km * rate * 10) / 10;
  // Cutback week every 4th week: -20% from Week 3
  const week4Km = Math.round(week3Km * 0.8 * 10) / 10;

  const fourWeekProgression: WeeklyVolumeProgression[] =
    lang === 'en'
      ? [
          {
            weekNumber: 1,
            label: 'Week 1 (Adaptation)',
            targetVolumeKm: week1Km,
            isCutback: false,
            note: 'Aligns your body with your 4-week rolling baseline volume.',
          },
          {
            weekNumber: 2,
            label: 'Week 2 (Build)',
            targetVolumeKm: week2Km,
            isCutback: false,
            note:
              weeklyIncreasePct > 0
                ? `Gradual +${weeklyIncreasePct}% initial step-up. Adjust based on recovery and body response.`
                : 'Volume held steady to support injury recovery.',
          },
          {
            weekNumber: 3,
            label: 'Week 3 (Cycle Peak)',
            targetVolumeKm: week3Km,
            isCutback: false,
            note:
              weeklyIncreasePct > 0
                ? `3-week block peak (+${weeklyIncreasePct}%).`
                : 'Keep all efforts low-impact and comfortable.',
          },
          {
            weekNumber: 4,
            label: 'Week 4 (Cutback -20%)',
            targetVolumeKm: week4Km,
            isCutback: true,
            note: 'Mandatory -20% recovery week so muscles and tendons rebound stronger.',
          },
        ]
      : [
          {
            weekNumber: 1,
            label: 'Minggu 1 (Adaptasi)',
            targetVolumeKm: week1Km,
            isCutback: false,
            note: 'Menyesuaikan tubuh pada baseline volume 4 minggu terakhir.',
          },
          {
            weekNumber: 2,
            label: 'Minggu 2 (Bangun)',
            targetVolumeKm: week2Km,
            isCutback: false,
            note:
              weeklyIncreasePct > 0
                ? `Naik bertahap +${weeklyIncreasePct}% sebagai patokan awal. Sesuaikan dengan pemulihan dan respons tubuh.`
                : 'Volume ditahan stabil untuk pemulihan cedera.',
          },
          {
            weekNumber: 3,
            label: 'Minggu 3 (Puncak Siklus)',
            targetVolumeKm: week3Km,
            isCutback: false,
            note:
              weeklyIncreasePct > 0
                ? `Puncak blok 3 minggu (+${weeklyIncreasePct}%).`
                : 'Tetap di intensitas rendah & nyaman.',
          },
          {
            weekNumber: 4,
            label: 'Minggu 4 (Cutback -20%)',
            targetVolumeKm: week4Km,
            isCutback: true,
            note: 'Pekan pemulihan wajib -20% agar jaringan otot & tendon pulih optimal.',
          },
        ];

  const taperMultiplier =
    countdownStatus === 'tapering'
      ? 0.75
      : countdownStatus === 'race_week'
        ? 0.5
        : countdownStatus === 'race_day'
          ? 0.35
          : 1.0;
  const scheduleTargetWeekKm =
    Math.round(week1Km * taperMultiplier * 10) / 10;
  const isRaceWeekOrDay =
    countdownStatus === 'race_week' || countdownStatus === 'race_day';

  const lowImpactOnly =
    bmiResult.requireLowImpactPhase || profile.injuryStatus === 'active';
  const extraEasy =
    bmiResult.extraEasyRatioPct >= 15 || profile.injuryStatus === 'recovering';

  const days = profile.trainingDaysPerWeek;
  const activeDaySlots: Record<3 | 4 | 5 | 6, number[]> = {
    3: [1, 3, 6],
    4: [1, 2, 4, 6],
    5: [0, 1, 3, 4, 6],
    6: [0, 1, 2, 3, 4, 6],
  };

  const activeIndices = activeDaySlots[days];
  const assignRole = (slotPosition: number, totalSlots: number) => {
    if (isRaceWeekOrDay) return 'easy' as const;
    if (slotPosition === totalSlots - 1) return 'long_run' as const;
    if (lowImpactOnly) return 'easy' as const;
    if (totalSlots === 3) {
      return slotPosition === 1 && !extraEasy ? ('tempo' as const) : ('easy' as const);
    }
    if (totalSlots === 4) {
      if (slotPosition === 1) return extraEasy ? ('easy' as const) : ('tempo' as const);
      return 'easy' as const;
    }
    if (totalSlots === 5) {
      if (slotPosition === 1) return extraEasy ? ('tempo' as const) : ('interval' as const);
      if (slotPosition === 3) return extraEasy ? ('easy' as const) : ('tempo' as const);
      return 'easy' as const;
    }
    if (slotPosition === 1) return extraEasy ? ('tempo' as const) : ('interval' as const);
    if (slotPosition === 3) return 'tempo' as const;
    return 'easy' as const;
  };

  const roleWeights: Record<'easy' | 'tempo' | 'interval' | 'long_run', number> = {
    easy: 1.0,
    tempo: 1.15,
    interval: 1.0,
    long_run: 1.85,
  };

  const slotRoles = activeIndices.map((_, pos) => assignRole(pos, activeIndices.length));
  const totalWeight = slotRoles.reduce((sum, role) => sum + roleWeights[role], 0);
  const dayNames = DAY_NAMES_BY_LANG[lang];

  const minSessionKm = taperMultiplier < 1 ? 1.5 : 2.0;

  const strengthScheduleMap: Record<
    number,
    { title: string; durationMin: number; exercises: string }
  > = {};

  if (!isRaceWeekOrDay) {
    if (days === 3 || days === 4) {
      strengthScheduleMap[0] =
        lang === 'en'
          ? {
              title: 'Lower-Body Strength & Core',
              durationMin: 30,
              exercises: 'Squat 3×10 · Reverse lunges 3×8/leg · Calf raises 3×15 · Plank 3×40s',
            }
          : {
              title: 'Kekuatan Kaki & Core',
              durationMin: 30,
              exercises: 'Squat 3×10 · Lunges 3×8/sisi · Calf raises 3×15 · Plank 3×40 dtk',
            };
      strengthScheduleMap[3] =
        lang === 'en'
          ? {
              title: 'Single-Leg Stability & Mobility',
              durationMin: 25,
              exercises: 'Glute bridge 3×12 · Step-ups 3×8/leg · Clamshell 2×15 · Hip mobility',
            }
          : {
              title: 'Stabilitas Satu Kaki & Mobilitas',
              durationMin: 25,
              exercises: 'Glute bridge 3×12 · Step-up 3×8/sisi · Clamshell 2×15 · Mobilitas pinggul',
            };
    } else if (days === 5) {
      strengthScheduleMap[0] =
        lang === 'en'
          ? {
              title: 'Post-Run Core & Hip Stability',
              durationMin: 20,
              exercises: 'Plank 3×40s · Side plank 2×30s/side · Dead bug 3×10 · Clamshell 2×15',
            }
          : {
              title: 'Core & Stabilitas Pinggul (Usai Lari)',
              durationMin: 20,
              exercises: 'Plank 3×40 dtk · Side plank 2×30 dtk · Dead bug 3×10 · Clamshell 2×15',
            };
      strengthScheduleMap[2] =
        lang === 'en'
          ? {
              title: 'Runner Lower-Body Strength',
              durationMin: 30,
              exercises: 'Goblet squat 3×10 · Single-leg RDL 3×8/leg · Eccentric calf raises 3×12',
            }
          : {
              title: 'Kekuatan Otot Lari (Hari Non-Lari)',
              durationMin: 30,
              exercises: 'Goblet squat 3×10 · Single-leg RDL 3×8/sisi · Calf raises 3×12',
            };
    } else {
      strengthScheduleMap[1] =
        lang === 'en'
          ? {
              title: 'Post-Easy Core & Glute Activation',
              durationMin: 20,
              exercises: 'Glute bridge 3×12 · Plank 3×40s · Bird-dog 3×8/side',
            }
          : {
              title: 'Core & Aktivasi Glute (Usai Easy Run)',
              durationMin: 20,
              exercises: 'Glute bridge 3×12 · Plank 3×40 dtk · Bird-dog 3×8/sisi',
            };
      strengthScheduleMap[3] =
        lang === 'en'
          ? {
              title: 'Light Leg Strength & Tendon Care',
              durationMin: 25,
              exercises: 'Step-ups 3×8/leg · Wall sit 2×40s · Heel drops 3×12',
            }
          : {
              title: 'Kekuatan Kaki Ringan & Tendon',
              durationMin: 25,
              exercises: 'Step-up 3×8/sisi · Wall sit 2×40 dtk · Heel drops 3×12',
            };
    }
  }

  const estimateDuration = (km: number, zoneRange: PaceZoneRange): number => {
    const midPace = Math.round((zoneRange.minPaceSecPerKm + zoneRange.maxPaceSecPerKm) / 2);
    return Math.max(12, Math.round((km * midPace) / 60));
  };

  const buildSteps = (
    role: 'easy' | 'tempo' | 'interval' | 'long_run',
    km: number
  ): {
    steps: WorkoutStepBlock[];
    coachNote: string;
    durationMin: number;
  } => {
    const wuKm = km >= 5 ? 1.5 : km >= 3.5 ? 1.0 : 0.8;
    const cdKm = km >= 4 ? 1.0 : 0.6;
    const mainKm = Math.max(1.0, Math.round((km - wuKm - cdKm) * 10) / 10);

    if (role === 'interval') {
      const repsCount = clampNumber(Math.round((mainKm * 1000) / 500), 4, 8);
      return {
        durationMin: estimateDuration(km, tempoZone),
        coachNote:
          lang === 'en'
            ? 'Run each repeat smooth and controlled—save a touch in reserve rather than sprinting rep 1.'
            : 'Jaga tiap repetisi tetap rapi dan terkontrol—jangan langsung sprint habis di repetisi pertama.',
        steps: [
          {
            phase: 'warmup',
            label: lang === 'en' ? 'Warm-up' : 'Pemanasan',
            targetText: `${formatDecimalComma(wuKm, 1, lang)} km + 2×60m strides`,
            paceText: easyZone.formattedRange,
          },
          {
            phase: 'main',
            label: lang === 'en' ? 'Main Set' : 'Sesi Inti',
            targetText:
              lang === 'en'
                ? `${repsCount}×400m fast + 90s walk/jog recovery`
                : `${repsCount}×400m cepat + jeda jalan/jog 90 dtk`,
            paceText: intervalZone.formattedRange,
          },
          {
            phase: 'cooldown',
            label: lang === 'en' ? 'Cool-down' : 'Pendinginan',
            targetText: `${formatDecimalComma(cdKm, 1, lang)} km`,
            paceText: easyZone.formattedRange,
          },
        ],
      };
    }

    if (role === 'tempo') {
      return {
        durationMin: estimateDuration(km, tempoZone),
        coachNote:
          lang === 'en'
            ? 'Settle into a steady rhythm where you can speak 3–4 words at a time during the main block.'
            : 'Kunci ritme stabil di sesi inti—masih cukup terkontrol untuk mengucap 3–4 kata singkat.',
        steps: [
          {
            phase: 'warmup',
            label: lang === 'en' ? 'Warm-up' : 'Pemanasan',
            targetText: `${formatDecimalComma(wuKm, 1, lang)} km`,
            paceText: easyZone.formattedRange,
          },
          {
            phase: 'main',
            label: lang === 'en' ? 'Main Set' : 'Sesi Inti',
            targetText:
              lang === 'en'
                ? `${formatDecimalComma(mainKm, 1, lang)} km steady Tempo`
                : `${formatDecimalComma(mainKm, 1, lang)} km Tempo stabil`,
            paceText: tempoZone.formattedRange,
          },
          {
            phase: 'cooldown',
            label: lang === 'en' ? 'Cool-down' : 'Pendinginan',
            targetText: `${formatDecimalComma(cdKm, 1, lang)} km`,
            paceText: easyZone.formattedRange,
          },
        ],
      };
    }

    if (role === 'long_run') {
      const longWu = Math.min(2.0, Math.round(km * 0.2 * 10) / 10);
      const longCd = 1.0;
      const longMain = Math.max(1.5, Math.round((km - longWu - longCd) * 10) / 10);
      return {
        durationMin: estimateDuration(km, longRunZone),
        coachNote:
          lang === 'en'
            ? 'Start conservatively on the first 2 km and sip water every 20–25 minutes if weather is humid.'
            : 'Mulai 2 km pertama dengan santai; minum air bertahap tiap 20–25 menit bila cuaca lembap.',
        steps: [
          {
            phase: 'warmup',
            label: lang === 'en' ? 'Warm-up' : 'Awalan Santai',
            targetText: `${formatDecimalComma(longWu, 1, lang)} km`,
            paceText: easyZone.formattedRange,
          },
          {
            phase: 'main',
            label: lang === 'en' ? 'Main Set' : 'Jarak Inti',
            targetText:
              lowImpactOnly
                ? lang === 'en'
                  ? `${formatDecimalComma(longMain, 1, lang)} km (3m jog / 1m walk)`
                  : `${formatDecimalComma(longMain, 1, lang)} km (3 mnt lari / 1 mnt jalan)`
                : lang === 'en'
                  ? `${formatDecimalComma(longMain, 1, lang)} km conversational aerobic`
                  : `${formatDecimalComma(longMain, 1, lang)} km aerobik nyaman`,
            paceText: longRunZone.formattedRange,
          },
          {
            phase: 'cooldown',
            label: lang === 'en' ? 'Finish' : 'Penutup Rapi',
            targetText: `${formatDecimalComma(longCd, 1, lang)} km`,
            paceText: easyZone.formattedRange,
          },
        ],
      };
    }

    return {
      durationMin: estimateDuration(km, easyZone),
      coachNote:
        lang === 'en'
          ? isRaceWeekOrDay
            ? 'Keep your stride bouncy and light—let the legs feel fresh for race day.'
            : 'Ignore GPS pressure today; keep breathing relaxed enough to chat comfortably.'
          : isRaceWeekOrDay
            ? 'Jaga langkah ringan dan santai—fokus menjaga kaki tetap segar menuju garis start.'
            : 'Tak perlu kejar angka pace hari ini; jaga napas tetap cukup nyaman untuk mengobrol.',
      steps: [
        {
          phase: 'warmup',
          label: lang === 'en' ? 'Warm-up' : 'Pemanasan',
          targetText:
            lang === 'en' ? '5 min brisk walk & ankle mobility' : '5 mnt jalan cepat & mobilitas engkel',
        },
        {
          phase: 'main',
          label: lang === 'en' ? 'Main Set' : 'Sesi Inti',
          targetText: `${formatDecimalComma(km, 1, lang)} km`,
          paceText: easyZone.formattedRange,
        },
        {
          phase: 'cooldown',
          label: lang === 'en' ? 'Cool-down' : 'Pendinginan',
          targetText: isRaceWeekOrDay
            ? '3×60m strides + stretch'
            : lang === 'en'
              ? '5 min calf & hip stretch'
              : '5 mnt peregangan betis & pinggul',
        },
      ],
    };
  };

  const weeklySchedule: DailySessionPlan[] = dayNames.map((dayName, dayIndex) => {
    const strengthSession = strengthScheduleMap[dayIndex] ?? null;
    const activePos = activeIndices.indexOf(dayIndex);
    if (activePos === -1) {
      return {
        dayIndex,
        dayName,
        zone: 'rest',
        title:
          lang === 'en'
            ? strengthSession
              ? 'Cross-Train: Strength & Mobility'
              : 'Rest & Active Recovery'
            : strengthSession
              ? 'Cross-Train: Strength & Mobilitas'
              : 'Hari Istirahat & Pemulihan',
        targetDistanceKm: 0,
        paceRange: lang === 'en' ? 'Rest' : 'Istirahat',
        guidance:
          lang === 'en'
            ? 'Prioritize quality sleep, steady hydration, and 10 minutes of gentle mobility.'
            : 'Fokus tidur cukup, hidrasi, dan peregangan ringan 10 menit.',
        estimatedDurationMin: strengthSession ? strengthSession.durationMin : 15,
        coachNote:
          lang === 'en'
            ? strengthSession
              ? 'Strong glutes and calves absorb running impact cleanly without adding extra mileage.'
              : 'Muscles adapt during rest—take today genuinely easy.'
            : strengthSession
              ? 'Otot glute dan betis yang kuat membantu menahan benturan lari tanpa menambah kilometer.'
              : 'Adaptasi kekuatan justru terjadi saat istirahat—nikmati hari pemulihan ini.',
        workoutSteps: strengthSession
          ? [
              {
                phase: 'warmup',
                label: lang === 'en' ? 'Activation' : 'Aktivasi',
                targetText:
                  lang === 'en' ? '5 min hip circles & glute bridges' : '5 mnt mobilitas pinggul',
              },
              {
                phase: 'main',
                label: lang === 'en' ? 'Strength' : 'Penguatan',
                targetText: strengthSession.exercises,
              },
              {
                phase: 'cooldown',
                label: lang === 'en' ? 'Mobility' : 'Mobilitas',
                targetText:
                  lang === 'en' ? '5 min calf & hamstring stretch' : '5 mnt peregangan ringan',
              },
            ]
          : undefined,
        strengthSession,
      };
    }

    const role = slotRoles[activePos];
    const km = Math.max(
      minSessionKm,
      Math.round(((scheduleTargetWeekKm * roleWeights[role]) / totalWeight) * 10) / 10
    );
    const meta = buildSteps(role, km);

    if (role === 'long_run') {
      return {
        dayIndex,
        dayName,
        zone: 'long_run',
        title:
          lang === 'en'
            ? countdownStatus === 'tapering'
              ? 'Taper Long Run (Reduced)'
              : lowImpactOnly
                ? 'Comfortable Long Walk-Run'
                : 'Weekend Long Run'
            : countdownStatus === 'tapering'
              ? 'Long Run Taper (Dipangkas)'
              : lowImpactOnly
                ? 'Long Walk-Run Nyaman'
                : 'Long Run Akhir Pekan',
        targetDistanceKm: km,
        paceRange: longRunZone.formattedRange,
        guidance:
          lang === 'en'
            ? countdownStatus === 'tapering'
              ? 'Shortened taper distance in Easy Pace to preserve freshness for race day.'
              : lowImpactOnly
                ? 'Alternate 3 minutes of gentle jogging with 1 minute of brisk walking consistently.'
                : 'Keep your heart rate settled in an easy aerobic zone from the first kilometer.'
            : countdownStatus === 'tapering'
              ? 'Jarak long run dipangkas otomatis di rentang Easy Pace agar kaki tetap bugar menuju hari lomba.'
              : lowImpactOnly
                ? 'Kombinasikan lari pelan 3 menit dan jalan cepat 1 menit secara konsisten.'
                : 'Jaga detak jantung stabil di zona aerobik nyaman sejak kilometer pertama.',
        estimatedDurationMin: meta.durationMin,
        coachNote: meta.coachNote,
        workoutSteps: meta.steps,
        strengthSession,
      };
    }

    if (role === 'tempo') {
      return {
        dayIndex,
        dayName,
        zone: 'tempo',
        title:
          lang === 'en'
            ? `Controlled Tempo (${race.label})`
            : `Tempo Terkontrol (${race.label})`,
        targetDistanceKm: km,
        paceRange: tempoZone.formattedRange,
        guidance:
          lang === 'en'
            ? 'Warm up 1.5 km easy, hold Tempo pace for the core block, then cool down 1 km.'
            : 'Pemanasan 1,5 km Easy, masuk pace Tempo di inti sesi, lalu pendinginan 1 km.',
        estimatedDurationMin: meta.durationMin,
        coachNote: meta.coachNote,
        workoutSteps: meta.steps,
        strengthSession,
      };
    }

    if (role === 'interval') {
      return {
        dayIndex,
        dayName,
        zone: 'interval',
        title:
          lang === 'en' ? 'Light Speed Intervals' : 'Interval Kecepatan Ringan',
        targetDistanceKm: km,
        paceRange: intervalZone.formattedRange,
        guidance:
          lang === 'en'
            ? 'Run 5–6×400m fast repeats with 90 seconds of easy walk/jog recovery.'
            : 'Lakukan 5–6×400m cepat dengan jeda jalan/jogging 90 detik di antaranya.',
        estimatedDurationMin: meta.durationMin,
        coachNote: meta.coachNote,
        workoutSteps: meta.steps,
        strengthSession,
      };
    }

    return {
      dayIndex,
      dayName,
      zone: 'easy',
      title:
        lang === 'en'
          ? isRaceWeekOrDay
            ? 'Race-Week Shakeout Run'
            : bmiResult.extraEasyRatioPct >= 15 || lowImpactOnly
              ? 'Easy / Recovery Walk-Run'
              : 'Easy Aerobic Run'
          : isRaceWeekOrDay
            ? 'Shakeout Ringan Pekan Lomba'
            : bmiResult.extraEasyRatioPct >= 15 || lowImpactOnly
              ? 'Easy / Walk-Run Pemulihan'
              : 'Easy Run Aerobik',
      targetDistanceKm: km,
      paceRange: easyZone.formattedRange,
      guidance:
        lang === 'en'
          ? isRaceWeekOrDay
            ? 'Keep steps light and relaxed with 3–4 gentle 60m strides to stay sharp without fatigue.'
            : bmiResult.extraEasyRatioPct >= 15
              ? 'Insert a 1-minute brisk walk break every 5 minutes if breathing feels heavy.'
              : 'Run relaxed without chasing pace to build capillaries and stride efficiency.'
          : isRaceWeekOrDay
            ? 'Jaga langkah ringan dan santai, tutup dengan 3–4 akselerasi pendek 60m agar kaki tetap responsif tanpa lelah.'
            : bmiResult.extraEasyRatioPct >= 15
              ? 'Sisipkan jeda jalan cepat 1 menit tiap 5 menit lari bila napas terasa berat.'
              : 'Lari santai tanpa mengejar waktu untuk membangun kapiler dan efisiensi langkah.',
      estimatedDurationMin: meta.durationMin,
      coachNote: meta.coachNote,
      workoutSteps: meta.steps,
      strengthSession,
    };
  });

  const totalPlannedWeekKm =
    Math.round(
      weeklySchedule.reduce((sum, s) => sum + s.targetDistanceKm, 0) * 10
    ) / 10;

  return {
    targetRace: profile.targetRace,
    targetDistanceKm: race.distanceKm,
    baselineFourWeekAvgKm: Math.round(baselineFourWeekAvgKm * 10) / 10,
    baselinePaceSecPerKm,
    isUsingDefaultBaseline: !hasRunHistory && !hasCustomTargetPace,
    isUsingCustomTargetPace: hasCustomTargetPace,
    paceZoneBasis,
    bmiResult,
    paceZones,
    weeklySchedule,
    fourWeekProgression,
    totalPlannedWeekKm,
    taperStatus: countdownStatus,
    taperMultiplier,
  };
}

/**
 * Computes consecutive streak (honoring scheduled rest days) & current Mon–Sun week completion stats
 * for Daily Progress Tracker, separating running sessions from cross-training/rest logs.
 */
export function computeDailyProgressStats(
  entries: DailyProgressEntry[],
  weeklySchedule: DailySessionPlan[],
  todayDateKey: string
): DailyProgressStats {
  const loggedDateSet = new Set(entries.map((e) => e.dateKey));
  const restDayIndices = new Set(
    weeklySchedule.filter((s) => s.zone === 'rest').map((s) => s.dayIndex)
  );
  const getWeekdayIndexFromKey = (key: string): number => {
    const ms = parseDateKeyUtcMs(key);
    if (ms === null) return 0;
    const utcDay = new Date(ms).getUTCDay();
    return utcDay === 0 ? 6 : utcDay - 1;
  };

  let streak = 0;
  if (loggedDateSet.size > 0) {
    let startKey: string | null = null;
    if (loggedDateSet.has(todayDateKey)) {
      startKey = todayDateKey;
    } else {
      // Allow bridging over today if today isn't logged yet, and any scheduled rest days
      let probeKey = addDaysToDateKey(todayDateKey, -1);
      for (let step = 0; step < 7; step++) {
        if (loggedDateSet.has(probeKey)) {
          startKey = probeKey;
          break;
        }
        if (!restDayIndices.has(getWeekdayIndexFromKey(probeKey))) {
          break;
        }
        probeKey = addDaysToDateKey(probeKey, -1);
      }
    }

    if (startKey) {
      let cursorKey = startKey;
      for (let i = 0; i < 365; i++) {
        if (loggedDateSet.has(cursorKey)) {
          streak++;
        } else if (!restDayIndices.has(getWeekdayIndexFromKey(cursorKey))) {
          break;
        }
        cursorKey = addDaysToDateKey(cursorKey, -1);
      }
    }
  }

  // Scope weekly progress metrics strictly to the current Mon–Sun week containing todayDateKey
  const todayWeekday = getWeekdayIndexFromKey(todayDateKey);
  const weekStartKey = addDaysToDateKey(todayDateKey, -todayWeekday);
  const weekEndKey = addDaysToDateKey(weekStartKey, 6);
  const thisWeekEntries = entries.filter(
    (e) => e.dateKey >= weekStartKey && e.dateKey <= weekEndKey
  );

  const plannedRunSessionsCount = weeklySchedule.filter(
    (s) => s.zone !== 'rest'
  ).length;
  const completedRunDayIndices = new Set(
    thisWeekEntries
      .filter((e) => e.zone !== 'rest' && e.actualKm > 0)
      .map((e) => e.dayIndex)
  );
  const completedThisWeekCount = weeklySchedule.filter(
    (s) => s.zone !== 'rest' && completedRunDayIndices.has(s.dayIndex)
  ).length;

  const strengthDayIndices = new Set(
    weeklySchedule.filter((s) => Boolean(s.strengthSession)).map((s) => s.dayIndex)
  );
  const completedCrossTrainCount = thisWeekEntries.filter(
    (e) => e.zone === 'rest' && strengthDayIndices.has(e.dayIndex)
  ).length;
  const loggedRestDaysCount = thisWeekEntries.filter(
    (e) => e.zone === 'rest' && !strengthDayIndices.has(e.dayIndex)
  ).length;

  const totalLoggedKm =
    Math.round(
      thisWeekEntries
        .filter((e) => e.zone !== 'rest')
        .reduce((sum, e) => sum + e.actualKm, 0) * 10
    ) / 10;

  const plannedWeekKm =
    Math.round(
      weeklySchedule.reduce((sum, s) => sum + s.targetDistanceKm, 0) * 10
    ) / 10;

  const completionPct =
    plannedRunSessionsCount > 0
      ? Math.min(
          100,
          Math.round((completedThisWeekCount / plannedRunSessionsCount) * 100)
        )
      : 0;

  const actualVsPlannedPct =
    plannedWeekKm > 0 ? Math.round((totalLoggedKm / plannedWeekKm) * 100) : 0;
  const isVolumeSignificantlyOverPlan =
    plannedWeekKm > 0 && actualVsPlannedPct > 115;

  const paceEntries = thisWeekEntries.filter(
    (e) =>
      typeof e.paceSecPerKm === 'number' &&
      Number.isFinite(e.paceSecPerKm) &&
      e.paceSecPerKm > 0
  );
  const avgPaceSecPerKm =
    paceEntries.length > 0
      ? Math.round(
          paceEntries.reduce((sum, e) => sum + (e.paceSecPerKm ?? 0), 0) /
            paceEntries.length
        )
      : null;

  const hrEntries = thisWeekEntries.filter(
    (e) =>
      typeof e.avgHeartRateBpm === 'number' &&
      Number.isFinite(e.avgHeartRateBpm) &&
      e.avgHeartRateBpm > 0
  );
  const avgHeartRateBpm =
    hrEntries.length > 0
      ? Math.round(
          hrEntries.reduce((sum, e) => sum + (e.avgHeartRateBpm ?? 0), 0) /
            hrEntries.length
        )
      : null;

  return {
    currentStreakDays: streak,
    completedThisWeekCount,
    plannedRunSessionsCount,
    completedCrossTrainCount,
    loggedRestDaysCount,
    totalLoggedKm,
    plannedWeekKm,
    completionPct,
    actualVsPlannedPct,
    isVolumeSignificantlyOverPlan,
    avgPaceSecPerKm,
    avgHeartRateBpm,
  };
}

/**
 * Computes daily carbohydrate, protein, and hydration targets for recovery
 * based on selected race distance (5K/10K/21K/42K), body weight, frequency, and BMI.
 */
export function computeNutritionRecommendation(
  profile: RunnerProfile,
  bmiResult: BmiResult,
  lang: AppLanguage = 'id'
): NutritionRecommendation {
  const safeWeight = clampNumber(profile.weightKg, 30, 200);

  const raceMacros: Record<
    RunnerProfile['targetRace'],
    {
      carbsPerKgMin: number;
      carbsPerKgMax: number;
      proteinPerKgMin: number;
      proteinPerKgMax: number;
      hydrationMin: number;
      hydrationMax: number;
    }
  > = {
    '5K': {
      carbsPerKgMin: 3.5,
      carbsPerKgMax: 5.0,
      proteinPerKgMin: 1.2,
      proteinPerKgMax: 1.4,
      hydrationMin: 2.0,
      hydrationMax: 2.5,
    },
    '10K': {
      carbsPerKgMin: 4.5,
      carbsPerKgMax: 6.0,
      proteinPerKgMin: 1.4,
      proteinPerKgMax: 1.6,
      hydrationMin: 2.2,
      hydrationMax: 2.8,
    },
    '21K': {
      carbsPerKgMin: 5.5,
      carbsPerKgMax: 7.5,
      proteinPerKgMin: 1.5,
      proteinPerKgMax: 1.8,
      hydrationMin: 2.5,
      hydrationMax: 3.2,
    },
    '42K': {
      carbsPerKgMin: 6.5,
      carbsPerKgMax: 9.0,
      proteinPerKgMin: 1.6,
      proteinPerKgMax: 2.0,
      hydrationMin: 2.8,
      hydrationMax: 3.8,
    },
  };

  const base = raceMacros[profile.targetRace];
  const highFreqBonus = profile.trainingDaysPerWeek >= 5 ? 0.3 : 0;

  const carbsPerKgMin = Math.round((base.carbsPerKgMin + highFreqBonus) * 10) / 10;
  const carbsPerKgMax = Math.round((base.carbsPerKgMax + highFreqBonus) * 10) / 10;
  const proteinPerKgMin = base.proteinPerKgMin;
  const proteinPerKgMax = base.proteinPerKgMax;

  const carbsMinG = Math.round(safeWeight * carbsPerKgMin);
  const carbsMaxG = Math.round(safeWeight * carbsPerKgMax);
  const proteinMinG = Math.round(safeWeight * proteinPerKgMin);
  const proteinMaxG = Math.round(safeWeight * proteinPerKgMax);

  const bmiNutritionNote =
    lang === 'en'
      ? bmiResult.category === 'kurus'
        ? `Prioritize your ${profile.targetRace} training load and session duration first—increase carbs on Long Run & Tempo days, while an Underweight BMI suggests leaning toward the upper calorie and protein range.`
        : bmiResult.category === 'berlebih' || bmiResult.category === 'obesitas'
          ? `Prioritize fuel around ${profile.targetRace} workouts (before and within 30–90 minutes after running) and meet daily protein targets to support recovery and satiety; BMI is only a secondary guide.`
          : `Lead with your ${profile.targetRace} training load: eat toward the upper carbohydrate range on Long Run or Tempo days and the lower bound on lighter or rest days.`
      : bmiResult.category === 'kurus'
        ? `Sesuaikan asupan dengan beban & durasi latihan ${profile.targetRace} Anda lebih dulu—tambah porsi karbohidrat di hari Long Run & Tempo. Dengan BMI Kurus, prioritaskan batas atas energi dan protein agar pemulihan tetap optimal.`
        : bmiResult.category === 'berlebih' || bmiResult.category === 'obesitas'
          ? `Utamakan penjadwalan karbohidrat di sekitar jam latihan ${profile.targetRace} (sebelum & 30–90 menit sesudah lari) serta cukupi protein harian untuk rasa kenyang dan pemulihan otot; BMI hanya acuan pendamping.`
          : `Sesuaikan asupan dengan beban latihan ${profile.targetRace} Anda: pakai batas atas karbohidrat di hari Long Run atau Tempo, dan batas bawah pada hari ringan atau istirahat.`;

  const recoveryTimings: NutritionRecoveryTiming[] =
    lang === 'en'
      ? [
          {
            key: 'pre',
            timingLabel: '60–120 Minutes Pre-Run',
            title: 'Light Pre-Run Fueling',
            macroFocus: 'Easy-to-digest carbs (30–60 g)',
            detail:
              'Helps provide energy before running without weighing down your stomach; individual tolerance varies.',
            foodExamples:
              '1–2 ripe bananas, toast with honey, or a small bowl of warm oats',
          },
          {
            key: 'post',
            timingLabel: '30–90 Minutes Post-Run (Flexible)',
            title: 'Post-Run Recovery Fueling',
            macroFocus: 'Example ~3:1 Carb-to-Protein strategy (20–30 g protein)',
            detail:
              'Supports glycogen replenishment and muscle repair. Urgency depends on session load and when your next run is; total daily intake still matters most.',
            foodExamples:
              'Low-fat milk + banana, yogurt with granola, steamed tempeh/tofu, or boiled eggs + toast',
          },
          {
            key: 'daily',
            timingLabel: 'Main Meals & Evening',
            title: 'Daily Repair & Hydration',
            macroFocus: 'Evenly spaced protein + complex carbs',
            detail:
              'Supports overall recovery between sessions so your legs feel ready for the next run.',
            foodExamples:
              'Rice, sweet potato, or cassava; chicken, fish, eggs, tofu/tempeh; leafy greens; and water + electrolytes',
          },
        ]
      : [
          {
            key: 'pre',
            timingLabel: '60–120 Menit Sebelum Lari',
            title: 'Isi Bahan Bakar Ringan',
            macroFocus: 'Karbohidrat mudah cerna (30–60 g)',
            detail:
              'Membantu menyediakan energi sebelum berlari tanpa membebani lambung; respons tiap orang berbeda.',
            foodExamples: '1–2 buah pisang, roti madu, atau oatmeal hangat porsi kecil',
          },
          {
            key: 'post',
            timingLabel: '30–90 Menit Setelah Lari (Fleksibel)',
            title: 'Asupan Pemulihan Pasca-Lari',
            macroFocus: 'Contoh strategi rasio Karbo : Protein ~3:1 (20–30 g protein)',
            detail:
              'Membantu isi ulang glikogen dan perbaikan otot. Urgensinya bergantung pada berat latihan & kapan sesi berikutnya; asupan harian tetap paling utama.',
            foodExamples:
              'Susu rendah lemak + pisang, yogurt dengan granola, tempe/tahu kukus, atau telur rebus + roti',
          },
          {
            key: 'daily',
            timingLabel: 'Makan Utama & Malam Hari',
            title: 'Pemeliharaan & Hidrasi Harian',
            macroFocus: 'Protein merata tiap makan + karbohidrat kompleks',
            detail:
              'Mendukung pemulihan menyeluruh antar sesi agar kaki terasa lebih siap pada latihan berikutnya.',
            foodExamples:
              'Nasi, ubi jalar, atau singkong; ayam, ikan, telur, tahu/tempe; sayur hijau; dan air + elektrolit',
          },
        ];

  return {
    targetRace: profile.targetRace,
    weightKg: safeWeight,
    carbsPerKgMin,
    carbsPerKgMax,
    carbsMinG,
    carbsMaxG,
    proteinPerKgMin,
    proteinPerKgMax,
    proteinMinG,
    proteinMaxG,
    hydrationLitersMin: base.hydrationMin,
    hydrationLitersMax: base.hydrationMax,
    bmiNutritionNote,
    recoveryTimings,
  };
}

function parseDateKeyUtcMs(dateKey: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  return Number.isFinite(ms) ? ms : null;
}

export function addDaysToDateKey(dateKey: string, daysToAdd: number): string {
  const baseMs = parseDateKeyUtcMs(dateKey) ?? Date.UTC(2026, 10, 19);
  const next = new Date(baseMs + daysToAdd * 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 10);
}

export function getDefaultRaceDateKey(
  todayDateKey: string,
  targetRace: RaceDistanceKey
): string {
  const daysAhead = DEFAULT_RACE_COUNTDOWN_DAYS[targetRace] ?? 42;
  return addDaysToDateKey(todayDateKey, daysAhead);
}

export function computeRaceCountdown(
  raceDateKey: string,
  targetRace: RaceDistanceKey,
  todayDateKey: string,
  lang: AppLanguage = 'id'
): RaceCountdownInfo {
  const safeRaceKey = parseDateKeyUtcMs(raceDateKey)
    ? raceDateKey
    : getDefaultRaceDateKey(todayDateKey, targetRace);

  const raceMs = parseDateKeyUtcMs(safeRaceKey) ?? Date.UTC(2026, 11, 31);
  const todayMs = parseDateKeyUtcMs(todayDateKey) ?? Date.UTC(2026, 10, 19);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((raceMs - todayMs) / dayMs);

  const d = new Date(raceMs);
  const months = lang === 'en' ? MONTHS_EN_SHORT : MONTHS_ID_SHORT;
  const formattedRaceDate = `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

  let status: RaceCountdownStatus = 'upcoming';
  if (diffDays < 0) status = 'passed';
  else if (diffDays === 0) status = 'race_day';
  else if (diffDays <= 6) status = 'race_week';
  else if (diffDays <= 21) status = 'tapering';

  const absDays = Math.max(0, diffDays);
  const weeksRemaining = Math.floor(absDays / 7);
  const remainderDays = absDays % 7;

  const phaseLabel =
    lang === 'en'
      ? status === 'race_day'
        ? 'Race Day!'
        : status === 'passed'
          ? 'Event Completed'
          : status === 'race_week'
            ? 'Race Week · Stay Fresh'
            : status === 'tapering'
              ? 'Tapering Phase'
              : 'Training Build Phase'
      : status === 'race_day'
        ? 'Hari Lomba!'
        : status === 'passed'
          ? 'Event Terlewati'
          : status === 'race_week'
            ? 'Pekan Lomba · Jaga Kesegaran'
            : status === 'tapering'
              ? 'Fase Tapering'
              : 'Fase Bangun Daya Tahan';

  const motivationTip =
    lang === 'en'
      ? status === 'race_day'
        ? `It is finally ${targetRace} race day. Trust your training, start calm, and enjoy every kilometer.`
        : status === 'passed'
          ? 'Pick a new upcoming race date to keep your motivation and countdown active.'
          : status === 'race_week'
            ? 'Keep runs short and easy, prioritize sleep, and hydrate steadily before the start line.'
            : status === 'tapering'
              ? 'Gradually trim weekly mileage while keeping crisp easy strides so your legs feel springy.'
              : 'Every consistent easy run today compounds into race-day confidence.'
      : status === 'race_day'
        ? `Hari perlombaan ${targetRace} telah tiba. Percayai latihan Anda, mulai dengan tenang, dan nikmati setiap kilometer.`
        : status === 'passed'
          ? 'Pilih tanggal target lomba berikutnya untuk menjaga semangat dan hitung mundur Anda tetap aktif.'
          : status === 'race_week'
            ? 'Kurangi beban latihan, cukupi tidur, dan jaga hidrasi menjelang garis start.'
            : status === 'tapering'
              ? 'Turunkan volume secara bertahap agar kaki terasa ringan dan penuh energi saat hari lomba.'
              : 'Setiap lari santai yang konsisten hari ini menabung kesiapan Anda menuju garis finis.';

  return {
    daysRemaining: diffDays,
    weeksRemaining,
    remainderDays,
    raceDateKey: safeRaceKey,
    formattedRaceDate,
    phaseLabel,
    motivationTip,
    status,
  };
}

function getWibDateKeyAndDayIndexFromIso(
  isoDate: string
): { dateKey: string; dayIndex: number } | null {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return null;
  const wib = new Date(parsed.getTime() + 7 * 60 * 60 * 1000);
  const dateKey = wib.toISOString().slice(0, 10);
  const utcDay = wib.getUTCDay(); // 0=Sun..6=Sat
  const dayIndex = utcDay === 0 ? 6 : utcDay - 1; // 0=Mon..6=Sun
  return { dateKey, dayIndex };
}

/**
 * Matches recent Strava runs (rolling 7 days relative to today, or falling back
 * to the latest 7-day window containing imported runs) to weekly schedule slots
 * without overwriting already logged days.
 */
export function findStravaProgressMatches(
  runs: RunActivity[],
  weeklySchedule: DailySessionPlan[],
  existingEntries: DailyProgressEntry[],
  referenceTodayKey: string,
  lang: AppLanguage = 'id'
): StravaSyncCandidate[] {
  if (runs.length === 0 || weeklySchedule.length === 0) return [];

  const parsedRuns = runs
    .map((run) => {
      const wib = getWibDateKeyAndDayIndexFromIso(run.startDate);
      return wib ? { run, ...wib } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => (a.dateKey > b.dateKey ? -1 : 1));

  if (parsedRuns.length === 0) return [];

  const recentStartKey = addDaysToDateKey(referenceTodayKey, -6);
  const inCurrentWindow = parsedRuns.filter(
    (item) => item.dateKey >= recentStartKey && item.dateKey <= referenceTodayKey
  );

  const windowAnchorKey =
    inCurrentWindow.length > 0 ? referenceTodayKey : parsedRuns[0].dateKey;
  const windowStartKey = addDaysToDateKey(windowAnchorKey, -6);

  const windowRuns = parsedRuns.filter(
    (item) => item.dateKey >= windowStartKey && item.dateKey <= windowAnchorKey
  );

  const loggedDayIndices = new Set(existingEntries.map((e) => e.dayIndex));
  const loggedDateKeys = new Set(existingEntries.map((e) => e.dateKey));

  const byDayIndex = new Map<
    number,
    {
      runId: string;
      names: string[];
      dateKey: string;
      dayIndex: number;
      meters: number;
      movingSeconds: number;
      hrValues: number[];
      startDate: string;
    }
  >();

  for (const item of windowRuns) {
    if (loggedDayIndices.has(item.dayIndex) || loggedDateKeys.has(item.dateKey)) {
      continue;
    }
    const existing = byDayIndex.get(item.dayIndex);
    if (!existing) {
      byDayIndex.set(item.dayIndex, {
        runId: item.run.id,
        names: [item.run.name],
        dateKey: item.dateKey,
        dayIndex: item.dayIndex,
        meters: item.run.distanceMeters,
        movingSeconds: item.run.movingTimeSeconds,
        hrValues:
          item.run.averageHeartRate && item.run.averageHeartRate > 0
            ? [item.run.averageHeartRate]
            : [],
        startDate: item.run.startDate,
      });
    } else {
      existing.meters += item.run.distanceMeters;
      existing.movingSeconds += item.run.movingTimeSeconds;
      if (item.run.averageHeartRate && item.run.averageHeartRate > 0) {
        existing.hrValues.push(item.run.averageHeartRate);
      }
      if (!existing.names.includes(item.run.name)) {
        existing.names.push(item.run.name);
      }
    }
  }

  const candidates: StravaSyncCandidate[] = [];
  for (const grouped of byDayIndex.values()) {
    const planDay = weeklySchedule.find((s) => s.dayIndex === grouped.dayIndex);
    if (!planDay) continue;
    const actualKm = Math.round((grouped.meters / 1000) * 10) / 10;
    if (actualKm <= 0) continue;
    const paceSecPerKm =
      grouped.movingSeconds > 0
        ? computePaceSecPerKm(grouped.meters, grouped.movingSeconds)
        : null;
    const avgHeartRateBpm =
      grouped.hrValues.length > 0
        ? Math.round(
            grouped.hrValues.reduce((s, v) => s + v, 0) /
              grouped.hrValues.length
          )
        : null;

    const isPlannedRest = planDay.zone === 'rest';

    candidates.push({
      runId: grouped.runId,
      runName: grouped.names.join(' + '),
      dateKey: grouped.dateKey,
      dayIndex: grouped.dayIndex,
      dayName: planDay.dayName,
      actualKm,
      plannedKm: planDay.targetDistanceKm,
      paceSecPerKm,
      avgHeartRateBpm,
      zone: isPlannedRest ? 'easy' : planDay.zone,
      sessionTitle: isPlannedRest
        ? lang === 'en'
          ? 'Extra Run (Planned Rest)'
          : 'Lari Ekstra (Hari Istirahat)'
        : planDay.title,
      startDate: grouped.startDate,
    });
  }

  return candidates.sort((a, b) => (a.dateKey > b.dateKey ? -1 : 1));
}

export function buildProgressEntriesFromMatches(
  candidates: StravaSyncCandidate[],
  syncTag: string
): DailyProgressEntry[] {
  return candidates.map((c) => ({
    dateKey: c.dateKey,
    dayIndex: c.dayIndex,
    sessionTitle: c.sessionTitle,
    zone: c.zone,
    plannedKm: c.plannedKm,
    actualKm: c.actualKm,
    paceSecPerKm: c.paceSecPerKm ?? null,
    avgHeartRateBpm: c.avgHeartRateBpm ?? null,
    comfortRating: 4,
    note: `${syncTag}: ${c.runName}`,
    completedAt: c.startDate,
  }));
}

/**
 * Computes Karvonen Heart Rate Zones (Z1-Z5), observed average HR,
 * and estimated VO2max (Uth HRmax/HRrest ratio blended with submaximal Strava speed-HR efficiency).
 */
export function computeHeartRateAndVo2Max(
  profile: RunnerProfile,
  runs: RunActivity[],
  dailyEntries: DailyProgressEntry[],
  lang: AppLanguage = 'id'
): HeartRateVo2Summary {
  const safeAge = clampNumber(profile.age, 14, 85);
  const restingHrBpm = Math.round(
    clampNumber(profile.restingHrBpm ?? 60, 35, 110)
  );
  const autoMaxHr = Math.round(208 - 0.7 * safeAge);
  const isCustomMaxHr = Boolean(
    profile.maxHrBpm &&
      Number.isFinite(profile.maxHrBpm) &&
      profile.maxHrBpm >= 120 &&
      profile.maxHrBpm <= 230
  );
  const maxHrBpm = isCustomMaxHr ? Math.round(profile.maxHrBpm!) : autoMaxHr;
  const hrr = Math.max(40, maxHrBpm - restingHrBpm);

  const zones: HeartRateZone[] = [
    {
      zone: 'Z1',
      label: lang === 'en' ? 'Recovery' : 'Pemulihan',
      pctRange: '50–60%',
      minBpm: Math.round(restingHrBpm + hrr * 0.5),
      maxBpm: Math.round(restingHrBpm + hrr * 0.6),
      purpose:
        lang === 'en'
          ? 'Warm-up & light shakeout'
          : 'Pemanasan & pemulihan aktif',
    },
    {
      zone: 'Z2',
      label: lang === 'en' ? 'Aerobic / Easy' : 'Aerobik / Easy',
      pctRange: '60–70%',
      minBpm: Math.round(restingHrBpm + hrr * 0.6),
      maxBpm: Math.round(restingHrBpm + hrr * 0.7),
      purpose:
        lang === 'en'
          ? 'Fat burn & endurance base'
          : 'Bangun fondasi daya tahan',
    },
    {
      zone: 'Z3',
      label: lang === 'en' ? 'Tempo' : 'Tempo',
      pctRange: '70–80%',
      minBpm: Math.round(restingHrBpm + hrr * 0.7),
      maxBpm: Math.round(restingHrBpm + hrr * 0.8),
      purpose:
        lang === 'en'
          ? 'Steady aerobic rhythm'
          : 'Ritme stabil daya tahan',
    },
    {
      zone: 'Z4',
      label: lang === 'en' ? 'Threshold' : 'Ambang Laktat',
      pctRange: '80–90%',
      minBpm: Math.round(restingHrBpm + hrr * 0.8),
      maxBpm: Math.round(restingHrBpm + hrr * 0.9),
      purpose:
        lang === 'en'
          ? 'Raise race-pace stamina'
          : 'Tingkatkan ketahanan pace lomba',
    },
    {
      zone: 'Z5',
      label: lang === 'en' ? 'VO2max' : 'VO2max',
      pctRange: '90–100%',
      minBpm: Math.round(restingHrBpm + hrr * 0.9),
      maxBpm: maxHrBpm,
      purpose:
        lang === 'en'
          ? 'Peak oxygen capacity & speed'
          : 'Kapasitas oksigen & kecepatan puncak',
    },
  ];

  // Collect observed HR from daily logs + Strava runs
  const dailyHrs = dailyEntries
    .map((e) => e.avgHeartRateBpm)
    .filter((v): v is number => typeof v === 'number' && v > 35 && v <= 230);
  const stravaHrs = runs
    .map((r) => r.averageHeartRate)
    .filter((v): v is number => typeof v === 'number' && v > 35 && v <= 230);
  const allHrs = [...dailyHrs, ...stravaHrs];
  const avgLoggedHrBpm =
    allHrs.length > 0
      ? Math.round(allHrs.reduce((s, v) => s + v, 0) / allHrs.length)
      : null;

  // Base Uth-Sorensen VO2max from HRmax/HRrest ratio
  const uthVo2 = clampNumber(15.3 * (maxHrBpm / restingHrBpm), 22, 85);

  const stravaWithSpeedAndHr = runs.filter((r) => {
    const quality = assessRunDataQuality(r);
    if (quality.reason === 'implausible_fast' || quality.reason === 'implausible_slow') {
      return false;
    }
    const effectiveSpeed =
      r.distanceMeters > 0 && r.movingTimeSeconds > 0
        ? r.distanceMeters / r.movingTimeSeconds
        : r.averageSpeedMps;
    return (
      effectiveSpeed > 1.2 &&
      effectiveSpeed <= 7.5 &&
      r.averageHeartRate !== null &&
      r.averageHeartRate > restingHrBpm + 20
    );
  });

  let vo2Max = Math.round(uthVo2 * 10) / 10;
  let vo2MaxSource: HeartRateVo2Summary['vo2MaxSource'] = 'resting_ratio';

  if (stravaWithSpeedAndHr.length > 0) {
    const sampleVo2s = stravaWithSpeedAndHr.map((r) => {
      const effectiveSpeed =
        r.distanceMeters > 0 && r.movingTimeSeconds > 0
          ? r.distanceMeters / r.movingTimeSeconds
          : r.averageSpeedMps;
      const speedMPerMin = effectiveSpeed * 60;
      const runningVo2Cost = 0.2 * speedMPerMin + 3.5;
      const pctHrr = clampNumber(
        ((r.averageHeartRate ?? restingHrBpm) - restingHrBpm) / hrr,
        0.45,
        0.98
      );
      return clampNumber(runningVo2Cost / pctHrr, 22, 85);
    });
    const avgRunVo2 =
      sampleVo2s.reduce((s, v) => s + v, 0) / sampleVo2s.length;
    vo2Max = Math.round((0.55 * avgRunVo2 + 0.45 * uthVo2) * 10) / 10;
    vo2MaxSource = 'strava_hr_blended';
  }

  const vo2MaxCategory =
    lang === 'en'
      ? vo2Max >= 56
        ? 'Superior'
        : vo2Max >= 48
          ? 'Excellent'
          : vo2Max >= 41
            ? 'Good'
            : vo2Max >= 34
              ? 'Fair'
              : 'Needs Base Building'
      : vo2Max >= 56
        ? 'Elit'
        : vo2Max >= 48
          ? 'Sangat Baik'
          : vo2Max >= 41
            ? 'Baik'
            : vo2Max >= 34
              ? 'Cukup'
              : 'Perlu Bangun Dasar';

  const vo2MaxNote =
    lang === 'en'
      ? vo2MaxSource === 'strava_hr_blended'
        ? `Non-lab estimate from ${stravaWithSpeedAndHr.length} valid Strava HR runs blended with Uth HRmax/HRrest ratio (15.3 × HRmax/HRrest).`
        : 'Non-lab estimate from Resting HR & Max HR ratio (Uth formula: 15.3 × HRmax/HRrest). Not a substitute for a lab VO2max test.'
      : vo2MaxSource === 'strava_hr_blended'
        ? `Estimasi non-lab dari ${stravaWithSpeedAndHr.length} sesi Strava ber-HR yang valid dan rasio HRmaks/HRistirahat (rumus Uth).`
        : 'Estimasi non-lab dari rasio HR Istirahat & HR Maksimal (rumus Uth: 15,3 × HRmaks/HRistirahat), bukan pengganti tes laboratorium.';

  return {
    restingHrBpm,
    maxHrBpm,
    isCustomMaxHr,
    avgLoggedHrBpm,
    vo2Max,
    vo2MaxCategory,
    vo2MaxNote,
    vo2MaxSource,
    zones,
  };
}

/**
 * Evaluates whether a target race pace is aligned with recent running history
 * so users distinguish Target Race Pace (goal) from Current Training Pace (today's readiness).
 */
export function evaluateTargetPaceReadiness(params: {
  goalRace: RaceDistanceKey;
  goalPaceSecPerKm: number;
  kpi: KpiSummary;
  daysToRace: number;
  lang?: AppLanguage;
}): TargetPaceReadinessAssessment {
  const { goalRace, goalPaceSecPerKm, kpi, daysToRace, lang = 'id' } = params;
  const hasValidBaseline =
    kpi.runCount30Days > 0 &&
    kpi.thirtyDayAvgPaceSecPerKm >= 140 &&
    kpi.thirtyDayAvgPaceSecPerKm <= 1800;

  if (!hasValidBaseline) {
    const recommendedTrainingPaceSecPerKm = Math.round(goalPaceSecPerKm * 1.06);
    return {
      status: 'no_history_caution',
      goalRace,
      goalPaceSecPerKm,
      currentBaselinePaceSecPerKm: null,
      recommendedTrainingPaceSecPerKm,
      gapPct: null,
      daysToRace,
      headline:
        lang === 'en'
          ? 'No Recent Run History for Readiness Check'
          : 'Belum Ada Riwayat Lari 30 Hari untuk Kalibrasi',
      explanation:
        lang === 'en'
          ? `Your ${goalRace} target (${formatPace(goalPaceSecPerKm)}) is a finish-day goal, not necessarily your current safe training intensity. Import Strava runs or start 6% more conservatively (${formatPace(recommendedTrainingPaceSecPerKm)}) if you are returning from a break.`
          : `Target ${goalRace} (${formatPace(goalPaceSecPerKm)}) adalah kecepatan lomba yang ingin dicapai, bukan otomatis kemampuan latihan saat ini. Impor riwayat Strava atau mulai ~6% lebih santai (${formatPace(recommendedTrainingPaceSecPerKm)}) bila baru mulai berlatih.`,
      suggestedTrainingNote:
        lang === 'en'
          ? `Conservative start pace: ${formatPace(recommendedTrainingPaceSecPerKm)}`
          : `Saran pace latihan awal lebih aman: ${formatPace(recommendedTrainingPaceSecPerKm)}`,
    };
  }

  const currentBaselinePaceSecPerKm = kpi.thirtyDayAvgPaceSecPerKm;
  const gapPct =
    Math.round(
      ((currentBaselinePaceSecPerKm - goalPaceSecPerKm) /
        currentBaselinePaceSecPerKm) *
        1000
    ) / 10;

  const needsCaution =
    gapPct > 15 || (gapPct > 8 && daysToRace >= 0 && daysToRace < 42);

  if (needsCaution) {
    const recommendedTrainingPaceSecPerKm = Math.max(
      goalPaceSecPerKm,
      Math.round(currentBaselinePaceSecPerKm * 0.94)
    );
    return {
      status: 'ambitious_caution',
      goalRace,
      goalPaceSecPerKm,
      currentBaselinePaceSecPerKm,
      recommendedTrainingPaceSecPerKm,
      gapPct,
      daysToRace,
      headline:
        lang === 'en'
          ? 'Target Pace Is Significantly Faster Than Current Baseline'
          : 'Target Pace Lomba Jauh Lebih Cepat dari Baseline Saat Ini',
      explanation:
        lang === 'en'
          ? `Your ${goalRace} goal pace (${formatPace(goalPaceSecPerKm)}) is ${formatDecimalComma(gapPct, 1, 'en')}% faster than your 30-day average (${formatPace(currentBaselinePaceSecPerKm)}). Remember: Easy runs raise that average, yet jumping straight to goal-pace zones with ${Math.max(0, daysToRace)} days left can overload joints.`
          : `Target pace ${goalRace} (${formatPace(goalPaceSecPerKm)}) lebih cepat ${formatDecimalComma(gapPct, 1, 'id')}% daripada rata-rata 30 hari Anda (${formatPace(currentBaselinePaceSecPerKm)}). Meski Easy run membuat rata-rata lebih lambat, langsung berlatih di zona target dengan sisa ${Math.max(0, daysToRace)} hari berisiko membebani pemulihan.`,
      suggestedTrainingNote:
        lang === 'en'
          ? `Conservative current training basis: ${formatPace(recommendedTrainingPaceSecPerKm)} (step toward your goal after a 2–3 week test run)`
          : `Saran pace latihan saat ini: ${formatPace(recommendedTrainingPaceSecPerKm)} (evaluasi bertahap lewat tes lari 2–3 minggu)`,
    };
  }

  return {
    status: 'aligned',
    goalRace,
    goalPaceSecPerKm,
    currentBaselinePaceSecPerKm,
    recommendedTrainingPaceSecPerKm: goalPaceSecPerKm,
    gapPct,
    daysToRace,
    headline:
      lang === 'en'
        ? 'Goal Pace Is Realistic for Your Recent Baseline'
        : 'Target Pace Selaras dengan Riwayat 30 Hari Anda',
    explanation:
      lang === 'en'
        ? `Your ${goalRace} goal (${formatPace(goalPaceSecPerKm)}) sits within a manageable step from your 30-day average (${formatPace(currentBaselinePaceSecPerKm)}). Keep Easy days truly comfortable.`
        : `Target ${goalRace} (${formatPace(goalPaceSecPerKm)}) berada dalam jarak progres yang wajar dari rata-rata 30 hari Anda (${formatPace(currentBaselinePaceSecPerKm)}). Tetap jaga porsi Easy agar benar-benar santai.`,
    suggestedTrainingNote:
      lang === 'en'
        ? 'Ready to apply directly or keep your current Strava baseline.'
        : 'Siap diterapkan ke zona latihan atau tetap pakai baseline Strava.',
  };
}

/**
 * Transparent, rule-based conservative weekly plan adaptation answering:
 * "What changes if I miss workouts, exceed planned volume, or feel unusually fatigued?"
 */
export function computeAdaptivePlanAdjustment(params: {
  weeklySchedule: DailySessionPlan[];
  progressEntries: DailyProgressEntry[];
  dailyStats: DailyProgressStats;
  todayDateKey: string;
  todayDayIndex: number;
  manualFatigueMode?: boolean;
  lang?: AppLanguage;
}): AdaptivePlanAdjustment {
  const {
    weeklySchedule,
    progressEntries,
    dailyStats,
    todayDateKey,
    todayDayIndex,
    manualFatigueMode = false,
    lang = 'id',
  } = params;

  const getWeekdayIndexFromKey = (key: string): number => {
    const ms = parseDateKeyUtcMs(key);
    if (ms === null) return 0;
    const utcDay = new Date(ms).getUTCDay();
    return utcDay === 0 ? 6 : utcDay - 1;
  };

  const todayWeekday = getWeekdayIndexFromKey(todayDateKey);
  const weekStartKey = addDaysToDateKey(todayDateKey, -todayWeekday);
  const weekEndKey = addDaysToDateKey(weekStartKey, 6);
  const thisWeekEntries = progressEntries.filter(
    (e) => e.dateKey >= weekStartKey && e.dateKey <= weekEndKey
  );

  const reasons: AdaptivePlanAdjustment['reasons'] = [];

  const recentFatigueEntry = thisWeekEntries.find(
    (e) => e.comfortRating <= 2 && e.zone !== 'rest'
  );
  if (recentFatigueEntry) {
    reasons.push('heavy_fatigue');
  }

  const loggedDayIndices = new Set(
    thisWeekEntries
      .filter((e) => e.zone !== 'rest' && e.actualKm > 0)
      .map((e) => e.dayIndex)
  );
  const missedEarlierRuns = weeklySchedule.filter(
    (s) =>
      s.zone !== 'rest' &&
      s.dayIndex < todayDayIndex &&
      !loggedDayIndices.has(s.dayIndex)
  );
  if (missedEarlierRuns.length >= 2) {
    reasons.push('missed_sessions');
  }

  if (dailyStats.isVolumeSignificantlyOverPlan) {
    reasons.push('volume_overload');
  }

  if (manualFatigueMode) {
    reasons.push('manual_fatigue');
  }

  if (reasons.length === 0) {
    return {
      triggered: false,
      reasons: [],
      volumeMultiplier: 1,
      downgradeQualityToEasy: false,
      headline:
        lang === 'en'
          ? 'Normal Weekly Plan Active (No Deload Triggered)'
          : 'Jadwal Normal Aktif (Belum Ada Penyesuaian Pemulihan)',
      summary:
        lang === 'en'
          ? 'If you log heavy fatigue (score 1–2), miss 2+ sessions, exceed planned km by >15%, or toggle "Legs Feel Heavy", remaining workouts automatically ease back.'
          : 'Jika Anda mencatat rasa berat/lelah (skor 1–2), melewatkan 2+ sesi, melebihi target >15%, atau menyalakan mode "Kaki Terasa Berat", sisa jadwal minggu ini otomatis diturunkan.',
      nextSessionAction:
        lang === 'en'
          ? 'Follow your scheduled intensity and keep Easy runs conversational.'
          : 'Jalani jadwal sesuai rencana dan jaga porsi Easy tetap nyaman.',
      adjustedTotalWeekKm: dailyStats.plannedWeekKm,
    };
  }

  const needsDeeperTrim =
    reasons.includes('volume_overload') ||
    (reasons.includes('heavy_fatigue') && reasons.includes('manual_fatigue'));
  const volumeMultiplier = needsDeeperTrim ? 0.8 : 0.85;
  const downgradeQualityToEasy =
    reasons.includes('heavy_fatigue') ||
    reasons.includes('volume_overload') ||
    reasons.includes('manual_fatigue');

  const adjustedTotalWeekKm =
    Math.round(dailyStats.plannedWeekKm * volumeMultiplier * 10) / 10;

  const reasonLabels = reasons.map((r) => {
    if (lang === 'en') {
      if (r === 'heavy_fatigue') return 'heavy fatigue logged (score ≤ 2)';
      if (r === 'missed_sessions')
        return `${missedEarlierRuns.length} missed planned runs this week`;
      if (r === 'volume_overload')
        return `actual volume at ${dailyStats.actualVsPlannedPct}% of plan`;
      return 'manual recovery mode enabled';
    }
    if (r === 'heavy_fatigue') return 'catatan sesi terasa berat/lelah (skor ≤ 2)';
    if (r === 'missed_sessions')
      return `${missedEarlierRuns.length} sesi terjadwal minggu ini terlewat`;
    if (r === 'volume_overload')
      return `jarak aktual mencapai ${dailyStats.actualVsPlannedPct}% dari rencana`;
    return 'mode pemulihan manual diaktifkan';
  });

  const trimPct = Math.round((1 - volumeMultiplier) * 100);

  return {
    triggered: true,
    reasons,
    volumeMultiplier,
    downgradeQualityToEasy,
    headline:
      lang === 'en'
        ? `Conservative Recovery Adjustment (-${trimPct}% Volume)`
        : `Penyesuaian Pemulihan Konservatif (-${trimPct}% Volume)`,
    summary:
      lang === 'en'
        ? `Triggered by: ${reasonLabels.join(' · ')}. Do not try to "make up" missed mileage all at once.`
        : `Dipicu oleh: ${reasonLabels.join(' · ')}. Jangan memaksakan mengejar seluruh jarak yang terlewat sekaligus.`,
    nextSessionAction: downgradeQualityToEasy
      ? lang === 'en'
        ? `Swap remaining Tempo/Interval sessions to Easy Pace and trim remaining distances by ${trimPct}%.`
        : `Ubah sisa sesi Tempo/Interval menjadi Easy Pace dan pangkas target jarak sisa sekitar ${trimPct}%.`
      : lang === 'en'
        ? `Resume calmly with ${trimPct}% lighter distance on remaining runs rather than doubling up sessions.`
        : `Lanjutkan bertahap dengan jarak ${trimPct}% lebih ringan pada sisa sesi tanpa menumpuk latihan.`,
    adjustedTotalWeekKm,
  };
}

/**
 * Pure helper to update distance & moving time on an imported/logged run activity,
 * recomputing derived average speed and clearing prior anomaly flags when valid.
 */
export function updateRunActivityDistanceAndTime(
  run: RunActivity,
  distanceMeters: number,
  movingTimeSeconds: number
): RunActivity {
  const safeDistance = Math.max(100, Math.min(500000, Math.round(distanceMeters)));
  const safeMovingTime = Math.max(30, Math.min(604800, Math.round(movingTimeSeconds)));
  const recomputedSpeedMps = safeDistance / safeMovingTime;

  const updated: RunActivity = {
    ...run,
    distanceMeters: safeDistance,
    movingTimeSeconds: safeMovingTime,
    elapsedTimeSeconds: Math.max(safeMovingTime, run.elapsedTimeSeconds || safeMovingTime),
    averageSpeedMps: recomputedSpeedMps,
    maxSpeedMps: Math.max(recomputedSpeedMps, run.maxSpeedMps || recomputedSpeedMps),
  };
  delete updated.dataWarningReason;
  return updated;
}

/**
 * Scales a Week 1 weeklySchedule to any week (1..4) in the 4-week progressive block
 * so runners can inspect upcoming build & cutback weeks just like Runna.
 */
export function scaleScheduleForWeek(
  plan: TrainingPlanSummary,
  weekNumber: 1 | 2 | 3 | 4,
  lang: AppLanguage = 'id'
): {
  weekInfo: WeeklyVolumeProgression;
  schedule: DailySessionPlan[];
  totalKm: number;
} {
  const weekInfo =
    plan.fourWeekProgression.find((w) => w.weekNumber === weekNumber) ??
    plan.fourWeekProgression[0];
  const baseWeekKm = Math.max(0.1, plan.fourWeekProgression[0]?.targetVolumeKm || plan.totalPlannedWeekKm || 1);
  const ratio = weekInfo ? weekInfo.targetVolumeKm / baseWeekKm : 1;

  if (weekNumber === 1 || Math.abs(ratio - 1) < 0.01) {
    return {
      weekInfo,
      schedule: plan.weeklySchedule,
      totalKm: plan.totalPlannedWeekKm,
    };
  }

  const schedule = plan.weeklySchedule.map((session) => {
    if (session.zone === 'rest') return session;
    const scaledKm = Math.max(1.5, Math.round(session.targetDistanceKm * ratio * 10) / 10);
    const estDuration = session.estimatedDurationMin
      ? Math.max(12, Math.round(session.estimatedDurationMin * ratio))
      : undefined;

    const scaledSteps = session.workoutSteps?.map((step) => {
      if (step.phase !== 'main') return step;
      if (session.zone === 'interval') {
        const baseReps = clampNumber(Math.round(((scaledKm - 2.2) * 1000) / 500), 4, 8);
        return {
          ...step,
          targetText:
            lang === 'en'
              ? `${baseReps}×400m fast + 90s walk/jog recovery`
              : `${baseReps}×400m cepat + jeda jalan/jog 90 dtk`,
        };
      }
      const wu = scaledKm >= 5 ? 1.5 : 1.0;
      const cd = 1.0;
      const mainKm = Math.max(1.0, Math.round((scaledKm - wu - cd) * 10) / 10);
      if (session.zone === 'tempo') {
        return {
          ...step,
          targetText:
            lang === 'en'
              ? `${formatDecimalComma(mainKm, 1, lang)} km steady Tempo`
              : `${formatDecimalComma(mainKm, 1, lang)} km Tempo stabil`,
        };
      }
      if (session.zone === 'long_run') {
        return {
          ...step,
          targetText:
            lang === 'en'
              ? `${formatDecimalComma(Math.max(1.5, scaledKm - 2.5), 1, lang)} km conversational aerobic`
              : `${formatDecimalComma(Math.max(1.5, scaledKm - 2.5), 1, lang)} km aerobik nyaman`,
        };
      }
      return {
        ...step,
        targetText: `${formatDecimalComma(scaledKm, 1, lang)} km`,
      };
    });

    return {
      ...session,
      targetDistanceKm: scaledKm,
      estimatedDurationMin: estDuration,
      workoutSteps: scaledSteps,
    };
  });

  const totalKm =
    Math.round(schedule.reduce((sum, s) => sum + s.targetDistanceKm, 0) * 10) / 10;

  return {
    weekInfo,
    schedule,
    totalKm,
  };
}

/**
 * Predicts 5K, 10K, 21K, and 42K race finish times from the runner's baseline pace
 * using the Riegel equivalence formula (T2 = T1 * (D2 / D1)^1.06).
 */
export function predictRaceFinishTimes(
  baselinePaceSecPerKm: number,
  targetRace: RaceDistanceKey,
  paceZoneBasis: TrainingPlanSummary['paceZoneBasis'] = 'default'
): RacePredictionItem[] {
  const safePace = clampNumber(baselinePaceSecPerKm > 0 ? baselinePaceSecPerKm : 365, 150, 900);
  const referenceDistanceKm =
    paceZoneBasis === 'race_goal'
      ? RACE_TARGETS_BY_LANG.id[targetRace].distanceKm
      : 5.0;
  const referencePaceSec =
    paceZoneBasis === 'race_goal' ? safePace : Math.max(150, safePace - 25);
  const referenceTotalSeconds = referenceDistanceKm * referencePaceSec;

  const raceKeys: RaceDistanceKey[] = ['5K', '10K', '21K', '42K'];
  return raceKeys.map((race) => {
    const distanceKm = RACE_TARGETS_BY_LANG.id[race].distanceKm;
    const predictedSeconds = Math.round(
      referenceTotalSeconds * Math.pow(distanceKm / referenceDistanceKm, 1.06)
    );
    const paceSecPerKm = Math.round(predictedSeconds / distanceKm);
    return {
      race,
      distanceKm,
      predictedSeconds,
      formattedTime: formatDuration(predictedSeconds),
      paceSecPerKm,
      formattedPace: formatPace(paceSecPerKm),
      isCurrentTarget: race === targetRace,
    };
  });
}

