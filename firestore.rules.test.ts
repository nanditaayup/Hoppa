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
  assert.match(rulesText, /incoming\(\)\.createdAt\s*==\s*request\.time/);
  assert.match(rulesText, /incoming\(\)\.updatedAt\s*==\s*request\.time/);
  assert.match(rulesText, /incoming\(\)\.createdAt\s*==\s*existing\(\)\.createdAt/);
  assert.match(rulesText, /incoming\(\)\.uid\s*==\s*existing\(\)\.uid/);
  assert.match(rulesText, /affectedKeys\(\)\.hasOnly\(/);
});

test('firebase-blueprint.json and firestore.rules cover every collection and forbid PII email fields', () => {
  const firestorePaths = Object.keys(blueprint.firestore ?? {});
  assert.deepEqual(firestorePaths.sort(), [
    '/users/{userId}',
    '/users/{userId}/progress/{progressId}',
    '/users/{userId}/runs/{runId}',
  ]);

  // Ensure email PII is not part of UserWorkspace schema or rules
  const userProps = Object.keys(blueprint.entities.UserWorkspace.properties ?? {});
  assert.equal(userProps.includes('email'), false);
  assert.equal(userProps.includes('phone'), false);

  // Blueprint maxLength bounds match firestore.rules size guards verbatim
  assert.equal(blueprint.entities.UserWorkspace.properties.customRaceName.maxLength, 80);
  assert.match(rulesText, /data\.customRaceName\.size\(\)\s*<=\s*80/);
  assert.equal(blueprint.entities.DailyProgress.properties.note.maxLength, 280);
  assert.match(rulesText, /data\.note\.size\(\)\s*<=\s*280/);
  assert.equal(blueprint.entities.RunActivity.properties.summaryPolyline.maxLength, 50000);
  assert.match(rulesText, /data\.summaryPolyline\.size\(\)\s*<=\s*50000/);
});
