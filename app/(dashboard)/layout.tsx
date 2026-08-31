import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { headers } from 'next/headers';
import { getSubscriptionState } from '@/lib/trial';
import { getCachedTenant } from '@/lib/queries';

export default async function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    // Force-change-password redirect for staff on demo password
    if (session.user.mustChangePassword) redirect('/set-password');

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    let businessName = 'Beauty Parlor'
    let subStatus: 'trial' | 'active' | 'expired' = 'trial'
    let daysLeft = 7

    if (tenantId) {
        const tenant = await getCachedTenant(tenantId)

        if (tenant) {
            businessName = tenant.businessName
            const state = getSubscriptionState(tenant)

            if (state.status === 'expired') {
                redirect('/subscribe')
            }

            subStatus = state.status
            daysLeft = state.daysLeft
        }
    }

    return (
        <DashboardShell
            userRole={session.user.role || 'STAFF'}
            user={session.user}
            businessName={businessName}
            subscriptionStatus={subStatus}
            trialDaysRemaining={daysLeft}
        >
            {children}
        </DashboardShell>
    );
}
