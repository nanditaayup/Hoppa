import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeeklyScheduleIcs,
  resolveUpcomingDateKeyForWeekday,
} from './ics-export';
import { DailySessionPlan } from './types';

const SAMPLE_SCHEDULE: DailySessionPlan[] = [
  {
    dayIndex: 0,
    dayName: 'Senin',
    zone: 'rest',
    title: 'Istirahat Total',
    targetDistanceKm: 0,
    paceRange: '-',
    guidance: 'Pemulihan otot.',
    strengthSession: null,
  },
  {
    dayIndex: 1,
    dayName: 'Selasa',
    zone: 'easy',
    title: 'Lari Santai Aerobik',
    targetDistanceKm: 6.5,
    paceRange: '06:30–07:00/km',
    guidance: 'Jaga napas tetap ringan; fokus irama kaki.',
    strengthSession: {
      title: 'Stabilitas Core & Pinggul',
      durationMin: 15,
      exercises: 'Plank 3x30 dtk, Glute Bridge 3x12',
    },
  },
  {
    dayIndex: 6,
    dayName: 'Minggu',
    zone: 'long_run',
    title: 'Long Run Akhir Pekan',
    targetDistanceKm: 14,
    paceRange: '06:40–07:10/km',
    guidance: 'Minum elektrolit tiap 30 menit.',
    strengthSession: null,
  },
];

test('resolveUpcomingDateKeyForWeekday maps weekdays relative to today without going backwards', () => {
  // 2026-11-24 is Tuesday (dayIndex = 1)
  assert.equal(resolveUpcomingDateKeyForWeekday('2026-11-24', 1, 1), '2026-11-24');
  assert.equal(resolveUpcomingDateKeyForWeekday('2026-11-24', 1, 6), '2026-11-29');
  // Monday (dayIndex = 0) already passed relative to Tuesday -> next Monday 2026-11-30
  assert.equal(resolveUpcomingDateKeyForWeekday('2026-11-24', 1, 0), '2026-11-30');
});

test('buildWeeklyScheduleIcs emits valid VCALENDAR VEVENTs for active sessions and skips rest days', () => {
  const ics = buildWeeklyScheduleIcs({
    weeklySchedule: SAMPLE_SCHEDULE,
    todayDateKey: '2026-11-24',
    todayDayIndex: 1,
    targetRace: '21K',
    raceEventLabel: 'Jakarta Half (21K)',
    lang: 'id',
  });

  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  const events = ics.match(/BEGIN:VEVENT/g) ?? [];
  assert.equal(events.length, 2);
  assert.match(ics, /DTSTART:20261124T060000/);
  assert.match(ics, /DTSTART:20261129T060000/);
  assert.match(ics, /SUMMARY:\[PaceCraft 21K\] Lari Santai Aerobik \(6\\,5 km\)/);
  assert.match(ics, /Latihan Kekuatan \(15 mnt\): Stabilitas Core & Pinggul/);
  assert.match(ics, /TRIGGER:-PT30M/);
});
