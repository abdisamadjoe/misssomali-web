import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /portal and /admin routes
  if (pathname.startsWith('/portal') || pathname.startsWith('/admin')) {
    try {
      const cookieHeader = request.headers.get('cookie') || '';
      
      // Make a fetch request to our internal role checking endpoint
      const roleCheckUrl = new URL('/api/auth/role', request.url);
      const res = await fetch(roleCheckUrl, {
        headers: {
          cookie: cookieHeader,
        },
      });

      if (!res.ok) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const data = await res.json();

      if (!data.authenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Check role redirects
      if (pathname.startsWith('/portal')) {
        // Must be contestant
        if (data.role !== 'contestant') {
          if (data.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          }
          // Authenticated but no database user profile - redirect to login to finalize registration
          return NextResponse.redirect(new URL('/login?error=noprofile', request.url));
        }
      }

      if (pathname.startsWith('/admin')) {
        if (data.role !== 'admin') {
          return NextResponse.redirect(new URL('/portal', request.url));
        }
      }

    } catch (error) {
      console.error('Middleware check error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If user is already logged in, redirect them away from /login and /register
  if (pathname === '/login' || pathname === '/register') {
    try {
      const cookieHeader = request.headers.get('cookie') || '';
      const roleCheckUrl = new URL('/api/auth/role', request.url);
      const res = await fetch(roleCheckUrl, {
        headers: {
          cookie: cookieHeader,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          if (data.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          } else if (data.role === 'contestant') {
            return NextResponse.redirect(new URL('/portal', request.url));
          }
        }
      }
    } catch {
      // Ignore errors here
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ],
};
