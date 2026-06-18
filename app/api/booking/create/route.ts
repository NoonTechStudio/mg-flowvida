import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTenantFromRequest } from '@/lib/tenant-middleware';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
    try {
        const tenant = await getTenantFromRequest(request);
        if (!tenant) {
            return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 });
        }

        const data = await request.json();
        const { serviceId, staffId, date, timeSlot, customerName, customerPhone, customerEmail } = data;

        // Get service details
        const service = await prisma.service.findFirst({
            where: { id: serviceId, tenantId: tenant.id }
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Calculate times
        const startTime = new Date(`${date}T${timeSlot}`);
        const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);

        // Find or create customer
        let customer = await prisma.customer.findFirst({
            where: {
                tenantId: tenant.id,
                phone: customerPhone
            }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    tenantId: tenant.id,
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail
                }
            });
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                tenantId: tenant.id,
                customerId: customer.id,
                staffId: staffId || null,
                serviceId: service.id,
                appointmentDate: new Date(date),
                startTime,
                endTime,
                status: 'CONFIRMED'
            },
            include: {
                customer: true,
                service: true,
                staff: true
            }
        });

        // Send WhatsApp confirmation
        try {
            const message = `
Dear ${customerName},

Your appointment is confirmed at ${tenant.businessName}!

📅 Date: ${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ Time: ${timeSlot}
💄 Service: ${service.name} (${service.durationMinutes} mins)
👩 ${staffId ? `Staff: ${appointment.staff?.name}` : 'Staff: Anyone Available'}

📍 Location: [Parlor Address]

Need to change? Contact us to reschedule your appointment.

We look forward to serving you! 💕
      `.trim();

            await sendWhatsAppMessage(customerPhone, message);
        } catch (waError) {
            console.error('WhatsApp notification failed:', waError);
            // Don't fail the booking if WhatsApp fails
        }

        return NextResponse.json({
            success: true,
            appointment: {
                id: appointment.id,
                date: appointment.appointmentDate,
                time: timeSlot,
                service: service.name,
                staff: appointment.staff?.name || 'Anyone Available'
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);
        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        );
    }
}