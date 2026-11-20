import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PaceCraft — Perencana Menu Lari & Sinkronisasi Strava',
  description:
    'Kalkulator menu latihan lari ideal (5K, 10K, 21K, 42K) berbasis BMI, pelacakan progres harian, dan integrasi riwayat aktivitas Strava.',
  openGraph: {
    title: 'PaceCraft — Perencana Menu Lari & Sinkronisasi Strava',
    description:
      'Kalkulator menu latihan lari ideal (5K, 10K, 21K, 42K) berbasis BMI, pelacakan progres harian, dan integrasi riwayat aktivitas Strava.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PaceCraft — Perencana Menu Lari & Sinkronisasi Strava',
    description:
      'Kalkulator menu latihan lari ideal (5K, 10K, 21K, 42K) berbasis BMI, pelacakan progres harian, dan integrasi riwayat aktivitas Strava.',
  },
};

const THEME_INIT_SCRIPT = `(function(){try{var k='pacecraft_theme_v1';var v=localStorage.getItem(k);var d=v==='dark'||v==='"dark"'?true:v==='light'||v==='"light"'?false:window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F7F9FA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-900 dark:selection:text-teal-100"
      >
        {children}
      </body>
    </html>
  );
}
