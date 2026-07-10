'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Building2, Clock, Phone, Mail, User, Zap,
    CheckCircle, AlertCircle, Calendar, Scissors, MessageCircle, HeartHandshake
} from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
};

interface SettingsClientProps {
    tenant: {
        id: string;
        businessName: string;
        ownerName: string;
        ownerPhone: string;
        ownerEmail: string | null;
        plan: string;
        subdomain: string;
    };
    settings: any;
}

export function SettingsClient({ tenant, settings }: SettingsClientProps) {
    const [businessName, setBusinessName] = useState(tenant.businessName);
    const [ownerName, setOwnerName] = useState(tenant.ownerName);
    const [ownerEmail, setOwnerEmail] = useState(tenant.ownerEmail || '');
    const [slotDuration, setSlotDuration] = useState(settings?.slotDuration ?? 30);
    const [bufferTime, setBufferTime] = useState(settings?.bufferTime ?? 10);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const workingHours = settings?.workingHours as Record<string, { start: string; end: string } | null> ?? {
        monday: { start: '09:00', end: '20:00' },
        tuesday: { start: '09:00', end: '20:00' },
        wednesday: { start: '09:00', end: '20:00' },
        thursday: { start: '09:00', end: '20:00' },
        friday: { start: '09:00', end: '20:00' },
        saturday: { start: '09:00', end: '21:00' },
        sunday: null,
    };

    const [hours, setHours] = useState(workingHours);

    const toggleDay = (day: string) => {
        setHours(prev => ({
            ...prev,
            [day]: prev[day] ? null : { start: '09:00', end: '20:00' }
        }));
    };

    const updateHour = (day: string, field: 'start' | 'end', value: string) => {
        setHours(prev => ({
            ...prev,
            [day]: prev[day] ? { ...prev[day]!, [field]: value } : { start: '09:00', end: '20:00', [field]: value }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessName, ownerName, ownerEmail, slotDuration, bufferTime, workingHours: hours })
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            console.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage your parlor profile and preferences</p>
                </div>
                <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2 shrink-0">
                    {saved ? <CheckCircle className="w-4 h-4" /> : null}
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                </Button>
            </div>

            {/* Business Info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-violet-600" />
                        Business Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="bizName">Parlor Name</Label>
                            <Input id="bizName" value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="subdomain">Subdomain</Label>
                            <div className="flex items-center mt-1">
                                <Input value={tenant.subdomain} disabled className="rounded-r-none bg-gray-50" />
                                <span className="px-3 h-9 flex items-center border border-l-0 rounded-r-lg bg-gray-100 text-gray-500 text-sm whitespace-nowrap">.flowvida.com</span>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="ownerName">Owner Name</Label>
                            <Input id="ownerName" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label>Owner Phone</Label>
                            <div className="flex items-center mt-1 gap-2">
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-sm font-medium text-gray-700">{tenant.ownerPhone}</span>
                                <Badge variant="secondary" className="text-xs">Primary login</Badge>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input id="email" type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} className="pl-9" placeholder="owner@email.com" />
                            </div>
                        </div>
                        <div>
                            <Label>Plan</Label>
                            <div className="mt-1">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${tenant.plan === 'PRO' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
                                    <Zap className="w-3.5 h-3.5" />
                                    {tenant.plan} Plan
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Booking Settings */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-violet-600" />
                        Booking Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="slot">Slot Duration (minutes)</Label>
                            <p className="text-xs text-gray-500 mb-2">Minimum time block for appointments</p>
                            <div className="flex gap-2">
                                {[15, 30, 45, 60].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setSlotDuration(v)}
                                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${slotDuration === v ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}
                                    >
                                        {v} min
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Buffer Time Between Appointments</Label>
                            <p className="text-xs text-gray-500 mb-2">Preparation / cleanup gap</p>
                            <div className="flex gap-2">
                                {[0, 5, 10, 15].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setBufferTime(v)}
                                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${bufferTime === v ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}
                                    >
                                        {v === 0 ? 'None' : `${v} min`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Built by / Support */}
            <Card className="border-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #004741 0%, #006b63 100%)' }}>
                <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(240,237,228,0.15)' }}>
                            <HeartHandshake className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm">Built by Meridian Grid</p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(240,237,228,0.7)' }}>
                                Questions, feedback, or need help? We're here for you.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <a
                                    href="mailto:zul@meridiangrid.in"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: 'rgba(240,237,228,0.15)', color: '#F0EDE4' }}
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    zul@meridiangrid.in
                                </a>
                                <a
                                    href="https://wa.me/918000403090"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: 'rgba(240,237,228,0.15)', color: '#F0EDE4' }}
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    WhatsApp +91-8000403090
                                </a>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-violet-600" />
                        Working Hours
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {DAYS.map(day => {
                            const isOpen = hours[day] !== null;
                            return (
                                <div key={day} className="rounded-xl border border-gray-100 px-3 py-2.5">
                                    {/* Top row: day label + toggle (+ Closed label) */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 text-sm font-semibold text-gray-700">{DAY_LABELS[day]}</span>
                                        <Switch checked={isOpen} onCheckedChange={() => toggleDay(day)} />
                                        {!isOpen && (
                                            <span className="text-xs text-gray-400 italic">Closed</span>
                                        )}
                                    </div>
                                    {/* Time inputs — shown below on mobile, inline on sm+ */}
                                    {isOpen && hours[day] && (
                                        <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto sm:inline-flex flex-wrap">
                                            <input
                                                type="time"
                                                value={hours[day]!.start}
                                                onChange={e => updateHour(day, 'start', e.target.value)}
                                                className="border rounded-lg px-2 py-1.5 text-sm flex-1 min-w-[100px] focus:outline-none focus:ring-2 focus:ring-violet-300"
                                            />
                                            <span className="text-gray-400 text-sm">to</span>
                                            <input
                                                type="time"
                                                value={hours[day]!.end}
                                                onChange={e => updateHour(day, 'end', e.target.value)}
                                                className="border rounded-lg px-2 py-1.5 text-sm flex-1 min-w-[100px] focus:outline-none focus:ring-2 focus:ring-violet-300"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
