import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Verify super admin
        const session = await getServerSession(authOptions);
        const superAdminPhones = process.env.SUPER_ADMIN_PHONES?.split(',') || [];

        if (!session?.user?.phone || !superAdminPhones.includes(session.user.phone)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const data = await request.json();

        // Create tenant
        const tenant = await prisma.tenant.create({
            data: {
                subdomain: data.subdomain,
                businessName: data.businessName,
                ownerName: data.ownerName,
                ownerPhone: data.ownerPhone,
                ownerEmail: data.ownerEmail,
                plan: data.plan,

                // Create default settings
                settings: {
                    create: {
                        workingHours: {
                            monday: { start: '10:00', end: '20:00' },
                            tuesday: { start: '10:00', end: '20:00' },
                            wednesday: { start: '10:00', end: '20:00' },
                            thursday: { start: '10:00', end: '20:00' },
                            friday: { start: '10:00', end: '20:00' },
                            saturday: { start: '10:00', end: '20:00' },
                            sunday: null
                        },
                        slotDuration: 30,
                        bufferTime: 10
                    }
                },

                // Create default services
                services: {
                    createMany: {
                        data: [
                            { name: 'Facial', category: 'SKIN', price: 800, durationMinutes: 45 },
                            { name: 'Cleanup', category: 'SKIN', price: 500, durationMinutes: 30 },
                            { name: 'Threading', category: 'HAIR', price: 50, durationMinutes: 15 },
                            { name: 'Waxing', category: 'HAIR', price: 300, durationMinutes: 30 },
                            { name: 'Manicure', category: 'NAILS', price: 400, durationMinutes: 45 },
                            { name: 'Pedicure', category: 'NAILS', price: 500, durationMinutes: 60 }
                        ]
                    }
                }
            }
        });

        // Create owner user
        await prisma.user.create({
            data: {
                tenantId: tenant.id,
                name: data.ownerName,
                phone: data.ownerPhone,
                email: data.ownerEmail,
                role: 'OWNER'
            }
        });

        return NextResponse.json(tenant, { status: 201 });

    } catch (error) {
        console.error('Create tenant error:', error);
        return NextResponse.json(
            { error: 'Failed to create tenant' },
            { status: 500 }
        );
    }
}