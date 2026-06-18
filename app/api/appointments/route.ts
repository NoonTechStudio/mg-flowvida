import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { format, parseISO, addMinutes } from 'date-fns';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    let dateFilter = {}
    if (dateStr) {
        const date = parseISO(dateStr);
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        dateFilter = { appointmentDate: { gte: start, lte: end } };
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            tenantId,
            ...dateFilter,
            ...(session.user.role === 'STAFF' ? { staffId: session.user.id } : {})
        },
        include: {
            customer: { select: { name: true, phone: true } },
            service: { select: { name: true, price: true, durationMinutes: true, color: true } },
            staff: { select: { name: true } },
        },
        orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ appointments });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { customerName, customerPhone, serviceId, staffId, date, time, notes, tenantId } = body;

        if (!serviceId || !date || !time) {
            return NextResponse.json({ error: 'Service, date, and time are required' }, { status: 400 });
        }

        const effectiveTenantId = tenantId || session.user.tenantId;

        // Get service for duration
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

        // Parse datetime
        const appointmentDate = parseISO(date);
        const [hours, minutes] = time.split(':').map(Number);
        const startTime = new Date(appointmentDate);
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = addMinutes(startTime, service.durationMinutes);

        // Find or create customer
        let customerId: string | undefined;
        if (customerPhone) {
            const cleanPhone = customerPhone.replace(/\D/g, '');
            let customer = await prisma.customer.findFirst({
                where: { tenantId: effectiveTenantId, phone: cleanPhone }
            });
            if (customer) {
                // Update name if a new name was provided
                if (customerName && customerName.trim() && customerName.trim() !== customer.name) {
                    customer = await prisma.customer.update({
                        where: { id: customer.id },
                        data: { name: customerName.trim() }
                    });
                }
            } else if (cleanPhone) {
                customer = await prisma.customer.create({
                    data: {
                        tenantId: effectiveTenantId,
                        name: customerName || 'Guest',
                        phone: cleanPhone,
                    }
                });
            }
            customerId = customer?.id;
        }

        const appointment = await prisma.appointment.create({
            data: {
                tenantId: effectiveTenantId,
                customerId: customerId || null,
                serviceId,
                staffId: staffId || null,
                appointmentDate,
                startTime,
                endTime,
                notes: notes || null,
                status: 'CONFIRMED',
            },
            include: {
                customer: { select: { name: true, phone: true } },
                service: { select: { name: true, price: true, durationMinutes: true, color: true } },
                staff: { select: { name: true } },
            }
        });

        return NextResponse.json({ appointment }, { status: 201 });
    } catch (error: any) {
        console.error('Create appointment error:', error);
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }
}
