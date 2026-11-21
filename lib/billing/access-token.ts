import crypto from 'node:crypto';
import { OWNER_ADMIN_EMAIL } from '@/lib/firebase/firestore-sync';
import { AccessPlanType, AccessProvider } from '@/lib/strava/types';

export const ENTITLEMENT_COOKIE_NAME = 'pacecraft_entitlement';
const DEFAULT_ENTITLEMENT_TTL_SEC = 60 * 60 * 24 * 365; // 365 days

const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedEphemeralSecret: string | null = null;
let cachedFirebaseCerts: {
  certs: Record<string, string>;
  expiresAtMs: number;
} | null = null;

export interface EntitlementPayload {
  uid: string;
  planType: AccessPlanType;
  provider: AccessProvider;
  iat: number;
  exp: number;
}

export interface BuyerLicensePayload {
  type: 'pc_license';
  planType: AccessPlanType;
  codeId: string;
  iat: number;
  exp: number;
}

export interface VerifiedFirebaseCaller {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isOwner: boolean;
}

export function getServerSigningSecret(): string {
  const envSecret = process.env.ACCESS_SIGNING_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  if (!cachedEphemeralSecret) {
    cachedEphemeralSecret = crypto.randomBytes(32).toString('hex');
  }
  return cachedEphemeralSecret;
}

export function isOwnerEmail(
  email: string | null | undefined,
  emailVerified: boolean
): boolean {
  if (!emailVerified || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === OWNER_ADMIN_EMAIL;
}

function sha256Buffer(input: string): Buffer {
  return crypto.createHash('sha256').update(input, 'utf8').digest();
}

function signHmacBase64Url(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data, 'utf8')
    .digest('base64url');
}

function safeBase64UrlCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function signEntitlementToken(
  uid: string,
  planType: AccessPlanType,
  provider: AccessProvider,
  secret: string,
  nowSec = Math.floor(Date.now() / 1000),
  ttlSec = DEFAULT_ENTITLEMENT_TTL_SEC
): string {
  const payload: EntitlementPayload = {
    uid: uid.trim(),
    planType: planType === 'pro' ? 'pro' : 'lifetime',
    provider,
    iat: nowSec,
    exp: nowSec + ttlSec,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url'
  );
  const sig = signHmacBase64Url(encoded, secret);
  return `${encoded}.${sig}`;
}

export function verifyEntitlementToken(
  token: string | undefined | null,
  expectedUid: string,
  secret: string,
  nowSec = Math.floor(Date.now() / 1000)
): EntitlementPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expectedSig = signHmacBase64Url(encoded, secret);
  if (!safeBase64UrlCompare(sig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as Partial<EntitlementPayload>;
    if (
      !parsed ||
      typeof parsed.uid !== 'string' ||
      parsed.uid !== expectedUid.trim() ||
      typeof parsed.exp !== 'number' ||
      parsed.exp <= nowSec
    ) {
      return null;
    }
    return {
      uid: parsed.uid,
      planType: parsed.planType === 'pro' ? 'pro' : 'lifetime',
      provider: parsed.provider ?? 'license',
      iat: Number(parsed.iat ?? nowSec),
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export function signBuyerLicenseKey(
  planType: AccessPlanType,
  secret: string,
  nowSec = Math.floor(Date.now() / 1000),
  ttlSec = 60 * 60 * 24 * 90 // 90 days to redeem
): string {
  const payload: BuyerLicensePayload = {
    type: 'pc_license',
    planType: planType === 'pro' ? 'pro' : 'lifetime',
    codeId: crypto.randomBytes(4).toString('hex').toUpperCase(),
    iat: nowSec,
    exp: nowSec + ttlSec,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url'
  );
  const sig = signHmacBase64Url(`PC:${encoded}`, secret);
  return `PC-${encoded}.${sig}`;
}

export function verifyBuyerCodeOrLicense(
  rawCode: string,
  config: {
    signingSecret: string;
    singleCode?: string;
    multipleCodesCsv?: string;
  },
  nowSec = Math.floor(Date.now() / 1000)
): { valid: boolean; planType: AccessPlanType; provider: AccessProvider } {
  const trimmed = (rawCode || '').trim();
  if (!trimmed) {
    return { valid: false, planType: 'lifetime', provider: 'license' };
  }

  // 1. Check HMAC-signed buyer license key (PC-<payload>.<sig>)
  if (trimmed.startsWith('PC-')) {
    const body = trimmed.slice(3);
    const parts = body.split('.');
    if (parts.length === 2) {
      const [encoded, sig] = parts;
      if (encoded && sig) {
        const expectedSig = signHmacBase64Url(
          `PC:${encoded}`,
          config.signingSecret
        );
        if (safeBase64UrlCompare(sig, expectedSig)) {
          try {
            const parsed = JSON.parse(
              Buffer.from(encoded, 'base64url').toString('utf8')
            ) as Partial<BuyerLicensePayload>;
            if (
              parsed &&
              parsed.type === 'pc_license' &&
              typeof parsed.exp === 'number' &&
              parsed.exp > nowSec
            ) {
              return {
                valid: true,
                planType: parsed.planType === 'pro' ? 'pro' : 'lifetime',
                provider: 'license',
              };
            }
          } catch {
            // Invalid license JSON
          }
        }
      }
    }
  }

  // 2. Check configured shared buyer access code(s) via timingSafeEqual SHA-256
  const candidates: string[] = [];
  if (config.singleCode && config.singleCode.trim().length >= 4) {
    candidates.push(config.singleCode.trim());
  }
  if (config.multipleCodesCsv) {
    for (const part of config.multipleCodesCsv.split(',')) {
      const clean = part.trim();
      if (clean.length >= 4) candidates.push(clean);
    }
  }

  if (candidates.length > 0) {
    const incomingHash = sha256Buffer(trimmed);
    for (const candidate of candidates) {
      const candidateHash = sha256Buffer(candidate);
      if (crypto.timingSafeEqual(incomingHash, candidateHash)) {
        return { valid: true, planType: 'lifetime', provider: 'license' };
      }
    }
  }

  return { valid: false, planType: 'lifetime', provider: 'license' };
}

export function sanitizeExternalCheckoutUrl(
  rawUrl: string | undefined | null
): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchFirebasePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedFirebaseCerts && cachedFirebaseCerts.expiresAtMs > now) {
    return cachedFirebaseCerts.certs;
  }

  const res = await fetch(FIREBASE_CERTS_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Unable to fetch Firebase public certificates');
  }
  const certs = (await res.json()) as Record<string, string>;
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSec = maxAgeMatch ? Math.min(3600, Number(maxAgeMatch[1])) : 300;

  cachedFirebaseCerts = {
    certs,
    expiresAtMs: now + Math.max(60, maxAgeSec) * 1000,
  };
  return certs;
}

export async function verifyFirebaseIdToken(
  authHeader: string | null,
  projectId: string
): Promise<VerifiedFirebaseCaller | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const segments = token.split('.');
  if (segments.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = segments;
  if (!headerB64 || !payloadB64 || !sigB64) return null;

  let header: { alg?: string; kid?: string };
  let claims: {
    aud?: string;
    iss?: string;
    sub?: string;
    user_id?: string;
    exp?: number;
    iat?: number;
    email?: string;
    email_verified?: boolean;
  };

  try {
    header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (header.alg !== 'RS256' || !header.kid) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  const uid = claims.sub || claims.user_id || '';
  if (
    !uid ||
    uid.length > 128 ||
    claims.aud !== projectId ||
    claims.iss !== expectedIssuer ||
    typeof claims.exp !== 'number' ||
    claims.exp <= nowSec ||
    typeof claims.iat !== 'number' ||
    claims.iat > nowSec + 300
  ) {
    return null;
  }

  try {
    const certs = await fetchFirebasePublicCerts();
    const pem = certs[header.kid];
    if (!pem) return null;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();
    const sigBuf = Buffer.from(sigB64, 'base64url');
    const isValid = verifier.verify(pem, sigBuf);
    if (!isValid) return null;

    const email = typeof claims.email === 'string' ? claims.email : null;
    const emailVerified = claims.email_verified === true;
    return {
      uid,
      email,
      emailVerified,
      isOwner: isOwnerEmail(email, emailVerified),
    };
  } catch {
    return null;
  }
}
