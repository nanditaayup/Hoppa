import { SAMPLE_STRAVA_RUNS } from './config';
import { addDaysToDateKey, getDefaultRaceDateKey } from './transform';
import {
  AppLanguage,
  DailyProgressEntry,
  RunActivity,
  RunnerProfile,
} from './types';

export interface DemoWorkspaceSnapshot {
  profile: RunnerProfile;
  runs: RunActivity[];
  progressEntries: DailyProgressEntry[];
  customRaceDate: string;
  customRaceName: string;
}

function getDayIndexForDateKey(dateKey: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!match) return 0;
  const dt = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
  const utcDay = dt.getUTCDay();
  return utcDay === 0 ? 6 : utcDay - 1;
}

function shiftIsoTimestamp(iso: string, deltaDays: number): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  const shiftedMs = parsed.getTime() + deltaDays * 24 * 60 * 60 * 1000;
  const wib = new Date(shiftedMs + 7 * 60 * 60 * 1000);
  return wib.toISOString().replace('Z', '+07:00');
}

/**
 * Generates deterministic, login-free dummy workspace data anchored to todayDateKey
 * so visitors inspecting the Demo experience realistic weekly volumes, route polylines,
 * completed progress logs, Monthly Intensity Calendar heatmaps, and Personal Bests.
 */
export function buildDemoWorkspaceSnapshot(
  todayDateKey: string,
  lang: AppLanguage = 'id'
): DemoWorkspaceSnapshot {
  const targetNewestDateKey = addDaysToDateKey(todayDateKey, -1);
  const baseNewestDateKey = SAMPLE_STRAVA_RUNS[0]?.startDate.slice(0, 10) || '2026-11-16';
  const targetMs = Date.parse(`${targetNewestDateKey}T00:00:00Z`);
  const baseMs = Date.parse(`${baseNewestDateKey}T00:00:00Z`);
  const deltaDays =
    Number.isFinite(targetMs) && Number.isFinite(baseMs)
      ? Math.round((targetMs - baseMs) / (24 * 60 * 60 * 1000))
      : 0;

  const runs: RunActivity[] = SAMPLE_STRAVA_RUNS.map((run) => ({
    ...run,
    startDate: shiftIsoTimestamp(run.startDate, deltaDays),
  }));

  const profile: RunnerProfile = {
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
    customTargetPaceSecPerKm: 325, // 05:25/km
    shoeName: 'Pegasus 41 Daily',
    shoeCurrentKm: 312,
    shoeMaxKm: 700,
    onboardingCompleted: true,
    pb5kSec: 1350, // 22:30
    pb10kSec: 2880, // 48:00
    pb21kSec: 6900, // 1:55:00
    pb42kSec: null,
  };

  const entryBlueprints: Array<{
    offsetDays: number;
    titleId: string;
    titleEn: string;
    zone: DailyProgressEntry['zone'];
    plannedKm: number;
    actualKm: number;
    paceSecPerKm: number;
    avgHeartRateBpm: number;
    comfortRating: DailyProgressEntry['comfortRating'];
    noteId: string;
    noteEn: string;
  }> = [
    {
      offsetDays: -1,
      titleId: 'Long Run Akhir Pekan',
      titleEn: 'Weekend Long Run',
      zone: 'long_run',
      plannedKm: 16,
      actualKm: 16.2,
      paceSecPerKm: 360,
      avgHeartRateBpm: 148,
      comfortRating: 5,
      noteId: 'Strava: Long Run Minggu Pagi — Senayan Loop',
      noteEn: 'Strava: Sunday Morning Long Run — Senayan Loop',
    },
    {
      offsetDays: -3,
      titleId: 'Tempo Terkontrol (21K)',
      titleEn: 'Controlled Tempo (21K)',
      zone: 'tempo',
      plannedKm: 8,
      actualKm: 8.1,
      paceSecPerKm: 300,
      avgHeartRateBpm: 168,
      comfortRating: 4,
      noteId: 'Strava: Tempo Threshold 8K',
      noteEn: 'Strava: Tempo Threshold 8K',
    },
    {
      offsetDays: -5,
      titleId: 'Easy Run Aerobik',
      titleEn: 'Easy Aerobic Run',
      zone: 'easy',
      plannedKm: 5.5,
      actualKm: 5.4,
      paceSecPerKm: 382,
      avgHeartRateBpm: 137,
      comfortRating: 5,
      noteId: 'Lari santai pagi hari, napas terasa ringan',
      noteEn: 'Relaxed morning run with steady breathing',
    },
    {
      offsetDays: -8,
      titleId: 'Easy Trail Hill Climb',
      titleEn: 'Easy Trail Hill Climb',
      zone: 'easy',
      plannedKm: 10,
      actualKm: 11.4,
      paceSecPerKm: 425,
      avgHeartRateBpm: 155,
      comfortRating: 4,
      noteId: 'Rute bukit Sentul dengan tanjakan bertahap',
      noteEn: 'Sentul rolling hills route',
    },
    {
      offsetDays: -11,
      titleId: 'Interval Kecepatan Ringan',
      titleEn: 'Light Speed Intervals',
      zone: 'interval',
      plannedKm: 9,
      actualKm: 9.2,
      paceSecPerKm: 318,
      avgHeartRateBpm: 162,
      comfortRating: 4,
      noteId: '6x800m di lintasan lari dengan jeda 90 detik',
      noteEn: '6x800m track repeats with 90s jog rest',
    },
  ];

  const progressEntries: DailyProgressEntry[] = entryBlueprints.map((item) => {
    const dateKey = addDaysToDateKey(todayDateKey, item.offsetDays);
    return {
      dateKey,
      dayIndex: getDayIndexForDateKey(dateKey),
      sessionTitle: lang === 'en' ? item.titleEn : item.titleId,
      zone: item.zone,
      plannedKm: item.plannedKm,
      actualKm: item.actualKm,
      paceSecPerKm: item.paceSecPerKm,
      avgHeartRateBpm: item.avgHeartRateBpm,
      comfortRating: item.comfortRating,
      note: lang === 'en' ? item.noteEn : item.noteId,
      completedAt: `${dateKey}T06:30:00+07:00`,
    };
  });

  return {
    profile,
    runs,
    progressEntries,
    customRaceDate: getDefaultRaceDateKey(todayDateKey, '21K'),
    customRaceName: 'Half Marathon Demo 21K',
  };
}
