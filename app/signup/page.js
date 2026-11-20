"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import AutocompleteWidget from "../components/AutocompleteWidget"
import OnboardingSteps from "../components/OnboardingSteps"

const legendClass = "mb-3 text-sm font-bold text-gray-900"

// For turning the API's field errors into readable messages
const fieldLabels = {
  firstName: "First name",
  lastName: "Last name",
  dob: "Date of birth",
  email: "Email",
  password: "Password",
  ssn: "SSN",
  address1: "Address",
  locality: "City",
  state: "State",
  postcode: "Postal code",
  country: "Country",
}

const SignUp = () => {
  const router = useRouter()
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors([])

    try {
      // Collects every named input, including the address fields from AutocompleteWidget.
      // Don't console.log it, since it contains the SSN.
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      })
      const body = await res.json()
      if (!res.ok) {
        const fieldErrors = Object.entries(body.fields ?? {}).map(
          ([field, messages]) => `${fieldLabels[field] ?? field}: ${messages[0]}`
        )
        setErrors(fieldErrors.length > 0 ? fieldErrors : [body.error ?? `Request failed (${res.status})`])
        setSubmitting(false)
        return
      }
      router.push("/onboarding")
      router.refresh() // so the header switches to the signed-in links
    } catch {
      setErrors(["Something went wrong. Please try again."])
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="card w-full max-w-xl space-y-6">
        <OnboardingSteps current={0} />

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-1 text-gray-600">We use these details to verify your identity. It takes about two minutes.</p>
        </div>

        {errors.length > 0 && (
          <ul role="alert" className="alert-error space-y-1">
            {errors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        )}

        <fieldset className="space-y-4">
          <legend className={legendClass}>About you</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="label">First name</label>
              <input id="firstName" name="firstName" type="text" required autoComplete="given-name" placeholder="Jane" className="input" />
            </div>
            <div>
              <label htmlFor="lastName" className="label">Last name</label>
              <input id="lastName" name="lastName" type="text" required autoComplete="family-name" placeholder="Doe" className="input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dob" className="label">Date of birth</label>
              <input id="dob" name="dob" type="date" required autoComplete="bday" className="input" />
            </div>
            <div>
              <label htmlFor="ssn" className="label">SSN</label>
              <input
                id="ssn"
                name="ssn"
                type="password"
                required
                inputMode="numeric"
                autoComplete="off"
                maxLength={11}
                pattern="\d{3}-?\d{2}-?\d{4}"
                title="9 digits, like 123-45-6789"
                placeholder="123-45-6789"
                className="input"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className={legendClass}>Login details</legend>
          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="jane.doe@email.com" className="input" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password" placeholder="At least 12 characters" className="input" />
          </div>
        </fieldset>

        <fieldset>
          <legend className={legendClass}>Home address</legend>
          <AutocompleteWidget />
        </fieldset>

        <div className="space-y-3">
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating your account..." : "Create account"}
          </button>
          <p className="text-center text-xs text-gray-500">
            Your SSN is only used to verify your identity. We never store it in full.
          </p>
        </div>

        <p className="border-t border-gray-100 pt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="font-semibold text-brand hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default SignUp
