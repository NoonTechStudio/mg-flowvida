import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/subscribe', '/welcome', '/forgot-password', '/reset-password', '/set-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public pages, auth API, and public booking widget
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/book')
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Inject tenant/user headers for server components
  const requestHeaders = new Headers(request.headers)
  if (token.tenantId) {
    requestHeaders.set('x-tenant-id', token.tenantId as string)
    requestHeaders.set('x-tenant-subdomain', (token.tenantSubdomain as string) || 'demo')
  }
  if (token.id) {
    requestHeaders.set('x-user-id', token.id as string)
  }
  if (token.role) {
    requestHeaders.set('x-user-role', token.role as string)
  }

  // Subscription validity is checked in server-component layouts (Prisma not
  // available in Edge runtime used here).
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)',
  ],
}
