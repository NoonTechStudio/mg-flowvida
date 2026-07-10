import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { addMinutes } from 'date-fns';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);
    const dateStr  = searchParams.get('date');
    const upcoming = searchParams.get('upcoming'); // number of days ahead

    let dateFilter: any = {}
    if (upcoming) {
        // Fetch appointments from tomorrow through N days ahead
        const days = parseInt(upcoming) || 7
        const from = new Date(); from.setDate(from.getDate() + 1); from.setHours(0, 0, 0, 0)
        const to   = new Date(); to.setDate(to.getDate() + days); to.setHours(23, 59, 59, 999)
        dateFilter = {
            appointmentDate: { gte: from, lte: to },
            status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        }
    } else if (dateStr) {
        // Use IST midnight boundaries so Indian dates match correctly
        dateFilter = {
            appointmentDate: {
                gte: new Date(`${dateStr}T00:00:00+05:30`),
                lte: new Date(`${dateStr}T23:59:59+05:30`),
            }
        }
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            tenantId,
            ...dateFilter,
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

        // Parse date+time as IST (UTC+5:30) so the stored UTC is correct.
        // setHours() on a UTC server would store the wrong hour otherwise.
        const startTime = new Date(`${date}T${time}:00+05:30`)
        const endTime = addMinutes(startTime, service.durationMinutes)
        const appointmentDate = new Date(`${date}T00:00:00+05:30`)

        // Find or create customer
        let customerId: string | undefined;
        if (customerPhone) {
            const cleanPhone = customerPhone.replace(/\D/g, '');
            if (cleanPhone) {
                const customer = await prisma.customer.upsert({
                    where: { tenantId_phone: { tenantId: effectiveTenantId, phone: cleanPhone } },
                    update: customerName?.trim() ? { name: customerName.trim() } : {},
                    create: {
                        tenantId: effectiveTenantId,
                        name: customerName?.trim() || 'Guest',
                        phone: cleanPhone,
                    },
                });
                customerId = customer.id;
            }
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
