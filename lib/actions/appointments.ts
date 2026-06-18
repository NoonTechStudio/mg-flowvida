'use server';

import { prisma } from '@/lib/db';
import { AppointmentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function updateAppointmentStatus(appointmentId: string, status: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { success: false, error: 'Unauthorized' };
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { service: true, customer: true }
        });

        if (!appointment) {
            return { success: false, error: 'Appointment not found' };
        }

        if (appointment.tenantId !== session.user.tenantId) {
            return { success: false, error: 'Unauthorized' };
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: status as AppointmentStatus }
        });

        // If completed, create transaction and update customer stats
        if (status === 'COMPLETED') {
            // Avoid duplicate transactions
            const existing = await prisma.transaction.findFirst({
                where: { appointmentId: appointment.id }
            });

            if (!existing) {
                await prisma.transaction.create({
                    data: {
                        tenantId: appointment.tenantId,
                        appointmentId: appointment.id,
                        customerId: appointment.customerId,
                        staffId: appointment.staffId,
                        amount: appointment.service.price,
                        paymentMode: 'CASH',
                        invoiceNumber: `INV-${Date.now()}`
                    }
                });
            }

            // Update customer stats if customer exists
            if (appointment.customerId) {
                await prisma.customer.update({
                    where: { id: appointment.customerId },
                    data: {
                        totalVisits: { increment: 1 },
                        totalSpent: { increment: appointment.service.price },
                        lastVisit: new Date()
                    }
                });
            }
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/appointments');
        return { success: true, appointment: updatedAppointment };

    } catch (error) {
        console.error('Update appointment error:', error);
        return { success: false, error: 'Failed to update appointment' };
    }
}

export async function createWalkInAppointment(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!data.selectedServices || data.selectedServices.length === 0) {
            return { success: false, error: 'Please select at least one service' };
        }

        // Find or create customer
        let customer = null;
        if (data.customerPhone) {
            const cleanPhone = data.customerPhone.replace(/\D/g, '');
            customer = await prisma.customer.findFirst({
                where: { tenantId: data.tenantId, phone: cleanPhone }
            });

            if (customer) {
                // Update name if provided and different
                if (data.customerName && data.customerName.trim() && data.customerName.trim() !== customer.name) {
                    customer = await prisma.customer.update({
                        where: { id: customer.id },
                        data: { name: data.customerName.trim() }
                    });
                }
            } else if (cleanPhone) {
                customer = await prisma.customer.create({
                    data: {
                        tenantId: data.tenantId,
                        name: data.customerName || 'Guest',
                        phone: cleanPhone
                    }
                });
            }
        } else if (data.customerName) {
            customer = await prisma.customer.create({
                data: {
                    tenantId: data.tenantId,
                    name: data.customerName,
                    phone: data.customerPhone || `walkin-${Date.now()}`,
                }
            });
        }

        // Get service details for the first service (to calculate duration)
        const firstServiceId = data.selectedServices[0];
        const service = await prisma.service.findUnique({ where: { id: firstServiceId } });
        if (!service) {
            return { success: false, error: 'Service not found' };
        }

        const now = new Date();
        // Use total duration from all selected services
        const totalDuration = data.totalDuration || service.durationMinutes;

        // Resolve staffId: 'any' or null means unassigned
        const resolvedStaffId = (!data.staffId || data.staffId === 'any') ? null : data.staffId;

        const appointment = await prisma.appointment.create({
            data: {
                tenantId: data.tenantId,
                customerId: customer?.id || null,
                staffId: resolvedStaffId,
                serviceId: firstServiceId,
                appointmentDate: now,
                startTime: now,
                endTime: new Date(now.getTime() + totalDuration * 60000),
                status: 'IN_SERVICE',
                isWalkIn: true
            }
        });

        // Create transaction
        await prisma.transaction.create({
            data: {
                tenantId: data.tenantId,
                appointmentId: appointment.id,
                customerId: customer?.id || null,
                staffId: resolvedStaffId,
                amount: data.totalAmount,
                paymentMode: data.paymentMode || 'CASH',
                invoiceNumber: `WLK-${Date.now()}`
            }
        });

        // Update customer stats immediately for walk-ins (already paid)
        if (customer?.id) {
            await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    totalVisits: { increment: 1 },
                    totalSpent: { increment: data.totalAmount },
                    lastVisit: now
                }
            });
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/appointments');
        return { success: true };

    } catch (error) {
        console.error('Create walk-in error:', error);
        return { success: false, error: 'Failed to create walk-in appointment' };
    }
}
