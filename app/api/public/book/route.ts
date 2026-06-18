// Public booking endpoint — no auth required (customer-facing)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseISO, addMinutes } from 'date-fns';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            tenantId,
            serviceId,
            staffId,
            date,        // "yyyy-MM-dd" string
            time,        // "HH:mm" string
            customerName,
            customerPhone,
            customerEmail,
        } = body;

        // Validate required fields
        if (!tenantId || !serviceId || !date || !time) {
            return NextResponse.json(
                { error: 'tenantId, serviceId, date, and time are required' },
                { status: 400 }
            );
        }

        // Verify tenant is active
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId, isActive: true },
            select: { id: true }
        });
        if (!tenant) {
            return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
        }

        // Verify service belongs to tenant
        const service = await prisma.service.findFirst({
            where: { id: serviceId, tenantId, isActive: true }
        });
        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Build start/end times
        const appointmentDate = parseISO(date);
        const [hours, minutes] = time.split(':').map(Number);
        const startTime = new Date(appointmentDate);
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = addMinutes(startTime, service.durationMinutes);

        // Find or create customer
        let customerId: string | null = null;
        if (customerPhone) {
            const cleanPhone = customerPhone.replace(/\D/g, '');
            if (cleanPhone) {
                let customer = await prisma.customer.findFirst({
                    where: { tenantId, phone: cleanPhone }
                });
                if (!customer) {
                    customer = await prisma.customer.create({
                        data: {
                            tenantId,
                            name: customerName || 'Guest',
                            phone: cleanPhone,
                            email: customerEmail || null,
                        }
                    });
                }
                customerId = customer.id;
            }
        }

        // Resolve staff — if staffId given, verify it belongs to tenant
        let resolvedStaffId: string | null = null;
        if (staffId) {
            const staffMember = await prisma.user.findFirst({
                where: { id: staffId, tenantId, isActive: true }
            });
            if (staffMember) resolvedStaffId = staffMember.id;
        }

        const appointment = await prisma.appointment.create({
            data: {
                tenantId,
                customerId,
                serviceId,
                staffId: resolvedStaffId,
                appointmentDate,
                startTime,
                endTime,
                status: 'CONFIRMED',
            },
            include: {
                service: { select: { name: true, price: true } },
                customer: { select: { name: true, phone: true } },
            }
        });

        return NextResponse.json({ appointment }, { status: 201 });
    } catch (error: any) {
        console.error('Public booking error:', error);
        return NextResponse.json({ error: 'Booking failed. Please try again.' }, { status: 500 });
    }
}
