import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessRunDataQuality,
  mergeAndDeduplicateRuns,
  normalizeRunType,
  parseGpxFiles,
  parseStravaCsv,
} from './import-parser';
import { computePaceSecPerKm, decodePolyline, formatDistanceKm, formatDuration, formatPace } from './transform';

test('AC-02: parseStravaCsv keeps Run, TrailRun, VirtualRun and skips Ride/Swim', () => {
  const csv = [
    'Activity ID,Activity Name,Activity Type,Activity Date,Moving Time,Distance,Average Heart Rate,Average Speed',
    '101,Pagi Senayan,Run,2026-11-16T06:00:00Z,2430,8100,152,3.3333',
    '102,Gowes Santai,Ride,2026-11-15T06:00:00Z,3600,25000,135,6.94',
    '103,Trail Sentul,Trail Run,2026-11-14T06:00:00Z,4200,10000,158,2.38',
    '104,Renang Pagi,Swim,2026-11-13T07:00:00Z,1800,1500,130,0.83',
    '105,Treadmill 5K,VirtualRun,2026-11-12T18:00:00Z,1920,5000,140,2.604',
  ].join('\n');

  const res = parseStravaCsv(csv);
  assert.equal(res.runs.length, 3);
  assert.equal(res.skippedNonRuns, 2);
  assert.equal(res.runs[0].id, '101');
  assert.equal(res.runs[1].type, 'TrailRun');
  assert.equal(res.runs[2].type, 'VirtualRun');

  // Verify AC-03 formatting on row 101
  const run101 = res.runs[0];
  assert.equal(formatDistanceKm(run101.distanceMeters), '8,10 km');
  assert.equal(formatDuration(run101.movingTimeSeconds), '40:30');
  assert.equal(
    formatPace(
      computePaceSecPerKm(
        run101.distanceMeters,
        run101.movingTimeSeconds,
        run101.averageSpeedMps
      )
    ),
    '05:00/km'
  );
  // Verify 2.604 m/s on VirtualRun 5K stays ~06:24/km rather than being parsed as 2604 m/s
  const run105 = res.runs[2];
  assert.ok(run105.averageSpeedMps > 2.5 && run105.averageSpeedMps < 2.7);
  assert.equal(
    formatPace(
      computePaceSecPerKm(
        run105.distanceMeters,
        run105.movingTimeSeconds,
        run105.averageSpeedMps
      )
    ),
    '06:24/km'
  );
});

test('parseStravaCsv supports Indonesian comma decimals and km distance headers', () => {
  const csv = [
    'Activity ID;Activity Name;Activity Type;Activity Date;Moving Time;Distance (km)',
    '201;Lari Sore;Run;2026-11-10T17:00:00Z;30:00;"5,50"',
  ].join('\n');

  const res = parseStravaCsv(csv);
  assert.equal(res.runs.length, 1);
  assert.equal(res.runs[0].distanceMeters, 5500);
  assert.equal(res.runs[0].movingTimeSeconds, 1800);
});

test('REGRESSION: MAF Training day 6 (5.03 km in 45:44) never outputs 00:33/km even with 3-decimal m/s or corrupted speed', () => {
  const csvValidSpeed = [
    'Activity Name,Activity Type,Activity Date,Moving Time,Distance,Average Heart Rate,Average Speed',
    'MAF Training day 6,Run,2026-11-20T06:00:00Z,45:44,5.03,142,1.833',
  ].join('\n');

  const cleanRes = parseStravaCsv(csvValidSpeed);
  assert.equal(cleanRes.runs.length, 1);
  const cleanRun = cleanRes.runs[0];
  assert.equal(cleanRun.distanceMeters, 5030);
  assert.equal(cleanRun.movingTimeSeconds, 2744);
  const cleanPace = computePaceSecPerKm(
    cleanRun.distanceMeters,
    cleanRun.movingTimeSeconds,
    cleanRun.averageSpeedMps
  );
  assert.equal(formatPace(cleanPace), '09:06/km');
  assert.equal(assessRunDataQuality(cleanRun).hasAnomaly, false);

  // Corrupted average speed column (e.g. 30.3 m/s -> 00:33/km if trusted blindly)
  const csvCorruptedSpeed = [
    'Activity Name,Activity Type,Activity Date,Moving Time,Distance,Average Heart Rate,Average Speed',
    'MAF Training day 6,Run,2026-11-20T06:00:00Z,45:44,5.03,142,30.3',
  ].join('\n');

  const fixedRes = parseStravaCsv(csvCorruptedSpeed);
  assert.equal(fixedRes.runs.length, 1);
  const fixedRun = fixedRes.runs[0];
  const fixedPace = computePaceSecPerKm(
    fixedRun.distanceMeters,
    fixedRun.movingTimeSeconds,
    fixedRun.averageSpeedMps
  );
  assert.equal(formatPace(fixedPace), '09:06/km');
  assert.equal(assessRunDataQuality(fixedRun).hasAnomaly, true);
  assert.equal(assessRunDataQuality(fixedRun).reason, 'speed_distance_mismatch');
});

test('AC-04: parseGpxFiles parses GPS trackpoints into RunActivity with encoded polyline', () => {
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="StravaGPX">
  <trk>
    <name>Lari Pagi GBK</name>
    <type>running</type>
    <trkseg>
      <trkpt lat="-6.2185" lon="106.8025"><ele>12</ele><time>2026-11-17T06:00:00Z</time></trkpt>
      <trkpt lat="-6.2140" lon="106.8025"><ele>15</ele><time>2026-11-17T06:02:30Z</time></trkpt>
      <trkpt lat="-6.2140" lon="106.8070"><ele>14</ele><time>2026-11-17T06:05:00Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`;

  const result = parseGpxFiles([{ name: 'gbk.gpx', content: gpx }]);
  assert.equal(result.runs.length, 1);
  const run = result.runs[0];
  assert.equal(run.name, 'Lari Pagi GBK');
  assert.ok(run.distanceMeters > 900);
  assert.equal(run.movingTimeSeconds, 300);
  assert.equal(run.elevationGainMeters, 3);
  assert.ok(run.summaryPolyline);
  const decoded = decodePolyline(run.summaryPolyline);
  assert.equal(decoded.length, 3);
});

test('normalizeRunType handles variants cleanly', () => {
  assert.equal(normalizeRunType('Run'), 'Run');
  assert.equal(normalizeRunType('Trail Run'), 'TrailRun');
  assert.equal(normalizeRunType('VirtualRun'), 'VirtualRun');
  assert.equal(normalizeRunType('Ride'), null);
  assert.equal(normalizeRunType('Walk'), null);
});

test('mergeAndDeduplicateRuns deduplicates by id and sorts newest first', () => {
  const res = mergeAndDeduplicateRuns(
    [
      {
        id: '1',
        name: 'Old Name',
        type: 'Run',
        startDate: '2026-11-10T06:00:00Z',
        distanceMeters: 5000,
        movingTimeSeconds: 1800,
        elapsedTimeSeconds: 1800,
        elevationGainMeters: 10,
        averageHeartRate: null,
        averageSpeedMps: 2.77,
        maxSpeedMps: 3.1,
        summaryPolyline: null,
        source: 'csv',
      },
    ],
    [
      {
        id: '1',
        name: 'Updated Name',
        type: 'Run',
        startDate: '2026-11-10T06:00:00Z',
        distanceMeters: 5000,
        movingTimeSeconds: 1800,
        elapsedTimeSeconds: 1800,
        elevationGainMeters: 10,
        averageHeartRate: 145,
        averageSpeedMps: 2.77,
        maxSpeedMps: 3.1,
        summaryPolyline: null,
        source: 'gpx',
      },
      {
        id: '2',
        name: 'Newer Run',
        type: 'Run',
        startDate: '2026-11-15T06:00:00Z',
        distanceMeters: 8000,
        movingTimeSeconds: 2700,
        elapsedTimeSeconds: 2750,
        elevationGainMeters: 25,
        averageHeartRate: 155,
        averageSpeedMps: 2.96,
        maxSpeedMps: 3.5,
        summaryPolyline: null,
        source: 'gpx',
      },
    ]
  );

  assert.equal(res.length, 2);
  assert.equal(res[0].id, '2');
  assert.equal(res[1].name, 'Updated Name');
});
