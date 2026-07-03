import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30)
}

export async function POST(request: NextRequest) {
  try {
    const { parlorName, ownerName, phone, area, city, password } = await request.json()

    if (!parlorName?.trim() || !ownerName?.trim() || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Valid 10-digit phone number is required' }, { status: 400 })
    }

    const existingTenant = await prisma.tenant.findUnique({ where: { ownerPhone: cleanPhone } })
    if (existingTenant) {
      return NextResponse.json(
        { code: 'ALREADY_REGISTERED', error: 'This number is already registered. Please sign in.' },
        { status: 409 }
      )
    }

    const existingUser = await prisma.user.findFirst({ where: { phone: cleanPhone } })
    if (existingUser) {
      return NextResponse.json(
        { code: 'ALREADY_REGISTERED', error: 'This number is already registered. Please sign in.' },
        { status: 409 }
      )
    }

    const baseSlug = slugify(parlorName) || 'parlor'
    let subdomain = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    const taken = await prisma.tenant.findUnique({ where: { subdomain } })
    if (taken) subdomain = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

    const passwordHash = await hashPassword(password)

    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          subdomain,
          businessName: parlorName.trim(),
          ownerName: ownerName.trim(),
          ownerPhone: cleanPhone,
          area: area?.trim() || null,
          city: city?.trim() || null,
        },
      })

      await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: ownerName.trim(),
          phone: cleanPhone,
          role: 'OWNER',
          passwordHash,
          mustChangePassword: false,
        },
      })

      // Default services
      await tx.service.createMany({
        data: [
          { tenantId: tenant.id, name: 'Haircut', category: 'HAIR', price: 200, durationMinutes: 30, color: '#6366F1' },
          { tenantId: tenant.id, name: 'Hair Colour', category: 'HAIR', price: 800, durationMinutes: 90, color: '#8B5CF6' },
          { tenantId: tenant.id, name: 'Facial', category: 'SKIN', price: 600, durationMinutes: 60, color: '#EC4899' },
          { tenantId: tenant.id, name: 'Waxing (Full Arms)', category: 'SKIN', price: 300, durationMinutes: 30, color: '#F59E0B' },
          { tenantId: tenant.id, name: 'Manicure', category: 'NAILS', price: 400, durationMinutes: 45, color: '#10B981' },
          { tenantId: tenant.id, name: 'Bridal Makeup', category: 'BRIDAL', price: 5000, durationMinutes: 180, color: '#EF4444' },
        ],
      })

      // Default working hours: Mon–Sat 9 AM–8 PM, Sunday closed
      await tx.settings.create({
        data: {
          tenantId: tenant.id,
          workingHours: {
            monday:    { open: true,  start: '09:00', end: '20:00' },
            tuesday:   { open: true,  start: '09:00', end: '20:00' },
            wednesday: { open: true,  start: '09:00', end: '20:00' },
            thursday:  { open: true,  start: '09:00', end: '20:00' },
            friday:    { open: true,  start: '09:00', end: '20:00' },
            saturday:  { open: true,  start: '09:00', end: '20:00' },
            sunday:    { open: false, start: '10:00', end: '18:00' },
          },
          slotDuration: 30,
          bufferTime: 10,
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          taxRate: 0,
        },
      })
    })

    return NextResponse.json({ success: true, message: 'Account created successfully.' })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
