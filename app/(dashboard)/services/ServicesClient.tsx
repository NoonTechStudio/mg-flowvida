'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Each category: its display label, color, and which parent group it belongs to
const CATEGORY_CONFIG: Record<string, { label: string; color: string; parent: string }> = {
  // Hair
  HAIR:             { label: 'Hair',             color: 'bg-pink-100 text-pink-700',     parent: 'HAIR' },
  HAIR_CUT:         { label: 'Hair Cut',          color: 'bg-pink-100 text-pink-700',     parent: 'HAIR' },
  HAIR_STYLING:     { label: 'Hair Styling',      color: 'bg-pink-100 text-pink-700',     parent: 'HAIR' },
  HAIR_COLOUR:      { label: 'Hair Colour',       color: 'bg-rose-100 text-rose-700',     parent: 'HAIR' },
  HAIR_TREATMENT:   { label: 'Hair Treatment',    color: 'bg-rose-100 text-rose-700',     parent: 'HAIR' },
  HAIR_SPA:         { label: 'Hair Spa',          color: 'bg-pink-100 text-pink-700',     parent: 'HAIR' },
  SCALP_TREATMENT:  { label: 'Scalp Treatment',   color: 'bg-rose-100 text-rose-700',     parent: 'HAIR' },
  // Skin
  SKIN:             { label: 'Skin',              color: 'bg-amber-100 text-amber-700',   parent: 'SKIN' },
  FACIAL:           { label: 'Facial',            color: 'bg-amber-100 text-amber-700',   parent: 'SKIN' },
  SKIN_CARE:        { label: 'Skin Care',         color: 'bg-amber-100 text-amber-700',   parent: 'SKIN' },
  WAXING:           { label: 'Waxing',            color: 'bg-yellow-100 text-yellow-700', parent: 'SKIN' },
  THREADING:        { label: 'Threading',         color: 'bg-yellow-100 text-yellow-700', parent: 'SKIN' },
  // Nails
  NAILS:            { label: 'Nails',             color: 'bg-purple-100 text-purple-700', parent: 'NAILS' },
  // Spa & Massage
  SPA:              { label: 'Spa',               color: 'bg-emerald-100 text-emerald-700', parent: 'SPA' },
  MASSAGE:          { label: 'Massage',           color: 'bg-emerald-100 text-emerald-700', parent: 'SPA' },
  // Men's
  MENS:             { label: "Men's",             color: 'bg-sky-100 text-sky-700',       parent: 'MENS' },
  // Special
  BRIDAL:           { label: 'Bridal',            color: 'bg-red-100 text-red-700',       parent: 'BRIDAL' },
  OTHER:            { label: 'Other',             color: 'bg-blue-100 text-blue-700',     parent: 'OTHER' },
}

// Parent filter tabs — each contains one or more categories
const PARENT_TABS: { key: string; label: string; cats: string[] }[] = [
  { key: 'ALL',    label: 'All Services', cats: Object.keys(CATEGORY_CONFIG) },
  { key: 'HAIR',   label: 'Hair',         cats: ['HAIR','HAIR_CUT','HAIR_STYLING','HAIR_COLOUR','HAIR_TREATMENT','HAIR_SPA','SCALP_TREATMENT'] },
  { key: 'SKIN',   label: 'Skin',         cats: ['SKIN','FACIAL','SKIN_CARE','WAXING','THREADING'] },
  { key: 'NAILS',  label: 'Nails',        cats: ['NAILS'] },
  { key: 'SPA',    label: 'Spa & Massage',cats: ['SPA','MASSAGE'] },
  { key: 'MENS',   label: "Men's",        cats: ['MENS'] },
  { key: 'BRIDAL', label: 'Bridal',       cats: ['BRIDAL'] },
  { key: 'OTHER',  label: 'Other',        cats: ['OTHER'] },
]

// Ordered list of subcategory labels to display as section headers within each parent
const SUBCATEGORY_ORDER: Record<string, string[]> = {
  HAIR:   ['HAIR_CUT','HAIR_STYLING','HAIR_COLOUR','HAIR_TREATMENT','HAIR_SPA','SCALP_TREATMENT','HAIR'],
  SKIN:   ['FACIAL','SKIN_CARE','WAXING','THREADING','SKIN'],
  NAILS:  ['NAILS'],
  SPA:    ['MASSAGE','SPA'],
  MENS:   ['MENS'],
  BRIDAL: ['BRIDAL'],
  OTHER:  ['OTHER'],
  ALL:    Object.keys(CATEGORY_CONFIG),
}

// Grouped category options for the "Add Service" form dropdown
const CATEGORY_GROUPS = [
  { group: '✂️ Hair', options: ['HAIR_CUT','HAIR_STYLING','HAIR_COLOUR','HAIR_TREATMENT','HAIR_SPA','SCALP_TREATMENT'] },
  { group: '✨ Skin',  options: ['FACIAL','SKIN_CARE','WAXING','THREADING'] },
  { group: '💅 Nails', options: ['NAILS'] },
  { group: '🌿 Spa',   options: ['MASSAGE','SPA'] },
  { group: '💈 Men\'s',options: ['MENS'] },
  { group: '👰 Special',options: ['BRIDAL','OTHER'] },
]

interface ServicesClientProps {
  initialServices: any[]
  tenantId: string
}

export function ServicesClient({ initialServices, tenantId }: ServicesClientProps) {
  const [services, setServices] = useState(initialServices)
  const [editingService, setEditingService] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL')

  const tab = PARENT_TABS.find(t => t.key === activeTab)!
  const filtered = services.filter(s => tab.cats.includes(s.category))

  // Group filtered services by subcategory in display order
  const subcatOrder = SUBCATEGORY_ORDER[activeTab] || Object.keys(CATEGORY_CONFIG)
  const grouped: { cat: string; items: any[] }[] = subcatOrder
    .map(cat => ({ cat, items: filtered.filter(s => s.category === cat) }))
    .filter(g => g.items.length > 0)

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

  return (
    <div className="space-y-5">
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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <ServiceForm service={editingService} tenantId={tenantId} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Parent category filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {PARENT_TABS.map(tab => {
          const count = services.filter(s => tab.cats.includes(s.category)).length
          if (tab.key !== 'ALL' && count === 0) return null
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === tab.key ? { backgroundColor: '#004741' } : {}}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-white/70' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Services grouped by subcategory */}
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
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.map(({ cat, items }) => (
                <>
                  {/* Subcategory section header */}
                  <TableRow key={`header-${cat}`} className="bg-gray-50 hover:bg-gray-50">
                    <TableCell colSpan={6} className="py-2 px-4">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_CONFIG[cat]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {CATEGORY_CONFIG[cat]?.label || cat}
                        <span className="ml-1.5 opacity-60">{items.length}</span>
                      </span>
                    </TableCell>
                  </TableRow>
                  {items.map(service => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                          <div>
                            <p className="font-medium text-sm">{service.name}</p>
                            {service.description && (
                              <p className="text-xs text-gray-400 max-w-xs truncate">{service.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_CONFIG[service.category]?.color || 'bg-gray-100 text-gray-600'}`}>
                          {CATEGORY_CONFIG[service.category]?.label || service.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900 text-sm">{formatCurrency(service.price)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{service.durationMinutes} min</span>
                      </TableCell>
                      <TableCell>
                        <Switch checked={service.isActive} onCheckedChange={(v) => handleToggle(service.id, v)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingService(service); setDialogOpen(true) }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
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
  service: any; tenantId: string; onSuccess: (s: any, isEdit: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: service?.name || '',
    category: service?.category || 'HAIR_CUT',
    price: service?.price?.toString() || '',
    durationMinutes: service?.durationMinutes?.toString() || '30',
    description: service?.description || '',
    color: service?.color || '#ec4899',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) { setError('Name and price are required'); return }
    setLoading(true); setError('')
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
        <Input placeholder="e.g. Basic Facial" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger>
              <span className="text-sm">{CATEGORY_CONFIG[form.category]?.label || form.category}</span>
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_GROUPS.map(({ group, options }) => (
                <div key={group}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group}</div>
                  {options.map(key => (
                    <SelectItem key={key} value={key}>{CATEGORY_CONFIG[key]?.label || key}</SelectItem>
                  ))}
                </div>
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
              onChange={e => setForm({ ...form, color: e.target.value })}
              className="h-9 w-12 rounded-md border border-gray-200 cursor-pointer"
            />
            <Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="flex-1 font-mono text-xs" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Price (₹) *</Label>
          <Input type="number" placeholder="500" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} min="0" required />
        </div>
        <div className="space-y-1">
          <Label>Duration (minutes)</Label>
          <Input type="number" placeholder="45" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} min="5" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Description (optional)</Label>
        <Input placeholder="Brief description of the service" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : service ? 'Update Service' : 'Add Service'}
      </Button>
    </form>
  )
}
