import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="flex flex-col sm:flex-row justify-between items-center gap-2 m-2 bg-[#a69fa7] px-2 py-3">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" width={30} height={30} alt="ai1-logo" />
        <span className="text-sm">© {new Date().getFullYear()} AI1. All rights reserved.</span>
      </div>
      <nav className="flex gap-4 text-sm">
        <Link href="/architecture-diagram" className="hover:underline">Architecture Diagram</Link>
        <Link href="/login" className="hover:underline">Login</Link>
        <Link href="/signup" className="hover:underline">Sign Up</Link>
      </nav>
    </footer>
  )
}

export default Footer
