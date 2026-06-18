import { PrismaClient } from '@prisma/client'
import { addHours, subDays, addMinutes, startOfDay } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding FlowVida demo data...')

  // Clean existing data
  await prisma.transaction.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.service.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // Create Demo Tenant
  const tenant = await prisma.tenant.create({
    data: {
      subdomain: 'demo',
      businessName: 'Nita Beauty Parlor',
      ownerName: 'Nita Patel',
      ownerPhone: '9876543210',
      ownerEmail: 'nita@nitabeauty.com',
      plan: 'PRO',
    },
  })
  console.log(`Tenant: ${tenant.businessName}`)

  // Settings
  await prisma.settings.create({
    data: {
      tenantId: tenant.id,
      workingHours: {
        monday: { start: '09:00', end: '20:00' },
        tuesday: { start: '09:00', end: '20:00' },
        wednesday: { start: '09:00', end: '20:00' },
        thursday: { start: '09:00', end: '20:00' },
        friday: { start: '09:00', end: '20:00' },
        saturday: { start: '09:00', end: '21:00' },
        sunday: { start: '10:00', end: '18:00' },
      },
      slotDuration: 30,
      bufferTime: 10,
    },
  })

  // Staff
  const owner = await prisma.user.create({ data: { tenantId: tenant.id, name: 'Nita Patel', phone: '9876543210', email: 'nita@nitabeauty.com', role: 'OWNER' } })
  const staff1 = await prisma.user.create({ data: { tenantId: tenant.id, name: 'Pooja Sharma', phone: '9876543211', role: 'STAFF' } })
  const staff2 = await prisma.user.create({ data: { tenantId: tenant.id, name: 'Kavita Mehta', phone: '9876543212', role: 'STAFF' } })
  await prisma.user.create({ data: { tenantId: tenant.id, name: 'Riya Joshi', phone: '9876543213', role: 'RECEPTIONIST' } })
  console.log('Staff: 1 owner, 2 stylists, 1 receptionist')

  // Services
  const svc = await Promise.all([
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Haircut & Styling', category: 'HAIR', price: 350, durationMinutes: 45, color: '#f43f5e' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Hair Colour (Full)', category: 'HAIR', price: 1500, durationMinutes: 120, color: '#e11d48' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Hair Smoothening', category: 'HAIR', price: 3500, durationMinutes: 180, color: '#be185d' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Keratin Treatment', category: 'HAIR', price: 4500, durationMinutes: 240, color: '#9d174d' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Gold Facial', category: 'SKIN', price: 900, durationMinutes: 60, color: '#f59e0b' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Cleanup Basic', category: 'SKIN', price: 350, durationMinutes: 40, color: '#d97706' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Bleach (Face)', category: 'SKIN', price: 250, durationMinutes: 30, color: '#b45309' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Detan (Face + Neck)', category: 'SKIN', price: 400, durationMinutes: 45, color: '#92400e' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Bridal Makeup', category: 'BRIDAL', price: 8000, durationMinutes: 180, color: '#7c3aed' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Pre-Bridal Package', category: 'BRIDAL', price: 5000, durationMinutes: 240, color: '#6d28d9' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Manicure', category: 'NAILS', price: 400, durationMinutes: 45, color: '#2563eb' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Pedicure', category: 'NAILS', price: 500, durationMinutes: 50, color: '#1d4ed8' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Nail Art', category: 'NAILS', price: 600, durationMinutes: 60, color: '#1e40af' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Head Massage', category: 'SPA', price: 400, durationMinutes: 30, color: '#059669' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Full Body Waxing', category: 'SPA', price: 1200, durationMinutes: 90, color: '#047857' } }),
    prisma.service.create({ data: { tenantId: tenant.id, name: 'Threading (Eyebrows)', category: 'SPA', price: 50, durationMinutes: 10, color: '#065f46' } }),
  ])
  console.log(`Services: ${svc.length}`)

  // Customers
  const custData = [
    { name: 'Priya Desai', phone: '9898989898', totalVisits: 15, totalSpent: 12500 },
    { name: 'Sonal Patel', phone: '9797979797', totalVisits: 8, totalSpent: 6400 },
    { name: 'Anjali Shah', phone: '9696969696', totalVisits: 22, totalSpent: 28000 },
    { name: 'Radha Joshi', phone: '9595959595', totalVisits: 3, totalSpent: 2100 },
    { name: 'Meera Chaudhari', phone: '9494949494', totalVisits: 5, totalSpent: 4200 },
    { name: 'Divya Trivedi', phone: '9393939393', totalVisits: 12, totalSpent: 9600 },
    { name: 'Nisha Rana', phone: '9292929292', totalVisits: 1, totalSpent: 900 },
    { name: 'Komal Bhatt', phone: '9191919191', totalVisits: 30, totalSpent: 35000 },
    { name: 'Heena Modi', phone: '9090909090', totalVisits: 7, totalSpent: 5600 },
    { name: 'Pooja Gupta', phone: '8989898989', totalVisits: 2, totalSpent: 1500 },
  ]
  const customers = await Promise.all(
    custData.map(c => prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: c.name,
        phone: c.phone,
        gender: 'FEMALE',
        totalVisits: c.totalVisits,
        totalSpent: c.totalSpent,
        lastVisit: subDays(new Date(), Math.floor(Math.random() * 30)),
      }
    }))
  )
  console.log(`Customers: ${customers.length}`)

  // Today's appointments
  const today = startOfDay(new Date())
  const todayAppts = [
    { time: 10, cIdx: 0, sIdx: 0, staff: staff1, status: 'COMPLETED' as const },
    { time: 10, cIdx: 1, sIdx: 4, staff: staff2, status: 'COMPLETED' as const },
    { time: 11, cIdx: 2, sIdx: 1, staff: staff1, status: 'COMPLETED' as const },
    { time: 11, cIdx: 3, sIdx: 5, staff: staff2, status: 'IN_SERVICE' as const },
    { time: 12, cIdx: 4, sIdx: 10, staff: staff1, status: 'CHECKED_IN' as const },
    { time: 13, cIdx: 5, sIdx: 8, staff: owner, status: 'CONFIRMED' as const },
    { time: 14, cIdx: 6, sIdx: 0, staff: staff1, status: 'CONFIRMED' as const },
    { time: 15, cIdx: 7, sIdx: 4, staff: staff2, status: 'CONFIRMED' as const },
    { time: 16, cIdx: 8, sIdx: 12, staff: staff2, status: 'CONFIRMED' as const },
    { time: 17, cIdx: 9, sIdx: 6, staff: staff1, status: 'CONFIRMED' as const },
  ]

  let invN = 1
  for (const a of todayAppts) {
    const service = svc[a.sIdx]
    const start = addHours(today, a.time)
    const end = addMinutes(start, service.durationMinutes)
    const appt = await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        customerId: customers[a.cIdx].id,
        serviceId: service.id,
        staffId: a.staff.id,
        appointmentDate: today,
        startTime: start,
        endTime: end,
        status: a.status,
      }
    })
    if (a.status === 'COMPLETED') {
      await prisma.transaction.create({
        data: {
          tenantId: tenant.id,
          appointmentId: appt.id,
          customerId: customers[a.cIdx].id,
          amount: service.price,
          paymentMode: ['CASH', 'UPI', 'CARD'][invN % 3] as any,
          transactionDate: start,
          invoiceNumber: `INV-TODAY-${invN++}`,
        }
      })
    }
  }
  console.log(`Today's appointments: ${todayAppts.length}`)

  // Past 30 days of data
  const modes = ['CASH', 'UPI', 'CARD', 'CASH', 'CASH'] as const
  let txN = 200
  for (let d = 1; d <= 30; d++) {
    const pastDate = startOfDay(subDays(new Date(), d))
    const count = 5 + Math.floor(Math.random() * 8)
    for (let i = 0; i < count; i++) {
      const c = customers[Math.floor(Math.random() * customers.length)]
      const s = svc[Math.floor(Math.random() * svc.length)]
      const stf = [staff1, staff2, owner][i % 3]
      const h = 9 + Math.floor(Math.random() * 10)
      const start = addHours(pastDate, h)
      const end = addMinutes(start, s.durationMinutes)
      const appt = await prisma.appointment.create({
        data: {
          tenantId: tenant.id, customerId: c.id, serviceId: s.id, staffId: stf.id,
          appointmentDate: pastDate, startTime: start, endTime: end, status: 'COMPLETED',
        }
      })
      await prisma.transaction.create({
        data: {
          tenantId: tenant.id, appointmentId: appt.id, customerId: c.id, staffId: stf.id,
          amount: s.price, paymentMode: modes[txN % modes.length],
          transactionDate: start, invoiceNumber: `INV-${d}-${txN++}`,
        }
      })
    }
  }
  console.log('Past 30 days: done')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  DEMO LOGIN (owner):  9876543210')
  console.log('  DEMO LOGIN (staff):  9876543211 or 9876543212')
  console.log('  OTP appears in THIS terminal when requested')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().then(() => prisma.$disconnect()).catch(async e => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
