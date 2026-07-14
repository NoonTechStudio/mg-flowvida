import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { StaffClient } from './StaffClient';
import { getCachedAllStaff } from '@/lib/queries';

export default async function StaffPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    if (!['OWNER', 'MANAGER'].includes(session.user.role || '')) {
        redirect('/');
    }

    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return <div>Invalid tenant</div>;

    const staff = await getCachedAllStaff(tenantId);

    return <StaffClient initialStaff={staff} tenantId={tenantId} />;
}
