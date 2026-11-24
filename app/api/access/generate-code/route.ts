import { NextRequest, NextResponse } from 'next/server';
import firebaseConfig from '@/firebase-applet-config.json';
import {
  generateAccessCodeString,
  verifyFirebaseIdToken,
} from '@/lib/billing/access-token';
import { AccessPlanType } from '@/lib/strava/types';

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

  if (!caller.isOwner) {
    return NextResponse.json(
      { error: 'Forbidden: Owner admin privileges required.' },
      { status: 403 }
    );
  }

  let planType: AccessPlanType = 'lifetime';
  try {
    const body = (await req.json()) as { planType?: unknown };
    if (body.planType === 'pro') {
      planType = 'pro';
    }
  } catch {
    // Default to lifetime
  }

  const licenseKey = generateAccessCodeString(planType);

  return NextResponse.json({
    licenseKey,
    codeId: licenseKey,
    planType,
  });
}
