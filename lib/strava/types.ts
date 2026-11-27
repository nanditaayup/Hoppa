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
  dataWarningReason?: RunDataQuality['reason'];
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
  customTargetPaceSecPerKm?: number | null;
  shoeName?: string;
  shoeCurrentKm?: number;
  shoeMaxKm?: number;
  pb5kSec?: number | null;
  pb10kSec?: number | null;
  pb21kSec?: number | null;
  pb42kSec?: number | null;
  onboardingCompleted?: boolean;
}

export interface RunDataQuality {
  hasAnomaly: boolean;
  reason: 'implausible_fast' | 'implausible_slow' | 'speed_distance_mismatch' | null;
  computedPaceSecPerKm: number;
  reportedPaceSecPerKm: number | null;
}

export interface PaceZoneRange {
  key: 'easy' | 'tempo' | 'interval' | 'long_run';
  label: string;
  description: string;
  minPaceSecPerKm: number; // faster bound (smaller sec/km)
  maxPaceSecPerKm: number; // slower bound (larger sec/km)
  formattedRange: string;
}

export interface WorkoutStepBlock {
  phase: 'warmup' | 'main' | 'cooldown';
  label: string;
  targetText: string;
  paceText?: string;
}

export interface DailySessionPlan {
  dayIndex: number; // 0 = Senin .. 6 = Minggu
  dayName: string;
  zone: TrainingZoneType;
  title: string;
  targetDistanceKm: number;
  paceRange: string;
  guidance: string;
  estimatedDurationMin?: number;
  coachNote?: string;
  workoutSteps?: WorkoutStepBlock[];
  strengthSession?: {
    title: string;
    durationMin: number;
    exercises: string;
  } | null;
}

export interface RacePredictionItem {
  race: RaceDistanceKey;
  distanceKm: number;
  predictedSeconds: number;
  formattedTime: string;
  paceSecPerKm: number;
  formattedPace: string;
  isCurrentTarget: boolean;
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
  isUsingCustomTargetPace: boolean;
  paceZoneBasis: 'default' | 'strava_baseline' | 'race_goal';
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
  flaggedAnomalyCount?: number;
}

export interface WeeklyChartBucket {
  weekKey: string;
  weekLabel: string;
  totalKm: number;
  runCount: number;
}

export interface DailyProgressStats {
  currentStreakDays: number;
  completedThisWeekCount: number;
  plannedRunSessionsCount: number;
  completedCrossTrainCount: number;
  loggedRestDaysCount: number;
  totalLoggedKm: number;
  plannedWeekKm: number;
  completionPct: number;
  actualVsPlannedPct: number;
  isVolumeSignificantlyOverPlan: boolean;
  avgPaceSecPerKm: number | null;
  avgHeartRateBpm: number | null;
}

export interface TargetPaceReadinessAssessment {
  status: 'aligned' | 'ambitious_caution' | 'no_history_caution';
  goalRace: RaceDistanceKey;
  goalPaceSecPerKm: number;
  currentBaselinePaceSecPerKm: number | null;
  recommendedTrainingPaceSecPerKm: number;
  gapPct: number | null;
  daysToRace: number;
  headline: string;
  explanation: string;
  suggestedTrainingNote: string;
}

export interface AdaptivePlanAdjustment {
  triggered: boolean;
  reasons: Array<'heavy_fatigue' | 'missed_sessions' | 'volume_overload' | 'manual_fatigue'>;
  volumeMultiplier: number;
  downgradeQualityToEasy: boolean;
  headline: string;
  summary: string;
  nextSessionAction: string;
  adjustedTotalWeekKm: number;
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

export interface BackupPayloadV1 {
  app: 'PaceCraft';
  version: 1;
  exportedAt: string;
  language: AppLanguage;
  customRaceDate: string | null;
  customRaceName: string;
  profile: RunnerProfile;
  progressEntries: DailyProgressEntry[];
  runs: RunActivity[];
}

export type AccessGrantStatus = 'pending' | 'active' | 'revoked';
export type AccessPlanType = 'lifetime' | 'pro';
export type AccessProvider =
  | 'stripe'
  | 'midtrans'
  | 'license'
  | 'admin_manual'
  | 'owner';

export interface AccessGrantRecord {
  uid: string;
  status: AccessGrantStatus;
  planType: AccessPlanType;
  provider: AccessProvider;
  orderRef: string;
  note: string;
  updatedAtIso?: string;
}

export type AccessCodeStatus = 'unused' | 'used' | 'revoked';

export interface AccessCodeRecord {
  codeId: string;
  planType: AccessPlanType;
  status: AccessCodeStatus;
  buyerNote: string;
  usedByUid: string | null;
  createdAtIso?: string;
  usedAtIso?: string;
}

export type TrainingIntensityTier = 0 | 1 | 2 | 3 | 4;

export type TrainingIntensityLevel =
  | 'rest'
  | 'light'
  | 'moderate'
  | 'high'
  | 'peak';

export type CalendarSessionSource =
  | 'daily_log'
  | 'strava_sample'
  | 'strava_csv'
  | 'strava_gpx'
  | 'strava_oauth';

export interface CalendarSessionItem {
  id: string;
  title: string;
  source: CalendarSessionSource;
  activityType?: RunActivityType;
  zone: TrainingZoneType;
  distanceKm: number;
  movingTimeSeconds: number | null;
  paceSecPerKm: number | null;
  avgHeartRateBpm: number | null;
  elevationGainMeters: number | null;
  comfortRating: 1 | 2 | 3 | 4 | 5 | null;
  note: string;
  tier: TrainingIntensityTier;
  dayIndex: number;
  timestampIso: string;
}

export interface CalendarDayData {
  dateKey: string;
  dayNumber: number;
  dayIndex: number; // 0 = Monday .. 6 = Sunday
  isCurrentMonth: boolean;
  isToday: boolean;
  totalDistanceKm: number;
  totalMovingTimeSeconds: number;
  intensityTier: TrainingIntensityTier;
  intensityLevel: TrainingIntensityLevel;
  hasRestLog: boolean;
  sessions: CalendarSessionItem[];
  dominantZone: TrainingZoneType | null;
}

export interface MonthlyCalendarSummary {
  monthKey: string;
  year: number;
  monthIndex: number; // 0..11
  activeDaysCount: number;
  restLoggedDaysCount: number;
  totalSessionsCount: number;
  totalDistanceKm: number;
  highOrPeakDaysCount: number;
  avgPaceSecPerKm: number | null;
  avgHeartRateBpm: number | null;
}

export interface MonthlyCalendarGrid {
  monthKey: string;
  year: number;
  monthIndex: number;
  days: CalendarDayData[];
  summary: MonthlyCalendarSummary;
}

