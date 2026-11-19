"use client"

import AutocompleteWidget from "../components/AutocompleteWidget"

const labelClass = "block mb-1 text-xs font-bold uppercase tracking-wide text-gray-700"
const inputClass = "block w-full rounded bg-gray-200 px-4 py-3 text-gray-700 focus:bg-white focus:outline-none"

const SignUp = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Collects every named input, including the address fields from AutocompleteWidget.
    const data = Object.fromEntries(new FormData(e.target))
    // TODO: send `data` to your server. Don't console.log it, since it contains the SSN.
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>First name</label>
            <input id="firstName" name="firstName" type="text" required autoComplete="given-name" placeholder="Jane" className={inputClass} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last name</label>
            <input id="lastName" name="lastName" type="text" required autoComplete="family-name" placeholder="Doe" className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="dob" className={labelClass}>Date of birth</label>
          <input id="dob" name="dob" type="date" required autoComplete="bday" className={inputClass} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email address</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="jane.doe@email.com" className={inputClass} />
        </div>

        <div>
          <label htmlFor="ssn" className={labelClass}>SSN</label>
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
            className={inputClass}
          />
        </div>

        <AutocompleteWidget />

        <button type="submit" className="px-4 py-1 bg-[#8a4ed3] text-white rounded-full cursor-pointer">
          Sign up
        </button>
      </form>
    </div>
  )
}

export default SignUp
