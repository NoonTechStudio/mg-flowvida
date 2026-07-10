import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { addMinutes, addDays, format } from 'date-fns';

// IST midnight for a given date string yyyy-MM-dd
function istDay(dateStr: string) {
    return {
        gte: new Date(`${dateStr}T00:00:00+05:30`),
        lte: new Date(`${dateStr}T23:59:59+05:30`),
    };
}

// Current date in IST as "yyyy-MM-dd"
function todayIST(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // en-CA = yyyy-MM-dd
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const week    = searchParams.get('week'); // "true" → return today+tomorrow+upcoming in one round-trip

    const include = {
        customer: { select: { name: true, phone: true } },
        service:  { select: { name: true, price: true, durationMinutes: true, color: true } },
        staff:    { select: { name: true } },
    };

    // ── Combined week fetch (1 DB round-trip for the Appointments page) ──────
    if (week === 'true') {
        const t0 = todayIST();
        const t1 = format(addDays(new Date(`${t0}T00:00:00+05:30`), 1), 'yyyy-MM-dd');
        const t2 = format(addDays(new Date(`${t0}T00:00:00+05:30`), 2), 'yyyy-MM-dd');
        const t8 = format(addDays(new Date(`${t0}T00:00:00+05:30`), 8), 'yyyy-MM-dd');

        const [today, tomorrow, upcoming] = await Promise.all([
            prisma.appointment.findMany({
                where: { tenantId, appointmentDate: istDay(t0) },
                include, orderBy: { startTime: 'asc' },
            }),
            prisma.appointment.findMany({
                where: { tenantId, appointmentDate: istDay(t1) },
                include, orderBy: { startTime: 'asc' },
            }),
            prisma.appointment.findMany({
                where: {
                    tenantId,
                    appointmentDate: {
                        gte: new Date(`${t2}T00:00:00+05:30`),
                        lte: new Date(`${t8}T23:59:59+05:30`),
                    },
                    status: { notIn: ['CANCELLED', 'NO_SHOW'] },
                },
                include, orderBy: { startTime: 'asc' },
            }),
        ]);

        return NextResponse.json({ today, tomorrow, upcoming });
    }

    // ── Single-date fetch ────────────────────────────────────────────────────
    let dateFilter: any = {};
    if (dateStr) {
        dateFilter = { appointmentDate: istDay(dateStr) };
    }

    const appointments = await prisma.appointment.findMany({
        where: { tenantId, ...dateFilter },
        include,
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

        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

        const startTime     = new Date(`${date}T${time}:00+05:30`);
        const endTime       = addMinutes(startTime, service.durationMinutes);
        const appointmentDate = new Date(`${date}T00:00:00+05:30`);

        let customerId: string | undefined;
        if (customerPhone) {
            const cleanPhone = customerPhone.replace(/\D/g, '');
            if (cleanPhone) {
                const customer = await prisma.customer.upsert({
                    where: { tenantId_phone: { tenantId: effectiveTenantId, phone: cleanPhone } },
                    update: customerName?.trim() ? { name: customerName.trim() } : {},
                    create: { tenantId: effectiveTenantId, name: customerName?.trim() || 'Guest', phone: cleanPhone },
                });
                customerId = customer.id;
            }
        }

        // Fetch staff name for optimistic UI response
        let staffRecord: { name: string } | null = null;
        if (staffId) {
            staffRecord = await prisma.user.findUnique({ where: { id: staffId }, select: { name: true } });
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
                service:  { select: { name: true, price: true, durationMinutes: true, color: true } },
                staff:    { select: { name: true } },
            },
        });

        return NextResponse.json({ appointment }, { status: 201 });
    } catch (error: any) {
        console.error('Create appointment error:', error);
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }
}
