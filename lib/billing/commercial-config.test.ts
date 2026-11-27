import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMERCIAL_PLANS,
  buildWhatsAppConfirmationUrl,
  normalizeWhatsappDigits,
} from './commercial-config';

test('normalizeWhatsappDigits converts leading zero Indonesian numbers to 62 format', () => {
  assert.equal(normalizeWhatsappDigits('0812-3456-7890'), '6281234567890');
  assert.equal(normalizeWhatsappDigits('+62 812 9999 0000'), '6281299990000');
  assert.equal(normalizeWhatsappDigits(''), '');
});

test('COMMERCIAL_PLANS defines Rp59.000 Essential (12 months) and Rp99.000 Lifetime tiers', () => {
  assert.equal(COMMERCIAL_PLANS.pro.priceIdr, 59000);
  assert.equal(COMMERCIAL_PLANS.pro.priceLabel, 'Rp59.000');
  assert.match(COMMERCIAL_PLANS.pro.billingPeriod.id, /12 bulan/);

  assert.equal(COMMERCIAL_PLANS.lifetime.priceIdr, 99000);
  assert.equal(COMMERCIAL_PLANS.lifetime.priceLabel, 'Rp99.000');
  assert.match(COMMERCIAL_PLANS.lifetime.billingPeriod.id, /selamanya/i);
});

test('buildWhatsAppConfirmationUrl builds pre-filled wa.me links for both Essential (pro) and Lifetime plans', () => {
  const lifetimeUrl = buildWhatsAppConfirmationUrl({
    whatsappDigits: '08123456789',
    planType: 'lifetime',
    userEmail: 'pelari@example.com',
    userUid: 'uid_abc123',
    orderRef: 'QRIS-9981',
    lang: 'id',
  });

  assert.ok(lifetimeUrl);
  assert.match(lifetimeUrl, /^https:\/\/wa\.me\/628123456789\?text=/);
  const decodedLifetime = decodeURIComponent(lifetimeUrl.split('?text=')[1]);
  assert.match(decodedLifetime, /PaceCraft Lifetime/);
  assert.match(decodedLifetime, /Rp99\.000/);
  assert.match(decodedLifetime, /pelari@example\.com/);
  assert.match(decodedLifetime, /uid_abc123/);
  assert.match(decodedLifetime, /QRIS-9981/);

  const essentialUrl = buildWhatsAppConfirmationUrl({
    whatsappDigits: '08123456789',
    planType: 'pro',
    userEmail: 'pelari@example.com',
    userUid: 'uid_abc123',
    orderRef: 'QRIS-5900',
    lang: 'en',
  });

  assert.ok(essentialUrl);
  const decodedEssential = decodeURIComponent(essentialUrl.split('?text=')[1]);
  assert.match(decodedEssential, /PaceCraft Essential/);
  assert.match(decodedEssential, /Rp59\.000/);
});
