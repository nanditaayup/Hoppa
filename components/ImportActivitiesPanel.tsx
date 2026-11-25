'use client';

import React, { useRef, useState } from 'react';
import {
  FileSpreadsheet,
  Link2,
  Play,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { parseGpxFiles, parseStravaCsv } from '@/lib/strava/import-parser';
import { AppLanguage, RunActivity } from '@/lib/strava/types';
import { UI_COPY } from '@/lib/strava/i18n';

export type ImportSourceKind = 'both' | 'csv' | 'gpx';

interface ImportActivitiesPanelProps {
  runsCount: number;
  isOAuthConnected: boolean;
  lang: AppLanguage;
  onLoadSampleData: () => void;
  onImportRuns: (
    runs: RunActivity[],
    skippedNonRuns: number,
    sourceKind: ImportSourceKind,
    errors?: string[]
  ) => void;
  onOpenDisconnectModal: () => void;
  onSyncStravaOAuthRuns: (runs: RunActivity[]) => void;
}

type OAuthNoticeKey =
  | 'missing_creds'
  | 'popup_blocked'
  | 'canceled'
  | 'endpoint_error'
  | null;

export default function ImportActivitiesPanel({
  runsCount,
  isOAuthConnected,
  lang,
  onLoadSampleData,
  onImportRuns,
  onOpenDisconnectModal,
  onSyncStravaOAuthRuns,
}: ImportActivitiesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [oauthNoticeKey, setOauthNoticeKey] = useState<OAuthNoticeKey>(null);
  const [customOAuthMessage, setCustomOAuthMessage] = useState<string | null>(
    null
  );
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
  const [showExportGuide, setShowExportGuide] = useState(false);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showAdvancedOAuth, setShowAdvancedOAuth] = useState(isOAuthConnected);

  const t = UI_COPY[lang].strava;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const csvFiles: File[] = [];
    const gpxFiles: Array<{ name: string; content: string }> = [];

    for (const file of Array.from(files)) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.csv')) {
        csvFiles.push(file);
      } else if (lower.endsWith('.gpx')) {
        const content = await file.text();
        gpxFiles.push({ name: file.name, content });
      }
    }

    let combinedRuns: RunActivity[] = [];
    let totalSkipped = 0;
    const allErrors: string[] = [];

    for (const csvFile of csvFiles) {
      const content = await csvFile.text();
      const parsed = parseStravaCsv(content);
      combinedRuns = [...combinedRuns, ...parsed.runs];
      totalSkipped += parsed.skippedNonRuns;
      allErrors.push(...parsed.errors);
    }

    if (gpxFiles.length > 0) {
      const parsedGpx = parseGpxFiles(gpxFiles);
      combinedRuns = [...combinedRuns, ...parsedGpx.runs];
      totalSkipped += parsedGpx.skippedNonRuns;
      allErrors.push(...parsedGpx.errors);
    }

    const sourceKind: ImportSourceKind =
      csvFiles.length > 0 && gpxFiles.length > 0
        ? 'both'
        : csvFiles.length > 0
          ? 'csv'
          : 'gpx';

    onImportRuns(combinedRuns, totalSkipped, sourceKind, allErrors);
    e.target.value = '';
  };

  const handleConnectStrava = async () => {
    setIsConnectingOAuth(true);
    setOauthNoticeKey(null);
    setCustomOAuthMessage(null);

    try {
      const res = await fetch('/api/strava/auth/url');
      const data = await res.json();

      if (!data.configured) {
        if (data.message && lang === 'id') {
          setCustomOAuthMessage(data.message);
        }
        setOauthNoticeKey('missing_creds');
        setIsConnectingOAuth(false);
        return;
      }

      const popup = window.open(
        data.url,
        'strava_oauth_popup',
        'width=600,height=720'
      );

      if (!popup) {
        setOauthNoticeKey('popup_blocked');
        setIsConnectingOAuth(false);
        return;
      }

      const handleMessage = async (event: MessageEvent) => {
        if (
          !event.origin.endsWith('.run.app') &&
          !event.origin.includes('localhost')
        ) {
          return;
        }
        if (event.data?.type === 'STRAVA_OAUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          const actRes = await fetch('/api/strava/activities');
          const actData = await actRes.json();
          if (actData.connected && Array.isArray(actData.runs)) {
            onSyncStravaOAuthRuns(actData.runs);
          }
          setIsConnectingOAuth(false);
        } else if (event.data?.type === 'STRAVA_OAUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          setOauthNoticeKey('canceled');
          setIsConnectingOAuth(false);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch {
      setOauthNoticeKey('endpoint_error');
      setIsConnectingOAuth(false);
    }
  };

  const resolvedOAuthNotice =
    oauthNoticeKey === 'missing_creds'
      ? customOAuthMessage ?? t.oauthMissingCreds
      : oauthNoticeKey === 'popup_blocked'
        ? t.oauthPopupBlocked
        : oauthNoticeKey === 'canceled'
          ? t.oauthCanceled
          : oauthNoticeKey === 'endpoint_error'
            ? t.oauthEndpointError
            : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.importSourceHeading}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.importSourceDescBeforeCsv}{' '}
            <span className="font-mono text-xs">activities.csv</span>{' '}
            {t.importSourceDescMiddle}{' '}
            <span className="font-mono text-xs">.gpx</span>{' '}
            {t.importSourceDescAfterGpx}
          </p>
          <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
            {t.offlineFriendlyTip}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.gpx"
            multiple
            onChange={handleFileChange}
            className="hidden"
            aria-label={t.fileInputAria}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
            {t.importBtn}
          </button>

          <button
            type="button"
            onClick={onLoadSampleData}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-sm font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            {t.loadSampleBtn}
          </button>

          {runsCount > 0 && (
            <button
              type="button"
              onClick={onOpenDisconnectModal}
              aria-label={t.clearDataAria}
              className="min-h-[44px] px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              {t.clearDataBtn}
            </button>
          )}
        </div>
      </div>

      {/* Friendly Collapsible Guide & Optional Strava API Link */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <button
            type="button"
            onClick={() => setShowExportGuide((v) => !v)}
            aria-expanded={showExportGuide}
            className="inline-flex items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t.howToExportToggle}</span>
            {showExportGuide ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowProvenance((v) => !v)}
            aria-expanded={showProvenance}
            data-testid="toggle-strava-provenance"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:underline"
          >
            <Info className="w-3.5 h-3.5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden="true" />
            <span>{t.provenanceToggle}</span>
            {showProvenance ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowAdvancedOAuth((v) => !v)}
            aria-expanded={showAdvancedOAuth}
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
          >
            <Link2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t.advancedOAuthToggle}</span>
          </button>
        </div>

        {showExportGuide && (
          <ol className="rounded-xl bg-[#F7F9FA] dark:bg-slate-800/70 px-4 py-3 text-xs text-slate-700 dark:text-slate-200 space-y-1.5 list-decimal list-inside">
            {t.howToExportSteps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        )}

        {showProvenance && (
          <div
            data-testid="strava-provenance-panel"
            className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 px-4 py-3.5 space-y-2.5 text-xs"
          >
            {t.provenanceItems.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {item.title}
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {showAdvancedOAuth && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleConnectStrava}
              disabled={isConnectingOAuth}
              className="min-h-[40px] px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors disabled:opacity-60"
            >
              <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
              {isOAuthConnected
                ? t.resyncStravaBtn
                : isConnectingOAuth
                  ? t.connectingStravaBtn
                  : t.oauthBtn}
            </button>
          </div>
        )}
      </div>

      {resolvedOAuthNotice && (
        <div
          role="status"
          className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/70 px-4 py-3 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5"
        >
          <Info
            className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>{resolvedOAuthNotice}</span>
        </div>
      )}
    </div>
  );
}
