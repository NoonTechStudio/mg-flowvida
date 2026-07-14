import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { maxStaffForPlan } from '@/lib/trial';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = session.user.tenantId;
    const staff = await prisma.user.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            _count: { select: { appointments: true } },
        },
    });

    return NextResponse.json({ staff });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['OWNER', 'MANAGER'].includes(session.user.role || '')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, phone, role, email, password } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
        }
        if (!password || password.length < 4) {
            return NextResponse.json({ error: 'A demo password (min 4 characters) is required' }, { status: 400 });
        }

        const tenantId = session.user.tenantId;

        // Enforce seat limit based on current plan
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { subscriptionPlan: true, subscriptionStatus: true },
        });

        const plan = tenant?.subscriptionPlan || tenant?.subscriptionStatus || 'trial';
        const maxStaff = maxStaffForPlan(plan);

        // Count existing non-owner staff
        const currentStaffCount = await prisma.user.count({
            where: { tenantId, isActive: true, role: { not: 'OWNER' } },
        });

        if (currentStaffCount >= maxStaff) {
            return NextResponse.json(
                {
                    code: 'SEAT_LIMIT_REACHED',
                    error: `Your ${plan} plan allows up to ${maxStaff} staff members. Upgrade your plan to add more.`,
                },
                { status: 403 }
            );
        }

        const cleanPhone = phone.replace(/\D/g, '');

        const existing = await prisma.user.findFirst({
            where: { tenantId, phone: cleanPhone },
        });
        if (existing) {
            return NextResponse.json({ error: 'A staff member with this phone already exists' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);

        const staff = await prisma.user.create({
            data: {
                tenantId,
                name,
                phone: cleanPhone,
                role: role || 'STAFF',
                email: email || null,
                passwordHash,
                mustChangePassword: true, // staff must set their own password on first login
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                mustChangePassword: true,
                createdAt: true,
            },
        });

        revalidateTag(`staff-${tenantId}`, {});
        return NextResponse.json({ staff }, { status: 201 });
    } catch (error: any) {
        console.error('Create staff error:', error);
        return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
    }
}
