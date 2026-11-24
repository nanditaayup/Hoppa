import { AppLanguage, DailySessionPlan, RaceDistanceKey } from './types';

function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

function escapeIcsText(raw: string): string {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/**
 * Given a Monday-indexed week and today's dateKey (YYYY-MM-DD) & dayIndex (0=Mon..6=Sun),
 * compute the calendar YYYY-MM-DD date for any session dayIndex within the current Monday..Sunday week.
 * If that day already passed earlier this week, shifts +7 days forward so every scheduled event
 * lands on the upcoming occurrence starting from todayDateKey.
 */
export function resolveUpcomingDateKeyForWeekday(
  todayDateKey: string,
  todayDayIndex: number,
  targetDayIndex: number
): string {
  const baseMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(todayDateKey);
  const baseDate = baseMatch
    ? new Date(
        Date.UTC(
          Number(baseMatch[1]),
          Number(baseMatch[2]) - 1,
          Number(baseMatch[3])
        )
      )
    : new Date();

  let offsetDays = targetDayIndex - todayDayIndex;
  if (offsetDays < 0) {
    offsetDays += 7;
  }

  const targetDate = new Date(baseDate.getTime() + offsetDays * 86_400_000);
  const y = targetDate.getUTCFullYear();
  const m = pad2(targetDate.getUTCMonth() + 1);
  const d = pad2(targetDate.getUTCDate());
  return `${y}-${m}-${d}`;
}

function toIcsCompactDate(dateKey: string): string {
  return dateKey.replace(/-/g, '');
}

export function buildWeeklyScheduleIcs(params: {
  weeklySchedule: DailySessionPlan[];
  todayDateKey: string;
  todayDayIndex: number;
  targetRace: RaceDistanceKey;
  raceEventLabel: string;
  lang: AppLanguage;
}): string {
  const {
    weeklySchedule,
    todayDateKey,
    todayDayIndex,
    targetRace,
    raceEventLabel,
    lang,
  } = params;

  const now = new Date();
  const dtStamp = `${now.getUTCFullYear()}${pad2(now.getUTCMonth() + 1)}${pad2(now.getUTCDate())}T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}${pad2(now.getUTCSeconds())}Z`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PaceCraft//Running Training Schedule//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(`PaceCraft ${targetRace}`)}`,
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  const activeSessions = weeklySchedule.filter((s) => s.zone !== 'rest');

  for (const session of activeSessions) {
    const dateKey = resolveUpcomingDateKeyForWeekday(
      todayDateKey,
      todayDayIndex,
      session.dayIndex
    );
    const compactDate = toIcsCompactDate(dateKey);

    // Default morning running slot: 06:00 - 07:00 WIB (23:00 prev UTC - 00:00 UTC)
    // Using floating local date-time (compatible with Google & Apple Calendar)
    const dtStart = `${compactDate}T060000`;
    const dtEnd = `${compactDate}T070000`;
    const uid = `pacecraft-${targetRace.toLowerCase()}-${compactDate}-d${session.dayIndex}@pacecraft.app`;

    const summary =
      lang === 'en'
        ? `[PaceCraft ${targetRace}] ${session.title} (${session.targetDistanceKm.toFixed(1)} km)`
        : `[PaceCraft ${targetRace}] ${session.title} (${session.targetDistanceKm.toFixed(1).replace('.', ',')} km)`;

    const descParts = [
      lang === 'en'
        ? `Target Event: ${raceEventLabel}`
        : `Target Lomba: ${raceEventLabel}`,
      lang === 'en'
        ? `Target Distance: ${session.targetDistanceKm.toFixed(1)} km`
        : `Target Jarak: ${session.targetDistanceKm.toFixed(1).replace('.', ',')} km`,
      lang === 'en'
        ? `Pace Range: ${session.paceRange}`
        : `Zona Pace: ${session.paceRange}`,
      session.guidance,
    ];

    if (session.strengthSession) {
      descParts.push(
        lang === 'en'
          ? `Strength Training (${session.strengthSession.durationMin} min): ${session.strengthSession.title} - ${session.strengthSession.exercises}`
          : `Latihan Kekuatan (${session.strengthSession.durationMin} mnt): ${session.strengthSession.title} - ${session.strengthSession.exercises}`
      );
    }

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(descParts.join('\n'))}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(summary)}`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
