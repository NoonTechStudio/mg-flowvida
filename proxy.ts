import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that are fully public (no auth needed)
const PUBLIC_PATHS = ['/login', '/verify', '/api/auth', '/_next', '/favicon.ico', '/book/'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static assets and public paths
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // API routes (except auth) — pass through, they handle auth themselves
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Protected routes: /dashboard and (dashboard) group routes
    const isProtected =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/appointments') ||
        pathname.startsWith('/customers') ||
        pathname.startsWith('/services') ||
        pathname.startsWith('/staff') ||
        pathname.startsWith('/reports');

    if (isProtected) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Inject tenant headers for server components to read
        const requestHeaders = new Headers(request.headers);
        if (token.tenantId) {
            requestHeaders.set('x-tenant-id', token.tenantId as string);
            requestHeaders.set('x-tenant-subdomain', (token.tenantSubdomain as string) || 'demo');
        }
        if (token.id) {
            requestHeaders.set('x-user-id', token.id as string);
        }
        if (token.role) {
            requestHeaders.set('x-user-role', token.role as string);
        }

        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
