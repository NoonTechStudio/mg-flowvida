'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, User, Phone, Mail } from 'lucide-react';

interface CustomerDetailsProps {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    onChange: (data: { customerName?: string; customerPhone?: string; customerEmail?: string }) => void;
    onNext: () => void;
    onBack: () => void;
}

export function CustomerDetails({
    customerName,
    customerPhone,
    customerEmail,
    onChange,
    onNext,
    onBack,
}: CustomerDetailsProps) {
    const isValid = customerName.trim().length >= 2 && customerPhone.trim().length === 10;

    return (
        <div className="p-4 space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Your Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Just a few details to confirm your booking</p>
            </div>

            <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        Full Name <span className="text-violet-600">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={customerName}
                        onChange={e => onChange({ customerName: e.target.value })}
                        placeholder="Priya Shah"
                        autoComplete="name"
                        className="h-11"
                    />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        Phone Number <span className="text-violet-600">*</span>
                    </Label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium shrink-0">
                            +91
                        </span>
                        <Input
                            id="phone"
                            value={customerPhone}
                            onChange={e => onChange({ customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            placeholder="9876543210"
                            inputMode="numeric"
                            autoComplete="tel"
                            className="rounded-l-none h-11"
                        />
                    </div>
                    {customerPhone.length > 0 && customerPhone.length < 10 && (
                        <p className="text-xs text-amber-600">Enter 10-digit number</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        Email <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={e => onChange({ customerEmail: e.target.value })}
                        placeholder="priya@email.com"
                        autoComplete="email"
                        className="h-11"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button onClick={onNext} disabled={!isValid} className="flex-1">
                    Review Booking
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
