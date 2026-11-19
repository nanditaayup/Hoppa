import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="id">
  <body style="font-family: sans-serif; padding: 24px; color: #334155;">
    <p>Otorisasi Strava dibatalkan atau gagal. Anda dapat menutup jendela ini.</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'STRAVA_OAUTH_ERROR', error: 'access_denied' }, '*');
        window.close();
      }
    </script>
  </body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="id">
  <body style="font-family: sans-serif; padding: 24px; color: #334155;">
    <p>Kredensial Strava belum dikonfigurasi di server.</p>
  </body>
</html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Gagal menukar kode otorisasi Strava.');
    }

    const tokenData = await tokenRes.json();
    const accessToken = String(tokenData.access_token || '');

    const html = `<!DOCTYPE html>
<html lang="id">
  <body style="font-family: sans-serif; padding: 24px; color: #334155;">
    <p>Koneksi Strava berhasil. Jendela ini akan tertutup otomatis.</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'STRAVA_OAUTH_SUCCESS' }, '*');
        window.close();
      } else {
        window.location.href = '/';
      }
    </script>
  </body>
</html>`;

    const response = new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

    response.cookies.set('pacecraft_strava_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 60 * 60 * 6,
    });

    return response;
  } catch {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="id">
  <body style="font-family: sans-serif; padding: 24px; color: #b91c1c;">
    <p>Gagal menyambungkan akun Strava. Silakan coba lagi atau gunakan impor CSV/GPX.</p>
  </body>
</html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
