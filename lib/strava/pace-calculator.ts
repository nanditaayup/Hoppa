import { AppLanguage, RaceDistanceKey } from './types';

export interface RaceDistanceOption {
  key: RaceDistanceKey;
  label: string;
  km: number;
  defaultHours: number;
  defaultMinutes: number;
  defaultSeconds: number;
}

export interface PaceZoneResult {
  distanceKm: number;
  totalSeconds: number;
  racePaceSec: number;
  racePaceFormatted: string;
  speedKmhFormatted: string;
  easyRange: string;
  tempoRange: string;
  intervalRange: string;
}

export const RACE_DISTANCES: Record<RaceDistanceKey, RaceDistanceOption> = {
  '5K': {
    key: '5K',
    label: '5K Fun / Road Race',
    km: 5.0,
    defaultHours: 0,
    defaultMinutes: 25,
    defaultSeconds: 0,
  },
  '10K': {
    key: '10K',
    label: '10K Road Race',
    km: 10.0,
    defaultHours: 0,
    defaultMinutes: 52,
    defaultSeconds: 30,
  },
  '21K': {
    key: '21K',
    label: '21K Half Marathon',
    km: 21.1,
    defaultHours: 1,
    defaultMinutes: 55,
    defaultSeconds: 0,
  },
  '42K': {
    key: '42K',
    label: '42K Full Marathon',
    km: 42.2,
    defaultHours: 4,
    defaultMinutes: 10,
    defaultSeconds: 0,
  },
};

export function formatCalculatorPace(secondsPerKm: number): string {
  const safeSeconds = Math.min(1800, Math.max(90, Math.round(secondsPerKm)));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}/km`;
}

export function formatCalculatorDecimal(
  value: number,
  fractionDigits: number,
  lang: AppLanguage = 'id'
): string {
  if (!Number.isFinite(value)) return '0';
  const fixed = value.toFixed(fractionDigits);
  return lang === 'id' ? fixed.replace('.', ',') : fixed;
}

export function calculateTrainingPaces(
  distanceKey: RaceDistanceKey,
  hours: number,
  minutes: number,
  seconds: number,
  lang: AppLanguage = 'id'
): PaceZoneResult {
  const distanceKm = RACE_DISTANCES[distanceKey].km;
  const safeHours = Number.isFinite(hours) ? Math.min(24, Math.max(0, Math.floor(hours))) : 0;
  const safeMinutes = Number.isFinite(minutes) ? Math.min(59, Math.max(0, Math.floor(minutes))) : 0;
  const safeSeconds = Number.isFinite(seconds) ? Math.min(59, Math.max(0, Math.floor(seconds))) : 0;

  const totalSeconds = Math.max(
    60,
    safeHours * 3600 + safeMinutes * 60 + safeSeconds
  );
  const racePaceSec = totalSeconds / distanceKm;
  const speedKmh = distanceKm / (totalSeconds / 3600);
  const speedUnit = lang === 'en' ? 'km/h' : 'km/jam';

  // 1. Easy Pace (+45s to +75s from Race Pace)
  const easyMin = racePaceSec + 45;
  const easyMax = racePaceSec + 75;

  // 2. Tempo Pace (distance-calibrated threshold)
  let tempoMin = racePaceSec + 10;
  let tempoMax = racePaceSec + 20;

  if (distanceKey === '21K') {
    tempoMin = racePaceSec - 5;
    tempoMax = racePaceSec + 5;
  } else if (distanceKey === '42K') {
    tempoMin = racePaceSec - 25;
    tempoMax = racePaceSec - 15;
  }

  // 3. Interval Pace (strictly faster than Tempo and Race Pace)
  const intervalBase = Math.min(racePaceSec, tempoMin);
  const intervalMin = Math.max(90, intervalBase - 25);
  const intervalMax = Math.max(95, intervalBase - 12);

  return {
    distanceKm,
    totalSeconds,
    racePaceSec: Math.round(racePaceSec),
    racePaceFormatted: formatCalculatorPace(racePaceSec),
    speedKmhFormatted: `${formatCalculatorDecimal(speedKmh, 1, lang)} ${speedUnit}`,
    easyRange: `${formatCalculatorPace(easyMin).replace('/km', '')} – ${formatCalculatorPace(easyMax)}`,
    tempoRange: `${formatCalculatorPace(tempoMin).replace('/km', '')} – ${formatCalculatorPace(tempoMax)}`,
    intervalRange: `${formatCalculatorPace(intervalMin).replace('/km', '')} – ${formatCalculatorPace(intervalMax)}`,
  };
}
