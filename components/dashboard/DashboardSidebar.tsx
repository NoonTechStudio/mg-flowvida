'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  UserCog,
  BarChart3,
  Settings,
  X,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/appointments', icon: CalendarDays, label: 'Appointments' },
  { href: '/dashboard/my-schedule', icon: CalendarCheck, label: 'My Schedule' },
  { href: '/dashboard/customers', icon: Users, label: 'Customers' },
  { href: '/dashboard/services', icon: Scissors, label: 'Services' },
  { href: '/dashboard/staff', icon: UserCog, label: 'Staff' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
]

const adminItems = [
  { href: '/admin', icon: ShieldCheck, label: 'Admin' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

// Bottom nav shows only 5 items on mobile (most important)
const bottomNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/appointments', icon: CalendarDays, label: 'Appts' },
  { href: '/dashboard/my-schedule', icon: CalendarCheck, label: 'My Day' },
  { href: '/dashboard/customers', icon: Users, label: 'Clients' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface DashboardSidebarProps {
  userRole: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({ userRole, mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
        isActive(item.href)
          ? 'bg-[#004741]/10 text-[#004741]'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <item.icon className={cn('w-4 h-4 shrink-0', isActive(item.href) ? 'text-[#004741]' : 'text-gray-400')} />
      {item.label}
    </Link>
  )

  return (
    <>
      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─────────────────────────────── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col h-full shrink-0">
        {/* Logo */}
        <div className="flex items-center px-5 py-4 border-b border-gray-100">
          <Image src="/Logo.png" alt="FlowVida" width={110} height={36} className="object-contain" priority />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
          {navItems.map((item) => <NavLink key={item.href} item={item} />)}

          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mt-4 mb-2">Admin</p>
              {adminItems.map((item) => <NavLink key={item.href} item={item} />)}
            </>
          )}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">FlowVida v1.0</p>
        </div>
      </aside>

      {/* ─── MOBILE SLIDE-OUT DRAWER ─────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl md:hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Image src="/Logo.png" alt="FlowVida" width={100} height={32} className="object-contain" />
              <button onClick={onMobileClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
              {navItems.map((item) => <NavLink key={item.href} item={item} onClick={onMobileClose} />)}

              {(userRole === 'OWNER' || userRole === 'MANAGER') && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mt-4 mb-2">Admin</p>
                  {adminItems.map((item) => <NavLink key={item.href} item={item} onClick={onMobileClose} />)}
                </>
              )}
            </nav>

            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">FlowVida v1.0</p>
            </div>
          </aside>
        </>
      )}

      {/* ─── MOBILE BOTTOM NAV BAR (iOS style) ─────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden bg-white/80 backdrop-blur-xl border-t border-gray-200/60 pb-safe">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-1 min-w-0 relative"
            >
              {active && (
                <span className="absolute top-1 w-5 h-1 rounded-full bg-[#004741] opacity-80" />
              )}
              <item.icon className={cn('w-5 h-5 shrink-0 transition-colors', active ? 'text-[#004741]' : 'text-gray-400')} />
              <span className={cn('text-[10px] font-semibold truncate transition-colors', active ? 'text-[#004741]' : 'text-gray-400')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
