"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AccountIcon from "../../components/AccountIcon"
import OnboardingSteps from "../../components/OnboardingSteps"
import { accountTypeLabels, formatBalance } from "@/lib/format"

const ChooseAccounts = () => {
  const router = useRouter()
  const [options, setOptions] = useState(null)
  const [selected, setSelected] = useState([])
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadOptions = async () => {
      const res = await fetch("/api/accounts/options")
      if (res.status === 401) return router.replace("/login")
      // Not approved, or already picked. /onboarding sends them to the right place.
      if (res.status === 409) return router.replace("/onboarding")
      if (!res.ok) throw new Error()

      const body = await res.json()
      setOptions(body.options)
      setSelected(body.options.map((option) => option.id)) // everything checked to start
    }
    loadOptions().catch(() => setError("We couldn't load your accounts. Refresh to try again."))
  }, [router])

  const toggle = (id) => {
    setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/accounts/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds: selected }),
      })
      if (res.status === 409) return router.replace("/onboarding")
      if (!res.ok) throw new Error((await res.json()).error)
      router.push("/dashboard")
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="card w-full max-w-lg space-y-6">
        <OnboardingSteps current={2} />

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Choose your accounts</h1>
          <p className="mt-1 text-gray-600">Pick the accounts you'd like to open. You can choose more than one.</p>
        </div>

        {error && <p role="alert" className="alert-error">{error}</p>}

        {!options && !error && (
          <div className="space-y-3" aria-label="Loading accounts">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-19 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}

        {options && (
          <fieldset className="space-y-3">
            <legend className="sr-only">Accounts</legend>
            {options.map((option) => {
              const checked = selected.includes(option.id)
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition ${checked ? "border-brand bg-lavender/50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.id)}
                    className="h-5 w-5 shrink-0 accent-brand"
                  />
                  <AccountIcon type={option.type} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{option.name}</span>
                    <span className="block text-sm text-gray-500">
                      {accountTypeLabels[option.type]} ••{option.mask}
                    </span>
                  </span>
                  <span className="text-right text-sm font-bold">
                    {formatBalance(option.type, option.balance)}
                  </span>
                </label>
              )
            })}
          </fieldset>
        )}

        <button
          type="submit"
          disabled={!options || selected.length === 0 || submitting}
          className="btn-primary w-full"
        >
          {submitting
            ? "Opening accounts..."
            : `Open ${selected.length} ${selected.length === 1 ? "account" : "accounts"}`}
        </button>

        <p className="text-center text-xs text-gray-500">Demo: these are sample accounts with made-up balances.</p>
      </form>
    </div>
  )
}

export default ChooseAccounts
