import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = session.user.tenantId;
    const services = await prisma.service.findMany({
        where: { tenantId },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { name, category, price, durationMinutes, description, color, tenantId } = body;

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
        }

        const effectiveTenantId = tenantId || session.user.tenantId;

        const service = await prisma.service.create({
            data: {
                tenantId: effectiveTenantId,
                name,
                category: category || 'OTHER',
                price: parseFloat(price),
                durationMinutes: parseInt(durationMinutes) || 30,
                description: description || null,
                color: color || '#7c3aed',
            }
        });

        revalidateTag(`services-${effectiveTenantId}`);
        return NextResponse.json({ service }, { status: 201 });
    } catch (error: any) {
        console.error('Create service error:', error);
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}
