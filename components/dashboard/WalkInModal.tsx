'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createWalkInAppointment } from '@/lib/actions/appointments';

interface WalkInModalProps {
    open: boolean;
    onClose: () => void;
    services: any[];
    staff: any[];
    tenantId: string;
    userId: string;
}

export function WalkInModal({ open, onClose, services, staff, tenantId, userId }: WalkInModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        selectedServices: [] as string[],
        staffId: 'any',
        paymentMode: 'CASH'
    });

    const [totalAmount, setTotalAmount] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);

    useEffect(() => {
        const selected = services.filter(s => formData.selectedServices.includes(s.id));
        const amount = selected.reduce((sum, s) => sum + s.price, 0);
        const duration = selected.reduce((sum, s) => sum + s.durationMinutes, 0);
        setTotalAmount(amount);
        setTotalDuration(duration);
    }, [formData.selectedServices, services]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createWalkInAppointment({
                tenantId,
                ...formData,
                staffId: formData.staffId === 'any' ? null : formData.staffId,
                totalAmount,
                totalDuration,
            });

            if (result.success) {
                router.refresh();
                onClose();
            }
        } catch (error) {
            console.error('Failed to create walk-in:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Walk-in Customer</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Customer Name (Optional)</Label>
                            <Input
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                placeholder="Guest"
                            />
                        </div>
                        <div>
                            <Label>Phone (Optional)</Label>
                            <Input
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                placeholder="9876543210"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Select Services</Label>
                        <div className="border rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                            {services.map((service) => (
                                <div key={service.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`service-${service.id}`}
                                            checked={formData.selectedServices.includes(service.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setFormData({
                                                        ...formData,
                                                        selectedServices: [...formData.selectedServices, service.id]
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        selectedServices: formData.selectedServices.filter(id => id !== service.id)
                                                    });
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`service-${service.id}`} className="cursor-pointer">
                                            {service.name}
                                        </Label>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        ₹{service.price} • {service.durationMinutes} min
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Assign Staff</Label>
                            <Select
                                value={formData.staffId}
                                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Any available" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any Available</SelectItem>
                                    {staff.map((person) => {
                                        const roleLabel: Record<string, string> = {
                                            OWNER: 'Owner', MANAGER: 'Manager',
                                            STAFF: 'Stylist', RECEPTIONIST: 'Receptionist',
                                        }
                                        return (
                                            <SelectItem key={person.id} value={person.id}>
                                                <span>{person.name}</span>
                                                <span className="ml-2 text-[10px] font-semibold text-gray-400">
                                                    {roleLabel[person.role] ?? person.role}
                                                </span>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Payment Mode</Label>
                            <Select
                                value={formData.paymentMode}
                                onValueChange={(value) => setFormData({ ...formData, paymentMode: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount:</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>Total Duration:</span>
                            <span>{totalDuration} minutes</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || formData.selectedServices.length === 0}
                        >
                            {loading ? 'Processing...' : 'Check-in & Process Payment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}