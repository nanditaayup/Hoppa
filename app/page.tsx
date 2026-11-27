import PaceCraftAuthShell from '@/components/PaceCraftAuthShell';

export default function HomePage() {
  return (
    <>
      <section aria-label="Ringkasan Aplikasi PaceCraft" className="sr-only">
        <h1>PaceCraft — Kalkulator Menu Latihan Lari &amp; Sinkronisasi Strava</h1>
        <p>
          Perencana latihan lari pribadi untuk target jarak 5K, 10K, 21K Half
          Marathon, dan 42K Full Marathon dengan pengaman BMI, zona detak jantung
          Karvonen, estimasi VO2max, kalkulator pace lomba, pelacak jarak sepatu
          lari, cadangan JSON, serta impor file CSV dan GPX Strava langsung di
          browser.
        </p>
        <ul>
          <li>Kalkulator Pace &amp; Zona Latihan (Easy, Tempo, Interval Pace)</li>
          <li>Jadwal Mingguan dengan panduan progresi bertahap 5K hingga maraton</li>
          <li>Pelacak Jarak Sepatu Lari &amp; Catatan Personal Best</li>
          <li>Impor Strava CSV/GPX gratis tanpa wajib langganan API berbayar</li>
          <li>Autentikasi Google, penyimpanan cloud terisolasi, dan akses pembeli</li>
        </ul>
        <p>
          Program latihan dan rekomendasi nutrisi di PaceCraft bersifat panduan
          umum dan bukan pengganti saran medis profesional.
        </p>
      </section>
      <PaceCraftAuthShell />
    </>
  );
}
