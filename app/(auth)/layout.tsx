import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
      {/* Gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#E03020] opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#0099DD] opacity-15 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-[#E03020] opacity-10 blur-[80px] pointer-events-none" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/Logo.png" alt="FlowVida" width={140} height={48} className="object-contain drop-shadow-lg" priority />
        </div>

        {/* Card */}
        <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl">
          {children}
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          © 2026 FlowVida by{' '}
          <a
            href="https://www.meridiangrid.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
          >
            MeridianGrid
          </a>
        </p>
      </div>
    </div>
  )
}
