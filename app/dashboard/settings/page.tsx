'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');
    if (!['OWNER', 'MANAGER'].includes(session.user.role || '')) redirect('/dashboard');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const [tenant, settings] = await Promise.all([
        prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true, businessName: true, ownerName: true, ownerPhone: true, ownerEmail: true, plan: true, subdomain: true }
        }),
        prisma.settings.findUnique({
            where: { tenantId },
        }),
    ]);

    if (!tenant) redirect('/login');

    return <SettingsClient tenant={tenant} settings={settings} />;
}
