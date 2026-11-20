"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const LoginPage = () => {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? `Request failed (${res.status})`)
        setSubmitting(false)
        return
      }
      // The dashboard sends anyone who hasn't finished onboarding to /onboarding
      router.push("/dashboard")
      router.refresh() // so the header switches to the signed-in links
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-5">
        <div className="space-y-3 text-center">
          <Image src="/logo.png" width={48} height={48} alt="" className="mx-auto" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-gray-600">Log in to see your accounts.</p>
          </div>
        </div>

        {error && <p role="alert" className="alert-error">{error}</p>}

        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="jane.doe@email.com" className="input" />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="border-t border-gray-100 pt-4 text-center text-sm text-gray-600">
          New to AI1? <Link href="/signup" className="font-semibold text-brand hover:underline">Create an account</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
