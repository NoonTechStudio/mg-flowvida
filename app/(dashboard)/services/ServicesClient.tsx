'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Scissors, Sparkles, Flower, Star, Hand, Leaf } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  HAIR: { label: 'Hair', icon: Scissors, color: 'bg-pink-100 text-pink-700' },
  SKIN: { label: 'Skin', icon: Sparkles, color: 'bg-amber-100 text-amber-700' },
  BRIDAL: { label: 'Bridal', icon: Star, color: 'bg-red-100 text-red-700' },
  NAILS: { label: 'Nails', icon: Hand, color: 'bg-purple-100 text-purple-700' },
  SPA: { label: 'Spa', icon: Leaf, color: 'bg-emerald-100 text-emerald-700' },
  OTHER: { label: 'Other', icon: Flower, color: 'bg-blue-100 text-blue-700' },
}

interface ServicesClientProps {
  initialServices: any[]
  tenantId: string
}

export function ServicesClient({ initialServices, tenantId }: ServicesClientProps) {
  const [services, setServices] = useState(initialServices)
  const [editingService, setEditingService] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('ALL')

  const categories = ['ALL', ...Object.keys(categoryConfig)]
  const filtered = activeCategory === 'ALL' ? services : services.filter(s => s.category === activeCategory)

  const handleSuccess = (service: any, isEdit: boolean) => {
    if (isEdit) {
      setServices(prev => prev.map(s => s.id === service.id ? service : s))
    } else {
      setServices(prev => [...prev, service])
    }
    setDialogOpen(false)
    setEditingService(null)
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      setServices(prev => prev.map(s => s.id === id ? { ...s, isActive } : s))
    } catch {
      console.error('Failed to update service')
    }
  }

  // Group by category for summary
  const categoryRevenue = Object.keys(categoryConfig).map(cat => ({
    key: cat,
    count: services.filter(s => s.category === cat && s.isActive).length,
    ...categoryConfig[cat],
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500">
            {services.filter(s => s.isActive).length} active of {services.length} total services
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingService(null) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <ServiceForm
              service={editingService}
              tenantId={tenantId}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-violet-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat === 'ALL' ? 'All Services' : categoryConfig[cat].label}
            <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'text-violet-200' : 'text-gray-400'}`}>
              {cat === 'ALL' ? services.length : services.filter(s => s.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Services Table */}
      <Card>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Scissors className="w-12 h-12 mb-3 text-gray-200" />
            <p className="font-medium">No services found</p>
            <p className="text-sm mt-1">Add your first service using the button above</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((service) => {
                const config = categoryConfig[service.category] || categoryConfig.OTHER
                const Icon = config.icon
                return (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: service.color }}
                        />
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-gray-400 max-w-xs truncate">{service.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">{formatCurrency(service.price)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{service.durationMinutes} min</span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={(v) => handleToggle(service.id, v)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingService(service)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}

function ServiceForm({
  service, tenantId, onSuccess
}: {
  service: any, tenantId: string, onSuccess: (s: any, isEdit: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: service?.name || '',
    category: service?.category || 'HAIR',
    price: service?.price?.toString() || '',
    durationMinutes: service?.durationMinutes?.toString() || '30',
    description: service?.description || '',
    color: service?.color || '#7c3aed',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) { setError('Name and price are required'); return }
    setLoading(true)
    setError('')

    try {
      const url = service ? `/api/services/${service.id}` : '/api/services'
      const method = service ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenantId, price: parseFloat(form.price), durationMinutes: parseInt(form.durationMinutes) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save service'); return }
      onSuccess(data.service, !!service)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Service Name *</Label>
        <Input placeholder="Gold Facial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-9 w-14 rounded-md border border-gray-200 cursor-pointer"
            />
            <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1 font-mono text-xs" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Price (₹) *</Label>
          <Input type="number" placeholder="800" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" required />
        </div>
        <div className="space-y-1">
          <Label>Duration (minutes)</Label>
          <Input type="number" placeholder="45" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} min="5" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Description (optional)</Label>
        <Input placeholder="Includes cleansing, scrubbing, and massage" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : service ? 'Update Service' : 'Add Service'}
      </Button>
    </form>
  )
}
