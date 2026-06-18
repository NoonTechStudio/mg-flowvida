import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link'
import {
  Sparkles, CalendarDays, Users, BarChart3, Scissors,
  UserCog, ArrowRight, Star, IndianRupee, Smartphone, Shield
} from 'lucide-react'

export default async function RootPage() {
  // If already logged in, go to dashboard
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  // Otherwise show marketing page
  const features = [
    { icon: CalendarDays, title: 'Appointment Booking', desc: 'Book and manage appointments with visual calendar and instant confirmations.', color: 'bg-violet-100 text-violet-600' },
    { icon: Users, title: 'Customer Database', desc: "Track every customer's history, preferences, and spending. Build loyalty.", color: 'bg-pink-100 text-pink-600' },
    { icon: Scissors, title: 'Walk-in & Sales', desc: 'Handle walk-ins instantly. Record services, assign staff, collect payment.', color: 'bg-emerald-100 text-emerald-600' },
    { icon: BarChart3, title: 'Revenue & Reports', desc: 'Know your daily, weekly, and monthly revenue. Track top services and staff.', color: 'bg-blue-100 text-blue-600' },
    { icon: UserCog, title: 'Staff Management', desc: 'Manage stylists, receptionists, and managers. Track their performance.', color: 'bg-amber-100 text-amber-600' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'OTP-based login, role-based access. Your data is always protected.', color: 'bg-red-100 text-red-600' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">FlowVida</span>
          </div>
          <Link href="/login" className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Built for Beauty Parlors in Vadodara
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Run your parlor<br />
            <span className="text-violet-600">smarter, not harder</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            FlowVida helps beauty parlors manage appointments, customers, staff, and revenue — all from one simple dashboard.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="inline-flex items-center gap-2 bg-violet-600 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-violet-700 transition-colors text-base shadow-lg shadow-violet-200">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 pt-8 border-t border-gray-100">
            {[{ value: '500+', label: 'Daily Appointments' }, { value: '50+', label: 'Parlors in Vadodara' }, { value: '98%', label: 'Satisfaction Rate' }].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-violet-700">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Everything your parlor needs</h2>
          <p className="text-gray-500 text-center mb-12">From booking to billing — FlowVida covers every aspect of your beauty business.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-12 text-white">
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-violet-200" />
            <h2 className="text-3xl font-bold mb-4">Ready to transform your parlor?</h2>
            <p className="text-violet-200 mb-8">Join beauty parlors across Vadodara growing with FlowVida.</p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-8 py-4 rounded-xl hover:bg-violet-50 transition-colors">
              Try Free Demo <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <p className="text-sm text-gray-400">© 2026 FlowVida. Built for beauty parlors in Vadodara.</p>
        </div>
      </footer>
    </div>
  )
}
