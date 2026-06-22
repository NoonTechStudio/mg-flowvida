import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';

// Extend next-auth types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            phone?: string;
            role: string;
            tenantId: string;
            tenantSubdomain: string;
        }
    }
    interface User {
        id: string;
        name?: string | null;
        phone?: string;
        role: string;
        tenantId: string;
        tenantSubdomain: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        tenantId: string;
        tenantSubdomain: string;
        phone?: string;
    }
}

// Simple in-memory OTP store (Use Redis in production)
const otpStore = new Map<string, { otp: string; expires: Date }>();

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phone: string, otp: string): void {
    otpStore.set(phone, {
        otp,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });
}

export function verifyOTP(phone: string, otp: string): boolean {
    const stored = otpStore.get(phone);
    if (!stored) return false;
    if (stored.expires < new Date()) {
        otpStore.delete(phone);
        return false;
    }
    if (stored.otp !== otp) return false;
    otpStore.delete(phone);
    return true;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'OTP',
            credentials: {
                phone: { label: 'Phone', type: 'text' },
                otp: { label: 'OTP', type: 'text' },
                tenantSubdomain: { label: 'Tenant', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.otp) {
                    return null;
                }

                // Verify OTP
                if (!verifyOTP(credentials.phone, credentials.otp)) {
                    return null;
                }

                // Find user by phone across all active tenants
                let user = await prisma.user.findFirst({
                    where: { phone: credentials.phone, isActive: true, tenant: { isActive: true } },
                    include: { tenant: true },
                });

                // If not found as a user record, check if they're a tenant owner
                // (owner user is auto-created on registration; this is a safety fallback)
                if (!user) {
                    const ownerTenant = await prisma.tenant.findFirst({
                        where: { ownerPhone: credentials.phone, isActive: true },
                    });
                    if (!ownerTenant) return null;

                    user = await prisma.user.create({
                        data: {
                            tenantId: ownerTenant.id,
                            name: ownerTenant.ownerName,
                            phone: credentials.phone,
                            role: 'OWNER',
                        },
                        include: { tenant: true },
                    });
                }

                const tenant = user.tenant;

                return {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role,
                    tenantId: tenant.id,
                    tenantSubdomain: tenant.subdomain,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.tenantId = user.tenantId;
                token.tenantSubdomain = user.tenantSubdomain;
                token.phone = user.phone;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            session.user.tenantId = token.tenantId;
            session.user.tenantSubdomain = token.tenantSubdomain;
            session.user.phone = token.phone;
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
};
