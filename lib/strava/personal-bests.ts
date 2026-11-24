import { RaceDistanceKey, RunActivity, RunnerProfile } from './types';

export interface PersonalBestSummary {
  key: RaceDistanceKey;
  distanceKm: number;
  seconds: number | null;
  formatted: string;
}

const PB_DISTANCE_BANDS: Array<{
  key: RaceDistanceKey;
  distanceKm: number;
  minMeters: number;
  maxMeters: number;
}> = [
  { key: '5K', distanceKm: 5, minMeters: 4850, maxMeters: 5400 },
  { key: '10K', distanceKm: 10, minMeters: 9750, maxMeters: 10600 },
  { key: '21K', distanceKm: 21.1, minMeters: 20700, maxMeters: 22200 },
  { key: '42K', distanceKm: 42.2, minMeters: 41600, maxMeters: 44000 },
];

export function clampPbSeconds(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 600 || rounded > 36000) return null;
  return rounded;
}

export function formatPbDuration(totalSeconds: number | null | undefined): string {
  const valid = clampPbSeconds(totalSeconds);
  if (valid === null) return '--:--';

  const hours = Math.floor(valid / 3600);
  const mins = Math.floor((valid % 3600) / 60);
  const secs = valid % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Parses "mm:ss" or "h:mm:ss" strings into total seconds (600s..36000s).
 * Returns null when empty or invalid.
 */
export function parsePbDurationInput(raw: string): number | null {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;

  const parts = trimmed.split(':').map((p) => p.trim());
  if (parts.length !== 2 && parts.length !== 3) return null;

  const nums = parts.map((p) => (/^\d+$/.test(p) ? Number(p) : NaN));
  if (nums.some((n) => !Number.isFinite(n))) return null;

  let totalSec = 0;
  if (nums.length === 2) {
    const [m, s] = nums;
    if (s >= 60 || m > 600) return null;
    totalSec = m * 60 + s;
  } else {
    const [h, m, s] = nums;
    if (h > 10 || m >= 60 || s >= 60) return null;
    totalSec = h * 3600 + m * 60 + s;
  }

  return clampPbSeconds(totalSec);
}

export function getProfilePersonalBests(
  profile: RunnerProfile
): PersonalBestSummary[] {
  const map: Record<RaceDistanceKey, number | null | undefined> = {
    '5K': profile.pb5kSec,
    '10K': profile.pb10kSec,
    '21K': profile.pb21kSec,
    '42K': profile.pb42kSec,
  };

  return PB_DISTANCE_BANDS.map((band) => {
    const sec = clampPbSeconds(map[band.key]);
    return {
      key: band.key,
      distanceKm: band.distanceKm,
      seconds: sec,
      formatted: formatPbDuration(sec),
    };
  });
}

export function extractSuggestedPbsFromRuns(
  runs: RunActivity[]
): Partial<Record<RaceDistanceKey, number>> {
  const best: Partial<Record<RaceDistanceKey, number>> = {};

  for (const run of runs) {
    if (run.movingTimeSeconds <= 0 || run.distanceMeters <= 0) continue;
    for (const band of PB_DISTANCE_BANDS) {
      if (
        run.distanceMeters >= band.minMeters &&
        run.distanceMeters <= band.maxMeters
      ) {
        // Normalize time proportionally to exact race distance
        const scaledSec = Math.round(
          (run.movingTimeSeconds / run.distanceMeters) * (band.distanceKm * 1000)
        );
        const valid = clampPbSeconds(scaledSec);
        if (valid !== null) {
          const prev = best[band.key];
          if (prev === undefined || valid < prev) {
            best[band.key] = valid;
          }
        }
      }
    }
  }

  return best;
}
