import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = session.user.tenantId;
    const staff = await prisma.user.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { appointments: true } }
        }
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
        const { name, phone, role, email, tenantId } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        const effectiveTenantId = tenantId || session.user.tenantId;

        // Check for duplicate phone
        const existing = await prisma.user.findFirst({
            where: { tenantId: effectiveTenantId, phone }
        });

        if (existing) {
            return NextResponse.json({ error: 'Staff with this phone already exists' }, { status: 409 });
        }

        const staff = await prisma.user.create({
            data: {
                tenantId: effectiveTenantId,
                name,
                phone,
                role: role || 'STAFF',
                email: email || null,
            }
        });

        return NextResponse.json({ staff }, { status: 201 });
    } catch (error: any) {
        console.error('Create staff error:', error);
        return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
    }
}
