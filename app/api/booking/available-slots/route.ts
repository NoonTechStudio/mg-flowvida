import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTenantFromRequest } from '@/lib/tenant-middleware';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const serviceId = searchParams.get('serviceId');
        const staffId = searchParams.get('staffId');

        if (!date || !serviceId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const tenant = await getTenantFromRequest(request);
        if (!tenant) {
            return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 });
        }

        // Get service duration
        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                tenantId: tenant.id
            }
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Get tenant settings
        const settings = await prisma.settings.findUnique({
            where: { tenantId: tenant.id }
        });

        // Get working hours for the selected date
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const workingHours = settings?.workingHours as any;
        const dayHours = workingHours?.[dayOfWeek];

        if (!dayHours) {
            return NextResponse.json({ slots: [] }); // Closed on this day
        }

        // Generate all possible slots
        const slots: string[] = [];
        const [startHour, startMinute] = dayHours.start.split(':').map(Number);
        const [endHour, endMinute] = dayHours.end.split(':').map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        const slotDuration = service.durationMinutes + (settings?.bufferTime || 0);

        for (let time = startTime; time + service.durationMinutes <= endTime; time += slotDuration) {
            const hours = Math.floor(time / 60);
            const minutes = time % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }

        // Get existing appointments for the date
        const existingAppointments = await prisma.appointment.findMany({
            where: {
                tenantId: tenant.id,
                appointmentDate: {
                    gte: new Date(`${date}T00:00:00`),
                    lt: new Date(`${date}T23:59:59`)
                },
                status: { in: ['CONFIRMED', 'CHECKED_IN', 'IN_SERVICE'] },
                ...(staffId && { staffId })
            },
            select: {
                startTime: true,
                endTime: true
            }
        });

        // Filter out booked slots
        const availableSlots = slots.filter(slot => {
            const slotStart = new Date(`${date}T${slot}`);
            const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60000);

            return !existingAppointments.some(apt => {
                const aptStart = new Date(apt.startTime);
                const aptEnd = new Date(apt.endTime);
                return (slotStart < aptEnd && slotEnd > aptStart);
            });
        });

        return NextResponse.json({ slots: availableSlots });

    } catch (error) {
        console.error('Available slots error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch available slots' },
            { status: 500 }
        );
    }
}