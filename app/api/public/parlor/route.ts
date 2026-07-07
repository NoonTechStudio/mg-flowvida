import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/public/parlor?subdomain=xxx
// Returns basic parlor info + services for the public booking page
export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get('subdomain')
  if (!subdomain) return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 })

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: {
      id: true,
      businessName: true,
      area: true,
      city: true,
      isActive: true,
      subscriptionStatus: true,
      trialEndDate: true,
      subscriptionEndDate: true,
      services: {
        where: { isActive: true },
        select: { id: true, name: true, category: true, price: true, durationMinutes: true, color: true },
        orderBy: { category: 'asc' },
      },
    },
  })

  if (!tenant || !tenant.isActive) {
    return NextResponse.json({ error: 'Parlor not found' }, { status: 404 })
  }

  // Don't expose booking page for expired accounts
  const expiry = tenant.subscriptionEndDate ?? tenant.trialEndDate
  if (expiry && new Date() > new Date(expiry) && tenant.subscriptionStatus !== 'active') {
    return NextResponse.json({ error: 'Booking is temporarily unavailable' }, { status: 403 })
  }

  return NextResponse.json({
    id: tenant.id,
    businessName: tenant.businessName,
    area: tenant.area,
    city: tenant.city,
    services: tenant.services,
  })
}
