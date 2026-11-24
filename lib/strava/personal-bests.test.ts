import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractSuggestedPbsFromRuns,
  formatPbDuration,
  getProfilePersonalBests,
  parsePbDurationInput,
} from './personal-bests';
import { DEFAULT_RUNNER_PROFILE } from '@/lib/firebase/firestore-sync';
import { RunActivity } from './types';

test('formatPbDuration formats sub-hour and multi-hour race times cleanly', () => {
  assert.equal(formatPbDuration(null), '--:--');
  assert.equal(formatPbDuration(1470), '24:30');
  assert.equal(formatPbDuration(3665), '1:01:05');
  assert.equal(formatPbDuration(14520), '4:02:00');
});

test('parsePbDurationInput parses mm:ss and h:mm:ss and rejects out-of-range inputs', () => {
  assert.equal(parsePbDurationInput('23:45'), 1425);
  assert.equal(parsePbDurationInput('1:52:10'), 6730);
  assert.equal(parsePbDurationInput('3:58:00'), 14280);
  assert.equal(parsePbDurationInput(''), null);
  assert.equal(parsePbDurationInput('12:75'), null);
  assert.equal(parsePbDurationInput('05:00'), null); // below 10m minimum
});

test('extractSuggestedPbsFromRuns detects fastest qualifying 5K and 21K runs', () => {
  const runs: RunActivity[] = [
    {
      id: 'r1',
      name: 'Morning 5K Tempo',
      type: 'Run',
      startDate: '2026-11-10T06:00:00Z',
      distanceMeters: 5050,
      movingTimeSeconds: 1414,
      elapsedTimeSeconds: 1430,
      elevationGainMeters: 20,
      averageHeartRate: 165,
      maxSpeedMps: 4.1,
      averageSpeedMps: 3.57,
      summaryPolyline: null,
      source: 'csv',
    },
    {
      id: 'r2',
      name: 'Half Marathon Race',
      type: 'Run',
      startDate: '2026-11-01T05:30:00Z',
      distanceMeters: 21100,
      movingTimeSeconds: 6600,
      elapsedTimeSeconds: 6650,
      elevationGainMeters: 90,
      averageHeartRate: 168,
      maxSpeedMps: 3.8,
      averageSpeedMps: 3.19,
      summaryPolyline: null,
      source: 'csv',
    },
  ];

  const detected = extractSuggestedPbsFromRuns(runs);
  assert.equal(detected['5K'], 1400);
  assert.equal(detected['21K'], 6600);
  assert.equal(detected['10K'], undefined);

  const summary = getProfilePersonalBests({
    ...DEFAULT_RUNNER_PROFILE,
    pb5kSec: detected['5K'],
  });
  assert.equal(summary[0].formatted, '23:20');
  assert.equal(summary[1].formatted, '--:--');
});
