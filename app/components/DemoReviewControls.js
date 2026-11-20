"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

// Demo only. In real use, a reviewer decides in Alloy and the result arrives by webhook.
// These buttons stand in for that, then reload the page to show the approved or denied screen.
const DemoReviewControls = ({ applicationId }) => {
  const router = useRouter()
  const [pending, setPending] = useState(null) // which button is working: "Approved" or "Denied"
  const [error, setError] = useState(null)

  const decide = async (outcome) => {
    setPending(outcome)
    setError(null)

    try {
      const res = await fetch(`/api/applications/${applicationId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      })
      // 409 means it was already decided. Either way, the page shows where things stand now.
      if (!res.ok && res.status !== 409) throw new Error()
      router.refresh()
    } catch {
      setError("That didn't work. Please try again.")
      setPending(null)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Demo controls</p>
        <p className="mt-1 text-sm text-amber-900">
          Play the reviewer: decide this application and see what the applicant sees next.
        </p>
      </div>

      {error && <p role="alert" className="alert-error">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => decide("Approved")} disabled={pending !== null} className="btn-primary px-5 py-2 text-sm">
          {pending === "Approved" ? "Approving..." : "Approve review"}
        </button>
        <button
          type="button"
          onClick={() => decide("Denied")}
          disabled={pending !== null}
          className="btn-secondary border-red-300 px-5 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "Denied" ? "Denying..." : "Deny review"}
        </button>
      </div>
    </div>
  )
}

export default DemoReviewControls
