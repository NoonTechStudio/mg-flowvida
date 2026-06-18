import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const customers = await prisma.customer.findMany({
        where: {
            tenantId,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                ]
            } : {})
        },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { appointments: true } }
        }
    });

    return NextResponse.json({ customers });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { name, phone, email, gender, notes, tenantId } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        const effectiveTenantId = tenantId || session.user.tenantId;

        // Check for duplicate phone
        const existing = await prisma.customer.findFirst({
            where: { tenantId: effectiveTenantId, phone }
        });

        if (existing) {
            return NextResponse.json({ error: 'Customer with this phone already exists' }, { status: 409 });
        }

        const customer = await prisma.customer.create({
            data: {
                tenantId: effectiveTenantId,
                name,
                phone,
                email: email || null,
                gender: gender || null,
                notes: notes || null,
            }
        });

        return NextResponse.json({ customer }, { status: 201 });
    } catch (error: any) {
        console.error('Create customer error:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
