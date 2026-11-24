import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSingleUseBuyerLicense,
  generateAccessCodeString,
  inferPlanTypeFromAccessCode,
  isOwnerEmail,
  isValidAccessCodeFormat,
  normalizeAccessCode,
  sanitizeExternalCheckoutUrl,
  signBuyerLicenseKey,
  signEntitlementToken,
  verifyBuyerCodeOrLicense,
  verifyEntitlementToken,
} from './access-token';

const TEST_SECRET = 'pacecraft-unit-test-signing-secret-2026';

test('signEntitlementToken & verifyEntitlementToken enforce UID binding and reject tampering', () => {
  const now = 1_800_000_000;
  const token = signEntitlementToken(
    'runner_uid_123',
    'lifetime',
    'stripe',
    TEST_SECRET,
    now,
    3600
  );

  const valid = verifyEntitlementToken(token, 'runner_uid_123', TEST_SECRET, now + 100);
  assert.ok(valid);
  assert.equal(valid?.uid, 'runner_uid_123');
  assert.equal(valid?.provider, 'stripe');

  // Wrong UID must fail
  assert.equal(
    verifyEntitlementToken(token, 'other_uid_999', TEST_SECRET, now + 100),
    null
  );

  // Tampered payload must fail
  const [payload, sig] = token.split('.');
  const tamperedPayload = Buffer.from(
    JSON.stringify({ uid: 'other_uid_999', planType: 'lifetime', provider: 'stripe', iat: now, exp: now + 3600 }),
    'utf8'
  ).toString('base64url');
  assert.equal(
    verifyEntitlementToken(`${tamperedPayload}.${sig}`, 'other_uid_999', TEST_SECRET, now + 100),
    null
  );

  // Expired token must fail
  assert.equal(
    verifyEntitlementToken(`${payload}.${sig}`, 'runner_uid_123', TEST_SECRET, now + 4000),
    null
  );
});

test('signBuyerLicenseKey & verifyBuyerCodeOrLicense validate HMAC keys and configured passcodes', () => {
  const now = 1_800_000_000;
  const created = createSingleUseBuyerLicense('pro', TEST_SECRET, now, 3600);
  const license = signBuyerLicenseKey('pro', TEST_SECRET, now, 3600);
  assert.ok(license.startsWith('PC-'));
  assert.ok(created.licenseKey.startsWith('PC-'));
  assert.match(created.codeId, /^LIC-[A-F0-9]{12}$/);
  assert.match(created.claimSecret, /^[a-f0-9]{24}$/);

  const okLicense = verifyBuyerCodeOrLicense(
    created.licenseKey,
    { signingSecret: TEST_SECRET },
    now + 60
  );
  assert.equal(okLicense.valid, true);
  assert.equal(okLicense.planType, 'pro');
  assert.equal(okLicense.provider, 'license');
  assert.equal(okLicense.singleUse, true);
  assert.equal(okLicense.codeId, created.codeId);
  assert.equal(okLicense.claimSecret, created.claimSecret);

  // Expired license fails
  const expiredLicense = verifyBuyerCodeOrLicense(
    license,
    { signingSecret: TEST_SECRET },
    now + 5000
  );
  assert.equal(expiredLicense.valid, false);

  // Configured shared passcode works
  const okShared = verifyBuyerCodeOrLicense(
    'RUN-CLUB-2026',
    {
      signingSecret: TEST_SECRET,
      singleCode: 'RUN-CLUB-2026',
      multipleCodesCsv: 'BETA-VIP-1,BETA-VIP-2',
    },
    now
  );
  assert.equal(okShared.valid, true);

  // Wrong code fails cleanly
  const bad = verifyBuyerCodeOrLicense(
    'WRONG-CODE',
    {
      signingSecret: TEST_SECRET,
      singleCode: 'RUN-CLUB-2026',
    },
    now
  );
  assert.equal(bad.valid, false);
});

test('isOwnerEmail checks verified status and exact owner email match', () => {
  assert.equal(isOwnerEmail('nanditayup@gmail.com', true), true);
  assert.equal(isOwnerEmail('NANDITAYUP@gmail.com', true), true);
  assert.equal(isOwnerEmail('nanditayup@gmail.com', false), false);
  assert.equal(isOwnerEmail('buyer@gmail.com', true), false);
  assert.equal(isOwnerEmail(null, true), false);
});

test('sanitizeExternalCheckoutUrl only permits http/https protocols', () => {
  assert.equal(
    sanitizeExternalCheckoutUrl('https://checkout.example.com/pacecraft'),
    'https://checkout.example.com/pacecraft'
  );
  assert.equal(sanitizeExternalCheckoutUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeExternalCheckoutUrl(''), null);
});

test('generateAccessCodeString, normalizeAccessCode, isValidAccessCodeFormat, and inferPlanTypeFromAccessCode enforce access-codes invariants', () => {
  const ltKey = generateAccessCodeString('lifetime');
  const proKey = generateAccessCodeString('pro');

  assert.match(ltKey, /^PACE-LT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  assert.match(proKey, /^PACE-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  assert.equal(inferPlanTypeFromAccessCode(ltKey), 'lifetime');
  assert.equal(inferPlanTypeFromAccessCode(proKey), 'pro');

  assert.equal(normalizeAccessCode(`  ${ltKey.toLowerCase()}  `), ltKey);
  assert.equal(isValidAccessCodeFormat(ltKey), true);
  assert.equal(isValidAccessCodeFormat('short'), false);
  assert.equal(isValidAccessCodeFormat('BAD/KEY!'), false);
});
