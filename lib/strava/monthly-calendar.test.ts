import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_STRAVA_RUNS } from './config';
import { buildMonthlyIntensityGrid, shiftMonthYear } from './monthly-calendar';
import { computeHeartRateAndVo2Max, generateTrainingPlan, computeKpiSummary } from './transform';
import { DailyProgressEntry, RunnerProfile } from './types';

const TEST_PROFILE: RunnerProfile = {
  weightKg: 66,
  heightCm: 172,
  directBmi: 22.3,
  useDirectBmi: false,
  age: 30,
  restingHrBpm: 56,
  maxHrBpm: 187,
  injuryStatus: 'none',
  targetRace: '21K',
  trainingDaysPerWeek: 4,
  customTargetPaceSecPerKm: null,
  shoeName: 'Pegasus',
  shoeCurrentKm: 200,
  shoeMaxKm: 700,
  onboardingCompleted: true,
};

test('buildMonthlyIntensityGrid combines DailyProgressEntry and Strava runs without double-counting mirrored logs', () => {
  const kpi = computeKpiSummary(SAMPLE_STRAVA_RUNS, new Date('2026-11-20T00:00:00Z'));
  const plan = generateTrainingPlan(TEST_PROFILE, kpi, 'id', 'upcoming');
  const hr = computeHeartRateAndVo2Max(TEST_PROFILE, SAMPLE_STRAVA_RUNS, [], 'id');

  const entries: DailyProgressEntry[] = [
    {
      // Matches SAMPLE_STRAVA_RUNS[0] (2026-11-16, 16.2 km) -> should deduplicate Strava copy
      dateKey: '2026-11-16',
      dayIndex: 0,
      sessionTitle: 'Long Run Minggu Pagi',
      zone: 'long_run',
      plannedKm: 16,
      actualKm: 16.2,
      paceSecPerKm: 360,
      avgHeartRateBpm: 148,
      comfortRating: 5,
      note: 'Strava: Long Run Minggu Pagi — Senayan Loop',
      completedAt: '2026-11-16T07:00:00+07:00',
    },
    {
      dateKey: '2026-11-18',
      dayIndex: 2,
      sessionTitle: 'Rest Day Check-In',
      zone: 'rest',
      plannedKm: 0,
      actualKm: 0,
      paceSecPerKm: null,
      avgHeartRateBpm: null,
      comfortRating: 5,
      note: 'Peregangan ringan',
      completedAt: '2026-11-18T18:00:00+07:00',
    },
  ];

  const grid = buildMonthlyIntensityGrid({
    year: 2026,
    monthIndex: 10, // November
    todayDateKey: '2026-11-19',
    entries,
    runs: SAMPLE_STRAVA_RUNS,
    weeklySchedule: plan.weeklySchedule,
    paceZones: plan.paceZones,
    hrZones: hr.zones,
  });

  assert.equal(grid.monthKey, '2026-11');
  assert.ok(grid.days.length >= 30 && grid.days.length % 7 === 0);

  const nov16 = grid.days.find((d) => d.dateKey === '2026-11-16');
  assert.ok(nov16);
  assert.equal(nov16.sessions.length, 1);
  assert.equal(nov16.totalDistanceKm, 16.2);
  assert.equal(nov16.intensityTier, 3);

  const nov18 = grid.days.find((d) => d.dateKey === '2026-11-18');
  assert.ok(nov18);
  assert.equal(nov18.hasRestLog, true);
  assert.equal(nov18.intensityTier, 0);

  assert.ok(grid.summary.activeDaysCount >= 5);
  assert.equal(grid.summary.restLoggedDaysCount, 1);
});

test('shiftMonthYear wraps cleanly across year boundaries', () => {
  assert.deepEqual(shiftMonthYear(2026, 0, -1), { year: 2025, monthIndex: 11 });
  assert.deepEqual(shiftMonthYear(2026, 11, 1), { year: 2027, monthIndex: 0 });
});
