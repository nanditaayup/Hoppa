'use client';

import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { User } from 'firebase/auth';
import { LANGUAGE_STORAGE_KEY } from '@/lib/strava/config';
import { AccessGrantRecord, AppLanguage } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';
import { useAppTheme } from '@/lib/strava/theme';
import {
  OWNER_ADMIN_EMAIL,
  subscribeToAccessGrant,
} from '@/lib/firebase/firestore-sync';
import FirebaseErrorBoundary from './FirebaseErrorBoundary';
import { AuthProvider, useAuth } from './AuthProvider';
import LoginGateScreen from './LoginGateScreen';
import PaymentAccessGate from './PaymentAccessGate';
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

interface AuthenticatedWorkspaceGateProps {
  user: User;
  preAuthLang: AppLanguage;
  authBusy: boolean;
  onChangeLang: (lang: AppLanguage) => void;
  onSignOut: () => Promise<void>;
  onFinalizeAccountDeletion: () => Promise<void>;
}

function AuthenticatedWorkspaceGate({
  user,
  preAuthLang,
  authBusy,
  onChangeLang,
  onSignOut,
  onFinalizeAccountDeletion,
}: AuthenticatedWorkspaceGateProps) {
  const userEmail = user.email?.toLowerCase() ?? null;
  const isOwnerAdmin =
    user.emailVerified === true && userEmail === OWNER_ADMIN_EMAIL;

  const [accessGrant, setAccessGrant] = useState<AccessGrantRecord | null>(null);
  const [grantChecked, setGrantChecked] = useState(isOwnerAdmin);
  const [serverUnlocked, setServerUnlocked] = useState(isOwnerAdmin);
  const [serverStatusChecked, setServerStatusChecked] = useState(isOwnerAdmin);

  const checkServerEntitlement = useCallback(async () => {
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/access/status', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = (await res.json()) as {
          hasServerEntitlement?: boolean;
          isOwner?: boolean;
        };
        if (data.hasServerEntitlement || data.isOwner) {
          setServerUnlocked(true);
        }
      }
    } catch {
      // Fall back gracefully to Firestore accessGrant check
    } finally {
      setServerStatusChecked(true);
    }
  }, [user]);

  useEffect(() => {
    if (isOwnerAdmin) return;

    let active = true;
    const unsub = subscribeToAccessGrant(user.uid, (grant) => {
      if (!active) return;
      setAccessGrant(grant);
      setGrantChecked(true);
    });

    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/access/status', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (active && res.ok) {
          const data = (await res.json()) as {
            hasServerEntitlement?: boolean;
            isOwner?: boolean;
          };
          if (data.hasServerEntitlement || data.isOwner) {
            setServerUnlocked(true);
          }
        }
      } catch {
        // Fall back gracefully to Firestore accessGrant check
      } finally {
        if (active) setServerStatusChecked(true);
      }
    })();

    return () => {
      active = false;
      unsub();
    };
  }, [user, isOwnerAdmin]);

  const hasVerifiedAccess =
    isOwnerAdmin || accessGrant?.status === 'active' || serverUnlocked;

  if (!hasVerifiedAccess && (!grantChecked || !serverStatusChecked)) {
    const t = UI_COPY[preAuthLang];
    return (
      <div
        data-testid="access-checking-skeleton"
        className="min-h-screen bg-[#F7F9FA] dark:bg-slate-950 flex items-center justify-center p-6"
      >
        <div className="max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <div className="h-6 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto animate-pulse" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.accessGate.checkingText}
          </p>
        </div>
      </div>
    );
  }

  if (!hasVerifiedAccess) {
    return (
      <PaymentAccessGate
        user={user}
        lang={preAuthLang}
        authBusy={authBusy}
        accessGrant={accessGrant}
        onChangeLang={onChangeLang}
        onSignOut={onSignOut}
        onServerUnlocked={() => setServerUnlocked(true)}
        onRefreshStatus={checkServerEntitlement}
      />
    );
  }

  return (
    <PaceCraftApp
      user={user}
      initialPreferredLang={preAuthLang}
      authBusy={authBusy}
      isOwnerAdmin={isOwnerAdmin}
      onSignOut={onSignOut}
      onFinalizeAccountDeletion={onFinalizeAccountDeletion}
    />
  );
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
    <AuthenticatedWorkspaceGate
      key={user.uid}
      user={user}
      preAuthLang={preAuthLang}
      authBusy={authBusy}
      onChangeLang={handleChangePreAuthLang}
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
