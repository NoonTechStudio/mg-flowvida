'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Scissors,
  Users,
  CalendarPlus,
  UserPlus,
  BarChart3,
  Settings,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Scissors,
    title: 'Review your services',
    description: 'We have added common services to get you started. Edit prices, durations, and add your own.',
    href: '/dashboard/services',
    cta: 'Manage Services',
    color: 'bg-violet-50 border-violet-100 text-violet-600',
    iconBg: 'bg-violet-100',
  },
  {
    number: '02',
    icon: UserPlus,
    title: 'Add your staff',
    description: 'Add team members, set their roles, and share demo passwords so they can log in.',
    href: '/dashboard/staff',
    cta: 'Add Staff',
    color: 'bg-blue-50 border-blue-100 text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    number: '03',
    icon: CalendarPlus,
    title: 'Book your first appointment',
    description: 'Schedule a walk-in or advance booking. Pick a service, time slot, and assign a staff member.',
    href: '/dashboard/appointments',
    cta: 'Book Appointment',
    color: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    number: '04',
    icon: Users,
    title: 'Build your customer list',
    description: 'Customer profiles are created automatically when you book appointments. You can also add them manually.',
    href: '/dashboard/customers',
    cta: 'View Customers',
    color: 'bg-orange-50 border-orange-100 text-orange-600',
    iconBg: 'bg-orange-100',
  },
  {
    number: '05',
    icon: BarChart3,
    title: 'Track your revenue',
    description: 'After completing appointments, mark payments to see daily and monthly revenue reports.',
    href: '/dashboard/reports',
    cta: 'View Reports',
    color: 'bg-pink-50 border-pink-100 text-pink-600',
    iconBg: 'bg-pink-100',
  },
  {
    number: '06',
    icon: Settings,
    title: 'Configure your settings',
    description: 'Set your working hours, slot duration, and buffer time between appointments.',
    href: '/dashboard/settings',
    cta: 'Open Settings',
    color: 'bg-slate-50 border-slate-200 text-slate-600',
    iconBg: 'bg-slate-100',
  },
]

interface OnboardingGuideProps {
  ownerName: string
  parlorName: string
}

export function OnboardingGuide({ ownerName, parlorName }: OnboardingGuideProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const firstName = ownerName?.split(' ')[0] || 'there'

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#004741] to-[#005a52] rounded-2xl p-5 mb-4 overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-2 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">Getting started</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-snug">
              Welcome, {firstName}! 👋
            </h2>
            <p className="text-white/60 text-sm mt-1">
              <span className="text-white/80 font-medium">{parlorName}</span> is set up.
              Follow these steps to go live in minutes.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
            aria-label="Dismiss guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="relative flex items-center gap-1.5 mt-4">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === 0 ? 'w-6 bg-emerald-400' : 'w-2 bg-white/20'}`} />
          ))}
        </div>
      </div>

      {/* Guide cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STEPS.map((step) => {
          const Icon = step.icon
          return (
            <Link
              key={step.number}
              href={step.href}
              className={`group relative border rounded-2xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${step.color}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${step.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold opacity-40 tracking-widest">STEP {step.number}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="font-semibold text-sm text-gray-900 mt-0.5 leading-snug">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-current/10">
                <span className="text-xs font-semibold">{step.cta} →</span>
              </div>
            </Link>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        This guide disappears once you book your first appointment.
        <button onClick={() => setDismissed(true)} className="ml-2 underline underline-offset-2 hover:text-gray-600 transition-colors">
          Dismiss for now
        </button>
      </p>
    </div>
  )
}
