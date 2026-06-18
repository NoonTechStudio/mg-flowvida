import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function SuperAdminLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions);

    // Check for super admin (you can set a specific phone number in env)
    const superAdminPhones = process.env.SUPER_ADMIN_PHONES?.split(',') || [];

    if (!session?.user?.phone || !superAdminPhones.includes(session.user.phone)) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-gray-900 text-white p-4">
                <div className="container mx-auto flex justify-between">
                    <h1 className="text-xl font-bold">GlamFlow Super Admin</h1>
                    <div className="space-x-4">
                        <a href="/super-admin" className="hover:underline">Dashboard</a>
                        <a href="/super-admin/tenants" className="hover:underline">Tenants</a>
                        <a href="/super-admin/tenants/new" className="hover:underline">+ New Tenant</a>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}