import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json();
        const { name, category, price, durationMinutes, description, color } = body;

        const service = await prisma.service.update({
            where: { id },
            data: {
                name,
                category,
                price: parseFloat(price),
                durationMinutes: parseInt(durationMinutes),
                description: description || null,
                color: color || '#7c3aed',
            }
        });

        revalidateTag(`services-${session.user.tenantId}`);
        return NextResponse.json({ service });
    } catch (error) {
        console.error('Update service error:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json();

        const service = await prisma.service.update({
            where: { id },
            data: body,
        });

        revalidateTag(`services-${session.user.tenantId}`);
        return NextResponse.json({ service });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        await prisma.service.delete({ where: { id } });
        revalidateTag(`services-${session.user.tenantId}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
