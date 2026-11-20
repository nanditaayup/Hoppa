'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';

export type AuthErrorCode = 'popup_closed' | 'popup_blocked' | 'generic' | null;

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authErrorCode: AuthErrorCode;
  signInWithGoogle: () => Promise<void>;
  signOutAccount: () => Promise<void>;
  finalizeAccountDeletion: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function disconnectBrowserStravaCookie(): Promise<void> {
  try {
    await fetch('/api/strava/disconnect', { method: 'POST' });
  } catch {
    // Ignore network error during Strava session cleanup
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authErrorCode, setAuthErrorCode] = useState<AuthErrorCode>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthErrorCode(null);
    setAuthBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        setAuthErrorCode('popup_closed');
      } else if (code === 'auth/popup-blocked') {
        setAuthErrorCode('popup_blocked');
      } else {
        setAuthErrorCode('generic');
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const signOutAccount = async () => {
    setAuthErrorCode(null);
    setAuthBusy(true);
    try {
      await disconnectBrowserStravaCookie();
      await signOut(auth);
    } finally {
      setAuthBusy(false);
    }
  };

  const finalizeAccountDeletion = async () => {
    setAuthErrorCode(null);
    setAuthBusy(true);
    try {
      await disconnectBrowserStravaCookie();
      const current = auth.currentUser;
      if (!current) return;
      try {
        await deleteUser(current);
      } catch (err: unknown) {
        const code =
          typeof err === 'object' && err !== null && 'code' in err
            ? String((err as { code?: unknown }).code)
            : '';
        if (code === 'auth/requires-recent-login') {
          try {
            await reauthenticateWithPopup(current, googleProvider);
            await deleteUser(current);
          } catch {
            await signOut(auth);
          }
        } else {
          await signOut(auth);
        }
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const clearAuthError = () => setAuthErrorCode(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        authBusy,
        authErrorCode,
        signInWithGoogle,
        signOutAccount,
        finalizeAccountDeletion,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
