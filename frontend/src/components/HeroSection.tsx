
import Image from "next/image";
import { Bug } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-12 pt-20 text-center">

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/BgImg.png"
          alt="PlanBee hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Optional dark overlay for readability */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#0B1020]/20" />

      {/* Purple Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-[1] h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-4xl">

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          <Bug size={16} />
          Bee Smart. Plan Better.
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
          From What's the Plan?
          <span className="block bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            to Let's Go!
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          Tell us what you love, your budget, and who&apos;s
          coming. Our AI helps you discover events that
          match your plans.
        </p>

      </div>
    </section>
  );
}
