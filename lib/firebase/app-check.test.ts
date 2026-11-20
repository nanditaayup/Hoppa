import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAppCheckConfigSummary,
  resolveAppCheckProviderKind,
  resolveRecaptchaSiteKey,
  shouldEnableAppCheckDebugToken,
} from './app-check-config';

test('resolveRecaptchaSiteKey prioritizes env key over firebase-applet-config key and rejects blanks/placeholders', () => {
  assert.equal(resolveRecaptchaSiteKey('', ''), null);
  assert.equal(resolveRecaptchaSiteKey('   ', '   '), null);
  assert.equal(
    resolveRecaptchaSiteKey('MY_RECAPTCHA_SITE_KEY', 'YOUR_SITE_KEY'),
    null
  );
  assert.equal(resolveRecaptchaSiteKey('key with spaces', ''), null);
  assert.equal(
    resolveRecaptchaSiteKey('6Lc_env_key_123', '6Lc_config_key_456'),
    '6Lc_env_key_123'
  );
  assert.equal(
    resolveRecaptchaSiteKey('', '  6Lc_config_key_456  '),
    '6Lc_config_key_456'
  );
});

test('resolveAppCheckProviderKind switches between enterprise and v3 cleanly', () => {
  assert.equal(resolveAppCheckProviderKind(undefined), 'v3');
  assert.equal(resolveAppCheckProviderKind(''), 'v3');
  assert.equal(resolveAppCheckProviderKind('v3'), 'v3');
  assert.equal(resolveAppCheckProviderKind('enterprise'), 'enterprise');
  assert.equal(resolveAppCheckProviderKind('RECAPTCHA_ENTERPRISE'), 'enterprise');
});

test('buildAppCheckConfigSummary tracks configuration source and provider accurately', () => {
  assert.deepEqual(buildAppCheckConfigSummary('', '', ''), {
    siteKey: null,
    siteKeySource: 'none',
    siteKeyConfigured: false,
    providerKind: 'v3',
  });

  assert.deepEqual(buildAppCheckConfigSummary('', '6Lc_config_key_456', 'enterprise'), {
    siteKey: '6Lc_config_key_456',
    siteKeySource: 'firebase-config',
    siteKeyConfigured: true,
    providerKind: 'enterprise',
  });

  assert.deepEqual(
    buildAppCheckConfigSummary('6Lc_env_key_123', '6Lc_config_key_456', 'v3'),
    {
      siteKey: '6Lc_env_key_123',
      siteKeySource: 'env',
      siteKeyConfigured: true,
      providerKind: 'v3',
    }
  );
});

test('shouldEnableAppCheckDebugToken only allows localhost in non-production when explicitly opted in', () => {
  assert.equal(
    shouldEnableAppCheckDebugToken('localhost', 'development', undefined),
    false
  );
  assert.equal(
    shouldEnableAppCheckDebugToken('127.0.0.1', 'development', 'true'),
    true
  );
  assert.equal(
    shouldEnableAppCheckDebugToken('localhost', 'production', 'true'),
    false
  );
  assert.equal(
    shouldEnableAppCheckDebugToken(
      'pacecraft.example.com',
      'development',
      'true'
    ),
    false
  );
  assert.equal(
    shouldEnableAppCheckDebugToken('localhost', 'development', 'false'),
    false
  );
});
