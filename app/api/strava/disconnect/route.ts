import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ disconnected: true });
  response.cookies.set('pacecraft_strava_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 0,
  });
  return response;
}
