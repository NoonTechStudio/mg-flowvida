import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#004741' }}>
      {/* Subtle glow orbs */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(240,237,228,0.06)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(240,237,228,0.04)', filter: 'blur(80px)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/Logo.png" alt="FlowVida" width={140} height={48} className="object-contain drop-shadow-lg" priority />
        </div>

        {/* Glass card */}
        <div className="rounded-3xl p-7 shadow-2xl" style={{ backgroundColor: 'rgba(240,237,228,0.07)', border: '1px solid rgba(240,237,228,0.12)', backdropFilter: 'blur(24px)' }}>
          {children}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(240,237,228,0.3)' }}>
          © 2026 FlowVida by{' '}
          <a
            href="https://www.meridiangrid.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ color: 'rgba(240,237,228,0.5)' }}
          >
            MeridianGrid
          </a>
        </p>
      </div>
    </div>
  )
}
