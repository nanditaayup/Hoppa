'use client';

import { FirebaseApp } from 'firebase/app';
import {
  AppCheck,
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import {
  AppCheckProviderKind,
  AppCheckSiteKeySource,
  AppCheckStatus,
  buildAppCheckConfigSummary,
  shouldEnableAppCheckDebugToken,
} from './app-check-config';

export interface AppCheckClientState {
  status: AppCheckStatus;
  siteKeyConfigured: boolean;
  siteKeySource: AppCheckSiteKeySource;
  providerKind: AppCheckProviderKind;
  debugModeEnabled: boolean;
  appCheck: AppCheck | null;
}

export interface InitFirebaseAppCheckOptions {
  envSiteKey?: string | null;
  configSiteKey?: string | null;
  providerEnv?: string | null;
  debugFlag?: string | null;
}

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

let cachedState: AppCheckClientState | null = null;

export function initFirebaseAppCheck(
  app: FirebaseApp,
  options: InitFirebaseAppCheckOptions = {}
): AppCheckClientState {
  const summary = buildAppCheckConfigSummary(
    options.envSiteKey,
    options.configSiteKey,
    options.providerEnv
  );

  if (typeof window === 'undefined') {
    return {
      status: 'unsupported',
      siteKeyConfigured: summary.siteKeyConfigured,
      siteKeySource: summary.siteKeySource,
      providerKind: summary.providerKind,
      debugModeEnabled: false,
      appCheck: null,
    };
  }

  if (cachedState) {
    return cachedState;
  }

  if (!summary.siteKey) {
    cachedState = {
      status: 'unconfigured',
      siteKeyConfigured: false,
      siteKeySource: 'none',
      providerKind: summary.providerKind,
      debugModeEnabled: false,
      appCheck: null,
    };
    return cachedState;
  }

  const debugModeEnabled = shouldEnableAppCheckDebugToken(
    window.location.hostname,
    process.env.NODE_ENV,
    options.debugFlag
  );

  if (debugModeEnabled && typeof window.FIREBASE_APPCHECK_DEBUG_TOKEN === 'undefined') {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  try {
    const provider =
      summary.providerKind === 'enterprise'
        ? new ReCaptchaEnterpriseProvider(summary.siteKey)
        : new ReCaptchaV3Provider(summary.siteKey);

    const appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    cachedState = {
      status: 'active',
      siteKeyConfigured: true,
      siteKeySource: summary.siteKeySource,
      providerKind: summary.providerKind,
      debugModeEnabled,
      appCheck,
    };
  } catch (error) {
    console.warn('Firebase App Check initialization skipped:', error);
    cachedState = {
      status: 'error',
      siteKeyConfigured: true,
      siteKeySource: summary.siteKeySource,
      providerKind: summary.providerKind,
      debugModeEnabled,
      appCheck: null,
    };
  }

  return cachedState;
}

export function getAppCheckClientState(): AppCheckClientState | null {
  return cachedState;
}

export async function fetchAppCheckToken(
  forceRefresh = false
): Promise<string | null> {
  if (!cachedState?.appCheck) return null;
  try {
    const result = await getToken(cachedState.appCheck, forceRefresh);
    return result.token || null;
  } catch {
    return null;
  }
}
