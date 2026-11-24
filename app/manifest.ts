import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'PaceCraft — Kalkulator Menu Latihan Lari & Sinkronisasi Strava',
    short_name: 'PaceCraft',
    description:
      'Kalkulator menu latihan lari 5K, 10K, 21K, dan 42K berbasis BMI, kalender intensitas bulanan, kalkulator pace target lomba, serta impor Strava CSV/GPX gratis.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F7F9FA',
    theme_color: '#0F766E',
    categories: ['fitness', 'health', 'sports'],
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
