import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
const rulesText = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

test('firestore.rules uses rules_version 2 and enforces global default-deny catch-all', () => {
  assert.match(rulesText, /rules_version\s*=\s*'2'/);
  assert.match(
    rulesText,
    /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/
  );
});

test('firestore.rules verifies email_verified and strict UID owner isolation across all collections', () => {
  assert.match(rulesText, /request\.auth\.token\.email_verified\s*==\s*true/);
  assert.match(rulesText, /request\.auth\.uid\s*==\s*userId/);
  assert.match(rulesText, /allow\s+list:\s*if\s*false;/); // /users/{userId} list disabled
  // Subcollection list rules evaluate resource.data (existing().uid) rather than blanket isSignedIn()
  assert.match(
    rulesText,
    /allow\s+list:\s*if\s*isValidId\(userId\)\s*&&\s*isOwner\(userId\)\s*&&\s*existing\(\)\.uid\s*==\s*request\.auth\.uid;/
  );
  assert.doesNotMatch(rulesText, /allow\s+read:\s*if\s*isSignedIn\(\)/);
  assert.doesNotMatch(rulesText, /allow\s+list:\s*if\s*isSignedIn\(\)\s*;/);
});

test('firestore.rules enforces Eight Pillars: isValidId, hasAll/hasOnly, request.time, and immutable fields', () => {
  assert.match(rulesText, /function\s+isValidId\(id\)/);
  assert.match(rulesText, /isValidUserWorkspace\(incoming\(\),\s*userId\)/);
  assert.match(rulesText, /isValidDailyProgress\(incoming\(\),\s*userId\)/);
  assert.match(rulesText, /isValidRunActivity\(incoming\(\),\s*userId\)/);
  assert.match(rulesText, /isValidAccessGrant\(incoming\(\),\s*userId\)/);
  assert.match(rulesText, /incoming\(\)\.createdAt\s*==\s*request\.time/);
  assert.match(rulesText, /incoming\(\)\.updatedAt\s*==\s*request\.time/);
  assert.match(rulesText, /incoming\(\)\.createdAt\s*==\s*existing\(\)\.createdAt/);
  assert.match(rulesText, /incoming\(\)\.uid\s*==\s*existing\(\)\.uid/);
  assert.match(rulesText, /affectedKeys\(\)\.hasOnly\(/);
});

test('firebase-blueprint.json and firestore.rules cover every collection and forbid PII email fields', () => {
  const firestorePaths = Object.keys(blueprint.firestore ?? {});
  assert.deepEqual(firestorePaths.sort(), [
    '/accessGrants/{userId}',
    '/users/{userId}',
    '/users/{userId}/progress/{progressId}',
    '/users/{userId}/runs/{runId}',
  ]);

  // Ensure email PII is not part of UserWorkspace or AccessGrant schema
  const userProps = Object.keys(blueprint.entities.UserWorkspace.properties ?? {});
  assert.equal(userProps.includes('email'), false);
  assert.equal(userProps.includes('phone'), false);
  const grantProps = Object.keys(blueprint.entities.AccessGrant.properties ?? {});
  assert.equal(grantProps.includes('email'), false);

  // Blueprint maxLength bounds match firestore.rules size guards verbatim
  assert.equal(blueprint.entities.UserWorkspace.properties.customRaceName.maxLength, 80);
  assert.match(rulesText, /data\.customRaceName\.size\(\)\s*<=\s*80/);
  assert.equal(blueprint.entities.RunnerProfile.properties.shoeName.maxLength, 60);
  assert.match(rulesText, /p\.shoeName\.size\(\)\s*<=\s*60/);
  assert.equal(blueprint.entities.AccessGrant.properties.orderRef.maxLength, 80);
  assert.match(rulesText, /data\.orderRef\.size\(\)\s*<=\s*80/);
  assert.equal(blueprint.entities.DailyProgress.properties.note.maxLength, 280);
  assert.match(rulesText, /data\.note\.size\(\)\s*<=\s*280/);
  assert.equal(blueprint.entities.RunActivity.properties.summaryPolyline.maxLength, 50000);
  assert.match(rulesText, /data\.summaryPolyline\.size\(\)\s*<=\s*50000/);
});

test('accessGrants rules block buyer self-activation and allow only pending requests or verified Admin writes', () => {
  assert.match(rulesText, /function\s+isAdmin\(\)/);
  assert.match(rulesText, /request\.auth\.token\.email\s*==\s*'nanditayup@gmail\.com'/);
  assert.match(rulesText, /incoming\(\)\.status\s*==\s*'pending'/);
  assert.match(rulesText, /incoming\(\)\.provider\s*==\s*'admin_manual'/);
  assert.match(rulesText, /existing\(\)\.status\s*!=\s*'active'/);
});

test('firestore.rules allows partial updates on legacy user docs missing newer optional fields while blocking shadow keys', () => {
  // Core RunnerProfile fields are in hasAll; newer optional fields are guarded with "in p" + hasOnly allowlist
  assert.match(rulesText, /!\('shoeName' in p\)/);
  assert.match(rulesText, /!\('shoeCurrentKm' in p\)/);
  assert.match(rulesText, /!\('shoeMaxKm' in p\)/);
  assert.match(rulesText, /!\('customTargetPaceSecPerKm' in p\)/);
  assert.match(rulesText, /!\('restingHrBpm' in p\)/);
  assert.match(rulesText, /!\('customRaceDate' in data\)/);
  assert.match(rulesText, /p\.keys\(\)\.hasOnly\(/);
});
