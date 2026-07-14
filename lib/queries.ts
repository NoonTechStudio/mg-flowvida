import { unstable_cache } from 'next/cache';
import { prisma } from './db';

// Cache active services per tenant — 60s TTL
// Used by: appointments page, dashboard, new appointment modal
export const getCachedActiveServices = (tenantId: string) =>
  unstable_cache(
    () =>
      prisma.service.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: 'asc' },
      }),
    [`active-services-${tenantId}`],
    { revalidate: 60, tags: [`services-${tenantId}`] }
  )();

// Cache all services per tenant (including inactive) — 60s TTL
// Used by: services management page
export const getCachedAllServices = (tenantId: string) =>
  unstable_cache(
    () =>
      prisma.service.findMany({
        where: { tenantId },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
    [`all-services-${tenantId}`],
    { revalidate: 60, tags: [`services-${tenantId}`] }
  )();

// Cache active staff per tenant — 60s TTL
// Used by: appointments page, dashboard
export const getCachedActiveStaff = (tenantId: string) =>
  unstable_cache(
    () =>
      prisma.user.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: 'asc' },
      }),
    [`active-staff-${tenantId}`],
    { revalidate: 60, tags: [`staff-${tenantId}`] }
  )();

// Cache all staff with appointment counts — 60s TTL
// Used by: staff management page
export const getCachedAllStaff = (tenantId: string) =>
  unstable_cache(
    () =>
      prisma.user.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
        include: {
          _count: {
            select: { appointments: { where: { status: 'COMPLETED' } } },
          },
        },
      }),
    [`all-staff-${tenantId}`],
    { revalidate: 60, tags: [`staff-${tenantId}`] }
  )();

// Cache customers per tenant — 30s TTL
// Used by: customers page
export const getCachedCustomers = (tenantId: string) =>
  unstable_cache(
    () =>
      prisma.customer.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { appointments: true } } },
      }),
    [`customers-${tenantId}`],
    { revalidate: 30, tags: [`customers-${tenantId}`] }
  )();
