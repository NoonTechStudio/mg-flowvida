'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserCog, UserPlus, Phone, CheckCircle, Award, Eye, EyeOff } from 'lucide-react'

const roleColors: Record<string, string> = {
  OWNER: 'bg-violet-100 text-violet-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  STAFF: 'bg-emerald-100 text-emerald-800',
  RECEPTIONIST: 'bg-amber-100 text-amber-800',
}

interface StaffClientProps {
  initialStaff: any[]
  tenantId: string
}

export function StaffClient({ initialStaff, tenantId }: StaffClientProps) {
  const [staffList, setStaffList] = useState(initialStaff)
  const [addOpen, setAddOpen] = useState(false)

  const handleAdd = (member: any) => {
    setStaffList(prev => [...prev, member])
    setAddOpen(false)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      setStaffList(prev => prev.map(s => s.id === id ? { ...s, isActive } : s))
    } catch {
      console.error('Failed to update staff')
    }
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500">{staffList.filter(s => s.isActive).length} active team members</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <AddStaffForm tenantId={tenantId} onSuccess={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {['OWNER', 'MANAGER', 'STAFF', 'RECEPTIONIST'].map(role => (
          <Card key={role} className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {staffList.filter(s => s.role === role && s.isActive).length}
            </p>
            <p className="text-xs text-gray-500 capitalize mt-1">{role.charAt(0) + role.slice(1).toLowerCase()}</p>
          </Card>
        ))}
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((member) => (
          <Card key={member.id} className={`p-5 ${!member.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-semibold bg-violet-100 text-violet-700">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[member.role] || 'bg-gray-100 text-gray-600'}`}>
                    {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
              <Switch
                checked={member.isActive}
                onCheckedChange={(v) => handleToggleActive(member.id, v)}
              />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {member.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                {member._count?.appointments || 0} services completed
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-gray-500">
                  {member._count?.appointments >= 50 ? 'Expert Stylist' :
                    member._count?.appointments >= 20 ? 'Senior Stylist' :
                      member._count?.appointments >= 5 ? 'Stylist' : 'Junior Stylist'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {staffList.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16 text-gray-400">
          <UserCog className="w-12 h-12 mb-3 text-gray-200" />
          <p className="font-medium">No staff members yet</p>
          <p className="text-sm mt-1">Add your first team member above</p>
        </Card>
      )}
    </div>
  )
}

function AddStaffForm({ tenantId, onSuccess }: { tenantId: string; onSuccess: (s: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', role: 'STAFF', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) { setError('Name and phone are required'); return }
    if (!form.password || form.password.length < 4) { setError('Demo password must be at least 4 characters'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenantId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to add staff'); return }
      onSuccess(data.staff)
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
          <Input placeholder="Pooja Patel" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <Label>Phone *</Label>
          <Input placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="numeric" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="STAFF">Stylist/Staff</SelectItem>
              <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Email (optional)</Label>
          <Input type="email" placeholder="pooja@parlor.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Demo Password *</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Temporary password for first login (min 4 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={4}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400">Staff will be forced to change this on first login.</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Adding...' : 'Add Staff Member'}
      </Button>
    </form>
  )
}
