import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendOTPViaSMS } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit phone number is required' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\D/g, '')

    // Find user across all active tenants
    const user = await prisma.user.findFirst({
      where: { phone: cleanPhone, isActive: true },
      include: { tenant: { select: { isActive: true } } },
    })

    // Also check if they are a tenant owner (auto-creates user on first login)
    const ownerTenant = !user
      ? await prisma.tenant.findFirst({
          where: { ownerPhone: cleanPhone, isActive: true },
        })
      : null

    if (!user && !ownerTenant) {
      return NextResponse.json(
        { code: 'NOT_REGISTERED', error: 'This number is not registered. Please sign up first.' },
        { status: 404 }
      )
    }

    const otp = generateOTP()
    await storeOTP(cleanPhone, otp)

    // Try SMS; fall back gracefully
    const smsSent = await sendOTPViaSMS(cleanPhone, otp)

    if (!smsSent) {
      console.log(`\n==========================================`)
      console.log(`  OTP for ${cleanPhone}: ${otp}`)
      console.log(`==========================================\n`)
    }

    // Show OTP on screen when SMS is not configured (no provider set up yet)
    const showOtpOnScreen = !smsSent

    return NextResponse.json({
      success: true,
      message: smsSent ? 'OTP sent via SMS' : 'OTP generated',
      ...(showOtpOnScreen && { demoOtp: otp }),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
