import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppConfirmationUrl,
  normalizeWhatsappDigits,
} from './commercial-config';

test('normalizeWhatsappDigits converts leading zero Indonesian numbers to 62 format', () => {
  assert.equal(normalizeWhatsappDigits('0812-3456-7890'), '6281234567890');
  assert.equal(normalizeWhatsappDigits('+62 812 9999 0000'), '6281299990000');
  assert.equal(normalizeWhatsappDigits(''), '');
});

test('buildWhatsAppConfirmationUrl builds pre-filled wa.me link with email and plan', () => {
  const url = buildWhatsAppConfirmationUrl({
    whatsappDigits: '08123456789',
    planType: 'lifetime',
    userEmail: 'pelari@example.com',
    userUid: 'uid_abc123',
    orderRef: 'QRIS-9981',
    lang: 'id',
  });

  assert.ok(url);
  assert.match(url, /^https:\/\/wa\.me\/628123456789\?text=/);
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.match(decoded, /Paket Lifetime/);
  assert.match(decoded, /Rp 149\.000/);
  assert.match(decoded, /pelari@example\.com/);
  assert.match(decoded, /uid_abc123/);
  assert.match(decoded, /QRIS-9981/);
});
