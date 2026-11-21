import { NextRequest, NextResponse } from 'next/server';
import firebaseConfig from '@/firebase-applet-config.json';
import {
  sanitizeExternalCheckoutUrl,
  verifyFirebaseIdToken,
} from '@/lib/billing/access-token';

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

function resolveAppBaseUrl(req: NextRequest): string {
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl && envUrl !== 'MY_APP_URL' && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '');
  }
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  const forwardedHost = req.headers.get('x-forwarded-host');
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
  }
  return req.nextUrl.origin.replace(/\/$/, '');
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

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const stripePriceId = process.env.STRIPE_PRICE_ID?.trim();

  if (stripeSecretKey && stripePriceId) {
    try {
      const baseUrl = resolveAppBaseUrl(req);
      const body = new URLSearchParams({
        mode: 'payment',
        'line_items[0][price]': stripePriceId,
        'line_items[0][quantity]': '1',
        client_reference_id: caller.uid,
        success_url: `${baseUrl}/?checkout_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?checkout_canceled=1`,
      });
      if (caller.email) {
        body.set('customer_email', caller.email);
      }

      const stripeRes = await fetch(
        'https://api.stripe.com/v1/checkout/sessions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      if (!stripeRes.ok) {
        return NextResponse.json(
          { configured: true, error: 'Failed to create Stripe checkout session.' },
          { status: 502 }
        );
      }

      const sessionData = (await stripeRes.json()) as {
        id?: string;
        url?: string;
      };
      const safeUrl = sanitizeExternalCheckoutUrl(sessionData.url);
      if (!safeUrl) {
        return NextResponse.json(
          { configured: true, error: 'Invalid checkout redirect URL.' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        configured: true,
        provider: 'stripe',
        url: safeUrl,
      });
    } catch {
      return NextResponse.json(
        { configured: true, error: 'Payment gateway request failed.' },
        { status: 502 }
      );
    }
  }

  const externalUrl = sanitizeExternalCheckoutUrl(
    process.env.PAYMENT_CHECKOUT_URL
  );
  if (externalUrl) {
    return NextResponse.json({
      configured: true,
      provider: 'external',
      url: externalUrl,
    });
  }

  return NextResponse.json({
    configured: false,
    message:
      'Checkout gateway belum dikonfigurasi. Gunakan kode akses pembeli atau konfirmasi pembayaran manual.',
  });
}
