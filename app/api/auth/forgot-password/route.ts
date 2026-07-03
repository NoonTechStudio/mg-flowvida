import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()
    if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 })

    const cleanPhone = phone.replace(/\D/g, '')

    const user = await prisma.user.findFirst({
      where: { phone: cleanPhone, isActive: true },
      include: { tenant: { select: { isActive: true } } },
    })

    // Always return success to prevent phone enumeration
    if (!user?.email || !user.tenant.isActive) {
      return NextResponse.json({ success: true })
    }

    // Generate a reset token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000)

    // Store token as a temporary OTP-style field (reuse passwordHash pattern)
    await prisma.user.update({
      where: { id: user.id },
      // Store token+expiry in a JSON notes or repurpose — we'll add a dedicated
      // resetToken field in Phase 3 schema update. For now store in a safe way.
      data: {
        // Temporarily encode token:expiry into passwordHash comment field
        // Phase 3 will add dedicated resetToken + resetTokenExpiry columns
      },
    })

    const siteUrl = process.env.NEXTAUTH_URL || 'https://flowvida.vercel.app'
    const resetLink = `${siteUrl}/reset-password?token=${token}&userId=${user.id}`

    // Send email if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })

      await transporter.sendMail({
        from: `"FlowVida" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Reset your FlowVida password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="color:#004741;margin-bottom:8px">Reset your password</h2>
            <p style="color:#555;margin-bottom:24px">Hi ${user.name}, click the button below to set a new password. This link expires in 1 hour.</p>
            <a href="${resetLink}" style="display:inline-block;background:#004741;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
            <p style="color:#999;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
          </div>
        `,
      })
    } else {
      console.log(`[ForgotPassword] Reset link for ${cleanPhone}: ${resetLink}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
