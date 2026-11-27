import { AccessPlanType, AppLanguage } from '@/lib/strava/types';

export interface PricingTierInfo {
  id: AccessPlanType;
  priceIdr: number;
  priceLabel: string;
  billingPeriod: Record<AppLanguage, string>;
  title: Record<AppLanguage, string>;
  subtitle?: Record<AppLanguage, string>;
  summary: Record<AppLanguage, string>;
  listIntro?: Record<AppLanguage, string>;
  suitedFor: Record<AppLanguage, string>;
  coreValue: Record<AppLanguage, string>;
  ctaLabel: Record<AppLanguage, string>;
  features: Record<AppLanguage, string[]>;
}

export const COMMERCIAL_PLANS: Record<AccessPlanType, PricingTierInfo> = {
  pro: {
    id: 'pro',
    priceIdr: 59000,
    priceLabel: 'Rp59.000',
    billingPeriod: {
      id: 'Akses 12 bulan',
      en: '12-month access',
    },
    title: {
      id: 'PaceCraft Essential',
      en: 'PaceCraft Essential',
    },
    subtitle: {
      id: 'Sekali bayar untuk 1 tahun persiapan lomba',
      en: 'One-time payment for 1 full year of race prep',
    },
    summary: {
      id: 'Untuk pelari yang ingin jadwal terstruktur ala coach, sesi harian jelas, dan progres konsisten selama 12 bulan.',
      en: 'For runners who want structured coach-style weekly blocks, clear daily workouts, and steady progress for 12 months.',
    },
    listIntro: {
      id: 'Termasuk dalam Essential (12 bulan):',
      en: 'Included in Essential (12 months):',
    },
    suitedFor: {
      id: 'Pelari target 5K–42K yang fokus pada jadwal terstruktur & check-in harian',
      en: '5K–42K runners focused on structured weekly plans & daily check-ins',
    },
    coreValue: {
      id: 'Jadwal terstruktur harian tanpa kebingungan menentukan porsi lari',
      en: 'Structured daily runs without guessing weekly mileage or pace',
    },
    ctaLabel: {
      id: 'Pilih Essential Rp59.000',
      en: 'Choose Essential Rp59.000',
    },
    features: {
      id: [
        'Rencana latihan 5K, 10K, 21K, hingga 42K dengan blok 4 minggu & cutback otomatis',
        'Detail tiap sesi terstruktur (Warm-up, Main Set, Cool-down) + latihan Strength',
        'Tampilan Hari Ini: target jarak, pace panduan, dan catat hasil dalam hitungan detik',
        'Zona pace Easy/Tempo/Interval, zona detak jantung Karvonen, & panduan Makan & Pulih',
        'Penyesuaian intensitas otomatis saat tubuh terasa lelah dan fase tapering lomba',
      ],
      en: [
        '5K to marathon training plans with 4-week progressive blocks & cutback weeks',
        'Structured workout steps (Warm-up, Main Set, Cool-down) + Strength & Mobility',
        'Today view with exact session structure, pace guide, and fast daily check-in',
        'Easy/Tempo/Interval pace zones, Karvonen HR zones, & Eat & Recover guide',
        'Fatigue recovery mode and automatic pre-race tapering adjustments',
      ],
    },
  },
  lifetime: {
    id: 'lifetime',
    priceIdr: 99000,
    priceLabel: 'Rp99.000',
    billingPeriod: {
      id: 'Sekali bayar · Akses selamanya',
      en: 'One-time · Lifetime access',
    },
    title: {
      id: 'PaceCraft Lifetime',
      en: 'PaceCraft Lifetime',
    },
    subtitle: {
      id: 'Sekali bayar, pakai selamanya tanpa biaya perpanjangan',
      en: 'Pay once, keep forever with zero renewal fees',
    },
    summary: {
      id: 'Semua fitur Essential ditambah akses selamanya, impor Strava CSV/GPX, proyeksi waktu lomba, dan pelacak perlengkapan.',
      en: 'Everything in Essential plus lifetime access, Strava CSV/GPX import, race finish predictor, and gear tracking.',
    },
    listIntro: {
      id: 'Semua fitur Essential, ditambah:',
      en: 'Everything in Essential, plus:',
    },
    suitedFor: {
      id: 'Pelari yang ingin memakai riwayat Strava, proyeksi finis, & akses selamanya',
      en: 'Runners who want Strava history calibration, finish predictions, & lifetime access',
    },
    coreValue: {
      id: 'Sekali bayar untuk seumur hidup—termasuk analisis Strava tanpa langganan',
      en: 'One payment forever—including Strava analysis with zero monthly fees',
    },
    ctaLabel: {
      id: 'Pilih Lifetime Rp99.000',
      en: 'Choose Lifetime Rp99.000',
    },
    features: {
      id: [
        'Akses penuh selamanya (Lifetime) tanpa biaya bulanan maupun tahunan',
        'Impor riwayat Strava (CSV/GPX) langsung di browser + kalibrasi baseline otomatis',
        'Proyeksi waktu finis 5K–42K, catatan Personal Best, dan peta rute + deteksi anomali',
        'Kalender intensitas bulanan gabungan, pelacak kilometer sepatu, & kartu share PNG',
        'Ekspor jadwal latihan ke kalender ponsel (.ics) dan seluruh pembaruan mendatang',
      ],
      en: [
        'Full lifetime access with zero monthly or annual renewal fees',
        'Browser Strava CSV/GPX history import + automatic training baseline calibration',
        '5K–42K race finish time predictor, Personal Best log, route map & anomaly checks',
        'Combined monthly intensity calendar, shoe mileage tracker, & PNG progress cards',
        'Export training blocks to your phone calendar (.ics) and all future updates',
      ],
    },
  },
};

export interface PricingComparisonRow {
  id: string;
  label: Record<AppLanguage, string>;
  pro: Record<AppLanguage, string> | boolean;
  lifetime: Record<AppLanguage, string> | boolean;
}

export const PRICING_COMPARISON_ROWS: PricingComparisonRow[] = [
  {
    id: 'duration',
    label: {
      id: 'Masa aktif akses',
      en: 'Access duration',
    },
    pro: { id: '12 bulan', en: '12 months' },
    lifetime: { id: 'Selamanya (Lifetime)', en: 'Lifetime (no renewal)' },
  },
  {
    id: 'structured_workouts',
    label: {
      id: 'Rencana 5K–42K, Warm-up/Inti/Cool-down & Strength',
      en: '5K–42K plans, Warm-up/Main/Cool-down & Strength',
    },
    pro: true,
    lifetime: true,
  },
  {
    id: 'today_checkin',
    label: {
      id: 'Tampilan Hari Ini, Zona Pace/HR & Panduan Makan',
      en: 'Today view, Pace/HR Zones & Fueling Guide',
    },
    pro: true,
    lifetime: true,
  },
  {
    id: 'strava_import',
    label: {
      id: 'Impor Strava CSV/GPX tanpa langganan & kalibrasi baseline',
      en: 'Free Strava CSV/GPX import & baseline calibration',
    },
    pro: false,
    lifetime: true,
  },
  {
    id: 'predictor_calendar',
    label: {
      id: 'Proyeksi Finis 5K–42K, Kalender Intensitas & Pelacak Sepatu',
      en: '5K–42K Finish Predictor, Intensity Calendar & Shoe Log',
    },
    pro: false,
    lifetime: true,
  },
  {
    id: 'export_ics',
    label: {
      id: 'Ekspor jadwal ke Google/Apple Calendar (.ics) & update selamanya',
      en: 'Calendar export (.ics) & all future plan updates',
    },
    pro: false,
    lifetime: true,
  },
];

export interface CommercialSellerConfig {
  whatsappDigits: string;
  qrisImageUrl: string;
  bankAccountInfo: string;
  merchantName: string;
  supportEmail: string;
}

export function normalizeWhatsappDigits(raw: string | undefined | null): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

export function getCommercialSellerConfig(): CommercialSellerConfig {
  const whatsappDigits = normalizeWhatsappDigits(
    process.env.NEXT_PUBLIC_SELLER_WHATSAPP
  );
  const qrisImageUrl = (process.env.NEXT_PUBLIC_QRIS_IMAGE_URL || '').trim();
  const bankAccountInfo = (
    process.env.NEXT_PUBLIC_BANK_ACCOUNT_INFO || ''
  ).trim();
  const merchantName =
    (process.env.NEXT_PUBLIC_MERCHANT_NAME || '').trim() || 'PaceCraft Indonesia';
  const supportEmail =
    (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '').trim() || 'nanditayup@gmail.com';

  return {
    whatsappDigits,
    qrisImageUrl,
    bankAccountInfo,
    merchantName,
    supportEmail,
  };
}

export function buildWhatsAppConfirmationUrl(params: {
  whatsappDigits: string;
  planType: AccessPlanType;
  userEmail: string | null;
  userUid: string;
  orderRef?: string;
  lang: AppLanguage;
}): string | null {
  const digits = normalizeWhatsappDigits(params.whatsappDigits);
  if (!digits) return null;

  const plan = COMMERCIAL_PLANS[params.planType];
  const emailLine = params.userEmail || '-';
  const refLine = params.orderRef?.trim() || '-';

  const message =
    params.lang === 'en'
      ? [
          `Hello PaceCraft Admin, I have completed payment for ${plan.title.en} (${plan.priceLabel}).`,
          `Google Email: ${emailLine}`,
          `Account UID: ${params.userUid}`,
          `Transfer/QRIS Ref: ${refLine}`,
          `Please send my single-use License Key. Thank you!`,
        ].join('\n')
      : [
          `Halo Admin PaceCraft, saya ingin konfirmasi pembayaran ${plan.title.id} (${plan.priceLabel}).`,
          `Email Google: ${emailLine}`,
          `UID Akun: ${params.userUid}`,
          `Ref Transfer/QRIS: ${refLine}`,
          `Mohon bantuannya untuk mengirimkan License Key aksesnya. Terima kasih!`,
        ].join('\n');

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
