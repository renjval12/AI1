"use client"

import { useEffect, useRef, useState } from "react"

const emptyAddress = {
  address1: "",
  address2: "",
  locality: "",
  state: "",
  postcode: "",
  country: "",
}

// The rest of the form. address1 is the search box and is rendered separately.
const otherFields = [
  { name: "address2", label: "Apartment, unit, suite, or floor #" },
  { name: "locality", label: "City" },
  { name: "state", label: "State/Province" },
  { name: "postcode", label: "Postal code" },
  { name: "country", label: "Country/Region" },
]

// Shared styles from globals.css
const labelClass = "label"
const inputClass = "input"

const AutocompleteWidget = () => {
  const [address, setAddress] = useState(emptyAddress)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const address2Ref = useRef(null)

  // Search 300ms after the user stops typing, so we don't send a request on every keystroke.
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({
        text: query,
        format: "json",
        limit: "5",
        apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
      })
      try {
        const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        setSuggestions(data.results ?? [])
      } catch (err) {
        if (err.name !== "AbortError") console.error(err)
      }
    }, 300)

    // If the user types again, cancel the pending search.
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const handleChange = (e) => {
    const { name, value } = e.target
    setAddress({ ...address, [name]: value })
    if (name === "address1") setQuery(value)
  }

  const selectSuggestion = (result) => {
    setAddress({
      address1: [result.housenumber, result.street].filter(Boolean).join(" "),
      address2: "",
      locality: result.city ?? "",
      state: result.state_code ?? result.state ?? "",
      postcode: result.postcode ?? "",
      country: result.country ?? "",
    })
    setQuery("")
    address2Ref.current?.focus()
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <label htmlFor="address1" className={labelClass}>Address</label>
        <input
          id="address1"
          name="address1"
          autoComplete="off"
          placeholder="Start typing an address..."
          value={address.address1}
          onChange={handleChange}
          onBlur={() => setSuggestions([])}
          className={inputClass}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 shadow-lg">
            {suggestions.map((result) => (
              <li key={result.place_id}>
                <button
                  type="button"
                  // onMouseDown runs before the input's onBlur, so the list doesn't close before the click registers
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectSuggestion(result)
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer"
                >
                  {result.formatted}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {otherFields.map(({ name, label }) => (
          <div key={name} className={name === "address2" ? "sm:col-span-2" : undefined}>
            <label htmlFor={name} className={labelClass}>{label}</label>
            <input
              id={name}
              name={name}
              ref={name === "address2" ? address2Ref : undefined}
              value={address[name]}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        ))}
      </div>

     
    </div>
  )
}

export default AutocompleteWidget