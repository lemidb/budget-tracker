// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

// Define public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/signup', '/'];
const publicApiRoutes = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/logout'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes and public API routes
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Get the access token from cookies
  const token = request.cookies.get('accessToken')?.value;

  // If no token, redirect to login (for pages) or return 401 (for API routes)
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Prevent redirect loop - don't redirect if already going to login/signup
    if (pathname === '/auth/login' || pathname === '/auth/signup') {
      return NextResponse.next();
    }
    // Immediately redirect to login - this happens before any page rendering
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Verify the token
  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Clear the invalid token cookie and redirect
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

