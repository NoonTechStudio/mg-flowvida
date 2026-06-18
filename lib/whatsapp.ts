// For MVP, we'll use Interakt (Indian WhatsApp API provider)
// Alternative: Twilio, Gupshup, WATI

interface WhatsAppConfig {
    apiKey: string;
    senderPhone: string;
}

export async function sendWhatsAppMessage(
    to: string,
    message: string,
    templateName?: string
): Promise<boolean> {
    try {
        // Format phone number (ensure country code)
        const formattedPhone = to.startsWith('+91') ? to : `+91${to}`;

        // For development, just log
        if (process.env.NODE_ENV === 'development') {
            console.log(`[WHATSAPP] To: ${formattedPhone}`);
            console.log(`[WHATSAPP] Message: ${message}`);
            return true;
        }

        // Interakt API Integration
        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${process.env.WHATSAPP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                countryCode: '+91',
                phoneNumber: formattedPhone.replace('+91', ''),
                callbackData: 'glamflow_booking',
                type: 'Template',
                template: {
                    name: templateName || 'appointment_confirmation',
                    languageCode: 'en',
                    bodyValues: [message]
                }
            })
        });

        const result = await response.json();
        return result.result === true;

    } catch (error) {
        console.error('WhatsApp send error:', error);
        return false;
    }
}

export async function sendBulkPromo(
    customers: { phone: string; name: string }[],
    businessName: string,
    offerMessage: string,
    bookingLink: string
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const customer of customers) {
        const message = `
Hi ${customer.name},

${offerMessage}

Book now: ${bookingLink}

- ${businessName}
    `.trim();

        const sent = await sendWhatsAppMessage(customer.phone, message);
        if (sent) {
            success++;
        } else {
            failed++;
        }

        // Rate limiting - 1 second between messages
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { success, failed };
}