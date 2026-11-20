export type AppCheckStatus = 'active' | 'unconfigured' | 'unsupported' | 'error';

export type AppCheckSiteKeySource = 'env' | 'firebase-config' | 'none';

export type AppCheckProviderKind = 'enterprise' | 'v3';

export interface AppCheckConfigSummary {
  siteKey: string | null;
  siteKeySource: AppCheckSiteKeySource;
  siteKeyConfigured: boolean;
  providerKind: AppCheckProviderKind;
}

const PLACEHOLDER_KEY_PATTERN = /^(MY_|YOUR_|PLACEHOLDER|REPLACE_)/i;

function normalizeCandidateKey(raw?: string | null): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/\s/.test(trimmed)) return null;
  if (PLACEHOLDER_KEY_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function resolveRecaptchaSiteKey(
  envKey?: string | null,
  configKey?: string | null
): string | null {
  const fromEnv = normalizeCandidateKey(envKey);
  if (fromEnv) return fromEnv;
  return normalizeCandidateKey(configKey);
}

export function resolveAppCheckProviderKind(
  envProvider?: string | null
): AppCheckProviderKind {
  if (typeof envProvider !== 'string') return 'v3';
  const normalized = envProvider.trim().toLowerCase();
  if (normalized === 'enterprise' || normalized === 'recaptcha_enterprise') {
    return 'enterprise';
  }
  return 'v3';
}

export function buildAppCheckConfigSummary(
  envKey?: string | null,
  configKey?: string | null,
  envProvider?: string | null
): AppCheckConfigSummary {
  const providerKind = resolveAppCheckProviderKind(envProvider);
  const fromEnv = normalizeCandidateKey(envKey);
  if (fromEnv) {
    return {
      siteKey: fromEnv,
      siteKeySource: 'env',
      siteKeyConfigured: true,
      providerKind,
    };
  }

  const fromConfig = normalizeCandidateKey(configKey);
  if (fromConfig) {
    return {
      siteKey: fromConfig,
      siteKeySource: 'firebase-config',
      siteKeyConfigured: true,
      providerKind,
    };
  }

  return {
    siteKey: null,
    siteKeySource: 'none',
    siteKeyConfigured: false,
    providerKind,
  };
}

export function shouldEnableAppCheckDebugToken(
  hostname: string,
  nodeEnv?: string,
  debugEnvFlag?: string | null
): boolean {
  if (debugEnvFlag !== 'true') {
    return false;
  }

  const normalizedHost = hostname.trim().toLowerCase();
  const isLocalhost =
    normalizedHost === 'localhost' ||
    normalizedHost === '127.0.0.1' ||
    normalizedHost === '[::1]';

  return nodeEnv !== 'production' && isLocalhost;
}
