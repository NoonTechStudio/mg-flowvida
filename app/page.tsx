'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// ─── Brand tokens ───────────────────────────────────────────────────────────
// Cyprus: #004741   Sand: #F0EDE4

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#004741]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Image src="/Logo.png" alt="FlowVida" width={130} height={44} className="object-contain" priority />

        {/* Desktop links */}
        <div
          className="hidden md:flex items-center gap-8 text-[#F0EDE4] text-sm font-medium"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          <a href="#features" className="hover:opacity-75 transition-opacity">Features</a>
          <a href="#pricing" className="hover:opacity-75 transition-opacity">Pricing</a>
          <a href="#faq" className="hover:opacity-75 transition-opacity">FAQ</a>
          <Link
            href="/login"
            className="bg-[#F0EDE4] text-[#004741] font-semibold px-5 py-2 rounded-full hover:bg-white transition-colors text-sm"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#F0EDE4]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden bg-[#004741] border-t border-[#F0EDE4]/20 px-6 pb-6 flex flex-col gap-4"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          <a href="#features" className="text-[#F0EDE4] text-sm font-medium py-2" onClick={() => setOpen(false)}>Features</a>
          <a href="#pricing" className="text-[#F0EDE4] text-sm font-medium py-2" onClick={() => setOpen(false)}>Pricing</a>
          <a href="#faq" className="text-[#F0EDE4] text-sm font-medium py-2" onClick={() => setOpen(false)}>FAQ</a>
          <Link
            href="/login"
            className="bg-[#F0EDE4] text-[#004741] font-semibold px-5 py-2.5 rounded-full text-sm text-center"
            onClick={() => setOpen(false)}
          >
            Start Free Trial
          </Link>
        </div>
      )}
    </nav>
  )
}

// ─── Section 1: Hero ─────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="bg-[#F0EDE4] pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#004741] leading-tight mb-6"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Run your parlor smarter, not harder.
        </h1>
        <p
          className="text-[#004741]/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          All-in-one management platform built exclusively for beauty parlors. Appointments, clients, staff, and revenue — all from one elegant dashboard. Say goodbye to paper notepads and WhatsApp lists.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="bg-[#004741] text-[#F0EDE4] font-semibold px-8 py-3.5 rounded-full hover:bg-[#003530] transition-colors text-base w-full sm:w-auto text-center"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            Start Free — 7 Days Trial
          </Link>
          <a
            href="#features"
            className="border-2 border-[#004741] text-[#004741] font-semibold px-8 py-3.5 rounded-full hover:bg-[#004741]/10 transition-colors text-base w-full sm:w-auto text-center"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            See How It Works
          </a>
        </div>
        <p
          className="mt-6 text-sm text-[#004741]/60"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          7 days free · No card required · Cancel anytime
        </p>
      </div>
    </section>
  )
}

// ─── Section 2: Problem ───────────────────────────────────────────────────────
function Problem() {
  const cards = [
    {
      icon: '📋',
      title: 'Appointment chaos',
      body: 'Paper registers, WhatsApp messages, phone calls. One missed message and a client shows up at the wrong time.',
    },
    {
      icon: '👩‍💼',
      title: 'Staff management headaches',
      body: "Who's working today? Who handled which client? Tracking staff manually wastes hours every week.",
    },
    {
      icon: '💸',
      title: 'Revenue flying blind',
      body: 'No clear picture of daily earnings, top services, or which staff member is performing best.',
    },
  ]

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#004741] text-center mb-12"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Sound familiar?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-t-4 border-t-[#004741]"
            >
              <div className="text-4xl mb-4">{c.icon}</div>
              <h3
                className="text-[#004741] font-semibold text-lg mb-2"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                {c.title}
              </h3>
              <p
                className="text-gray-600 text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 3: How It Works ─────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: '1',
      title: 'Create your account',
      body: 'Enter your parlor name, mobile number, and city. Done in under 2 minutes.',
    },
    {
      n: '2',
      title: 'Set up your parlor',
      body: 'Add your services, staff members, and working hours. FlowVida is ready to take bookings immediately.',
    },
    {
      n: '3',
      title: 'Run everything from one dashboard',
      body: 'Appointments, walk-ins, revenue, staff — all in one place. Open the app and your entire business is in front of you.',
    },
  ]

  return (
    <section className="bg-[#F0EDE4] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#004741] text-center mb-14"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Up and running in 3 steps
        </h2>
        <div className="flex flex-col md:flex-row gap-8">
          {steps.map((s) => (
            <div key={s.n} className="flex-1 flex flex-col items-start md:items-center text-left md:text-center">
              <div
                className="w-12 h-12 rounded-full bg-[#004741] text-[#F0EDE4] flex items-center justify-center text-lg font-bold mb-4 shrink-0"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {s.n}
              </div>
              <h3
                className="text-[#004741] font-semibold text-lg mb-2"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                {s.title}
              </h3>
              <p
                className="text-[#004741]/70 text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 4: Features ─────────────────────────────────────────────────────
function Features() {
  const items = [
    { icon: '📅', title: 'Appointment booking', desc: 'Visual calendar with instant booking and confirmations. No more double bookings.' },
    { icon: '👥', title: 'Customer database', desc: "Every client's history, preferences, and spending — tracked automatically." },
    { icon: '🚶', title: 'Walk-in & sales', desc: 'Handle walk-ins instantly. Record services, assign staff, collect payment.' },
    { icon: '📊', title: 'Revenue reports', desc: 'Daily, weekly, and monthly revenue at a glance. Know your top services and best performers.' },
    { icon: '👩‍🔧', title: 'Staff management', desc: 'Manage stylists and receptionists. Track attendance and individual performance.' },
    { icon: '🔒', title: 'Secure & reliable', desc: 'OTP-based login and role-based access. Your data is always protected.' },
  ]

  return (
    <section id="features" className="bg-white py-20 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#004741] text-center mb-12"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Everything your parlor needs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((f) => (
            <div
              key={f.title}
              className="bg-[#F0EDE4] rounded-2xl p-6 border-t-4 border-t-[#004741]"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3
                className="text-[#004741] font-semibold text-lg mb-2"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                {f.title}
              </h3>
              <p
                className="text-[#004741]/70 text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 5: Pricing ───────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Starter',
      subtitle: 'Solo owner or small parlor',
      price: '₹299',
      features: [
        '1 staff seat',
        'Appointment booking & calendar',
        'Customer database',
        'Basic revenue reports',
      ],
      highlight: false,
    },
    {
      name: 'Growth',
      subtitle: 'Growing parlor with a team',
      price: '₹499',
      badge: 'Most popular',
      features: [
        'Up to 3 staff seats',
        'Everything in Starter',
        'Staff management & scheduling',
        'Full revenue analytics',
        'Walk-in & sales tracking',
      ],
      highlight: true,
    },
    {
      name: 'Pro',
      subtitle: 'Established parlor or multi-branch',
      price: '₹799',
      features: [
        'Unlimited staff seats',
        'Everything in Growth',
        'Multi-branch support',
        'Priority support',
        'Data export',
      ],
      highlight: false,
    },
  ]

  return (
    <section id="pricing" className="bg-[#004741] py-20 px-6 scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#F0EDE4] text-center mb-3"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Simple pricing. Grows with your parlor.
        </h2>
        <p
          className="text-[#F0EDE4]/70 text-center mb-12 max-w-xl mx-auto"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          Start completely free for 7 days. No card needed. Pick a plan only when you&apos;re ready.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                p.highlight
                  ? 'bg-white rounded-2xl p-7 border-2 border-[#004741] shadow-xl relative md:-mt-4 md:pb-11'
                  : 'bg-[#F0EDE4] rounded-2xl p-7'
              }
            >
              {p.badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#004741] text-[#F0EDE4] text-xs font-semibold px-4 py-1 rounded-full"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  {p.badge}
                </span>
              )}
              <h3
                className="text-[#004741] font-bold text-xl mb-1"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                {p.name}
              </h3>
              <p
                className="text-[#004741]/60 text-sm mb-4"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {p.subtitle}
              </p>
              <p
                className="text-[#004741] font-bold text-3xl mb-6"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {p.price}<span className="text-base font-normal">/month</span>
              </p>
              <ul className="space-y-2 mb-8">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[#004741]"
                    style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                  >
                    <span className="text-[#004741] font-bold mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block text-center bg-[#004741] text-[#F0EDE4] font-semibold py-3 rounded-full hover:bg-[#003530] transition-colors text-sm"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>

        <p
          className="text-center text-[#F0EDE4]/60 text-sm mt-8"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          7-day free trial · No card needed · Cancel anytime
        </p>
      </div>
    </section>
  )
}

// ─── Section 6: FAQ ───────────────────────────────────────────────────────────
const faqItems = [
  {
    q: 'Is this only for beauty parlors?',
    a: 'Yes — FlowVida is built exclusively for beauty parlors. Every feature is designed around how a parlor actually works.',
  },
  {
    q: 'Do I need to download an app?',
    a: 'No. FlowVida works right in your browser on any device. Just open the link and you\'re in.',
  },
  {
    q: 'What happens after my 7-day trial?',
    a: 'Choose a plan and continue. If you don\'t subscribe, your account is paused but your data stays safe.',
  },
  {
    q: 'Can I manage multiple staff members?',
    a: 'Yes. The Growth and Pro plans support multiple staff seats with individual performance tracking.',
  },
  {
    q: 'What if I need help getting started?',
    a: 'WhatsApp us at +91 80004 03090. We\'ll set it up with you on a call — no extra charge.',
  },
]

function FAQ() {
  return (
    <section id="faq" className="bg-[#F0EDE4] py-20 px-6 scroll-mt-16">
      <div className="max-w-2xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#004741] text-center mb-12"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Questions? Answered.
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b border-[#004741]/20"
            >
              <AccordionTrigger
                className="text-[#004741] font-medium text-left hover:no-underline data-[state=open]:text-[#004741] py-5"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent
                className="text-[#004741]/70 leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

// ─── Section 7: Final CTA ────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="bg-[#004741] py-24 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#F0EDE4] mb-4"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Your parlor deserves better than a WhatsApp group.
        </h2>
        <p
          className="text-[#F0EDE4]/70 mb-10 text-lg"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          Join beauty parlors across India already running smarter with FlowVida.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#F0EDE4] text-[#004741] font-bold px-10 py-4 rounded-full text-lg hover:bg-white transition-colors"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          Start Free — 7 Days, No Card
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#004741] px-6 pt-10 pb-6">
      <div
        className="max-w-6xl mx-auto border-t border-[#F0EDE4]/20 pt-8"
      />
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left */}
        <div>
          <Image src="/Logo.png" alt="FlowVida" width={110} height={36} className="object-contain mb-1" />
          <p
            className="text-[#F0EDE4]/60 text-sm"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            A product by Meridian Grid
          </p>
        </div>

        {/* Center */}
        <div
          className="flex flex-wrap gap-6 text-[#F0EDE4]/80 text-sm"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          <a href="#features" className="hover:text-[#F0EDE4] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#F0EDE4] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#F0EDE4] transition-colors">FAQ</a>
          <Link href="/login" className="hover:text-[#F0EDE4] transition-colors">Sign In</Link>
        </div>

        {/* Right */}
        <div
          className="text-[#F0EDE4]/60 text-sm space-y-1"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          <a href="mailto:zul@meridiangrid.in" className="block hover:text-[#F0EDE4] transition-colors">zul@meridiangrid.in</a>
          <a
            href="https://wa.me/918000403090"
            className="block text-[#F0EDE4]/80 hover:text-[#F0EDE4] transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp +91-8000403090
          </a>
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto mt-10 border-t border-[#F0EDE4]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#F0EDE4]/40"
        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
      >
        <p>© 2026 FlowVida by Meridian Grid. All rights reserved.</p>
        <p>
          Feedback?{' '}
          <a href="mailto:zul@meridiangrid.in" className="text-[#F0EDE4]/60 hover:text-[#F0EDE4] transition-colors underline underline-offset-2">zul@meridiangrid.in</a>
          {' · '}
          <a href="https://wa.me/918000403090" target="_blank" rel="noopener noreferrer" className="text-[#F0EDE4]/60 hover:text-[#F0EDE4] transition-colors underline underline-offset-2">WhatsApp +91-8000403090</a>
        </p>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ scrollBehavior: 'smooth' }}>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
