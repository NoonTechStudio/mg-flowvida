import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Public slot availability — no auth required
// GET /api/public/slots?tenantId=xxx&serviceId=xxx&date=yyyy-MM-dd
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenantId  = searchParams.get('tenantId')
  const serviceId = searchParams.get('serviceId')
  const date      = searchParams.get('date')

  if (!tenantId || !serviceId || !date) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const [service, settings, existingAppointments] = await Promise.all([
    prisma.service.findFirst({
      where: { id: serviceId, tenantId, isActive: true },
    }),
    prisma.settings.findUnique({ where: { tenantId } }),
    prisma.appointment.findMany({
      where: {
        tenantId,
        appointmentDate: {
          gte: new Date(`${date}T00:00:00`),
          lt:  new Date(`${date}T23:59:59`),
        },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'IN_SERVICE'] },
      },
      select: { startTime: true, endTime: true },
    }),
  ])

  if (!service) return NextResponse.json({ slots: [] })

  const workingHours = settings?.workingHours as Record<string, { open: boolean; start: string; end: string }> | null
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const dayHours = workingHours?.[dayName]

  if (!dayHours?.open) return NextResponse.json({ slots: [] })

  const [startH, startM] = dayHours.start.split(':').map(Number)
  const [endH,   endM]   = dayHours.end.split(':').map(Number)
  const startMins = startH * 60 + startM
  const endMins   = endH   * 60 + endM
  const step      = service.durationMinutes + (settings?.bufferTime ?? 0)

  const allSlots: string[] = []
  for (let t = startMins; t + service.durationMinutes <= endMins; t += step) {
    allSlots.push(
      `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
    )
  }

  // Filter out already-booked slots
  const now = new Date()
  const available = allSlots.filter((slot) => {
    const slotStart = new Date(`${date}T${slot}`)
    if (slotStart <= now) return false // past slots
    const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60_000)
    return !existingAppointments.some((apt) => {
      const aStart = new Date(apt.startTime)
      const aEnd   = new Date(apt.endTime)
      return slotStart < aEnd && slotEnd > aStart
    })
  })

  return NextResponse.json({ slots: available })
}
