import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Plus, Building2 } from 'lucide-react';

export default async function TenantsPage() {
    const tenants = await prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { users: true, appointments: true } },
        },
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Tenants</h1>
                        <p className="text-gray-500 text-sm">{tenants.length} parlors registered</p>
                    </div>
                    <Link
                        href="/super-admin/tenants/new"
                        className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Tenant
                    </Link>
                </div>

                <div className="bg-white rounded-xl border divide-y">
                    {tenants.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No tenants yet. Add your first parlor.</p>
                        </div>
                    ) : (
                        tenants.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{t.businessName}</p>
                                    <p className="text-sm text-gray-500">{t.subdomain}.flowvida.com · {t.ownerPhone}</p>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span>{t._count.users} staff</span>
                                    <span>{t._count.appointments} bookings</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {t.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {t.plan}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
