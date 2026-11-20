"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { fieldFor } from "@/lib/kycFields"

// One input per field Alloy asked for. Sends them to PATCH /api/applications/[id], then reloads the page,
// which shows the new result (approved, more questions, in review...).
const NeedsInfoForm = ({ applicationId, requiredFields }) => {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      })
      if (res.status === 400) {
        const body = await res.json()
        const keys = [...(body.missing ?? []), ...(body.invalid ?? [])]
        setError(keys.length > 0 ? `Please check: ${keys.map((key) => fieldFor(key).label).join(", ")}` : body.error)
        setSubmitting(false)
        return
      }
      // 409 means the application already moved on. Either way, the page shows where things stand now.
      if (!res.ok && res.status !== 409) throw new Error()
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p role="alert" className="alert-error">{error}</p>}

      {requiredFields.map((key) => {
        const field = fieldFor(key)
        return (
          <div key={key}>
            <label htmlFor={key} className="label">{field.label}</label>
            <input id={key} name={key} required className="input" {...field.input} />
          </div>
        )
      })}

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Sending..." : "Send and continue"}
      </button>
    </form>
  )
}

export default NeedsInfoForm
