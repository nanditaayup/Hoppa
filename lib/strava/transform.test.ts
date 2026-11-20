import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildProgressEntriesFromMatches,
  calculateBmi,
  computeDailyProgressStats,
  computeHeartRateAndVo2Max,
  computeKpiSummary,
  computeNutritionRecommendation,
  computePaceSecPerKm,
  computePaceZones,
  computeRaceCountdown,
  computeWeeklyChartBuckets,
  decodePolyline,
  findStravaProgressMatches,
  formatDistanceKm,
  formatDuration,
  formatIndonesianDate,
  formatPace,
  formatSpeedKmh,
  generateTrainingPlan,
  getDefaultRaceDateKey,
  parsePaceInputToSecPerKm,
} from './transform';
import { SAMPLE_STRAVA_RUNS, encodePolyline } from './config';

test('AC-01: calculateBmi computes 28,4 (Berlebih) for 82 kg and 170 cm', () => {
  const res = calculateBmi(82, 170);
  assert.equal(res.bmi, 28.4);
  assert.equal(res.formattedBmi, '28,4');
  assert.equal(res.category, 'berlebih');
  assert.equal(res.categoryLabel, 'Berlebih');
  assert.equal(res.extraEasyRatioPct, 15);
});

test('calculateBmi covers Kurus, Ideal, Obesitas, and direct BMI input', () => {
  assert.equal(calculateBmi(48, 170).category, 'kurus');
  assert.equal(calculateBmi(65, 170).category, 'ideal');
  assert.equal(calculateBmi(95, 170).category, 'obesitas');
  assert.equal(calculateBmi(95, 170).requireLowImpactPhase, true);

  const direct = calculateBmi(70, 170, 22.7, true);
  assert.equal(direct.bmi, 22.7);
  assert.equal(direct.category, 'ideal');
});

test('AC-03: normalisasi jarak, waktu, pace, dan kecepatan format Indonesia', () => {
  const distanceMeters = 8100;
  const movingTimeSeconds = 2430;
  const avgSpeedMps = 3.3333;

  const paceSec = computePaceSecPerKm(distanceMeters, movingTimeSeconds, avgSpeedMps);
  assert.equal(formatDistanceKm(distanceMeters), '8,10 km');
  assert.equal(formatPace(paceSec), '05:00/km');
  assert.equal(formatDuration(movingTimeSeconds), '40:30');
  assert.equal(formatDuration(5832), '1:37:12');
  assert.equal(formatSpeedKmh(avgSpeedMps), '12,0 km/jam');
  assert.equal(formatIndonesianDate('2026-11-16T06:00:00+07:00'), '16 Nov 2026, 06.00');
});

test('computePaceZones produces Easy, Tempo, Interval, and Long Run ranges', () => {
  const zones = computePaceZones(360); // 06:00/km
  const easy = zones.find((z) => z.key === 'easy')!;
  const tempo = zones.find((z) => z.key === 'tempo')!;
  const interval = zones.find((z) => z.key === 'interval')!;
  assert.equal(easy.minPaceSecPerKm, 405); // +45s -> 06:45
  assert.equal(easy.maxPaceSecPerKm, 435); // +75s -> 07:15
  assert.equal(tempo.minPaceSecPerKm, 335); // -25s -> 05:35
  assert.equal(tempo.maxPaceSecPerKm, 345); // -15s -> 05:45
  assert.equal(interval.minPaceSecPerKm, 310); // -50s -> 05:10
  assert.equal(interval.maxPaceSecPerKm, 325); // -35s -> 05:25
});

test('generateTrainingPlan respects 4-week progression with -20% cutback on week 4', () => {
  const kpi = computeKpiSummary(
    SAMPLE_STRAVA_RUNS,
    new Date('2026-11-19T12:00:00+07:00')
  );
  const plan = generateTrainingPlan(
    {
      weightKg: 65,
      heightCm: 170,
      directBmi: null,
      useDirectBmi: false,
      age: 30,
      injuryStatus: 'none',
      targetRace: '10K',
      trainingDaysPerWeek: 4,
    },
    kpi
  );

  assert.equal(plan.fourWeekProgression.length, 4);
  const w3 = plan.fourWeekProgression[2].targetVolumeKm;
  const w4 = plan.fourWeekProgression[3].targetVolumeKm;
  assert.equal(plan.fourWeekProgression[3].isCutback, true);
  assert.ok(Math.abs(w4 - Math.round(w3 * 0.8 * 10) / 10) <= 0.1);
  assert.equal(plan.weeklySchedule.filter((s) => s.zone !== 'rest').length, 4);
});

test('decodePolyline round-trips encoded route coordinates', () => {
  const pts = [
    { lat: -6.2246, lng: 106.8019 },
    { lat: -6.2175, lng: 106.8058 },
  ];
  const encoded = encodePolyline(pts);
  const decoded = decodePolyline(encoded);
  assert.equal(decoded.length, 2);
  assert.ok(Math.abs(decoded[0].lat - pts[0].lat) < 0.0001);
  assert.ok(Math.abs(decoded[1].lng - pts[1].lng) < 0.0001);
});

test('computeWeeklyChartBuckets returns 8 weekly buckets oldest-to-newest', () => {
  const buckets = computeWeeklyChartBuckets(
    SAMPLE_STRAVA_RUNS,
    8,
    new Date('2026-11-19T12:00:00+07:00')
  );
  assert.equal(buckets.length, 8);
  const sum = buckets.reduce((acc, b) => acc + b.runCount, 0);
  assert.equal(sum, SAMPLE_STRAVA_RUNS.length);
});

test('computeDailyProgressStats calculates consecutive daily streak & completion rate', () => {
  const kpi = computeKpiSummary(SAMPLE_STRAVA_RUNS);
  const plan = generateTrainingPlan(
    {
      weightKg: 65,
      heightCm: 170,
      directBmi: null,
      useDirectBmi: false,
      age: 29,
      injuryStatus: 'none',
      targetRace: '5K',
      trainingDaysPerWeek: 3,
    },
    kpi
  );

  const stats = computeDailyProgressStats(
    [
      {
        dateKey: '2026-11-19',
        dayIndex: 3,
        sessionTitle: 'Tempo',
        zone: 'tempo',
        plannedKm: 5,
        actualKm: 5.2,
        comfortRating: 4,
        note: 'Segar',
        completedAt: '2026-11-19T06:30:00Z',
      },
      {
        dateKey: '2026-11-18',
        dayIndex: 1,
        sessionTitle: 'Easy Run',
        zone: 'easy',
        plannedKm: 4,
        actualKm: 4.1,
        comfortRating: 5,
        note: 'Nyaman',
        completedAt: '2026-11-18T06:30:00Z',
      },
    ],
    plan.weeklySchedule,
    '2026-11-19'
  );

  assert.equal(stats.currentStreakDays, 2);
  assert.equal(stats.completedThisWeekCount, 2);
  assert.equal(stats.plannedRunSessionsCount, 3);
  assert.equal(stats.totalLoggedKm, 9.3);
  assert.equal(stats.completionPct, 67);
});

test('computeNutritionRecommendation scales carbohydrates & protein by target distance and weight', () => {
  const bmiIdeal = calculateBmi(70, 175);
  const rec5k = computeNutritionRecommendation(
    {
      weightKg: 70,
      heightCm: 175,
      directBmi: null,
      useDirectBmi: false,
      age: 30,
      injuryStatus: 'none',
      targetRace: '5K',
      trainingDaysPerWeek: 3,
    },
    bmiIdeal
  );
  const rec42k = computeNutritionRecommendation(
    {
      weightKg: 70,
      heightCm: 175,
      directBmi: null,
      useDirectBmi: false,
      age: 30,
      injuryStatus: 'none',
      targetRace: '42K',
      trainingDaysPerWeek: 5,
    },
    bmiIdeal
  );

  assert.equal(rec5k.carbsMinG, 245); // 70 * 3.5
  assert.equal(rec5k.proteinMinG, 84); // 70 * 1.2
  assert.ok(rec42k.carbsMinG > rec5k.carbsMaxG);
  assert.ok(rec42k.proteinMaxG > rec5k.proteinMaxG);
  assert.equal(rec42k.recoveryTimings.length, 3);
});

test('bilingual localization supports English number, date, BMI, plan, and nutrition outputs', () => {
  assert.equal(formatDistanceKm(8100, 'en'), '8.10 km');
  assert.equal(formatSpeedKmh(3.3333, 'en'), '12.0 km/h');
  assert.equal(
    formatIndonesianDate('2026-11-16T06:00:00+07:00', true, 'en'),
    '16 Nov 2026, 06:00'
  );

  const bmiEn = calculateBmi(82, 170, null, false, 'en');
  assert.equal(bmiEn.formattedBmi, '28.4');
  assert.equal(bmiEn.categoryLabel, 'Overweight');

  const kpi = computeKpiSummary(
    SAMPLE_STRAVA_RUNS,
    new Date('2026-11-19T12:00:00+07:00')
  );
  const planEn = generateTrainingPlan(
    {
      weightKg: 65,
      heightCm: 170,
      directBmi: null,
      useDirectBmi: false,
      age: 30,
      injuryStatus: 'none',
      targetRace: '10K',
      trainingDaysPerWeek: 4,
    },
    kpi,
    'en'
  );

  assert.equal(planEn.weeklySchedule[0].dayName, 'Monday');
  assert.equal(planEn.weeklySchedule[0].title, 'Cross-Train: Strength & Mobility');
  assert.equal(planEn.weeklySchedule[5].title, 'Rest & Active Recovery');
  assert.equal(planEn.fourWeekProgression[3].label, 'Week 4 (Cutback -20%)');

  const nutritionEn = computeNutritionRecommendation(
    {
      weightKg: 70,
      heightCm: 175,
      directBmi: null,
      useDirectBmi: false,
      age: 30,
      injuryStatus: 'none',
      targetRace: '10K',
      trainingDaysPerWeek: 4,
    },
    bmiEn,
    'en'
  );
  assert.equal(nutritionEn.recoveryTimings[0].timingLabel, '60–120 Minutes Pre-Run');
});

test('getDefaultRaceDateKey & computeRaceCountdown cover offsets and statuses in ID and EN', () => {
  const todayKey = '2026-11-19';
  assert.equal(getDefaultRaceDateKey(todayKey, '5K'), '2026-12-17'); // +28 days
  assert.equal(getDefaultRaceDateKey(todayKey, '42K'), '2027-02-11'); // +84 days

  const upcoming42k = computeRaceCountdown('2027-02-11', '42K', todayKey, 'id');
  assert.equal(upcoming42k.daysRemaining, 84);
  assert.equal(upcoming42k.weeksRemaining, 12);
  assert.equal(upcoming42k.remainderDays, 0);
  assert.equal(upcoming42k.status, 'upcoming');
  assert.equal(upcoming42k.phaseLabel, 'Fase Bangun Daya Tahan');

  const taperingEn = computeRaceCountdown('2026-12-03', '21K', todayKey, 'en');
  assert.equal(taperingEn.daysRemaining, 14);
  assert.equal(taperingEn.weeksRemaining, 2);
  assert.equal(taperingEn.status, 'tapering');
  assert.equal(taperingEn.phaseLabel, 'Tapering Phase');

  const raceWeekId = computeRaceCountdown('2026-11-22', '10K', todayKey, 'id');
  assert.equal(raceWeekId.daysRemaining, 3);
  assert.equal(raceWeekId.status, 'race_week');

  const raceDayEn = computeRaceCountdown(todayKey, '42K', todayKey, 'en');
  assert.equal(raceDayEn.daysRemaining, 0);
  assert.equal(raceDayEn.status, 'race_day');
  assert.equal(raceDayEn.phaseLabel, 'Race Day!');

  const passedId = computeRaceCountdown('2026-11-10', '5K', todayKey, 'id');
  assert.equal(passedId.daysRemaining, -9);
  assert.equal(passedId.status, 'passed');
  assert.equal(passedId.phaseLabel, 'Event Terlewati');
});

test('generateTrainingPlan automatically trims volume during tapering and switches to shakeouts in race_week', () => {
  const kpi = computeKpiSummary(
    SAMPLE_STRAVA_RUNS,
    new Date('2026-11-19T12:00:00+07:00')
  );
  const profile = {
    weightKg: 68,
    heightCm: 170,
    directBmi: null,
    useDirectBmi: false,
    age: 29,
    injuryStatus: 'none' as const,
    targetRace: '42K' as const,
    trainingDaysPerWeek: 4 as const,
  };

  const normalPlan = generateTrainingPlan(profile, kpi, 'id', 'upcoming');
  const taperPlan = generateTrainingPlan(profile, kpi, 'id', 'tapering');
  const raceWeekPlan = generateTrainingPlan(profile, kpi, 'id', 'race_week');

  assert.equal(normalPlan.taperMultiplier, 1);
  assert.equal(taperPlan.taperMultiplier, 0.75);
  assert.equal(raceWeekPlan.taperMultiplier, 0.5);
  assert.ok(taperPlan.totalPlannedWeekKm < normalPlan.totalPlannedWeekKm);
  assert.ok(raceWeekPlan.totalPlannedWeekKm < taperPlan.totalPlannedWeekKm);

  const raceWeekActiveZones = raceWeekPlan.weeklySchedule
    .filter((s) => s.zone !== 'rest')
    .map((s) => s.zone);
  assert.ok(raceWeekActiveZones.every((z) => z === 'easy'));
});

test('findStravaProgressMatches maps recent Strava runs to weekday schedule without overwriting manual logs', () => {
  const kpi = computeKpiSummary(
    SAMPLE_STRAVA_RUNS,
    new Date('2026-11-19T12:00:00+07:00')
  );
  const plan = generateTrainingPlan(
    {
      weightKg: 68,
      heightCm: 170,
      directBmi: null,
      useDirectBmi: false,
      age: 29,
      injuryStatus: 'none',
      targetRace: '10K',
      trainingDaysPerWeek: 4,
    },
    kpi,
    'id',
    'upcoming'
  );

  // Rolling 7 days ending 2026-11-19 includes 2026-11-16 (16.2 km) and 2026-11-13 (8.1 km)
  const matches = findStravaProgressMatches(
    SAMPLE_STRAVA_RUNS,
    plan.weeklySchedule,
    [],
    '2026-11-19'
  );
  assert.equal(matches.length, 2);
  assert.equal(matches[0].dateKey, '2026-11-16');
  assert.equal(matches[0].actualKm, 16.2);
  assert.equal(matches[1].dateKey, '2026-11-13');
  assert.equal(matches[1].actualKm, 8.1);

  // Existing manual log on Friday (dayIndex 4) prevents overwriting Friday
  const entries = buildProgressEntriesFromMatches([matches[1]], 'Sinkronisasi Strava');
  assert.equal(entries.length, 1);
  const remaining = findStravaProgressMatches(
    SAMPLE_STRAVA_RUNS,
    plan.weeklySchedule,
    entries,
    '2026-11-19'
  );
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].dateKey, '2026-11-16');
  assert.ok((remaining[0].paceSecPerKm ?? 0) > 0);
  assert.ok((remaining[0].avgHeartRateBpm ?? 0) > 0);
});

test('parsePaceInputToSecPerKm parses mm:ss and rejects out-of-range inputs', () => {
  assert.equal(parsePaceInputToSecPerKm('06:15'), 375);
  assert.equal(parsePaceInputToSecPerKm('5.30'), 330);
  assert.equal(parsePaceInputToSecPerKm('06:75'), null);
  assert.equal(parsePaceInputToSecPerKm(''), null);
  assert.equal(parsePaceInputToSecPerKm('abc'), null);
});

test('generateTrainingPlan includes 2 strength training sessions in normal weeks and omits them in race_week', () => {
  const kpi = computeKpiSummary(
    SAMPLE_STRAVA_RUNS,
    new Date('2026-11-19T12:00:00+07:00')
  );
  const baseProfile = {
    weightKg: 68,
    heightCm: 170,
    directBmi: null,
    useDirectBmi: false,
    age: 29,
    injuryStatus: 'none' as const,
    targetRace: '10K' as const,
    trainingDaysPerWeek: 4 as const,
  };

  const plan4 = generateTrainingPlan(baseProfile, kpi, 'id', 'upcoming');
  assert.equal(
    plan4.weeklySchedule.filter((s) => Boolean(s.strengthSession)).length,
    2
  );

  const plan5 = generateTrainingPlan(
    { ...baseProfile, trainingDaysPerWeek: 5 },
    kpi,
    'en',
    'upcoming'
  );
  assert.equal(
    plan5.weeklySchedule.filter((s) => Boolean(s.strengthSession)).length,
    2
  );

  const plan6 = generateTrainingPlan(
    { ...baseProfile, trainingDaysPerWeek: 6 },
    kpi,
    'id',
    'upcoming'
  );
  assert.equal(
    plan6.weeklySchedule.filter((s) => Boolean(s.strengthSession)).length,
    2
  );

  const raceWeekPlan = generateTrainingPlan(baseProfile, kpi, 'id', 'race_week');
  assert.equal(
    raceWeekPlan.weeklySchedule.filter((s) => Boolean(s.strengthSession)).length,
    0
  );
});

test('computeHeartRateAndVo2Max computes Tanaka HRmax, Karvonen Z1-Z5, VO2max, and avg pace/HR daily stats', () => {
  const profile = {
    weightKg: 68,
    heightCm: 170,
    directBmi: null,
    useDirectBmi: false,
    age: 30,
    injuryStatus: 'none' as const,
    targetRace: '10K' as const,
    trainingDaysPerWeek: 4 as const,
    restingHrBpm: 55,
    maxHrBpm: null,
  };

  // Resting-only fallback (no Strava runs)
  const restOnly = computeHeartRateAndVo2Max(profile, [], [], 'id');
  assert.equal(restOnly.maxHrBpm, 187); // 208 - 0.7 * 30 = 187
  assert.equal(restOnly.zones.length, 5);
  assert.equal(restOnly.vo2MaxSource, 'resting_ratio');
  assert.ok(restOnly.vo2Max > 45);
  assert.equal(restOnly.avgLoggedHrBpm, null);

  // Blended with Strava runs + daily log HR
  const blended = computeHeartRateAndVo2Max(
    profile,
    SAMPLE_STRAVA_RUNS,
    [
      {
        dateKey: '2026-11-19',
        dayIndex: 3,
        sessionTitle: 'Easy Run',
        zone: 'easy',
        plannedKm: 6,
        actualKm: 6,
        paceSecPerKm: 360,
        avgHeartRateBpm: 152,
        comfortRating: 4,
        note: 'Stabil',
        completedAt: '2026-11-19T06:00:00Z',
      },
    ],
    'en'
  );
  assert.equal(blended.vo2MaxSource, 'strava_hr_blended');
  assert.ok((blended.avgLoggedHrBpm ?? 0) > 130);

  const plan = generateTrainingPlan(profile, computeKpiSummary(SAMPLE_STRAVA_RUNS), 'id');
  const stats = computeDailyProgressStats(
    [
      {
        dateKey: '2026-11-19',
        dayIndex: 3,
        sessionTitle: 'Easy',
        zone: 'easy',
        plannedKm: 6,
        actualKm: 6,
        paceSecPerKm: 360,
        avgHeartRateBpm: 150,
        comfortRating: 4,
        note: '',
        completedAt: '2026-11-19T06:00:00Z',
      },
      {
        dateKey: '2026-11-18',
        dayIndex: 2,
        sessionTitle: 'Tempo',
        zone: 'tempo',
        plannedKm: 7,
        actualKm: 7,
        paceSecPerKm: 320,
        avgHeartRateBpm: 164,
        comfortRating: 4,
        note: '',
        completedAt: '2026-11-18T06:00:00Z',
      },
    ],
    plan.weeklySchedule,
    '2026-11-19'
  );
  assert.equal(stats.avgPaceSecPerKm, 340);
  assert.equal(stats.avgHeartRateBpm, 157);
});

test('computeKpiSummary and computeWeeklyChartBuckets adapt dynamically to newer 2027 runs and older historical runs', () => {
  const futureRun = [
    {
      ...SAMPLE_STRAVA_RUNS[0],
      id: '9901001',
      startDate: '2027-03-15T06:00:00+07:00',
    },
  ];
  const refPast = new Date('2026-11-20T12:00:00+07:00');
  const kpiFuture = computeKpiSummary(futureRun, refPast);
  assert.equal(kpiFuture.runCount30Days, 1);
  assert.equal(kpiFuture.thirtyDayTotalKm, 16.2);

  const bucketsFuture = computeWeeklyChartBuckets(futureRun, 8, refPast, 'id');
  assert.equal(
    bucketsFuture.reduce((sum, b) => sum + b.runCount, 0),
    1
  );

  const ref2027 = new Date('2027-06-01T12:00:00+07:00');
  const kpiOld = computeKpiSummary(SAMPLE_STRAVA_RUNS, ref2027);
  assert.equal(kpiOld.runCount30Days, SAMPLE_STRAVA_RUNS.length);
  const bucketsOld = computeWeeklyChartBuckets(SAMPLE_STRAVA_RUNS, 8, ref2027, 'id');
  assert.equal(
    bucketsOld.reduce((sum, b) => sum + b.runCount, 0),
    SAMPLE_STRAVA_RUNS.length
  );
});



