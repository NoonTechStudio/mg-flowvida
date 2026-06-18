import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json();

        const staff = await prisma.user.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ staff });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
    }
}
