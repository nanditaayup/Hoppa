'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { LANGUAGE_STORAGE_KEY } from '@/lib/strava/config';
import { AppLanguage } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { useAppTheme } from '@/lib/strava/theme';
import FirebaseErrorBoundary from './FirebaseErrorBoundary';
import { AuthProvider, useAuth } from './AuthProvider';
import LoginGateScreen from './LoginGateScreen';
import PaceCraftApp from './PaceCraftApp';

const PRE_AUTH_LANG_EVENT = 'pacecraft-preauth-lang-change';

function subscribePreAuthLang(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(PRE_AUTH_LANG_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(PRE_AUTH_LANG_EVENT, callback);
  };
}

function readStoredPreAuthLang(): AppLanguage {
  if (typeof window === 'undefined') return 'id';
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!raw) return 'id';
    return JSON.parse(raw) === 'en' ? 'en' : 'id';
  } catch {
    return 'id';
  }
}

function AuthGateRouter() {
  useAppTheme();
  const {
    user,
    authReady,
    authBusy,
    authErrorCode,
    signInWithGoogle,
    signOutAccount,
    finalizeAccountDeletion,
  } = useAuth();

  const preAuthLang = useSyncExternalStore<AppLanguage>(
    subscribePreAuthLang,
    readStoredPreAuthLang,
    () => 'id'
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = preAuthLang;
    }
  }, [preAuthLang]);

  const handleChangePreAuthLang = (nextLang: AppLanguage) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          LANGUAGE_STORAGE_KEY,
          JSON.stringify(nextLang)
        );
        window.dispatchEvent(new Event(PRE_AUTH_LANG_EVENT));
      } catch {
        // Ignore storage error
      }
    }
  };

  if (!authReady) {
    const t = UI_COPY[preAuthLang];
    return (
      <div
        data-testid="auth-loading-skeleton"
        className="min-h-screen bg-[#F7F9FA] dark:bg-slate-950 flex items-center justify-center p-6"
      >
        <div className="max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <div className="h-6 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto animate-pulse" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.auth.loadingText}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginGateScreen
        lang={preAuthLang}
        authBusy={authBusy}
        authErrorCode={authErrorCode}
        onChangeLang={handleChangePreAuthLang}
        onSignInGoogle={() => void signInWithGoogle()}
      />
    );
  }

  return (
    <PaceCraftApp
      key={user.uid}
      user={user}
      initialPreferredLang={preAuthLang}
      authBusy={authBusy}
      onSignOut={() => signOutAccount()}
      onFinalizeAccountDeletion={() => finalizeAccountDeletion()}
    />
  );
}

export default function PaceCraftAuthShell() {
  return (
    <FirebaseErrorBoundary>
      <AuthProvider>
        <AuthGateRouter />
      </AuthProvider>
    </FirebaseErrorBoundary>
  );
}
