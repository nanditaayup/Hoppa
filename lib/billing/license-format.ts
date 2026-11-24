import { AccessPlanType } from '@/lib/strava/types';

export const PENDING_LICENSE_KEY_SESSION_KEY = 'pacecraft_pending_license_key';

export function normalizeAccessCode(raw: string): string {
  return (raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function isValidAccessCodeFormat(code: string): boolean {
  const normalized = normalizeAccessCode(code);
  return /^[A-Z0-9][A-Z0-9_-]{7,63}$/.test(normalized);
}

export function inferPlanTypeFromAccessCode(code: string): AccessPlanType {
  const normalized = normalizeAccessCode(code);
  if (normalized.startsWith('PACE-PRO-') || normalized.startsWith('PRO-')) {
    return 'pro';
  }
  return 'lifetime';
}
