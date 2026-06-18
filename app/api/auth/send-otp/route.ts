import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { phone } = await request.json();

        if (!phone || phone.replace(/\D/g, '').length !== 10) {
            return NextResponse.json({ error: 'Valid 10-digit phone number is required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');

        // In demo mode, find the demo tenant
        const tenant = await prisma.tenant.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'No parlor found. Please run the seed script first.' }, { status: 404 });
        }

        // Check if user is registered in this tenant or is the owner
        const user = await prisma.user.findFirst({
            where: { tenantId: tenant.id, phone: cleanPhone }
        });

        const isOwner = tenant.ownerPhone === cleanPhone;

        if (!user && !isOwner) {
            return NextResponse.json({ error: 'Phone number not registered with this parlor' }, { status: 404 });
        }

        // Generate and store OTP
        const otp = generateOTP();
        storeOTP(cleanPhone, otp);

        // Log OTP to console for demo
        console.log(`\n==========================================`);
        console.log(`  OTP for ${cleanPhone}: ${otp}`);
        console.log(`  Parlor: ${tenant.businessName}`);
        console.log(`==========================================\n`);

        return NextResponse.json({
            success: true,
            message: 'OTP sent',
            // Demo mode: expose OTP so it can be shown on the verify screen
            // In production, remove this and send via SMS/WhatsApp instead
            demoOtp: otp,
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
