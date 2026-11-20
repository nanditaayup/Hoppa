'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface FirebaseErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class FirebaseErrorBoundary extends React.Component<
  { children: React.ReactNode },
  FirebaseErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): FirebaseErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Terjadi kendala sinkronisasi akun.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('PaceCraft ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      let friendlyHint =
        'Terjadi kendala saat menyinkronkan data akun Anda. Silakan muat ulang halaman.';
      if (this.state.message.includes('Quota exceeded')) {
        friendlyHint =
          'Kuota harian Firestore sedang penuh dan akan pulih otomatis pada hari berikutnya.';
      } else if (
        this.state.message.includes('Missing or insufficient permissions')
      ) {
        friendlyHint =
          'Sesi autentikasi Anda perlu dimuat ulang agar izin akses akun tetap sinkron.';
      }

      return (
        <div className="min-h-screen bg-[#F7F9FA] dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Koneksi Akun Terganggu
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {friendlyHint}
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
