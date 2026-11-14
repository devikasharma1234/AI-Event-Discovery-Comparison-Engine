
import Link from "next/link";
import { Sparkles, Compass } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1020]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl">
            <Image
            src="/assets/bee.png"
            alt="PlanBee Logo"
            width={50}
            height={50}
            className="h-20 w-20 object-contain"
            />
            {/* <Compass className="h-6 w-6 text-white" /> */}
          </div>

          <span className="text-xl font-bold tracking-tight text-white">
            Plan<span className="text-violet-400">Bee</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <Link href="/" className="hover:text-white">
            Discover
          </Link>

          <a href="#recommendations" className="hover:text-white">
            Recommendations
          </a>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          <Sparkles size={16} />
          AI Powered
        </div>
      </nav>
    </header>
  );
}
