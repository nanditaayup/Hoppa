import type { Metadata, Viewport } from 'next';
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

function resolveMetadataBase(): URL {
  const raw = process.env.APP_URL?.trim();
  if (raw && raw !== 'MY_APP_URL' && raw.startsWith('http')) {
    try {
      return new URL(raw);
    } catch {
      // fallback below
    }
  }
  return new URL('https://pacecraft.app');
}

const APP_TITLE = 'PaceCraft — Kalkulator Menu Latihan Lari & Sinkronisasi Strava';
const APP_DESCRIPTION =
  'Kalkulator menu latihan lari ideal (5K, 10K, 21K, 42K) berbasis BMI, kalkulator pace target lomba, kalender intensitas bulanan, ekspor kalender .ics, pelacak jarak sepatu, serta impor riwayat aktivitas Strava (CSV/GPX gratis).';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F766E' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  applicationName: 'PaceCraft',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PaceCraft',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  keywords: [
    'PaceCraft',
    'kalkulator pace lari',
    'menu latihan lari 5K 10K 21K 42K',
    'program lari maraton',
    'BMI pelari',
    'shoe mileage tracker',
    'impor CSV GPX Strava',
  ],
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    type: 'website',
    locale: 'id_ID',
    siteName: 'PaceCraft',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
};

const JSON_LD_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PaceCraft',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  inLanguage: ['id', 'en'],
  description: APP_DESCRIPTION,
  featureList: [
    'Kalkulator Pace Lomba 5K, 10K, 21K, dan 42K',
    'Jadwal Latihan Lari Mingguan dengan Pengaman BMI & Ekspor Kalender .ics',
    'Kalender Intensitas Bulanan & Rekor Personal Best Lomba',
    'Pelacak Jarak Sepatu Lari (Shoe Mileage Tracker)',
    'Impor Riwayat Strava CSV dan GPX di Browser',
    'Kartu Progres Siap Share Instagram Story 9:16 & Cadangan JSON',
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_SCHEMA) }}
        />
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
