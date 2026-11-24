import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBackupPayload, parseAndValidateBackupJson } from './backup';
import { DEFAULT_RUNNER_PROFILE } from '@/lib/firebase/firestore-sync';
import { SAMPLE_STRAVA_RUNS } from './config';

test('buildBackupPayload and parseAndValidateBackupJson round-trip valid workspace snapshots', () => {
  const payload = buildBackupPayload({
    language: 'id',
    customRaceDate: '2026-12-20',
    customRaceName: 'Jakarta Run 21K',
    profile: {
      ...DEFAULT_RUNNER_PROFILE,
      weightKg: 66,
      targetRace: '21K',
      shoeName: 'Novablast 5',
      shoeCurrentKm: 245.5,
      shoeMaxKm: 750,
      customTargetPaceSecPerKm: 327,
      pb5kSec: 1320,
      pb10kSec: 2800,
      pb21kSec: 6420,
      pb42kSec: null,
      onboardingCompleted: true,
    },
    progressEntries: [
      {
        dateKey: '2026-11-20',
        dayIndex: 4,
        sessionTitle: 'Easy Run',
        zone: 'easy',
        plannedKm: 8,
        actualKm: 8.2,
        paceSecPerKm: 375,
        avgHeartRateBpm: 145,
        comfortRating: 5,
        note: 'Ringan',
        completedAt: '2026-11-20T06:00:00Z',
      },
    ],
    runs: SAMPLE_STRAVA_RUNS.slice(0, 2),
  });

  const json = JSON.stringify(payload);
  const res = parseAndValidateBackupJson(json);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.profile.shoeName, 'Novablast 5');
    assert.equal(res.data.profile.shoeCurrentKm, 245.5);
    assert.equal(res.data.profile.customTargetPaceSecPerKm, 327);
    assert.equal(res.data.profile.pb5kSec, 1320);
    assert.equal(res.data.profile.pb10kSec, 2800);
    assert.equal(res.data.profile.pb21kSec, 6420);
    assert.equal(res.data.profile.pb42kSec, null);
    assert.equal(res.data.profile.onboardingCompleted, true);
    assert.equal(res.data.progressEntries.length, 1);
    assert.equal(res.data.runs.length, 2);
  }
});

test('parseAndValidateBackupJson rejects corrupted JSON and foreign schemas while clamping extremes', () => {
  const badJson = parseAndValidateBackupJson('{broken');
  assert.deepEqual(badJson, { ok: false, errorCode: 'invalid_json' });

  const foreignSchema = parseAndValidateBackupJson(
    JSON.stringify({ app: 'OtherApp', version: 99, profile: {} })
  );
  assert.deepEqual(foreignSchema, { ok: false, errorCode: 'invalid_schema' });

  const clamped = parseAndValidateBackupJson(
    JSON.stringify({
      app: 'PaceCraft',
      version: 1,
      profile: {
        weightKg: 999,
        heightCm: 50,
        shoeCurrentKm: -50,
        shoeMaxKm: 9000,
        customTargetPaceSecPerKm: 40,
      },
      progressEntries: [{ actualKm: 9999, comfortRating: 99 }],
      runs: [{ distanceMeters: 9999999 }],
    })
  );
  assert.equal(clamped.ok, true);
  if (clamped.ok) {
    assert.equal(clamped.data.profile.weightKg, 200);
    assert.equal(clamped.data.profile.heightCm, 120);
    assert.equal(clamped.data.profile.shoeCurrentKm, 0);
    assert.equal(clamped.data.profile.shoeMaxKm, 2000);
    assert.equal(clamped.data.profile.customTargetPaceSecPerKm, 120);
    assert.equal(clamped.data.progressEntries[0].actualKm, 300);
    assert.equal(clamped.data.runs[0].distanceMeters, 500000);
  }
});
