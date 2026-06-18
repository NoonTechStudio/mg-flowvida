import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './db';

export interface TenantContext {
    id: string;
    subdomain: string;
    businessName: string;
    plan: string;
}

export async function getTenantFromRequest(
    request: NextRequest
): Promise<TenantContext | null> {
    const hostname = request.headers.get('host') || '';

    // Remove port if present (localhost:3000 -> localhost)
    const cleanHostname = hostname.split(':')[0];

    // Check if it's a subdomain
    const parts = cleanHostname.split('.');

    let subdomain: string | null = null;

    if (parts.length >= 3) {
        // subdomain.domain.com
        subdomain = parts[0];
    } else if (process.env.NODE_ENV === 'development') {
        // In development, allow query param for testing
        const url = new URL(request.url);
        subdomain = url.searchParams.get('tenant') || null;
    }

    if (!subdomain || subdomain === 'www' || subdomain === 'app') {
        return null;
    }

    const tenant = await prisma.tenant.findUnique({
        where: { subdomain, isActive: true },
        select: {
            id: true,
            subdomain: true,
            businessName: true,
            plan: true
        }
    });

    return tenant;
}

// Prisma Client Extension for automatic tenant filtering
export function tenantExtension(tenantId: string) {
    return prisma.$extends({
        query: {
            $allModels: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async $allOperations({ model, args, query }: { model: string; operation: string; args: any; query: (args: any) => Promise<any> }) {
                    if (model === 'Tenant') {
                        return query(args);
                    }
                    if (args && typeof args === 'object') {
                        if (!args.where) args.where = {};
                        if (!('tenantId' in args.where)) {
                            args.where.tenantId = tenantId;
                        }
                    }
                    return query(args);
                }
            }
        }
    });
}