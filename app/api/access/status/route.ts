import { NextRequest, NextResponse } from 'next/server';
import firebaseConfig from '@/firebase-applet-config.json';
import {
  ENTITLEMENT_COOKIE_NAME,
  getServerSigningSecret,
  sanitizeExternalCheckoutUrl,
  verifyEntitlementToken,
  verifyFirebaseIdToken,
} from '@/lib/billing/access-token';

export async function GET(req: NextRequest) {
  const caller = await verifyFirebaseIdToken(
    req.headers.get('authorization'),
    firebaseConfig.projectId
  );

  if (!caller) {
    return NextResponse.json(
      { error: 'Unauthorized: valid Firebase ID token required.' },
      { status: 401 }
    );
  }

  const secret = getServerSigningSecret();
  const cookieToken = req.cookies.get(ENTITLEMENT_COOKIE_NAME)?.value;
  const entitlement = verifyEntitlementToken(cookieToken, caller.uid, secret);

  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_PRICE_ID?.trim()
  );
  const externalCheckoutUrl = sanitizeExternalCheckoutUrl(
    process.env.PAYMENT_CHECKOUT_URL
  );
  const checkoutConfigured = stripeConfigured || Boolean(externalCheckoutUrl);

  const hasPasscodeEnv = Boolean(
    process.env.BUYER_ACCESS_CODE?.trim() ||
      process.env.BUYER_ACCESS_CODES?.trim() ||
      process.env.ACCESS_SIGNING_SECRET?.trim()
  );

  return NextResponse.json({
    isOwner: caller.isOwner,
    hasServerEntitlement: caller.isOwner || Boolean(entitlement),
    planType: entitlement?.planType ?? (caller.isOwner ? 'pro' : null),
    provider: entitlement?.provider ?? (caller.isOwner ? 'owner' : null),
    checkoutConfigured,
    stripeConfigured,
    checkoutUrl: stripeConfigured ? null : externalCheckoutUrl,
    hasAccessCodeSupport: hasPasscodeEnv,
    manualConfirmationEnabled: true,
  });
}
