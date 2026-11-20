export type AppLanguage = 'id' | 'en';

export type AppTheme = 'light' | 'dark';

export type WorkspaceTabId =
  | 'overview'
  | 'training'
  | 'progress'
  | 'profile'
  | 'nutrition'
  | 'strava';

export type RunActivityType = 'Run' | 'TrailRun' | 'VirtualRun';

export type DataSource = 'sample' | 'csv' | 'gpx' | 'strava_oauth';

export type RaceDistanceKey = '5K' | '10K' | '21K' | '42K';

export type BmiCategoryKey = 'kurus' | 'ideal' | 'berlebih' | 'obesitas';

export type InjuryStatus = 'none' | 'recovering' | 'active';

export type TrainingZoneType = 'easy' | 'tempo' | 'interval' | 'long_run' | 'rest';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RunActivity {
  id: string;
  name: string;
  type: RunActivityType;
  startDate: string; // ISO 8601 UTC/offset string
  distanceMeters: number;
  movingTimeSeconds: number;
  elapsedTimeSeconds: number;
  elevationGainMeters: number;
  averageHeartRate: number | null;
  maxSpeedMps: number;
  averageSpeedMps: number;
  summaryPolyline: string | null;
  source: DataSource;
}

export interface BmiResult {
  bmi: number;
  formattedBmi: string;
  category: BmiCategoryKey;
  categoryLabel: string;
  safetyNote: string;
  maxWeeklyIncreasePct: number;
  extraEasyRatioPct: number;
  requireLowImpactPhase: boolean;
}

export interface RunnerProfile {
  weightKg: number;
  heightCm: number;
  directBmi: number | null;
  useDirectBmi: boolean;
  age: number;
  injuryStatus: InjuryStatus;
  targetRace: RaceDistanceKey;
  trainingDaysPerWeek: 3 | 4 | 5 | 6;
  restingHrBpm?: number;
  maxHrBpm?: number | null;
}

export interface PaceZoneRange {
  key: 'easy' | 'tempo' | 'interval' | 'long_run';
  label: string;
  description: string;
  minPaceSecPerKm: number; // faster bound (smaller sec/km)
  maxPaceSecPerKm: number; // slower bound (larger sec/km)
  formattedRange: string;
}

export interface DailySessionPlan {
  dayIndex: number; // 0 = Senin .. 6 = Minggu
  dayName: string;
  zone: TrainingZoneType;
  title: string;
  targetDistanceKm: number;
  paceRange: string;
  guidance: string;
  strengthSession?: {
    title: string;
    durationMin: number;
    exercises: string;
  } | null;
}

export interface WeeklyVolumeProgression {
  weekNumber: number;
  label: string;
  targetVolumeKm: number;
  isCutback: boolean;
  note: string;
}

export interface TrainingPlanSummary {
  targetRace: RaceDistanceKey;
  targetDistanceKm: number;
  baselineFourWeekAvgKm: number;
  baselinePaceSecPerKm: number;
  isUsingDefaultBaseline: boolean;
  bmiResult: BmiResult;
  paceZones: PaceZoneRange[];
  weeklySchedule: DailySessionPlan[];
  fourWeekProgression: WeeklyVolumeProgression[];
  totalPlannedWeekKm: number;
  taperStatus: RaceCountdownStatus;
  taperMultiplier: number;
}

export interface KpiSummary {
  fourWeekAvgKm: number;
  thirtyDayTotalKm: number;
  thirtyDayAvgPaceSecPerKm: number;
  longestRunKm: number;
  runCount30Days: number;
  totalActivitiesCount: number;
}

export interface WeeklyChartBucket {
  weekKey: string;
  weekLabel: string;
  totalKm: number;
  runCount: number;
}

export interface DailyProgressEntry {
  dateKey: string; // YYYY-MM-DD
  dayIndex: number;
  sessionTitle: string;
  zone: TrainingZoneType;
  plannedKm: number;
  actualKm: number;
  paceSecPerKm?: number | null;
  avgHeartRateBpm?: number | null;
  comfortRating: 1 | 2 | 3 | 4 | 5;
  note: string;
  completedAt: string;
}

export interface ParseImportResult {
  runs: RunActivity[];
  skippedNonRuns: number;
  totalRowsProcessed: number;
  errors: string[];
}

export interface NutritionRecoveryTiming {
  key: 'pre' | 'post' | 'daily';
  timingLabel: string;
  title: string;
  macroFocus: string;
  detail: string;
  foodExamples: string;
}

export interface NutritionRecommendation {
  targetRace: RaceDistanceKey;
  weightKg: number;
  carbsPerKgMin: number;
  carbsPerKgMax: number;
  carbsMinG: number;
  carbsMaxG: number;
  proteinPerKgMin: number;
  proteinPerKgMax: number;
  proteinMinG: number;
  proteinMaxG: number;
  hydrationLitersMin: number;
  hydrationLitersMax: number;
  bmiNutritionNote: string;
  recoveryTimings: NutritionRecoveryTiming[];
}

export type RaceCountdownStatus =
  | 'upcoming'
  | 'tapering'
  | 'race_week'
  | 'race_day'
  | 'passed';

export interface RaceCountdownInfo {
  daysRemaining: number;
  weeksRemaining: number;
  remainderDays: number;
  raceDateKey: string;
  formattedRaceDate: string;
  phaseLabel: string;
  motivationTip: string;
  status: RaceCountdownStatus;
}

export interface StravaSyncCandidate {
  runId: string;
  runName: string;
  dateKey: string;
  dayIndex: number;
  dayName: string;
  actualKm: number;
  plannedKm: number;
  paceSecPerKm?: number | null;
  avgHeartRateBpm?: number | null;
  zone: TrainingZoneType;
  sessionTitle: string;
  startDate: string;
}

export interface HeartRateZone {
  zone: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
  label: string;
  pctRange: string;
  minBpm: number;
  maxBpm: number;
  purpose: string;
}

export interface HeartRateVo2Summary {
  restingHrBpm: number;
  maxHrBpm: number;
  isCustomMaxHr: boolean;
  avgLoggedHrBpm: number | null;
  vo2Max: number;
  vo2MaxCategory: string;
  vo2MaxNote: string;
  vo2MaxSource: 'resting_ratio' | 'strava_hr_blended';
  zones: HeartRateZone[];
}

