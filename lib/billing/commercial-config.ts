import { AccessPlanType, AppLanguage } from '@/lib/strava/types';

export interface PricingTierInfo {
  id: AccessPlanType;
  priceIdr: number;
  priceLabel: string;
  originalPriceLabel: string;
  billingPeriod: Record<AppLanguage, string>;
  title: Record<AppLanguage, string>;
  summary: Record<AppLanguage, string>;
  badge?: Record<AppLanguage, string>;
  features: Record<AppLanguage, string[]>;
}

export const COMMERCIAL_PLANS: Record<AccessPlanType, PricingTierInfo> = {
  lifetime: {
    id: 'lifetime',
    priceIdr: 149000,
    priceLabel: 'Rp 149.000',
    originalPriceLabel: 'Rp 299.000',
    billingPeriod: {
      id: 'Sekali bayar · Akses selamanya',
      en: 'One-time payment · Lifetime access',
    },
    title: {
      id: 'Paket Lifetime',
      en: 'Lifetime Access',
    },
    summary: {
      id: 'Bayar sekali tanpa iuran bulanan untuk seluruh fitur 5K hingga Marathon.',
      en: 'Pay once with zero monthly subscriptions for all 5K to Marathon features.',
    },
    badge: {
      id: 'Paling Hemat',
      en: 'Best Value',
    },
    features: {
      id: [
        'Menu latihan 5K, 10K, 21K & 42K + batas aman BMI',
        'Kalkulator Pace, Zona HR Karvonen & estimasi VO2max',
        'Impor CSV & GPX Strava gratis tanpa langganan Strava',
        'Kalender intensitas bulanan, ekspor .ics & kartu IG Story 9:16',
        'Sinkronisasi cloud terisolasi + semua pembaruan selamanya',
      ],
      en: [
        '5K, 10K, 21K & 42K adaptive training plans with BMI guard',
        'Race Pace Calculator, Karvonen HR zones & VO2max estimation',
        'Free Strava CSV & GPX import without paid Strava Subscription',
        'Monthly intensity calendar, .ics export & 9:16 IG Story card',
        'Private cloud sync + all future feature updates included',
      ],
    },
  },
  pro: {
    id: 'pro',
    priceIdr: 99000,
    priceLabel: 'Rp 99.000',
    originalPriceLabel: 'Rp 149.000',
    billingPeriod: {
      id: 'Per tahun · Hemat untuk 1 musim lomba',
      en: 'Per year · Ideal for a full race season',
    },
    title: {
      id: 'Paket Pro Tahunan',
      en: 'Annual Pro',
    },
    summary: {
      id: 'Cocok untuk persiapan 1–2 target event lomba utama sepanjang tahun.',
      en: 'Great for preparing 1–2 primary race targets over the year.',
    },
    features: {
      id: [
        'Semua kalkulator pace, jadwal mingguan & strength training',
        'Pelacak progres harian, sepatu lari & rekor PB pribadi',
        'Impor Strava CSV/GPX lokal langsung di browser',
        'Ekspor jadwal ke Google/Apple Calendar (.ics)',
        'Cadangan JSON & dukungan prioritas via WhatsApp',
      ],
      en: [
        'Full pace calculator, weekly plan & strength training schedule',
        'Daily progress tracker, shoe mileage & Personal Best records',
        'Local Strava CSV/GPX file import directly in browser',
        'One-click export to Google/Apple Calendar (.ics)',
        'JSON backup/restore & WhatsApp customer support',
      ],
    },
  },
};

export interface PricingComparisonRow {
  id: string;
  label: Record<AppLanguage, string>;
  lifetime: Record<AppLanguage, string> | boolean;
  pro: Record<AppLanguage, string> | boolean;
}

export const PRICING_COMPARISON_ROWS: PricingComparisonRow[] = [
  {
    id: 'price',
    label: { id: 'Harga Paket', en: 'Plan Price' },
    lifetime: { id: 'Rp 149.000 (Sekali)', en: 'Rp 149.000 (One-Time)' },
    pro: { id: 'Rp 99.000 / tahun', en: 'Rp 99.000 / year' },
  },
  {
    id: 'duration',
    label: { id: 'Masa Berlaku Akses', en: 'Access Duration' },
    lifetime: { id: 'Selamanya (Tanpa Perpanjangan)', en: 'Lifetime (No Renewal)' },
    pro: { id: '12 Bulan (1 Musim Lomba)', en: '12 Months (1 Race Season)' },
  },
  {
    id: 'plans_bmi',
    label: {
      id: 'Menu Lari 5K–42K, Pengaman BMI & Tapering',
      en: '5K–42K Plans, BMI Guard & Auto Tapering',
    },
    lifetime: true,
    pro: true,
  },
  {
    id: 'pace_hr',
    label: {
      id: 'Kalkulator Pace, Zona HR Karvonen & VO2max',
      en: 'Race Pace Calculator, Karvonen HR & VO2max',
    },
    lifetime: true,
    pro: true,
  },
  {
    id: 'strava_import',
    label: {
      id: 'Impor Strava CSV/GPX Gratis (Tanpa Langganan API)',
      en: 'Free Browser Strava CSV/GPX Import',
    },
    lifetime: true,
    pro: true,
  },
  {
    id: 'calendar_ics',
    label: {
      id: 'Kalender Intensitas Bulanan & Ekspor .ics HP',
      en: 'Monthly Intensity Calendar & .ics Export',
    },
    lifetime: true,
    pro: true,
  },
  {
    id: 'pb_story_shoe',
    label: {
      id: 'Kartu IG Story 9:16, Rekor PB & Pelacak Sepatu',
      en: '9:16 IG Story Cards, PB Wall & Shoe Tracker',
    },
    lifetime: true,
    pro: true,
  },
  {
    id: 'future_updates',
    label: {
      id: 'Semua Pembaruan Fitur Mendatang',
      en: 'All Future Feature Updates',
    },
    lifetime: { id: 'Termasuk Selamanya', en: 'Included Forever' },
    pro: { id: 'Selama Masa Aktif', en: 'During Active Year' },
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
