'use client';

import { useState } from 'react';
import { ServiceSelection } from './ServiceSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { CustomerDetails } from './CustomerDetails';
import { BookingConfirmation } from './BookingConfirmation';
import { cn } from '@/lib/utils';

type Step = 'service' | 'datetime' | 'details' | 'confirm';

interface BookingWizardProps {
    tenant: any;
    services: any[];
    staff: any[];
    settings: any;
}

const STEPS: { id: Step; label: string; short: string }[] = [
    { id: 'service',  label: 'Choose Service',   short: '1' },
    { id: 'datetime', label: 'Pick Date & Time',  short: '2' },
    { id: 'details',  label: 'Your Details',      short: '3' },
    { id: 'confirm',  label: 'Confirm',           short: '4' },
];

export function BookingWizard({ tenant, services, staff, settings }: BookingWizardProps) {
    const [currentStep, setCurrentStep] = useState<Step>('service');
    const [bookingData, setBookingData] = useState({
        serviceId: '',
        staffId: '',
        date: null as Date | null,
        timeSlot: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
    });

    const currentIndex = STEPS.findIndex(s => s.id === currentStep);

    const updateBookingData = (data: Partial<typeof bookingData>) =>
        setBookingData(prev => ({ ...prev, ...data }));

    const nextStep = () => {
        if (currentIndex < STEPS.length - 1) setCurrentStep(STEPS[currentIndex + 1].id);
    };
    const prevStep = () => {
        if (currentIndex > 0) setCurrentStep(STEPS[currentIndex - 1].id);
    };

    return (
        <div className="px-0">
            {/* ── Step indicator ── */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-0">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                            {/* Dot */}
                            <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                                idx < currentIndex  && 'bg-violet-600 text-white',
                                idx === currentIndex && 'bg-violet-600 text-white ring-4 ring-violet-100',
                                idx > currentIndex  && 'bg-gray-100 text-gray-400'
                            )}>
                                {idx < currentIndex ? '✓' : step.short}
                            </div>
                            {/* Connector line */}
                            {idx < STEPS.length - 1 && (
                                <div className={cn(
                                    'flex-1 h-0.5 mx-1 transition-colors',
                                    idx < currentIndex ? 'bg-violet-600' : 'bg-gray-100'
                                )} />
                            )}
                        </div>
                    ))}
                </div>
                {/* Step label */}
                <p className="text-sm font-semibold text-gray-700 mt-2">
                    {STEPS[currentIndex].label}
                </p>
                <p className="text-xs text-gray-400">Step {currentIndex + 1} of {STEPS.length}</p>
            </div>

            {/* ── Step content ── */}
            <div className="bg-white mx-0 rounded-none sm:rounded-2xl sm:mx-4 sm:mt-2 sm:mb-6 shadow-sm border-t border-b sm:border border-gray-100">
                {currentStep === 'service' && (
                    <ServiceSelection
                        services={services}
                        selectedServiceId={bookingData.serviceId}
                        selectedStaffId={bookingData.staffId}
                        staff={staff}
                        onSelect={(serviceId, staffId) => updateBookingData({ serviceId, staffId })}
                        onNext={nextStep}
                    />
                )}
                {currentStep === 'datetime' && (
                    <DateTimeSelection
                        tenantId={tenant.id}
                        serviceId={bookingData.serviceId}
                        staffId={bookingData.staffId}
                        services={services}
                        settings={settings}
                        selectedDate={bookingData.date}
                        selectedTimeSlot={bookingData.timeSlot}
                        onSelect={(date, timeSlot) => updateBookingData({ date, timeSlot })}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}
                {currentStep === 'details' && (
                    <CustomerDetails
                        customerName={bookingData.customerName}
                        customerPhone={bookingData.customerPhone}
                        customerEmail={bookingData.customerEmail}
                        onChange={updateBookingData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}
                {currentStep === 'confirm' && (
                    <BookingConfirmation
                        tenant={tenant}
                        bookingData={bookingData}
                        services={services}
                        staff={staff}
                        onBack={prevStep}
                    />
                )}
            </div>
        </div>
    );
}
