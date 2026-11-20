import Image from "next/image"
import Link from "next/link"
import LogoutButton from "./LogoutButton"
import { getUserId } from "@/lib/session"

const navLinkClass = "rounded-full px-3 py-1.5 text-gray-700 transition hover:bg-white/70 hover:text-gray-900"

const Header = async () => {
  const signedIn = Boolean(await getUserId())

  return (
    <header className="px-2 pt-2">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-lavender px-4 py-2 shadow-lg shadow-black/20">
        <Link href="/" id="logo" className="flex items-center gap-2 text-gray-900">
          <Image src="/logo.png" width={40} height={40} alt="ai1 logo" />
          <span className="text-lg font-extrabold tracking-tight">AI1</span>
        </Link>

        <nav id="links" className="flex items-center gap-1 text-sm font-medium">
          <Link href="/" className={navLinkClass}>Home</Link>
          <Link href="/architecture-diagram" className={navLinkClass}>Architecture Diagram</Link>
        </nav>

        <div id="login-signup" className="flex items-center gap-2 text-sm font-medium">
          {signedIn ? (
            <>
              <Link href="/dashboard" className={navLinkClass}>Dashboard</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass}>Log In</Link>
              <Link href="/signup" className="btn-primary px-4 py-1.5 text-sm">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
