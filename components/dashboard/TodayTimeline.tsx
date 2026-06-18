'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    Clock,
    UserCheck,
    Scissors,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { updateAppointmentStatus } from '@/lib/actions/appointments';

type StatusKey = 'CONFIRMED' | 'CHECKED_IN' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const statusConfig: Record<StatusKey, { label: string; color: string; icon: React.ElementType }> = {
    CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: Clock },
    CHECKED_IN: { label: 'Checked In', color: 'bg-yellow-100 text-yellow-800', icon: UserCheck },
    IN_SERVICE: { label: 'In Service', color: 'bg-purple-100 text-purple-800', icon: Scissors },
    COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    NO_SHOW: { label: 'No Show', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
};

interface TodayTimelineProps {
    appointments: any[];
    userRole: string;
    userId: string;
}

export function TodayTimeline({ appointments, userRole, userId }: TodayTimelineProps) {
    const [appointmentsList, setAppointmentsList] = useState(appointments);

    const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
        const result = await updateAppointmentStatus(appointmentId, newStatus);

        if (result.success) {
            setAppointmentsList(prev =>
                prev.map(apt =>
                    apt.id === appointmentId
                        ? { ...apt, status: newStatus }
                        : apt
                )
            );
        }
    };

    const getNextAction = (status: string): { label: string; status: string } | null => {
        switch (status) {
            case 'CONFIRMED': return { label: 'Check-in', status: 'CHECKED_IN' };
            case 'CHECKED_IN': return { label: 'Start Service', status: 'IN_SERVICE' };
            case 'IN_SERVICE': return { label: 'Complete', status: 'COMPLETED' };
            default: return null;
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Timeline</h2>

            <div className="space-y-3">
                {appointmentsList.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No appointments scheduled for today.</p>
                ) : (
                    appointmentsList.map((appointment) => {
                        const status = appointment.status as StatusKey;
                        const StatusIcon = statusConfig[status]?.icon || Clock;
                        const nextAction = getNextAction(appointment.status);
                        const isAssignedToUser = !appointment.staffId || appointment.staffId === userId;

                        return (
                            <div
                                key={appointment.id}
                                className="p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Time column */}
                                    <div className="text-center min-w-[52px] shrink-0">
                                        <p className="font-mono text-sm md:text-base font-semibold leading-tight">
                                            {new Date(appointment.startTime).toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-gray-400">
                                            {appointment.service.durationMinutes}m
                                        </p>
                                    </div>

                                    {/* Info + actions */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm md:text-base truncate">{appointment.customer?.name || 'Walk-in'}</p>
                                                <p className="text-xs md:text-sm text-gray-500 truncate">{appointment.service.name}</p>
                                                {appointment.staff && (
                                                    <p className="text-xs text-gray-400">with {appointment.staff.name}</p>
                                                )}
                                            </div>
                                            <Badge className={`${statusConfig[status]?.color} shrink-0 text-[10px] md:text-xs`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                <span className="hidden sm:inline">{statusConfig[status]?.label}</span>
                                                <span className="sm:hidden">{statusConfig[status]?.label.split(' ')[0]}</span>
                                            </Badge>
                                        </div>

                                        {/* Action buttons — full width row below on mobile */}
                                        {isAssignedToUser && (nextAction || appointment.status === 'CONFIRMED') && (
                                            <div className="flex gap-2 mt-2">
                                                {nextAction && (
                                                    <Button
                                                        size="sm"
                                                        className="h-7 text-xs px-3"
                                                        onClick={() => handleStatusUpdate(appointment.id, nextAction.status)}
                                                    >
                                                        {nextAction.label}
                                                    </Button>
                                                )}
                                                {appointment.status === 'CONFIRMED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs px-3 text-red-600 border-red-200"
                                                        onClick={() => handleStatusUpdate(appointment.id, 'NO_SHOW')}
                                                    >
                                                        No Show
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
}