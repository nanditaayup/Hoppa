# PaceCraft Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Strict Ownership & Zero-Trust Isolation**: Every document under `/users/{userId}`, `/users/{userId}/progress/{progressId}`, and `/users/{userId}/runs/{runId}` may ONLY be read or written by the authenticated, email-verified user whose `request.auth.uid == userId` and `data.uid == request.auth.uid`.
2. **No PII Storage in Firestore**: User email addresses remain strictly in Firebase Auth session memory and are never persisted into Firestore documents.
3. **Immutable Ownership & Creation Timestamps**: `uid` and `createdAt` cannot be modified after creation; `createdAt` on create and `updatedAt` on create/update must equal `request.time`.
4. **Strict Schema & Bounds Enforcement**: Every string has bounded `.size()`, every enum and numeric value is strictly validated, and unknown/shadow keys are rejected via `keys().hasAll(...)` + `keys().hasOnly(...)`.
5. **Path Hardening**: All path IDs (`userId`, `progressId`, `runId`) must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
6. **Paid Access Entitlement Isolation (`/accessGrants/{userId}` & `/access-codes/{codeId}`)**: Buyers may read only their own grant, submit a `status: 'pending'` confirmation request (`provider: 'admin_manual'`), or atomically redeem an `'unused'` single-use license key in `/access-codes/{codeId}` by transitioning `/access-codes/{codeId}` to `status: 'used'` (`usedByUid == request.auth.uid`, `usedAt == request.time`) in the same atomic batch as `/accessGrants/{userId}` becoming `'active'`. Buyers can NEVER read `/access-codes`, NEVER reuse a `'used'`/`'revoked'` license key, and NEVER self-activate `status: 'active'` without a matching unused key or Admin verification.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Read/Write**: Reading or creating `/users/userA` with `request.auth == null`.
2. **Unverified Email Write**: Creating `/users/userA` when `request.auth.token.email_verified == false`.
3. **Cross-User Read (`get`)**: User B (`uid = "userB"`) calling `get` on `/users/userA`, `/accessGrants/userA`, or `/access-codes/PACE-LT-1234`.
4. **Cross-User Subcollection List**: User B calling `list` on `/users/userA/runs`, `/users/userA/progress`, `/accessGrants`, or `/access-codes`.
5. **Identity Spoofing on Create**: User A writing `/users/userA/runs/r1` with `{ uid: "userB", ... }`.
6. **Shadow Field Injection**: User A writing `/users/userA` with valid fields plus `{ isAdmin: true }`.
7. **Immutable Field Tampering**: User A updating `/users/userA` with modified `createdAt` or `uid`.
8. **Client Timestamp Forgery**: User A creating `/users/userA` with `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
9. **Path Variable Poisoning**: User A writing `/users/userA/runs/../../etc/passwd` or a 300-character document ID.
10. **String Resource Exhaustion**: User A writing `/users/userA` with `customRaceName` of 5,000 characters, `shoeName` of 500 characters, or `note` of 2,000 characters.
11. **Value Type / Enum Poisoning**: User A updating `/users/userA` with `profile.targetRace: "100K"`, `profile.weightKg: -50`, or `profile.shoeMaxKm: 50000`.
12. **Self-Activation & License Replay Privilege Escalation**: Buyer writing `/accessGrants/userA` with `{ status: "active" }` without an atomic `'unused'` `/access-codes/{codeId}` batch transition, or attempting to redeem an already `'used'`/`'revoked'` key.
