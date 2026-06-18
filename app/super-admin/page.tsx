import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Building2, Users, Plus } from 'lucide-react';

export default async function SuperAdminPage() {
    const [tenantCount, userCount] = await Promise.all([
        prisma.tenant.count(),
        prisma.user.count(),
    ]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">FlowVida Admin</h1>
                <p className="text-gray-500 mb-8">Manage all tenants and platform settings</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl border p-6">
                        <Building2 className="w-8 h-8 text-violet-600 mb-3" />
                        <p className="text-3xl font-bold">{tenantCount}</p>
                        <p className="text-gray-500 text-sm mt-1">Active Parlors</p>
                    </div>
                    <div className="bg-white rounded-xl border p-6">
                        <Users className="w-8 h-8 text-emerald-600 mb-3" />
                        <p className="text-3xl font-bold">{userCount}</p>
                        <p className="text-gray-500 text-sm mt-1">Total Users</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link
                        href="/super-admin/tenants"
                        className="bg-violet-600 text-white px-5 py-2.5 rounded-lg hover:bg-violet-700 font-medium"
                    >
                        View All Tenants
                    </Link>
                    <Link
                        href="/super-admin/tenants/new"
                        className="flex items-center gap-2 border border-violet-600 text-violet-600 px-5 py-2.5 rounded-lg hover:bg-violet-50 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Tenant
                    </Link>
                </div>
            </div>
        </div>
    );
}
