import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="mt-12 px-2 pb-2">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 px-2 py-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Image src="/logo.png" width={24} height={24} alt="ai1 logo" />
          <span>© {new Date().getFullYear()} AI1. All rights reserved.</span>
        </div>
        <nav className="flex gap-5 text-sm text-gray-400">
          <Link href="/architecture-diagram" className="transition hover:text-white">Architecture Diagram</Link>
          <Link href="/login" className="transition hover:text-white">Login</Link>
          <Link href="/signup" className="transition hover:text-white">Sign Up</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
