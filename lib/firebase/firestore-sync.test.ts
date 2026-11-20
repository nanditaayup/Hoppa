import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDailyProgressPayload,
  buildProgressDocId,
  buildRunActivityPayload,
  DEFAULT_RUNNER_PROFILE,
  sanitizeFirestoreId,
  sanitizeRaceDateString,
  sanitizeRaceNameString,
  sanitizeRunnerProfile,
} from './firestore-sync';
import { DailyProgressEntry, RunActivity } from '@/lib/strava/types';

test('sanitizeFirestoreId strips invalid path characters and enforces 120 char cap', () => {
  const dirty = '../../etc/passwd?token=' + 'a'.repeat(180);
  const safe = sanitizeFirestoreId(dirty);
  assert.match(safe, /^[a-zA-Z0-9_-]+$/);
  assert.ok(safe.length <= 120);
});

test('sanitizeRunnerProfile clamps extreme inputs within Firestore rule bounds', () => {
  const sanitized = sanitizeRunnerProfile({
    ...DEFAULT_RUNNER_PROFILE,
    weightKg: -20,
    heightCm: 999,
    age: 5,
    restingHrBpm: 300,
    maxHrBpm: 80,
    directBmi: 2,
    useDirectBmi: true,
    injuryStatus: 'invalid' as never,
    targetRace: '100K' as never,
    trainingDaysPerWeek: 9 as never,
  });

  assert.equal(sanitized.weightKg, 30);
  assert.equal(sanitized.heightCm, 230);
  assert.equal(sanitized.age, 12);
  assert.equal(sanitized.restingHrBpm, 110);
  assert.equal(sanitized.maxHrBpm, 120);
  assert.equal(sanitized.directBmi, 10);
  assert.equal(sanitized.injuryStatus, 'none');
  assert.equal(sanitized.targetRace, '10K');
  assert.equal(sanitized.trainingDaysPerWeek, 4);
});

test('sanitizeRaceDateString and sanitizeRaceNameString enforce schema regex and max length', () => {
  assert.equal(sanitizeRaceDateString('2026-12-01'), '2026-12-01');
  assert.equal(sanitizeRaceDateString('invalid-date'), '');
  assert.equal(sanitizeRaceNameString('M'.repeat(140)).length, 80);
});

test('buildDailyProgressPayload enforces progressId format and bounds', () => {
  const entry: DailyProgressEntry = {
    dateKey: '2026-11-20',
    dayIndex: 4,
    sessionTitle: 'Easy Run ' + 'x'.repeat(150),
    zone: 'easy',
    plannedKm: 5,
    actualKm: 999,
    paceSecPerKm: 50,
    avgHeartRateBpm: 320,
    comfortRating: 5,
    note: 'n'.repeat(400),
    completedAt: '2026-11-20T07:30:00Z',
  };

  assert.equal(buildProgressDocId('2026-11-20', 4), '2026-11-20_4');
  const { progressId, payload } = buildDailyProgressPayload('user_123', entry);
  assert.equal(progressId, '2026-11-20_4');
  assert.equal(payload.uid, 'user_123');
  assert.equal(payload.actualKm, 300);
  assert.equal(payload.paceSecPerKm, 120);
  assert.equal(payload.avgHeartRateBpm, 240);
  assert.equal(String(payload.sessionTitle).length, 120);
  assert.equal(String(payload.note).length, 280);
});

test('buildRunActivityPayload enforces runId parity, GPS spike clamps, and polyline bounds', () => {
  const run: RunActivity = {
    id: 'strava/run:999',
    name: '',
    type: 'Run',
    startDate: '2026-11-18T06:00:00Z',
    distanceMeters: 10000,
    movingTimeSeconds: 3600,
    elapsedTimeSeconds: 3700,
    elevationGainMeters: 85,
    averageHeartRate: 10, // invalid low outlier -> null
    maxSpeedMps: 95, // GPS glitch -> clamped to 30
    averageSpeedMps: 2.8,
    summaryPolyline: 'p'.repeat(60000),
    source: 'gpx',
  };

  const { runId, payload } = buildRunActivityPayload('user_abc', run);
  assert.equal(runId, 'strava_run_999');
  assert.equal(payload.id, 'strava_run_999');
  assert.equal(payload.name, 'Sesi Lari');
  assert.equal(payload.averageHeartRate, null);
  assert.equal(payload.maxSpeedMps, 30);
  assert.equal(String(payload.summaryPolyline).length, 50000);
});
