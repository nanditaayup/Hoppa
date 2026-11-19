import { NextRequest, NextResponse } from 'next/server';

function resolveBaseUrl(req: NextRequest): string {
  const envUrl = process.env.APP_URL;
  if (envUrl && envUrl !== 'MY_APP_URL' && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '');
  }
  return req.nextUrl.origin.replace(/\/$/, '');
}

export async function GET(req: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const baseUrl = resolveBaseUrl(req);
  const redirectUri = `${baseUrl}/api/strava/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      configured: false,
      redirectUri,
      message:
        'OAuth Strava API bersifat opsional. Gunakan Impor CSV / GPX gratis atau isi STRAVA_CLIENT_ID & STRAVA_CLIENT_SECRET di environment.',
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  });

  return NextResponse.json({
    configured: true,
    redirectUri,
    url: `https://www.strava.com/oauth/authorize?${params.toString()}`,
  });
}
