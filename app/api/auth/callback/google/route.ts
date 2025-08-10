import { NextRequest, NextResponse } from 'next/server';
import { OAuthService } from '@/lib/oauth-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(new URL(`/account?error=${encodeURIComponent(error)}`, request.url));
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(new URL('/account?error=missing_parameters', request.url));
  }

  try {
    // Process the OAuth callback
    const result = await OAuthService.handleOAuthCallback('google-calendar', code, state);
    
    if (result.success) {
      return NextResponse.redirect(new URL('/account?connected=google-calendar', request.url));
    } else {
      return NextResponse.redirect(new URL(`/account?error=${encodeURIComponent(result.error || 'oauth_failed')}`, request.url));
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/account?error=callback_failed', request.url));
  }
} 