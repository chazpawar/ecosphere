import { signIn } from '@/app/(auth)/auth';
import { isDevelopmentEnvironment } from '@/lib/constants';
import { getToken } from 'next-auth/jwt';
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

    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: !isDevelopmentEnvironment,
    });

    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return await signIn('guest', { redirect: true, redirectTo: redirectUrl });
  } catch (error) {
    console.error('Guest authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
