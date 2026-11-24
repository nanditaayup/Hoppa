'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(display-mode: standalone)');
  mql.addEventListener('change', callback);
  window.addEventListener('appinstalled', callback);
  return () => {
    mql.removeEventListener('change', callback);
    window.removeEventListener('appinstalled', callback);
  };
}

function readIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function readIsIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function noopSubscribe() {
  return () => {};
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installedViaEvent, setInstalledViaEvent] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    readIsStandalone,
    () => false
  );

  const isIos = useSyncExternalStore(noopSubscribe, readIsIos, () => false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalledViaEvent(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const isInstalled = isStandalone || installedViaEvent;

  const triggerNativeInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setInstalledViaEvent(true);
    }
    return outcome;
  };

  return {
    isInstalled,
    isIos,
    canPromptNative: Boolean(deferredPrompt) && !isInstalled,
    triggerNativeInstall,
  };
}

function subscribeOnlineStatus(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function readOnlineStatus(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribeOnlineStatus, readOnlineStatus, () => true);
}
