"use client"

import { useRouter } from "next/navigation"

const LogoutButton = () => {
  const router = useRouter()

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/")
    router.refresh() // so the header switches back to the signed-out links
  }

  return (
    <button type="button" onClick={logout} className="btn-secondary px-4 py-1 text-sm">
      Log out
    </button>
  )
}

export default LogoutButton
