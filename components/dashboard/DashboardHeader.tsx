'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bell, LogOut, Store, Menu } from 'lucide-react'

interface DashboardHeaderProps {
  user: {
    name?: string | null
    role?: string
    tenantId?: string
  }
  tenantId?: string | null
  businessName?: string
  onMobileMenuToggle?: () => void
}

export function DashboardHeader({ user, businessName, onMobileMenuToggle }: DashboardHeaderProps) {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const roleLabel: Record<string, string> = {
    OWNER: 'Owner',
    MANAGER: 'Manager',
    STAFF: 'Stylist',
    RECEPTIONIST: 'Receptionist',
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Left: hamburger (mobile) + business name */}
      <div className="flex items-center gap-2">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 -ml-1 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Store className="w-4 h-4 text-[#004741]" />
        <span className="text-sm font-semibold text-gray-700 truncate max-w-[140px] sm:max-w-none">
          {businessName || 'Beauty Parlor'}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell (decorative for demo) */}
        <button className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-500">
          <Bell className="w-4 h-4" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-tight">{user.name || 'Staff'}</p>
            <p className="text-xs text-gray-400">{roleLabel[user.role || ''] || user.role}</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-gray-400 hover:text-red-500"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
