import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['OWNER', 'MANAGER'].includes(session.user.role || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const headersList = await headers();
        const tenantId = headersList.get('x-tenant-id') || session.user.tenantId;
        if (!tenantId) return NextResponse.json({ error: 'No tenant' }, { status: 400 });

        const { businessName, ownerName, ownerEmail, slotDuration, bufferTime, workingHours } = await request.json();

        await Promise.all([
            prisma.tenant.update({
                where: { id: tenantId },
                data: { businessName, ownerName, ownerEmail: ownerEmail || null }
            }),
            prisma.settings.upsert({
                where: { tenantId },
                update: { slotDuration, bufferTime, workingHours },
                create: { tenantId, slotDuration, bufferTime, workingHours }
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Settings save error:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
