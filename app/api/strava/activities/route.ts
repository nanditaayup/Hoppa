import { NextRequest, NextResponse } from 'next/server';
import { normalizeRunType } from '@/lib/strava/import-parser';
import { RunActivity } from '@/lib/strava/types';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('pacecraft_strava_token')?.value;
  if (!token) {
    return NextResponse.json({ connected: false, runs: [] });
  }

  try {
    const stravaRes = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=50',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (!stravaRes.ok) {
      return NextResponse.json({ connected: false, runs: [] });
    }

    const rawList = (await stravaRes.json()) as Array<Record<string, unknown>>;
    const runs: RunActivity[] = [];

    for (const item of rawList) {
      const rawType = String(item.sport_type || item.type || '');
      const runType = normalizeRunType(rawType);
      if (!runType) continue;

      const mapObj = item.map as Record<string, unknown> | undefined;
      const hr =
        typeof item.average_heartrate === 'number'
          ? Math.round(item.average_heartrate)
          : null;

      runs.push({
        id: String(item.id),
        name: String(item.name || 'Aktivitas Lari Strava'),
        type: runType,
        startDate: String(item.start_date || new Date().toISOString()),
        distanceMeters: Math.round(Number(item.distance || 0)),
        movingTimeSeconds: Math.round(Number(item.moving_time || 0)),
        elapsedTimeSeconds: Math.round(Number(item.elapsed_time || 0)),
        elevationGainMeters: Math.round(Number(item.total_elevation_gain || 0)),
        averageHeartRate: hr,
        averageSpeedMps: Number(item.average_speed || 0),
        maxSpeedMps: Number(item.max_speed || 0),
        summaryPolyline:
          mapObj && typeof mapObj.summary_polyline === 'string'
            ? mapObj.summary_polyline
            : null,
        source: 'strava_oauth',
      });
    }

    return NextResponse.json({ connected: true, runs });
  } catch {
    return NextResponse.json({ connected: false, runs: [] });
  }
}
