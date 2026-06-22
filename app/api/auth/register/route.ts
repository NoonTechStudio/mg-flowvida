import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateOTP, storeOTP } from '@/lib/auth'
import { sendOTPViaSMS } from '@/lib/sms'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30)
}

export async function POST(request: NextRequest) {
  try {
    const { parlorName, ownerName, phone } = await request.json()

    if (!parlorName?.trim() || !ownerName?.trim() || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Valid 10-digit phone number is required' }, { status: 400 })
    }

    // Check if phone already registered
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

    // Build a unique subdomain
    const baseSlug = slugify(parlorName) || 'parlor'
    const random = Math.random().toString(36).slice(2, 6)
    let subdomain = `${baseSlug}-${random}`

    // Ensure subdomain uniqueness
    const taken = await prisma.tenant.findUnique({ where: { subdomain } })
    if (taken) subdomain = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

    // Set trial to 7 days from now
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Create tenant + owner user in one transaction
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          subdomain,
          businessName: parlorName.trim(),
          ownerName: ownerName.trim(),
          ownerPhone: cleanPhone,
        },
      })

      await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: ownerName.trim(),
          phone: cleanPhone,
          role: 'OWNER',
        },
      })
    })

    // Send OTP so they can complete login immediately
    const otp = generateOTP()
    storeOTP(cleanPhone, otp)
    const smsSent = await sendOTPViaSMS(cleanPhone, otp)

    if (!smsSent) {
      console.log(`\n==========================================`)
      console.log(`  Registration OTP for ${cleanPhone}: ${otp}`)
      console.log(`==========================================\n`)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created. OTP sent.',
      ...(!smsSent && { demoOtp: otp }),
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
