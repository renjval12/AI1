// app/lib/kycFields.js
// Shared by the API routes (to validate) and the onboarding forms (to render). Safe to import on the client.

const digits = (value) => value.replace(/\D/g, "")

// Fields Alloy may ask for in a 206 "needs more info" response, keyed by Alloy's field name.
// `input` is spread onto the <input>. `clean` runs before `valid`, and the cleaned value is what goes to Alloy.
export const alloyFields = {
  name_first: { label: "First name", input: { autoComplete: "given-name" } },
  name_last: { label: "Last name", input: { autoComplete: "family-name" } },
  birth_date: {
    label: "Date of birth",
    input: { type: "date", autoComplete: "bday" },
    valid: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
  },
  document_ssn: {
    label: "Social Security number",
    input: { type: "password", inputMode: "numeric", autoComplete: "off", placeholder: "123-45-6789", maxLength: 11 },
    clean: digits,
    valid: (v) => /^\d{9}$/.test(v),
  },
  phone_number: {
    label: "Phone number",
    input: { type: "tel", autoComplete: "tel", placeholder: "(555) 123-4567" },
    clean: digits,
    valid: (v) => /^1?\d{10}$/.test(v),
  },
  email_address: {
    label: "Email address",
    input: { type: "email", autoComplete: "email" },
    valid: (v) => v.includes("@"),
  },
  address_line_1: { label: "Street address", input: { autoComplete: "address-line1" } },
  address_line_2: { label: "Apartment, unit, or suite", input: { autoComplete: "address-line2" } },
  address_city: { label: "City", input: { autoComplete: "address-level2" } },
  address_state: {
    label: "State",
    input: { autoComplete: "address-level1", placeholder: "CA", maxLength: 2 },
    clean: (v) => v.toUpperCase(),
    valid: (v) => /^[A-Z]{2}$/.test(v),
  },
  address_postal_code: {
    label: "ZIP code",
    input: { autoComplete: "postal-code", inputMode: "numeric", placeholder: "12345" },
    valid: (v) => /^\d{5}(-\d{4})?$/.test(v),
  },
}

// Keys we don't know get a plain text box, labeled from the key: "employer_name" -> "Employer name"
export const fieldFor = (key) =>
  alloyFields[key] ?? { label: key.charAt(0).toUpperCase() + key.slice(1).replaceAll("_", " "), input: {} }

// Document uploads. Check `value` against the document types your Alloy workflow accepts.
export const documentTypes = [
  { value: "license", label: "Driver's license" },
  { value: "passport", label: "Passport" },
  { value: "utility", label: "Utility bill" },
]

export const documentLabel = (type) => documentTypes.find((t) => t.value === type)?.label ?? type

export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024
export const DOCUMENT_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" }
