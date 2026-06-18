import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['OWNER', 'MANAGER'].includes(session.user.role || '')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
        const { audience, message, offer, expiryDays } = await request.json();
        const tenantId = session.user.tenantId;

        if (!message || !offer) {
            return NextResponse.json({ error: 'Message and offer are required' }, { status: 400 });
        }

        // Build customer filter based on audience
        const now = new Date();
        let customerWhere: any = { tenantId };

        if (audience === 'recent') {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            customerWhere.lastVisit = { gte: thirtyDaysAgo };
        } else if (audience === 'dormant') {
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            customerWhere.lastVisit = { lte: sixtyDaysAgo };
        } else if (audience === 'vip') {
            customerWhere.totalSpent = { gte: 5000 };
        }

        const customers = await prisma.customer.findMany({
            where: customerWhere,
            select: { id: true, name: true, phone: true }
        });

        if (customers.length === 0) {
            return NextResponse.json({ success: 0, failed: 0, message: 'No customers found for this audience' });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { businessName: true }
        });

        let successCount = 0;
        let failCount = 0;

        for (const customer of customers) {
            if (!customer.phone) { failCount++; continue; }

            const campaignMessage = `Dear ${customer.name || 'Customer'},

${message}

🎁 Special Offer: ${offer}
⏰ Valid for: ${expiryDays} days

Book your appointment at ${tenant?.businessName || 'our parlor'} now!

We look forward to seeing you! 💕`.trim();

            try {
                await sendWhatsAppMessage(customer.phone, campaignMessage);
                successCount++;
            } catch {
                failCount++;
            }
        }

        return NextResponse.json({ success: successCount, failed: failCount, total: customers.length });

    } catch (error) {
        console.error('Marketing campaign error:', error);
        return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
    }
}
