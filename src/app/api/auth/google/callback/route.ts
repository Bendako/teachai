import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This will be the teacherId
  const error = searchParams.get('error');

  if (error) {
    // Handle OAuth error
    return NextResponse.redirect(
      new URL(`/?error=oauth_error&message=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`/?error=missing_params&message=${encodeURIComponent('Missing authorization code or state')}`, request.url)
    );
  }

  // Redirect back to the app with the authorization code and teacherId
  const redirectUrl = new URL('/', request.url);
  redirectUrl.searchParams.set('auth_code', code);
  redirectUrl.searchParams.set('teacher_id', state);
  redirectUrl.searchParams.set('oauth_provider', 'google');

  return NextResponse.redirect(redirectUrl);
} 