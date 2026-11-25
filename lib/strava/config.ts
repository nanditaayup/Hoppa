import { AppLanguage, BmiCategoryKey, RaceDistanceKey, RunActivity } from './types';

export const IMPORTED_RUNS_STORAGE_KEY = 'pacecraft_imported_runs_v1';
export const DAILY_PROGRESS_STORAGE_KEY = 'pacecraft_training_progress_v1';
export const RUNNER_PROFILE_STORAGE_KEY = 'pacecraft_runner_profile_v1';
export const LANGUAGE_STORAGE_KEY = 'pacecraft_language_v1';
export const THEME_STORAGE_KEY = 'pacecraft_theme_v1';
export const RACE_DATE_STORAGE_KEY = 'pacecraft_race_date_v1';
export const RACE_NAME_STORAGE_KEY = 'pacecraft_race_name_v1';

export const DEFAULT_RACE_COUNTDOWN_DAYS: Record<RaceDistanceKey, number> = {
  '5K': 28,
  '10K': 42,
  '21K': 56,
  '42K': 84,
};

export type RaceTargetConfig = {
  key: RaceDistanceKey;
  label: string;
  fullName: string;
  distanceKm: number;
  defaultBaselineWeeklyKm: number;
  description: string;
};

export const RACE_TARGETS: Record<RaceDistanceKey, RaceTargetConfig> = {
  '5K': {
    key: '5K',
    label: '5K',
    fullName: 'Lari 5 Kilometer',
    distanceKm: 5.0,
    defaultBaselineWeeklyKm: 12.0,
    description: 'Fokus membangun kebiasaan rutin, daya tahan dasar, dan kenyamanan napas.',
  },
  '10K': {
    key: '10K',
    label: '10K',
    fullName: 'Lari 10 Kilometer',
    distanceKm: 10.0,
    defaultBaselineWeeklyKm: 20.0,
    description: 'Keseimbangan lari santai, ketahanan aerobik, dan porsi tempo terkontrol.',
  },
  '21K': {
    key: '21K',
    label: '21K',
    fullName: 'Half Marathon (21,1 km)',
    distanceKm: 21.1,
    defaultBaselineWeeklyKm: 28.0,
    description: 'Progresi jarak long run bertahap dengan pemulihan terukur tiap minggu ke-4.',
  },
  '42K': {
    key: '42K',
    label: '42K',
    fullName: 'Full Marathon (42,2 km)',
    distanceKm: 42.2,
    defaultBaselineWeeklyKm: 38.0,
    description: 'Daya tahan jarak jauh berjenjang dengan pengaman beban agar bebas cedera.',
  },
};

export const RACE_TARGETS_BY_LANG: Record<
  AppLanguage,
  Record<RaceDistanceKey, RaceTargetConfig>
> = {
  id: RACE_TARGETS,
  en: {
    '5K': {
      key: '5K',
      label: '5K',
      fullName: '5 Kilometer Run',
      distanceKm: 5.0,
      defaultBaselineWeeklyKm: 12.0,
      description: 'Focuses on building a consistent routine, aerobic base, and comfortable breathing.',
    },
    '10K': {
      key: '10K',
      label: '10K',
      fullName: '10 Kilometer Run',
      distanceKm: 10.0,
      defaultBaselineWeeklyKm: 20.0,
      description: 'Balances easy running, aerobic endurance, and controlled tempo efforts.',
    },
    '21K': {
      key: '21K',
      label: '21K',
      fullName: 'Half Marathon (21.1 km)',
      distanceKm: 21.1,
      defaultBaselineWeeklyKm: 28.0,
      description: 'Gradual long-run progression with structured recovery every 4th week.',
    },
    '42K': {
      key: '42K',
      label: '42K',
      fullName: 'Full Marathon (42.2 km)',
      distanceKm: 42.2,
      defaultBaselineWeeklyKm: 38.0,
      description: 'Phased endurance build with load safeguards to keep your joints injury-free.',
    },
  },
};

export type BmiZoneConfig = {
  label: string;
  rangeLabel: string;
  safetyNote: string;
  maxWeeklyIncreasePct: number;
  extraEasyRatioPct: number;
  requireLowImpactPhase: boolean;
};

export const BMI_ZONES: Record<BmiCategoryKey, BmiZoneConfig> = {
  kurus: {
    label: 'Kurus',
    rangeLabel: '< 18,5',
    safetyNote:
      'Saran progres awal hingga +8%/minggu disertai asupan energi & protein cukup. Sesuaikan dengan riwayat latihan, pemulihan, rasa sakit, dan respons tubuh.',
    maxWeeklyIncreasePct: 8,
    extraEasyRatioPct: 5,
    requireLowImpactPhase: false,
  },
  ideal: {
    label: 'Ideal',
    rangeLabel: '18,5 – 24,9',
    safetyNote:
      'Saran progres awal hingga +10%/minggu. Sesuaikan dengan riwayat latihan, pemulihan, rasa sakit, dan respons tubuh.',
    maxWeeklyIncreasePct: 10,
    extraEasyRatioPct: 0,
    requireLowImpactPhase: false,
  },
  berlebih: {
    label: 'Berlebih',
    rangeLabel: '25,0 – 29,9',
    safetyNote:
      'Saran progres awal lebih konservatif (+7%/minggu) dengan tambahan porsi Easy / Walk-Run +15%. Sesuaikan dengan pemulihan, rasa sakit, dan respons tubuh.',
    maxWeeklyIncreasePct: 7,
    extraEasyRatioPct: 15,
    requireLowImpactPhase: false,
  },
  obesitas: {
    label: 'Obesitas',
    rangeLabel: '≥ 30,0',
    safetyNote:
      'Saran progres awal berfokus pada fase dasar Low-Impact & Easy Pace (maks +5%/minggu). Sesuaikan dengan riwayat latihan, pemulihan, rasa sakit, dan respons tubuh.',
    maxWeeklyIncreasePct: 5,
    extraEasyRatioPct: 30,
    requireLowImpactPhase: true,
  },
};

export const BMI_ZONES_BY_LANG: Record<
  AppLanguage,
  Record<BmiCategoryKey, BmiZoneConfig>
> = {
  id: BMI_ZONES,
  en: {
    kurus: {
      label: 'Underweight',
      rangeLabel: '< 18.5',
      safetyNote:
        'Initial progression suggestion up to +8%/week alongside adequate energy and protein intake. Adjust based on training history, recovery, soreness, and body response.',
      maxWeeklyIncreasePct: 8,
      extraEasyRatioPct: 5,
      requireLowImpactPhase: false,
    },
    ideal: {
      label: 'Ideal',
      rangeLabel: '18.5 – 24.9',
      safetyNote:
        'Initial progression suggestion up to +10%/week. Adjust based on your training history, recovery, soreness, and how your body responds.',
      maxWeeklyIncreasePct: 10,
      extraEasyRatioPct: 0,
      requireLowImpactPhase: false,
    },
    berlebih: {
      label: 'Overweight',
      rangeLabel: '25.0 – 29.9',
      safetyNote:
        'Conservative initial suggestion (+7%/week) with +15% Easy / Walk-Run focus. Adjust based on recovery, joint comfort, and body response.',
      maxWeeklyIncreasePct: 7,
      extraEasyRatioPct: 15,
      requireLowImpactPhase: false,
    },
    obesitas: {
      label: 'Obesity',
      rangeLabel: '≥ 30.0',
      safetyNote:
        'Initial progression suggestion starts with a Low-Impact & Easy Pace base (up to +5%/week). Adjust based on training history, recovery, soreness, and body response.',
      maxWeeklyIncreasePct: 5,
      extraEasyRatioPct: 30,
      requireLowImpactPhase: true,
    },
  },
};

export const DAY_NAMES_ID = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
] as const;

export const DAY_NAMES_EN = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const DAY_NAMES_BY_LANG: Record<AppLanguage, readonly string[]> = {
  id: DAY_NAMES_ID,
  en: DAY_NAMES_EN,
};

export const ACCEPTED_RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun']);

export const RUN_TYPE_LABELS: Record<'Run' | 'TrailRun' | 'VirtualRun', string> = {
  Run: 'Jalan Raya',
  TrailRun: 'Trail',
  VirtualRun: 'Virtual',
};

export const RUN_TYPE_LABELS_BY_LANG: Record<
  AppLanguage,
  Record<'Run' | 'TrailRun' | 'VirtualRun', string>
> = {
  id: RUN_TYPE_LABELS,
  en: {
    Run: 'Road Run',
    TrailRun: 'Trail Run',
    VirtualRun: 'Virtual Run',
  },
};

/**
 * Encode lat/lng points into a Google/Strava encoded polyline string.
 */
export function encodePolyline(points: Array<{ lat: number; lng: number }>): string {
  let prevLat = 0;
  let prevLng = 0;
  let output = '';

  const encodeValue = (value: number): string => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    let encoded = '';
    while (v >= 0x20) {
      encoded += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    encoded += String.fromCharCode(v + 63);
    return encoded;
  };

  for (const pt of points) {
    const lat = Math.round(pt.lat * 1e5);
    const lng = Math.round(pt.lng * 1e5);
    output += encodeValue(lat - prevLat);
    output += encodeValue(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  }

  return output;
}

// Synthetic realistic polylines for Jakarta/Sentul routes matching PRD Section 8 sample data
const SENAYAN_LOOP_POLYLINE = encodePolyline([
  { lat: -6.2246, lng: 106.8019 },
  { lat: -6.2212, lng: 106.8034 },
  { lat: -6.2175, lng: 106.8058 },
  { lat: -6.2145, lng: 106.8035 },
  { lat: -6.2162, lng: 106.7988 },
  { lat: -6.2208, lng: 106.7972 },
  { lat: -6.2248, lng: 106.7995 },
  { lat: -6.2246, lng: 106.8019 },
]);

const SUDIRMAN_TEMPO_POLYLINE = encodePolyline([
  { lat: -6.2255, lng: 106.8075 },
  { lat: -6.218, lng: 106.8132 },
  { lat: -6.2088, lng: 106.8201 },
  { lat: -6.2015, lng: 106.8229 },
  { lat: -6.2092, lng: 106.8195 },
  { lat: -6.2186, lng: 106.8126 },
  { lat: -6.2251, lng: 106.8079 },
]);

const SENTUL_TRAIL_POLYLINE = encodePolyline([
  { lat: -6.5842, lng: 106.8912 },
  { lat: -6.5884, lng: 106.8965 },
  { lat: -6.5931, lng: 106.9012 },
  { lat: -6.5978, lng: 106.9048 },
  { lat: -6.5955, lng: 106.9102 },
  { lat: -6.5892, lng: 106.9065 },
  { lat: -6.5851, lng: 106.8984 },
  { lat: -6.5842, lng: 106.8912 },
]);

const TRACK_INTERVAL_POLYLINE = encodePolyline([
  { lat: -6.2185, lng: 106.8025 },
  { lat: -6.2174, lng: 106.8025 },
  { lat: -6.217, lng: 106.8034 },
  { lat: -6.2174, lng: 106.8042 },
  { lat: -6.2185, lng: 106.8042 },
  { lat: -6.2189, lng: 106.8034 },
  { lat: -6.2185, lng: 106.8025 },
]);

const MONAS_LOOP_POLYLINE = encodePolyline([
  { lat: -6.1782, lng: 106.8235 },
  { lat: -6.1725, lng: 106.8242 },
  { lat: -6.1718, lng: 106.8305 },
  { lat: -6.1784, lng: 106.8312 },
  { lat: -6.1782, lng: 106.8235 },
]);

/**
 * Dataset Referensi Implementasi — PRD Section 8
 */
export const SAMPLE_STRAVA_RUNS: RunActivity[] = [
  {
    id: '9001001',
    name: 'Long Run Minggu Pagi — Senayan Loop',
    type: 'Run',
    startDate: '2026-11-16T06:00:00+07:00',
    distanceMeters: 16200,
    movingTimeSeconds: 5832, // 1:37:12
    elapsedTimeSeconds: 6010,
    elevationGainMeters: 84,
    averageHeartRate: 148,
    averageSpeedMps: 16200 / 5832,
    maxSpeedMps: 3.45,
    summaryPolyline: SENAYAN_LOOP_POLYLINE,
    source: 'sample',
  },
  {
    id: '9001002',
    name: 'Tempo Threshold 8K',
    type: 'Run',
    startDate: '2026-11-13T05:45:00+07:00',
    distanceMeters: 8100,
    movingTimeSeconds: 2430, // 40:30
    elapsedTimeSeconds: 2480,
    elevationGainMeters: 32,
    averageHeartRate: 168,
    averageSpeedMps: 8100 / 2430, // 3.3333 m/s -> 05:00/km
    maxSpeedMps: 4.12,
    summaryPolyline: SUDIRMAN_TEMPO_POLYLINE,
    source: 'sample',
  },
  {
    id: '9001003',
    name: 'Recovery Treadmill 5K',
    type: 'VirtualRun',
    startDate: '2026-11-11T18:30:00+07:00',
    distanceMeters: 5000,
    movingTimeSeconds: 1920, // 32:00
    elapsedTimeSeconds: 1920,
    elevationGainMeters: 0,
    averageHeartRate: 136,
    averageSpeedMps: 5000 / 1920,
    maxSpeedMps: 2.95,
    summaryPolyline: null,
    source: 'sample',
  },
  {
    id: '9001004',
    name: 'Sentul Hill Trail Easy',
    type: 'TrailRun',
    startDate: '2026-11-09T06:15:00+07:00',
    distanceMeters: 11400,
    movingTimeSeconds: 4902, // 1:21:42
    elapsedTimeSeconds: 5190,
    elevationGainMeters: 345,
    averageHeartRate: 155,
    averageSpeedMps: 11400 / 4902,
    maxSpeedMps: 3.22,
    summaryPolyline: SENTUL_TRAIL_POLYLINE,
    source: 'sample',
  },
  {
    id: '9001005',
    name: 'Interval 6x800m Track',
    type: 'Run',
    startDate: '2026-11-06T06:00:00+07:00',
    distanceMeters: 9200,
    movingTimeSeconds: 2944, // 49:04
    elapsedTimeSeconds: 3320,
    elevationGainMeters: 12,
    averageHeartRate: 162,
    averageSpeedMps: 9200 / 2944,
    maxSpeedMps: 4.85,
    summaryPolyline: TRACK_INTERVAL_POLYLINE,
    source: 'sample',
  },
  {
    id: '9001006',
    name: 'Easy Shakeout 6K',
    type: 'Run',
    startDate: '2026-11-01T06:20:00+07:00',
    distanceMeters: 6100,
    movingTimeSeconds: 2257, // 37:37
    elapsedTimeSeconds: 2305,
    elevationGainMeters: 24,
    averageHeartRate: null,
    averageSpeedMps: 6100 / 2257,
    maxSpeedMps: 3.15,
    summaryPolyline: MONAS_LOOP_POLYLINE,
    source: 'sample',
  },
  {
    id: '9001007',
    name: 'Long Run Akhir Pekan 14K',
    type: 'Run',
    startDate: '2026-10-26T05:50:00+07:00',
    distanceMeters: 14100,
    movingTimeSeconds: 5146, // 1:25:46
    elapsedTimeSeconds: 5300,
    elevationGainMeters: 76,
    averageHeartRate: 149,
    averageSpeedMps: 14100 / 5146,
    maxSpeedMps: 3.38,
    summaryPolyline: SENAYAN_LOOP_POLYLINE,
    source: 'sample',
  },
  {
    id: '9001008',
    name: 'Midweek Aerobic 10K',
    type: 'Run',
    startDate: '2026-10-21T06:00:00+07:00',
    distanceMeters: 10050,
    movingTimeSeconds: 3618, // 1:00:18
    elapsedTimeSeconds: 3695,
    elevationGainMeters: 42,
    averageHeartRate: 146,
    averageSpeedMps: 10050 / 3618,
    maxSpeedMps: 3.55,
    summaryPolyline: SUDIRMAN_TEMPO_POLYLINE,
    source: 'sample',
  },
];
