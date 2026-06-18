'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewTenantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subdomain: '',
        businessName: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        plan: 'CORE'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/super-admin/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const tenant = await response.json();
                router.push(`/super-admin/tenants/${tenant.id}`);
            }
        } catch (error) {
            console.error('Failed to create tenant:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Parlor Tenant</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Subdomain</Label>
                            <div className="flex items-center">
                                <Input
                                    value={formData.subdomain}
                                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                                    placeholder="priya"
                                    required
                                />
                                <span className="ml-2 text-gray-500">.glamflow.com</span>
                            </div>
                        </div>

                        <div>
                            <Label>Business Name</Label>
                            <Input
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="Priya's Beauty Studio"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Owner Name</Label>
                                <Input
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    placeholder="Priya Sharma"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Owner Phone</Label>
                                <Input
                                    value={formData.ownerPhone}
                                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                                    placeholder="9876543210"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Owner Email (Optional)</Label>
                            <Input
                                type="email"
                                value={formData.ownerEmail}
                                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                                placeholder="priya@example.com"
                            />
                        </div>

                        <div>
                            <Label>Plan</Label>
                            <Select
                                value={formData.plan}
                                onValueChange={(value) => setFormData({ ...formData, plan: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CORE">Core (₹1,199/mo)</SelectItem>
                                    <SelectItem value="PRO">Pro (₹1,999/mo)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Creating...' : 'Create Tenant'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}