import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

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
            mustChangePassword: boolean;
        }
    }
    interface User {
        id: string;
        name?: string | null;
        phone?: string;
        role: string;
        tenantId: string;
        tenantSubdomain: string;
        mustChangePassword: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        tenantId: string;
        tenantSubdomain: string;
        phone?: string;
        mustChangePassword: boolean;
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Password',
            credentials: {
                phone: { label: 'Phone', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.password) return null;

                const cleanPhone = credentials.phone.replace(/\D/g, '');

                const user = await prisma.user.findFirst({
                    where: {
                        phone: cleanPhone,
                        isActive: true,
                        tenant: { isActive: true },
                    },
                    include: { tenant: true },
                });

                if (!user || !user.passwordHash) return null;

                const valid = await verifyPassword(credentials.password, user.passwordHash);
                if (!valid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role,
                    tenantId: user.tenant.id,
                    tenantSubdomain: user.tenant.subdomain,
                    mustChangePassword: user.mustChangePassword,
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
                token.mustChangePassword = user.mustChangePassword;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            session.user.tenantId = token.tenantId;
            session.user.tenantSubdomain = token.tenantSubdomain;
            session.user.phone = token.phone;
            session.user.mustChangePassword = token.mustChangePassword;
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
