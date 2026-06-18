import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Core',
        price: '₹1,199',
        period: '/month',
        description: 'Perfect for single-chair parlors just getting started',
        features: [
            'Appointment Booking',
            'Customer Database (up to 500)',
            'Daily Sales Tracking',
            'Basic Reports',
            'Walk-in Management',
            'WhatsApp Reminders (100/mo)',
        ],
        cta: 'Start Free Trial',
        highlight: false,
    },
    {
        name: 'Pro',
        price: '₹1,999',
        period: '/month',
        description: 'For growing parlors with a full team',
        features: [
            'Everything in Core',
            'Unlimited Customers',
            'Staff Performance Reports',
            'Inventory Management',
            'Loyalty Program',
            'WhatsApp Reminders (500/mo)',
            'Priority Support',
        ],
        cta: 'Start Free Trial',
        highlight: true,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 py-20 px-4">
            <div className="max-w-4xl mx-auto text-center mb-14">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
                <p className="text-lg text-gray-600">No hidden fees. Cancel anytime. Start with a 14-day free trial.</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`rounded-2xl p-8 ${plan.highlight
                            ? 'bg-violet-600 text-white shadow-2xl scale-105'
                            : 'bg-white text-gray-900 shadow-lg border border-gray-100'
                            }`}
                    >
                        <h2 className={`text-2xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                            {plan.name}
                        </h2>
                        <p className={`text-sm mb-6 ${plan.highlight ? 'text-violet-200' : 'text-gray-500'}`}>
                            {plan.description}
                        </p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            <span className={plan.highlight ? 'text-violet-200' : 'text-gray-500'}>{plan.period}</span>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm">
                                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-violet-200' : 'text-violet-600'}`} />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/login"
                            className={`block text-center py-3 px-6 rounded-xl font-semibold transition-colors ${plan.highlight
                                ? 'bg-white text-violet-600 hover:bg-violet-50'
                                : 'bg-violet-600 text-white hover:bg-violet-700'
                                }`}
                        >
                            {plan.cta}
                        </Link>
                    </div>
                ))}
            </div>

            <p className="text-center mt-10 text-sm text-gray-500">
                Need a custom plan?{' '}
                <a href="mailto:hello@flowvida.com" className="text-violet-600 underline">
                    Contact us
                </a>
            </p>
        </div>
    );
}
