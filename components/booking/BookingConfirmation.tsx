'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CheckCircle, Loader2, Scissors, Clock, Calendar, User, Phone, ChevronRight } from 'lucide-react';

interface BookingConfirmationProps {
    tenant: any;
    bookingData: {
        serviceId: string;
        staffId: string;
        date: Date | null;
        timeSlot: string;
        customerName: string;
        customerPhone: string;
        customerEmail: string;
    };
    services: any[];
    staff: any[];
    onBack: () => void;
}

export function BookingConfirmation({ tenant, bookingData, services, staff, onBack }: BookingConfirmationProps) {
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');

    const service = services.find(s => s.id === bookingData.serviceId);
    const staffMember = staff.find(s => s.id === bookingData.staffId);

    const handleConfirm = async () => {
        if (!bookingData.date || !bookingData.timeSlot) {
            setError('Please go back and select a date and time.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Use the public endpoint — no auth required for customer bookings
            const res = await fetch('/api/public/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: tenant.id,
                    serviceId: bookingData.serviceId,
                    staffId: bookingData.staffId || null,
                    // date must be "yyyy-MM-dd" string; time must be "HH:mm" string
                    date: format(bookingData.date, 'yyyy-MM-dd'),
                    time: bookingData.timeSlot,
                    customerName: bookingData.customerName,
                    customerPhone: bookingData.customerPhone,
                    customerEmail: bookingData.customerEmail,
                }),
            });
            if (res.ok) {
                setConfirmed(true);
            } else {
                const data = await res.json();
                setError(data.error || 'Booking failed. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Success state ──
    if (confirmed) {
        return (
            <div className="p-6 text-center space-y-4 py-10">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">All Set! 🎉</h2>
                    <p className="text-sm text-gray-500 mt-1">Your appointment is confirmed</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Scissors className="w-4 h-4 text-violet-500" />
                        <span className="font-medium">{service?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {bookingData.date ? format(bookingData.date, 'EEEE, d MMMM yyyy') : ''}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {bookingData.timeSlot}
                    </div>
                </div>
                <p className="text-xs text-gray-400">
                    We'll reach out on +91&nbsp;{bookingData.customerPhone} to confirm. You can close this page.
                </p>
            </div>
        );
    }

    // ── Review state ──
    return (
        <div className="p-4 space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Review & Confirm</h2>
                <p className="text-sm text-gray-500 mt-0.5">Double-check your details below</p>
            </div>

            {/* Booking summary card */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {/* Service */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: service?.color ? service.color + '22' : '#fff1ee' }}>
                        <Scissors className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">{service?.name}</p>
                        <p className="text-xs text-gray-500">{service?.durationMinutes} min · {staffMember?.name || 'Anyone Available'}</p>
                    </div>
                    <p className="font-bold text-violet-700 text-base">₹{service?.price}</p>
                </div>

                <div className="border-t border-gray-200" />

                {/* Date/time */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <p className="font-medium text-sm text-gray-900">
                            {bookingData.date ? format(bookingData.date, 'EEEE, d MMMM yyyy') : ''}
                        </p>
                        <p className="text-xs text-gray-500">at {bookingData.timeSlot}</p>
                    </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Customer */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                        <p className="font-medium text-sm text-gray-900">{bookingData.customerName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            +91 {bookingData.customerPhone}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} disabled={loading} className="flex-1">
                    Back
                </Button>
                <Button onClick={handleConfirm} disabled={loading} className="flex-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {loading ? 'Booking…' : 'Confirm Booking'}
                    {!loading && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
            </div>
        </div>
    );
}
