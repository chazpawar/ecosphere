import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirectUrl') || '/';

    // Check if required environment variables are set
    if (!process.env.AUTH_SECRET) {
      console.error('AUTH_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Authentication not configured properly' },
        { status: 500 }
      );
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error('NEXTAUTH_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Authentication URL not configured' },
        { status: 500 }
      );
    }

    // Validate and decode the redirect URL
    let decodedRedirectUrl: string;
    try {
      decodedRedirectUrl = decodeURIComponent(redirectUrl);
      // Ensure it's a valid URL or path - only allow relative paths for security
      if (!decodedRedirectUrl.startsWith('/')) {
        decodedRedirectUrl = '/';
      }
      // Remove any potential query parameters that might cause issues
      const url = new URL(decodedRedirectUrl, 'http://localhost');
      decodedRedirectUrl = url.pathname;
    } catch {
      decodedRedirectUrl = '/';
    }

    // Use NextAuth's built-in signin endpoint for guest
    const baseUrl = new URL(request.url).origin;
    const callbackUrl = encodeURIComponent(`${baseUrl}${decodedRedirectUrl}`);

    // Redirect to NextAuth's built-in signin endpoint for guest
    const signInUrl = `${baseUrl}/api/auth/signin/guest?callbackUrl=${callbackUrl}`;
    
    return NextResponse.redirect(signInUrl);
  } catch (error) {
    console.error('Guest authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
