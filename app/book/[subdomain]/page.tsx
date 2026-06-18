import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BookingWizard } from '@/components/booking/BookingWizard';

// Next.js 16: params is a Promise
export default async function BookingPage({ params }: { params: Promise<{ subdomain: string }> }) {
    const { subdomain } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { subdomain, isActive: true },
        include: {
            settings: true,
            services: {
                where: { isActive: true },
                orderBy: { category: 'asc' }
            },
            users: {
                where: {
                    role: { in: ['STAFF', 'OWNER'] },
                    isActive: true
                },
                select: { id: true, name: true }
            }
        }
    });

    if (!tenant) notFound();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-black text-sm">
                            {tenant.businessName.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-tight">{tenant.businessName}</p>
                        <p className="text-xs text-gray-400">Book an appointment</p>
                    </div>
                </div>
            </header>

            {/* Wizard */}
            <div className="max-w-lg mx-auto">
                <BookingWizard
                    tenant={tenant}
                    services={tenant.services}
                    staff={tenant.users}
                    settings={tenant.settings}
                />
            </div>
        </div>
    );
}
