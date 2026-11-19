import {
  BMI_ZONES_BY_LANG,
  DAY_NAMES_BY_LANG,
  DEFAULT_RACE_COUNTDOWN_DAYS,
  RACE_TARGETS_BY_LANG,
  RUN_TYPE_LABELS_BY_LANG,
} from './config';
import {
  AppLanguage,
  BmiCategoryKey,
  BmiResult,
  DailyProgressEntry,
  DailySessionPlan,
  KpiSummary,
  NutritionRecommendation,
  NutritionRecoveryTiming,
  PaceZoneRange,
  RaceCountdownInfo,
  RaceCountdownStatus,
  RaceDistanceKey,
  RoutePoint,
  RunActivity,
  RunnerProfile,
  StravaSyncCandidate,
  TrainingPlanSummary,
  WeeklyChartBucket,
  WeeklyVolumeProgression,
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
  if (averageSpeedMps && averageSpeedMps > 0.2) {
    return Math.round(1000 / averageSpeedMps);
  }
  const km = distanceMeters / 1000;
  if (km <= 0 || movingTimeSeconds <= 0) return 0;
  return Math.round(movingTimeSeconds / km);
}

export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '--:--/km';
  const totalSec = Math.round(secPerKm);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}/km`;
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
  referenceNow: Date = new Date('2026-11-19T12:00:00+07:00')
): KpiSummary {
  if (runs.length === 0) {
    return {
      fourWeekAvgKm: 0,
      thirtyDayTotalKm: 0,
      thirtyDayAvgPaceSecPerKm: 0,
      longestRunKm: 0,
      runCount30Days: 0,
      totalActivitiesCount: 0,
    };
  }

  const sorted = [...runs].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Anchor to referenceNow if there are runs within 30 days of referenceNow,
  // otherwise anchor to the newest activity's timestamp so historical imports still produce useful KPIs.
  const newestRunTime = new Date(sorted[0].startDate).getTime();
  const refTime = referenceNow.getTime();
  const anchorMs =
    refTime - newestRunTime <= 30 * 24 * 60 * 60 * 1000 ? refTime : newestRunTime;

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
  const thirtyDayTotalSeconds = runs30Days.reduce(
    (acc, r) => acc + r.movingTimeSeconds,
    0
  );
  const thirtyDayTotalKm = Math.round((thirtyDayTotalMeters / 1000) * 100) / 100;

  const thirtyDayAvgPaceSecPerKm =
    thirtyDayTotalMeters > 0
      ? Math.round(thirtyDayTotalSeconds / (thirtyDayTotalMeters / 1000))
      : 0;

  const longestMeters = sorted.reduce(
    (max, r) => Math.max(max, r.distanceMeters),
    0
  );
  const longestRunKm = Math.round((longestMeters / 1000) * 100) / 100;

  return {
    fourWeekAvgKm,
    thirtyDayTotalKm,
    thirtyDayAvgPaceSecPerKm,
    longestRunKm,
    runCount30Days: runs30Days.length,
    totalActivitiesCount: sorted.length,
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
  referenceNow: Date = new Date('2026-11-19T12:00:00+07:00'),
  lang: AppLanguage = 'id'
): WeeklyChartBucket[] {
  const anchorDate =
    runs.length > 0
      ? (() => {
          const newest = Math.max(
            ...runs.map((r) => new Date(r.startDate).getTime())
          );
          return referenceNow.getTime() - newest <= 56 * 24 * 60 * 60 * 1000
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
  lang: AppLanguage = 'id'
): PaceZoneRange[] {
  const base = clampNumber(
    baselinePaceSecPerKm > 0 ? baselinePaceSecPerKm : 365,
    180,
    720
  );

  const easyMin = base + 45;
  const easyMax = base + 75;

  const tempoFast = Math.max(150, base - 25);
  const tempoSlow = Math.max(165, base - 15);

  const intervalFast = Math.max(135, base - 50);
  const intervalSlow = Math.max(150, base - 35);

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

  const baselinePaceSecPerKm = hasRunHistory
    ? kpi.thirtyDayAvgPaceSecPerKm
    : 365; // default 06:05/km

  const paceZones = computePaceZones(baselinePaceSecPerKm, lang);
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
                ? `Gradual +${weeklyIncreasePct}% step-up within BMI safety bounds.`
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
                ? `Naik bertahap +${weeklyIncreasePct}% sesuai batas aman BMI.`
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

  const weeklySchedule: DailySessionPlan[] = dayNames.map((dayName, dayIndex) => {
    const activePos = activeIndices.indexOf(dayIndex);
    if (activePos === -1) {
      return {
        dayIndex,
        dayName,
        zone: 'rest',
        title:
          lang === 'en'
            ? 'Rest & Active Recovery'
            : 'Hari Istirahat & Pemulihan',
        targetDistanceKm: 0,
        paceRange: lang === 'en' ? 'Rest' : 'Istirahat',
        guidance:
          lang === 'en'
            ? 'Prioritize quality sleep, steady hydration, and 10 minutes of gentle mobility.'
            : 'Fokus tidur cukup, hidrasi, dan peregangan ringan 10 menit.',
      };
    }

    const role = slotRoles[activePos];
    const km = Math.max(
      minSessionKm,
      Math.round(((scheduleTargetWeekKm * roleWeights[role]) / totalWeight) * 10) / 10
    );

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
    isUsingDefaultBaseline: !hasRunHistory,
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
 * Computes consecutive daily streak & weekly completion stats for Daily Progress Tracker.
 */
export function computeDailyProgressStats(
  entries: DailyProgressEntry[],
  weeklySchedule: DailySessionPlan[],
  todayDateKey: string
): {
  currentStreakDays: number;
  completedThisWeekCount: number;
  plannedRunSessionsCount: number;
  totalLoggedKm: number;
  completionPct: number;
} {
  const uniqueDates = Array.from(new Set(entries.map((e) => e.dateKey))).sort(
    (a, b) => (a > b ? -1 : 1)
  );

  let streak = 0;
  if (uniqueDates.length > 0) {
    const parseUtcDay = (key: string) => {
      const [y, m, d] = key.split('-').map(Number);
      return Date.UTC(y, m - 1, d);
    };

    const todayMs = parseUtcDay(todayDateKey);
    const newestMs = parseUtcDay(uniqueDates[0]);
    const dayMs = 24 * 60 * 60 * 1000;

    // Streak stays active if newest log is today or yesterday
    if (todayMs - newestMs <= dayMs && newestMs <= todayMs) {
      streak = 1;
      let prevMs = newestMs;
      for (let i = 1; i < uniqueDates.length; i++) {
        const currMs = parseUtcDay(uniqueDates[i]);
        if (prevMs - currMs === dayMs) {
          streak++;
          prevMs = currMs;
        } else if (prevMs !== currMs) {
          break;
        }
      }
    }
  }

  const plannedRunSessionsCount = weeklySchedule.filter(
    (s) => s.zone !== 'rest'
  ).length;
  const completedDayIndices = new Set(entries.map((e) => e.dayIndex));
  const completedThisWeekCount = weeklySchedule.filter(
    (s) => s.zone !== 'rest' && completedDayIndices.has(s.dayIndex)
  ).length;

  const totalLoggedKm =
    Math.round(entries.reduce((sum, e) => sum + e.actualKm, 0) * 10) / 10;

  const completionPct =
    plannedRunSessionsCount > 0
      ? Math.min(
          100,
          Math.round((completedThisWeekCount / plannedRunSessionsCount) * 100)
        )
      : 0;

  return {
    currentStreakDays: streak,
    completedThisWeekCount,
    plannedRunSessionsCount,
    totalLoggedKm,
    completionPct,
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
        ? 'With an Underweight BMI, aim toward the upper end of your carbohydrate & protein ranges and add a nutrient-dense snack after running to protect lean mass and energy.'
        : bmiResult.category === 'berlebih' || bmiResult.category === 'obesitas'
          ? 'Time your carbohydrate intake around training sessions (before and 30–60 minutes after running) and meet your protein target to support satiety and muscle repair.'
          : 'Balanced macronutrient strategy: lean toward the upper carb range on Long Run or Tempo days, and the lower bound on rest days.'
      : bmiResult.category === 'kurus'
        ? 'Dengan BMI Kurus, prioritaskan batas atas rentang karbohidrat & protein serta tambah camilan padat gizi setelah sesi lari agar massa otot dan energi tetap terjaga.'
        : bmiResult.category === 'berlebih' || bmiResult.category === 'obesitas'
          ? 'Fokuskan porsi karbohidrat di sekitar waktu latihan (sebelum & 30–60 menit sesudah lari) dan penuhi target protein untuk menjaga rasa kenyang serta pemulihan jaringan otot.'
          : 'Distribusi makronutrisi seimbang: sesuaikan asupan karbohidrat di batas atas pada hari Long Run atau Tempo, dan batas bawah pada hari istirahat.';

  const recoveryTimings: NutritionRecoveryTiming[] =
    lang === 'en'
      ? [
          {
            key: 'pre',
            timingLabel: '60–120 Minutes Pre-Run',
            title: 'Light Pre-Run Fueling',
            macroFocus: 'Fast-digesting carbs (30–60 g)',
            detail:
              'Stabilizes blood glucose before stepping out without weighing down your stomach.',
            foodExamples: '1–2 ripe bananas, whole-grain toast with honey, or a small bowl of warm oats',
          },
          {
            key: 'post',
            timingLabel: '30–60 Minutes Post-Run',
            title: 'Recovery Window',
            macroFocus: '3:1 Carb-to-Protein Ratio (20–30 g protein)',
            detail:
              'Accelerates glycogen replenishment and jumpstarts muscle fiber repair right after training.',
            foodExamples:
              'Low-fat milk + banana, Greek yogurt with granola, or boiled eggs + toast',
          },
          {
            key: 'daily',
            timingLabel: 'Main Meals & Evening',
            title: 'Daily Repair & Hydration',
            macroFocus: 'Evenly spaced protein + complex carbs',
            detail:
              'Supports overnight training adaptation so your legs feel fresh for the next run.',
            foodExamples:
              'Rice or sweet potato, chicken breast/fish/tempeh, leafy greens, and water + electrolytes',
          },
        ]
      : [
          {
            key: 'pre',
            timingLabel: '60–120 Menit Sebelum Lari',
            title: 'Isi Bahan Bakar Ringan',
            macroFocus: 'Karbohidrat mudah cerna (30–60 g)',
            detail:
              'Menstabilkan glukosa darah sebelum berlari tanpa membebani lambung saat melangkah.',
            foodExamples: '1–2 buah pisang, roti gandum madu, atau oatmeal hangat porsi kecil',
          },
          {
            key: 'post',
            timingLabel: '30–60 Menit Setelah Lari',
            title: 'Jendela Pemulihan Otot',
            macroFocus: 'Rasio Karbohidrat : Protein 3:1 (20–30 g protein)',
            detail:
              'Mempercepat pengisian ulang glikogen otot yang terkuras dan memperbaiki serat otot setelah sesi.',
            foodExamples:
              'Susu rendah lemak + pisang, yogurt dengan granola, atau telur rebus + roti',
          },
          {
            key: 'daily',
            timingLabel: 'Makan Utama & Malam Hari',
            title: 'Pemeliharaan & Hidrasi Harian',
            macroFocus: 'Protein merata tiap makan + karbohidrat kompleks',
            detail:
              'Mendukung adaptasi latihan semalaman agar kaki terasa segar pada sesi berikutnya.',
            foodExamples:
              'Nasi merah/putih, dada ayam/ikan/tempe, sayur hijau, dan air + elektrolit',
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
  referenceTodayKey: string
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
        startDate: item.run.startDate,
      });
    } else {
      existing.meters += item.run.distanceMeters;
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

    candidates.push({
      runId: grouped.runId,
      runName: grouped.names.join(' + '),
      dateKey: grouped.dateKey,
      dayIndex: grouped.dayIndex,
      dayName: planDay.dayName,
      actualKm,
      plannedKm: planDay.targetDistanceKm,
      zone: planDay.zone,
      sessionTitle: planDay.title,
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
    comfortRating: 4,
    note: `${syncTag}: ${c.runName}`,
    completedAt: c.startDate,
  }));
}
