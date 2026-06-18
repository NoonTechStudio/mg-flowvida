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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { Plus, Search, Phone, Calendar, IndianRupee, Star, UserPlus } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface CustomersClientProps {
  initialCustomers: any[]
  tenantId: string
}

export function CustomersClient({ initialCustomers, tenantId }: CustomersClientProps) {
  const router = useRouter()
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const handleAddCustomer = (customer: any) => {
    setCustomers(prev => [customer, ...prev])
    setAddOpen(false)
  }

  const openDetail = (customer: any) => {
    setSelectedCustomer(customer)
    setDetailOpen(true)
  }

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const getLoyaltyBadge = (visits: number) => {
    if (visits >= 20) return { label: 'VIP', variant: 'default' as const }
    if (visits >= 10) return { label: 'Regular', variant: 'secondary' as const }
    if (visits >= 5) return { label: 'Loyal', variant: 'success' as const }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-xs md:text-sm text-gray-500">{customers.length} customers registered</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <UserPlus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Add Customer</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <AddCustomerForm tenantId={tenantId} onSuccess={handleAddCustomer} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-3 md:p-4">
          <p className="text-xs text-gray-500">Total Customers</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
        </Card>
        <Card className="p-3 md:p-4">
          <p className="text-xs text-gray-500">Active This Month</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
            {customers.filter(c => c.lastVisit && new Date(c.lastVisit) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
          </p>
        </Card>
        <Card className="p-3 md:p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
          </p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Customers list */}
      <Card>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="w-12 h-12 mb-3 text-gray-200" />
            <p className="font-medium">No customers found</p>
            <p className="text-sm mt-1">{search ? 'Try a different search' : 'Add your first customer above'}</p>
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE (md+) ── */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((customer) => {
                    const loyalty = getLoyaltyBadge(customer.totalVisits)
                    return (
                      <TableRow key={customer.id} className="cursor-pointer" onClick={() => openDetail(customer)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-pink-100 text-pink-700">{getInitials(customer.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-xs text-gray-400">{customer.gender || 'Not specified'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm"><Phone className="w-3 h-3 text-gray-400" />{customer.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-gray-400" /><span className="text-sm">{customer.totalVisits}</span></div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm font-medium"><IndianRupee className="w-3 h-3 text-gray-400" />{customer.totalSpent.toLocaleString('en-IN')}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'}</span>
                        </TableCell>
                        <TableCell>
                          {loyalty ? (<Badge variant={loyalty.variant} className="gap-1"><Star className="w-3 h-3" />{loyalty.label}</Badge>) : (<Badge variant="outline">New</Badge>)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* ── MOBILE CARD LIST (< md) ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((customer) => {
                const loyalty = getLoyaltyBadge(customer.totalVisits)
                return (
                  <div key={customer.id} className="flex items-center gap-3 p-4 active:bg-gray-50 cursor-pointer" onClick={() => openDetail(customer)}>
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback className="text-sm bg-pink-100 text-pink-700">{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
                        {loyalty ? (
                          <Badge variant={loyalty.variant} className="gap-1 shrink-0 text-[10px] py-0">
                            <Star className="w-2.5 h-2.5" />{loyalty.label}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 text-[10px] py-0">New</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{customer.totalVisits} visits</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">₹{customer.totalSpent.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400">{customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>

      {/* Customer Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerDetail customer={selectedCustomer} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddCustomerForm({ tenantId, onSuccess }: { tenantId: string; onSuccess: (c: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', gender: '', notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) { setError('Name and phone are required'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenantId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to add customer'); return }
      onSuccess(data.customer)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Full Name *</Label>
          <Input placeholder="Priya Shah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <Label>Phone *</Label>
          <Input placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="numeric" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" placeholder="priya@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Notes</Label>
        <Input placeholder="Allergies, preferences..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Adding...' : 'Add Customer'}
      </Button>
    </form>
  )
}

function CustomerDetail({ customer }: { customer: any }) {
  const getInitials = (name: string) =>
    name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-xl bg-pink-100 text-pink-700">
            {getInitials(customer.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
          <p className="text-gray-500">{customer.phone}</p>
          {customer.email && <p className="text-gray-400 text-sm">{customer.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-violet-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-violet-700">{customer.totalVisits}</p>
          <p className="text-xs text-violet-500 mt-1">Total Visits</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(customer.totalSpent)}</p>
          <p className="text-xs text-emerald-500 mt-1">Total Spent</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-amber-700">
            {customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'}
          </p>
          <p className="text-xs text-amber-500 mt-1">Last Visit</p>
        </div>
      </div>

      {customer.notes && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{customer.notes}</p>
        </div>
      )}
    </div>
  )
}
