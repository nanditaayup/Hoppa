import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PaceCraft — Perencana Menu Lari 5K–42K & Sinkronisasi Strava';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background:
            'linear-gradient(135deg, #EAF6F3 0%, #F4F8FB 52%, #EEF2FB 100%)',
          color: '#0F172A',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              PC
            </div>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              PaceCraft
            </span>
          </div>

          <div
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#0F766E',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            5K · 10K · 21K · 42K
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            style={{
              fontSize: '54px',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#0F172A',
            }}
          >
            Kalkulator Menu Latihan Lari Ideal & Sinkronisasi Strava
          </div>
          <div
            style={{
              fontSize: '24px',
              lineHeight: 1.45,
              color: '#334155',
              maxWidth: '940px',
            }}
          >
            Perencanaan pace lomba, pengaman BMI, pelacak jarak sepatu, progres
            harian, serta impor CSV & GPX Strava langsung di browser.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            fontSize: '18px',
            fontWeight: 600,
            color: '#0F766E',
          }}
        >
          <span>Kalkulator Pace & Zona</span>
          <span>·</span>
          <span>Pengaman BMI & HR VO2max</span>
          <span>·</span>
          <span>Impor CSV/GPX Gratis</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
