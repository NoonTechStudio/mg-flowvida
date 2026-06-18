'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Users } from 'lucide-react';

export default function MarketingPage() {
    const [targetAudience, setTargetAudience] = useState('all');
    const [message, setMessage] = useState('');
    const [offer, setOffer] = useState('');
    const [expiryDays, setExpiryDays] = useState(7);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const audienceOptions = [
        { value: 'all', label: 'All Customers' },
        { value: 'recent', label: 'Visited in last 30 days' },
        { value: 'dormant', label: 'Not visited in 60+ days' },
        { value: 'vip', label: 'Spent over ₹5,000' }
    ];

    const handleSendCampaign = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/admin/marketing/send-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audience: targetAudience,
                    message,
                    offer,
                    expiryDays
                })
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Campaign failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const previewMessage = `
Dear [Customer Name],

${message}

🎁 Special Offer: ${offer}
⏰ Valid for: ${expiryDays} days

Book your appointment now: [Booking Link]

We look forward to seeing you! 💕
  `.trim();

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-3xl font-bold">Marketing Campaigns</h1>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Create Campaign</h2>

                <div className="space-y-6">
                    <div>
                        <Label>Target Audience</Label>
                        <RadioGroup
                            value={targetAudience}
                            onValueChange={setTargetAudience}
                            className="grid grid-cols-2 gap-4 mt-2"
                        >
                            {audienceOptions.map(option => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={option.value} />
                                    <Label htmlFor={option.value}>{option.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div>
                        <Label>Main Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="We've missed you! Come in for a relaxing facial..."
                            className="mt-2"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Special Offer</Label>
                            <Input
                                value={offer}
                                onChange={(e) => setOffer(e.target.value)}
                                placeholder="20% off on all facials"
                            />
                        </div>
                        <div>
                            <Label>Valid for (days)</Label>
                            <Input
                                type="number"
                                value={expiryDays}
                                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                                min={1}
                                max={30}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Preview</Label>
                        <div className="bg-gray-50 p-4 rounded-lg mt-2">
                            <pre className="whitespace-pre-wrap font-sans text-sm">
                                {previewMessage}
                            </pre>
                        </div>
                    </div>

                    {result && (
                        <Alert>
                            <AlertDescription>
                                Campaign sent! ✅ Success: {result.success}, Failed: {result.failed}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSendCampaign}
                            disabled={loading || !message || !offer}
                            size="lg"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {loading ? 'Sending...' : 'Send Campaign'}
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Campaign History</h2>
                <p className="text-gray-500">No campaigns sent yet.</p>
            </Card>
        </div>
    );
}