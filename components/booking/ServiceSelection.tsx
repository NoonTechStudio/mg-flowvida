'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Scissors, Sparkles, Crown, Hand, Wind, MoreHorizontal, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, React.ElementType> = {
    HAIR: Scissors,
    SKIN: Sparkles,
    BRIDAL: Crown,
    NAILS: Hand,
    SPA: Wind,
    OTHER: MoreHorizontal
};

interface ServiceSelectionProps {
    services: any[];
    selectedServiceId: string;
    selectedStaffId: string;
    staff: any[];
    onSelect: (serviceId: string, staffId: string) => void;
    onNext: () => void;
}

export function ServiceSelection({
    services,
    selectedServiceId,
    selectedStaffId,
    staff,
    onSelect,
    onNext
}: ServiceSelectionProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    const categories = useMemo(() => {
        const cats = new Set(services.map(s => s.category));
        return ['ALL', ...Array.from(cats)];
    }, [services]);

    const filteredServices = selectedCategory === 'ALL'
        ? services
        : services.filter(s => s.category === selectedCategory);

    return (
        <div className="p-4 space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Choose a Service</h2>
                <p className="text-sm text-gray-500 mt-0.5">Select what you'd like to book</p>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {categories.map(cat => {
                    const Icon = categoryIcons[cat] || MoreHorizontal;
                    const active = selectedCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0',
                                active
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {cat === 'ALL' ? 'All Services' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </button>
                    );
                })}
            </div>

            {/* Service list */}
            <div className="space-y-2">
                {filteredServices.map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                        <button
                            key={service.id}
                            onClick={() => onSelect(service.id, selectedStaffId)}
                            className={cn(
                                'w-full text-left rounded-xl border-2 p-4 transition-all',
                                isSelected
                                    ? 'border-violet-600 bg-violet-50'
                                    : 'border-gray-100 bg-white hover:border-gray-200'
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {/* Colour dot from service */}
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: service.color || '#d42a14' }}
                                        />
                                        <p className={cn('font-semibold text-sm', isSelected ? 'text-violet-900' : 'text-gray-900')}>
                                            {service.name}
                                        </p>
                                    </div>
                                    {service.description && (
                                        <p className="text-xs text-gray-500 mt-1 ml-5 line-clamp-2">{service.description}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1 ml-5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {service.durationMinutes} minutes
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={cn('text-base font-bold', isSelected ? 'text-violet-700' : 'text-gray-900')}>
                                        ₹{service.price}
                                    </p>
                                    {isSelected && (
                                        <p className="text-[10px] text-violet-600 font-medium mt-0.5">Selected ✓</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Staff preference */}
            <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Preferred Staff <span className="font-normal text-gray-400">(optional)</span></Label>
                <Select
                    value={selectedStaffId || 'any'}
                    onValueChange={(value) => onSelect(selectedServiceId, value === 'any' ? '' : value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Anyone Available" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Anyone Available (Recommended)</SelectItem>
                        {staff.map((person) => (
                            <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* CTA */}
            <Button
                onClick={onNext}
                disabled={!selectedServiceId}
                className="w-full py-3 text-base font-semibold"
            >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
        </div>
    );
}
