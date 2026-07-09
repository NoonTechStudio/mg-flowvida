import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Always reuse the global instance — on Vercel serverless, warm invocations
// share globalThis so this prevents a new DB connection on every request.
// The missing `!== 'production'` guard was the main cause of app slowness.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

globalForPrisma.prisma = prisma
