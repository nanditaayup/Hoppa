import { NextRequest, NextResponse } from 'next/server';
import firebaseConfig from '@/firebase-applet-config.json';
import {
  ENTITLEMENT_COOKIE_NAME,
  getServerSigningSecret,
  signEntitlementToken,
  verifyBuyerCodeOrLicense,
  verifyFirebaseIdToken,
} from '@/lib/billing/access-token';
import { AccessPlanType, AccessProvider } from '@/lib/strava/types';

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    const reqHost = req.headers.get('x-forwarded-host') || req.nextUrl.host;
    return parsed.host === reqHost;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  const caller = await verifyFirebaseIdToken(
    req.headers.get('authorization'),
    firebaseConfig.projectId
  );
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { accessCode?: unknown; stripeSessionId?: unknown } = {};
  try {
    body = (await req.json()) as {
      accessCode?: unknown;
      stripeSessionId?: unknown;
    };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const stripeSessionId =
    typeof body.stripeSessionId === 'string'
      ? body.stripeSessionId.trim()
      : '';
  const accessCode =
    typeof body.accessCode === 'string' ? body.accessCode.trim() : '';

  const secret = getServerSigningSecret();
  let unlocked = false;
  let planType: AccessPlanType = 'lifetime';
  let provider: AccessProvider = 'license';

  // 1. Verify Stripe Checkout Session if provided
  if (stripeSessionId) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeSecretKey) {
      return NextResponse.json(
        { unlocked: false, errorCode: 'stripe_not_configured' },
        { status: 400 }
      );
    }

    if (!/^cs_[a-zA-Z0-9_]+$/.test(stripeSessionId)) {
      return NextResponse.json(
        { unlocked: false, errorCode: 'invalid_session' },
        { status: 400 }
      );
    }

    try {
      const stripeRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(stripeSessionId)}`,
        {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
          },
        }
      );

      if (stripeRes.ok) {
        const session = (await stripeRes.json()) as {
          payment_status?: string;
          client_reference_id?: string | null;
          customer_details?: { email?: string | null };
        };

        const matchesUser =
          session.client_reference_id === caller.uid ||
          (caller.email &&
            session.customer_details?.email &&
            session.customer_details.email.toLowerCase() ===
              caller.email.toLowerCase());

        if (session.payment_status === 'paid' && matchesUser) {
          unlocked = true;
          planType = 'lifetime';
          provider = 'stripe';
        }
      }
    } catch {
      return NextResponse.json(
        { unlocked: false, errorCode: 'stripe_verify_failed' },
        { status: 502 }
      );
    }
  } else if (accessCode) {
    // 2. Verify signed buyer license key or configured passcode
    const result = verifyBuyerCodeOrLicense(accessCode, {
      signingSecret: secret,
      singleCode: process.env.BUYER_ACCESS_CODE,
      multipleCodesCsv: process.env.BUYER_ACCESS_CODES,
    });
    if (result.valid) {
      if (result.singleUse && result.codeId && result.claimSecret) {
        // Legacy dot-signed single-use keys must be redeemed atomically in Firestore (/access-codes + /accessGrants)
        // so one unique code can only ever unlock 1 Google account once.
        return NextResponse.json({
          unlocked: false,
          requiresFirestoreRedeem: true,
          codeId: result.codeId,
          claimSecret: result.claimSecret,
          planType: result.planType,
          provider: 'license',
        });
      }
      unlocked = true;
      planType = result.planType;
      provider = result.provider;
    }
  } else {
    return NextResponse.json(
      { unlocked: false, errorCode: 'missing_credentials' },
      { status: 400 }
    );
  }

  if (!unlocked) {
    return NextResponse.json(
      { unlocked: false, errorCode: 'invalid_code_or_payment' },
      { status: 403 }
    );
  }

  const token = signEntitlementToken(caller.uid, planType, provider, secret);
  const response = NextResponse.json({
    unlocked: true,
    planType,
    provider,
  });

  response.cookies.set(ENTITLEMENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
