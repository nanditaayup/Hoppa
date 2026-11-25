import { ACCEPTED_RUN_TYPES, encodePolyline } from './config';
import { ParseImportResult, RunActivity, RunActivityType, RunDataQuality } from './types';

export function normalizeRunType(rawType: string): RunActivityType | null {
  const cleaned = rawType.trim().toLowerCase();
  if (!cleaned) return null;
  if (
    cleaned === 'run' ||
    cleaned === 'running' ||
    cleaned === 'jalan raya' ||
    cleaned === 'road run' ||
    cleaned === '9'
  ) {
    return 'Run';
  }
  if (
    cleaned === 'trailrun' ||
    cleaned === 'trail run' ||
    cleaned === 'trail running' ||
    cleaned === 'trail'
  ) {
    return 'TrailRun';
  }
  if (
    cleaned === 'virtualrun' ||
    cleaned === 'virtual run' ||
    cleaned === 'virtual running' ||
    cleaned === 'virtual' ||
    cleaned === 'treadmill'
  ) {
    return 'VirtualRun';
  }
  if (ACCEPTED_RUN_TYPES.has(rawType.trim())) {
    return rawType.trim() as RunActivityType;
  }
  return null;
}

/**
 * Parses numeric values supporting both dot and comma decimal formats.
 * Handles thousands separator like "8.100" when followed by 3 digits and no comma,
 * or preserves 3-decimal floats like "1.833" m/s when preserveThreeDecimalAsFloat is true.
 */
export function parseFlexibleNumber(
  raw: string | undefined,
  preserveThreeDecimalAsFloat = false
): number {
  if (!raw) return 0;
  let cleaned = raw.trim().replace(/[^0-9.,-]/g, '');
  if (!cleaned) return 0;

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    // e.g. "8.100,50" -> remove dots, replace comma with dot
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // e.g. "8,100.50" -> remove commas
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (hasComma) {
    // e.g. "3,3333" or "8,10"
    cleaned = cleaned.replace(',', '.');
  } else if (hasDot) {
    // Check if dot is thousands separator like "8.100" (only when not a 3-decimal float column)
    if (!preserveThreeDecimalAsFloat && /^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
      cleaned = cleaned.replace(/\./g, '');
    }
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Splits a single CSV line respecting quoted fields and delimiters (, or ;).
 */
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDurationInput(raw: string | undefined): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (/^\d+:\d{1,2}(:\d{1,2})?$/.test(trimmed)) {
    const parts = trimmed.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return Math.round(parseFlexibleNumber(trimmed));
}

function parseDateIso(raw: string | undefined): string {
  if (!raw || !raw.trim()) return new Date().toISOString();
  const trimmed = raw.trim();
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return new Date().toISOString();
}

/**
 * Parses Strava activities.csv content purely in memory.
 */
export function parseStravaCsv(csvText: string): ParseImportResult {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return {
      runs: [],
      skippedNonRuns: 0,
      totalRowsProcessed: 0,
      errors: ['File CSV kosong atau tidak memiliki baris data.'],
    };
  }

  const headerLine = lines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';

  const headers = splitCsvLine(headerLine, delimiter).map((h) =>
    h.toLowerCase().replace(/^"|"$/g, '').trim()
  );

  const findCol = (...candidates: string[]): number => {
    for (const c of candidates) {
      const exact = headers.indexOf(c);
      if (exact !== -1) return exact;
    }
    for (const c of candidates) {
      const partial = headers.findIndex((h) => h.includes(c));
      if (partial !== -1) return partial;
    }
    return -1;
  };

  const colId = findCol('activity id', 'id');
  const colName = findCol('activity name', 'name', 'nama');
  const colType = findCol('activity type', 'type', 'sport_type', 'tipe');
  const colDate = findCol('activity date', 'start_date', 'date', 'tanggal');
  const colMovingTime = findCol('moving time', 'moving_time', 'waktu bergerak');
  const colElapsedTime = findCol('elapsed time', 'elapsed_time', 'waktu total');
  const colDistance = findCol('distance', 'jarak');
  const colElevation = findCol('elevation gain', 'total_elevation_gain', 'elevasi');
  const colHr = findCol('average heart rate', 'average_heartrate', 'heart rate', 'hr');
  const colAvgSpeed = findCol('average speed', 'average_speed', 'kecepatan rata');
  const colMaxSpeed = findCol('max speed', 'max_speed', 'kecepatan maks');

  if (colType === -1 || colDistance === -1) {
    return {
      runs: [],
      skippedNonRuns: 0,
      totalRowsProcessed: lines.length - 1,
      errors: [
        'Kolom wajib "Activity Type" atau "Distance" tidak ditemukan dalam file CSV.',
      ],
    };
  }

  const distanceHeader = headers[colDistance] || '';
  const explicitKm = distanceHeader.includes('(km)') || distanceHeader.includes('km');
  const explicitMeters =
    distanceHeader.includes('(m)') ||
    distanceHeader.includes('meter') ||
    distanceHeader === 'distance_m';

  const runs: RunActivity[] = [];
  let skippedNonRuns = 0;

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const cols = splitCsvLine(lines[rowIdx], delimiter);
    if (cols.length < 2) continue;

    const rawType = cols[colType] || '';
    const runType = normalizeRunType(rawType);
    if (!runType) {
      skippedNonRuns++;
      continue;
    }

    const movingTimeSeconds =
      colMovingTime !== -1 ? parseDurationInput(cols[colMovingTime]) : 0;
    const elapsedTimeSeconds =
      colElapsedTime !== -1
        ? Math.max(movingTimeSeconds, parseDurationInput(cols[colElapsedTime]))
        : movingTimeSeconds;

    const rawDistance = parseFlexibleNumber(cols[colDistance], explicitKm);
    let distanceMeters = rawDistance;
    if (explicitMeters) {
      distanceMeters = rawDistance;
    } else if (explicitKm) {
      distanceMeters = rawDistance * 1000;
    } else if (movingTimeSeconds > 0 && rawDistance > 0) {
      // Heuristic: if rawDistance / movingTime is plausible running speed (0.5..12 m/s), it's meters
      const asMetersSpeed = rawDistance / movingTimeSeconds;
      const asKmSpeed = (rawDistance * 1000) / movingTimeSeconds;
      if (asMetersSpeed >= 0.5 && asMetersSpeed <= 12) {
        distanceMeters = rawDistance;
      } else if (asKmSpeed >= 0.5 && asKmSpeed <= 12) {
        distanceMeters = rawDistance * 1000;
      } else if (rawDistance < 100) {
        distanceMeters = rawDistance * 1000;
      }
    } else if (rawDistance > 0 && rawDistance < 100) {
      distanceMeters = rawDistance * 1000;
    }

    if (distanceMeters <= 0) continue;

    const rawAvgSpeed =
      colAvgSpeed !== -1 ? parseFlexibleNumber(cols[colAvgSpeed], true) : 0;
    const derivedSpeedMps =
      movingTimeSeconds > 0 && distanceMeters > 0
        ? distanceMeters / movingTimeSeconds
        : 0;

    let averageSpeedMps = derivedSpeedMps > 0 ? derivedSpeedMps : rawAvgSpeed;
    let dataWarningReason: RunDataQuality['reason'] = null;

    if (rawAvgSpeed > 0) {
      if (derivedSpeedMps > 0) {
        const diffMps = Math.abs(rawAvgSpeed - derivedSpeedMps) / derivedSpeedMps;
        const asKmhToMps = rawAvgSpeed / 3.6;
        const diffKmh = Math.abs(asKmhToMps - derivedSpeedMps) / derivedSpeedMps;
        if (diffMps <= 0.25 && rawAvgSpeed <= 8.5) {
          averageSpeedMps = rawAvgSpeed;
        } else if (rawAvgSpeed > 5 && diffKmh <= 0.15) {
          averageSpeedMps = asKmhToMps;
        } else {
          // Corrupted or mismatched speed column; fall back safely to distance / movingTime
          averageSpeedMps = derivedSpeedMps;
          dataWarningReason = 'speed_distance_mismatch';
        }
      } else {
        averageSpeedMps = rawAvgSpeed > 10 ? rawAvgSpeed / 3.6 : rawAvgSpeed;
      }
    }

    const rawMaxSpeed =
      colMaxSpeed !== -1 ? parseFlexibleNumber(cols[colMaxSpeed], true) : 0;
    const normalizedMaxSpeed =
      rawMaxSpeed > 12 && averageSpeedMps > 0 && Math.abs(rawMaxSpeed / 3.6 - averageSpeedMps) < averageSpeedMps * 2
        ? rawMaxSpeed / 3.6
        : rawMaxSpeed;
    const maxSpeedMps =
      normalizedMaxSpeed > 0 && normalizedMaxSpeed <= 12
        ? normalizedMaxSpeed
        : averageSpeedMps * 1.18;

    const elevationGainMeters =
      colElevation !== -1 ? Math.round(parseFlexibleNumber(cols[colElevation], true)) : 0;

    const rawHr = colHr !== -1 ? parseFlexibleNumber(cols[colHr], true) : 0;
    const averageHeartRate = rawHr > 30 ? Math.round(rawHr) : null;

    const startDate = parseDateIso(colDate !== -1 ? cols[colDate] : undefined);
    const id =
      colId !== -1 && cols[colId]?.trim()
        ? cols[colId].trim()
        : `csv-${startDate}-${Math.round(distanceMeters)}`;
    const name =
      colName !== -1 && cols[colName]?.trim()
        ? cols[colName].trim()
        : `Lari ${runType === 'TrailRun' ? 'Trail' : runType === 'VirtualRun' ? 'Virtual' : 'Jalan Raya'}`;

    runs.push({
      id,
      name,
      type: runType,
      startDate,
      distanceMeters: Math.round(distanceMeters),
      movingTimeSeconds: Math.max(1, movingTimeSeconds || Math.round(distanceMeters / (averageSpeedMps || 2.8))),
      elapsedTimeSeconds: Math.max(1, elapsedTimeSeconds || movingTimeSeconds),
      elevationGainMeters,
      averageHeartRate,
      averageSpeedMps,
      maxSpeedMps,
      summaryPolyline: null,
      source: 'csv',
      ...(dataWarningReason ? { dataWarningReason } : {}),
    });
  }

  return {
    runs: mergeAndDeduplicateRuns([], runs),
    skippedNonRuns,
    totalRowsProcessed: lines.length - 1,
    errors: [],
  };
}

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Parses a single GPX XML string without DOMParser so it works identically in browser & Node tests.
 */
export function parseGpxContent(
  gpxXml: string,
  fileName = 'route.gpx'
): { run: RunActivity | null; error?: string } {
  const nameMatch = gpxXml.match(/<trk>[\s\S]*?<name>([\s\S]*?)<\/name>/i) ||
    gpxXml.match(/<name>([\s\S]*?)<\/name>/i);
  const typeMatch = gpxXml.match(/<type>([\s\S]*?)<\/type>/i);

  const trackName = nameMatch
    ? nameMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()
    : fileName.replace(/\.gpx$/i, '');

  let runType: RunActivityType = 'Run';
  if (typeMatch) {
    const normalized = normalizeRunType(typeMatch[1]);
    if (!normalized) {
      return {
        run: null,
        error: `Aktivitas "${trackName}" bertipe non-lari (${typeMatch[1].trim()}) dilewati.`,
      };
    }
    runType = normalized;
  }

  const trkptRegex = /<trkpt\s+([^>]*?)>([\s\S]*?)<\/trkpt>/gi;
  const points: Array<{
    lat: number;
    lng: number;
    ele: number | null;
    timeMs: number | null;
    hr: number | null;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = trkptRegex.exec(gpxXml)) !== null) {
    const attrs = match[1];
    const body = match[2];

    const latMatch = attrs.match(/lat=["']([^"']+)["']/i);
    const lonMatch = attrs.match(/lon=["']([^"']+)["']/i);
    if (!latMatch || !lonMatch) continue;

    const lat = Number(latMatch[1]);
    const lng = Number(lonMatch[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const eleMatch = body.match(/<ele>([^<]+)<\/ele>/i);
    const timeMatch = body.match(/<time>([^<]+)<\/time>/i);
    const hrMatch = body.match(/<(?:gpxtpx:)?hr>([^<]+)<\/(?:gpxtpx:)?hr>/i);

    const ele = eleMatch ? Number(eleMatch[1]) : null;
    const timeMs = timeMatch ? Date.parse(timeMatch[1].trim()) : null;
    const hr = hrMatch ? Number(hrMatch[1]) : null;

    points.push({
      lat,
      lng,
      ele: ele !== null && Number.isFinite(ele) ? ele : null,
      timeMs: timeMs !== null && Number.isFinite(timeMs) ? timeMs : null,
      hr: hr !== null && Number.isFinite(hr) ? hr : null,
    });
  }

  if (points.length < 2) {
    return {
      run: null,
      error: `File "${fileName}" tidak memiliki cukup trackpoint GPS (<trkpt>).`,
    };
  }

  let totalDistance = 0;
  let elevationGain = 0;
  let movingTimeSeconds = 0;
  let maxSpeedMps = 0;
  let hrSum = 0;
  let hrCount = 0;

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    if (curr.hr && curr.hr > 30) {
      hrSum += curr.hr;
      hrCount++;
    }
    if (i === 0) continue;
    const prev = points[i - 1];
    const segDist = haversineMeters(prev.lat, prev.lng, curr.lat, curr.lng);
    totalDistance += segDist;

    if (prev.ele !== null && curr.ele !== null && curr.ele > prev.ele) {
      const diff = curr.ele - prev.ele;
      if (diff >= 0.5 && diff < 50) {
        elevationGain += diff;
      }
    }

    if (prev.timeMs !== null && curr.timeMs !== null && curr.timeMs > prev.timeMs) {
      const dt = (curr.timeMs - prev.timeMs) / 1000;
      if (dt > 0 && dt < 300) {
        const segSpeed = segDist / dt;
        // Count as moving if speed > 0.4 m/s
        if (segSpeed > 0.4) {
          movingTimeSeconds += dt;
        }
        if (segSpeed > maxSpeedMps && segSpeed < 12) {
          maxSpeedMps = segSpeed;
        }
      }
    }
  }

  const firstTime = points.find((p) => p.timeMs !== null)?.timeMs ?? Date.now();
  const lastTime =
    [...points].reverse().find((p) => p.timeMs !== null)?.timeMs ?? firstTime;
  const elapsedTimeSeconds = Math.max(
    1,
    Math.round((lastTime - firstTime) / 1000) || Math.round(totalDistance / 2.8)
  );
  if (movingTimeSeconds <= 0) {
    movingTimeSeconds = elapsedTimeSeconds;
  }
  movingTimeSeconds = Math.round(movingTimeSeconds);

  const averageSpeedMps = totalDistance / Math.max(1, movingTimeSeconds);
  if (maxSpeedMps <= 0) maxSpeedMps = averageSpeedMps * 1.15;

  // Downsample points for compact polyline if very dense (> 120 points)
  const step = Math.max(1, Math.floor(points.length / 100));
  const sampledPoints = points.filter((_, idx) => idx % step === 0 || idx === points.length - 1);
  const summaryPolyline = encodePolyline(
    sampledPoints.map((p) => ({ lat: p.lat, lng: p.lng }))
  );

  const startIso = new Date(firstTime).toISOString();
  const id = `gpx-${fileName.replace(/[^a-zA-Z0-9]/g, '')}-${Math.round(firstTime / 1000)}`;

  return {
    run: {
      id,
      name: trackName,
      type: runType,
      startDate: startIso,
      distanceMeters: Math.round(totalDistance),
      movingTimeSeconds,
      elapsedTimeSeconds: Math.max(movingTimeSeconds, elapsedTimeSeconds),
      elevationGainMeters: Math.round(elevationGain),
      averageHeartRate: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
      averageSpeedMps,
      maxSpeedMps,
      summaryPolyline,
      source: 'gpx',
    },
  };
}

export function parseGpxFiles(
  files: Array<{ name: string; content: string }>
): ParseImportResult {
  const runs: RunActivity[] = [];
  const errors: string[] = [];
  let skippedNonRuns = 0;

  for (const file of files) {
    const res = parseGpxContent(file.content, file.name);
    if (res.run) {
      runs.push(res.run);
    } else if (res.error) {
      if (res.error.includes('non-lari')) {
        skippedNonRuns++;
      } else {
        errors.push(res.error);
      }
    }
  }

  return {
    runs: mergeAndDeduplicateRuns([], runs),
    skippedNonRuns,
    totalRowsProcessed: files.length,
    errors,
  };
}

export function assessRunDataQuality(run: RunActivity): RunDataQuality {
  const distanceKm = run.distanceMeters / 1000;
  const computedPaceSecPerKm =
    distanceKm > 0 && run.movingTimeSeconds > 0
      ? Math.round(run.movingTimeSeconds / distanceKm)
      : 0;
  const reportedPaceSecPerKm =
    run.averageSpeedMps > 0.2 ? Math.round(1000 / run.averageSpeedMps) : null;

  const effectivePace = computedPaceSecPerKm || reportedPaceSecPerKm || 0;
  if (effectivePace > 0 && effectivePace < 140) {
    return {
      hasAnomaly: true,
      reason: 'implausible_fast',
      computedPaceSecPerKm: effectivePace,
      reportedPaceSecPerKm,
    };
  }
  if (effectivePace > 1800) {
    return {
      hasAnomaly: true,
      reason: 'implausible_slow',
      computedPaceSecPerKm: effectivePace,
      reportedPaceSecPerKm,
    };
  }
  if (
    computedPaceSecPerKm > 0 &&
    reportedPaceSecPerKm !== null &&
    Math.abs(reportedPaceSecPerKm - computedPaceSecPerKm) / computedPaceSecPerKm > 0.25
  ) {
    return {
      hasAnomaly: true,
      reason: 'speed_distance_mismatch',
      computedPaceSecPerKm,
      reportedPaceSecPerKm,
    };
  }
  if (run.dataWarningReason) {
    return {
      hasAnomaly: true,
      reason: run.dataWarningReason,
      computedPaceSecPerKm: effectivePace,
      reportedPaceSecPerKm,
    };
  }
  return {
    hasAnomaly: false,
    reason: null,
    computedPaceSecPerKm: effectivePace,
    reportedPaceSecPerKm,
  };
}

export function mergeAndDeduplicateRuns(
  existing: RunActivity[],
  incoming: RunActivity[]
): RunActivity[] {
  const byId = new Map<string, RunActivity>();
  const fingerprintToId = new Map<string, string>();

  const upsert = (run: RunActivity) => {
    const t = new Date(run.startDate).getTime();
    const minuteBucket = Number.isFinite(t) ? Math.round(t / 60000) : 0;
    const distBucket = Math.round(run.distanceMeters / 25);
    const fingerprint = `${minuteBucket}:${distBucket}`;

    const matchedId = byId.has(run.id) ? run.id : fingerprintToId.get(fingerprint);
    if (matchedId && matchedId !== run.id) {
      const prev = byId.get(matchedId);
      if (prev) {
        byId.delete(matchedId);
        byId.set(run.id, {
          ...prev,
          ...run,
          summaryPolyline: run.summaryPolyline ?? prev.summaryPolyline,
          averageHeartRate: run.averageHeartRate ?? prev.averageHeartRate,
        });
      } else {
        byId.set(run.id, run);
      }
    } else {
      byId.set(run.id, run);
    }
    fingerprintToId.set(fingerprint, run.id);
  };

  for (const run of existing) {
    upsert(run);
  }
  for (const run of incoming) {
    upsert(run);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
}
