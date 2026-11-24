import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoWorkspaceSnapshot } from './demo-data';

test('buildDemoWorkspaceSnapshot anchors runs and progress logs relative to todayDateKey', () => {
  const snapshot = buildDemoWorkspaceSnapshot('2026-11-24', 'id');

  assert.equal(snapshot.profile.targetRace, '21K');
  assert.equal(snapshot.profile.onboardingCompleted, true);
  assert.equal(snapshot.profile.pb5kSec, 1350);
  assert.equal(snapshot.runs.length, 8);
  assert.equal(snapshot.progressEntries.length, 5);

  const newestRunDate = snapshot.runs[0].startDate.slice(0, 10);
  assert.equal(newestRunDate, '2026-11-23');
  assert.ok(snapshot.runs[0].summaryPolyline && snapshot.runs[0].summaryPolyline.length > 0);

  for (const entry of snapshot.progressEntries) {
    assert.ok(entry.dayIndex >= 0 && entry.dayIndex <= 6);
    assert.ok(entry.actualKm > 0);
  }
});

test('buildDemoWorkspaceSnapshot supports English labels and notes', () => {
  const en = buildDemoWorkspaceSnapshot('2026-11-24', 'en');
  assert.equal(en.progressEntries[0].sessionTitle, 'Weekend Long Run');
  assert.match(en.progressEntries[2].note, /Relaxed morning run/);
});
