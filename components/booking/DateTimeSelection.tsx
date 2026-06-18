'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface DateTimeSelectionProps {
    tenantId: string;
    serviceId: string;
    staffId: string;
    services: any[];
    settings: any;
    selectedDate: Date | null;
    selectedTimeSlot: string;
    onSelect: (date: Date, timeSlot: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00',
];

export function DateTimeSelection({
    selectedDate,
    selectedTimeSlot,
    onSelect,
    onNext,
    onBack,
}: DateTimeSelectionProps) {
    const [date, setDate] = useState<Date | undefined>(selectedDate || undefined);
    const today = startOfDay(new Date());

    const handleDateSelect = (d: Date | undefined) => {
        if (d) {
            setDate(d);
            if (selectedTimeSlot) onSelect(d, selectedTimeSlot);
        }
    };

    const handleTimeSelect = (slot: string) => {
        if (date) onSelect(date, slot);
    };

    return (
        <div className="p-4 space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Pick a Date & Time</h2>
                <p className="text-sm text-gray-500 mt-0.5">Choose your preferred slot</p>
            </div>

            {/* Calendar — full width on mobile */}
            <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Select Date</p>
                <div className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(d) => isBefore(d, today)}
                        className="rounded-xl border border-gray-100 w-full"
                    />
                </div>
            </div>

            {/* Time slots */}
            {date && (
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        Available times · {format(date, 'EEE d MMM')}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map(slot => (
                            <button
                                key={slot}
                                onClick={() => handleTimeSelect(slot)}
                                className={cn(
                                    'py-2.5 text-sm rounded-xl border-2 font-medium transition-colors',
                                    selectedTimeSlot === slot
                                        ? 'bg-violet-600 text-white border-violet-600'
                                        : 'bg-white text-gray-700 border-gray-100 hover:border-violet-300'
                                )}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!date || !selectedTimeSlot}
                    className="flex-1"
                >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
