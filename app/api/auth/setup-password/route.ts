import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// One-time password setup for existing users who have no passwordHash.
// Safe: refuses to overwrite an existing password — use forgot-password for that.
export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    const user = await prisma.user.findFirst({
      where: { phone: cleanPhone, isActive: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'No account found for this number' }, { status: 404 })
    }

    // Only allow this if no password is set yet — security guard
    if (user.passwordHash) {
      return NextResponse.json(
        { error: 'Password already set. Use forgot password to reset it.' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({ success: true, message: 'Password set. You can now sign in.' })
  } catch (error) {
    console.error('Setup password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
