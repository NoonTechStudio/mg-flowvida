import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['OWNER', 'MANAGER'].includes(session.user.role || '')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await request.json();

        // Confirm the staff member belongs to the same tenant
        const target = await prisma.user.findFirst({
            where: { id, tenantId: session.user.tenantId },
        });
        if (!target) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        // Owner cannot change another owner's password
        if (target.role === 'OWNER' && target.id !== session.user.id) {
            return NextResponse.json({ error: 'Cannot modify another owner account' }, { status: 403 });
        }

        const { newPassword, ...rest } = body;

        // Build update payload — hash password if provided
        const updateData: Record<string, unknown> = { ...rest };
        if (newPassword) {
            if (newPassword.length < 4) {
                return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
            }
            updateData.passwordHash = await hashPassword(newPassword);
            updateData.mustChangePassword = true;
        }

        delete updateData.passwordHash_raw;

        const staff = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                isActive: true,
                mustChangePassword: true,
            },
        });

        revalidateTag(`staff-${session.user.tenantId}`, {});
        return NextResponse.json({ staff });
    } catch (error) {
        console.error('Update staff error:', error);
        return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['OWNER', 'MANAGER'].includes(session.user.role || '')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
        const { id } = await params;

        const target = await prisma.user.findFirst({
            where: { id, tenantId: session.user.tenantId },
        });
        if (!target) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        if (target.role === 'OWNER') return NextResponse.json({ error: 'Cannot remove the owner account' }, { status: 403 });

        // Soft delete — keeps historical appointment data intact
        await prisma.user.update({
            where: { id },
            data: { isActive: false },
        });

        revalidateTag(`staff-${session.user.tenantId}`, {});
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete staff error:', error);
        return NextResponse.json({ error: 'Failed to remove staff member' }, { status: 500 });
    }
}
