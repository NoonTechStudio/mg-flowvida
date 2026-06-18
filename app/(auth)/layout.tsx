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
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-3 shadow-2xl">
            <Image src="/Logo.png" alt="FlowVida" width={48} height={48} className="object-contain" />
          </div>
          <h1 className="text-white font-bold text-xl tracking-tight">FlowVida</h1>
          <p className="text-white/50 text-sm">Beauty Parlor Manager</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl">
          {children}
        </div>

        <p className="text-center text-white/25 text-xs mt-6">© 2026 FlowVida · Vadodara</p>
      </div>
    </div>
  )
}
