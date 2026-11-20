"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DOCUMENT_EXTENSIONS, DOCUMENT_MAX_BYTES, documentTypes } from "@/lib/kycFields"

// Sends one file to POST /api/applications/[id]/documents. The server page lists what's been uploaded.
const DocumentUpload = ({ applicationId }) => {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Same checks as the API, so people find out before waiting on an upload
  const checkFile = (e) => {
    const file = e.target.files?.[0]
    let problem = null
    if (file && !DOCUMENT_EXTENSIONS[file.type]) problem = "File must be a JPEG, PNG, or PDF"
    else if (file && file.size > DOCUMENT_MAX_BYTES) problem = "File must be 10 MB or smaller"

    setMessage(null)
    setError(problem)
    if (problem) e.target.value = "" // clear it, so the bad file can't be submitted
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      // No Content-Type header: the browser sets the multipart boundary itself
      const res = await fetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        body: new FormData(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error)
      }
      form.reset()
      setMessage("Got it, thanks. We've added it to your review.")
      router.refresh()
    } catch (err) {
      setError(err.message || "Upload failed, please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p role="alert" className="alert-error">{error}</p>}
      {message && (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </p>
      )}

      <div>
        <label htmlFor="type" className="label">Document type</label>
        <select id="type" name="type" required defaultValue="" className="input">
          <option value="" disabled>Choose one</option>
          {documentTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="file" className="label">File</label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept={Object.keys(DOCUMENT_EXTENSIONS).join(",")}
          onChange={checkFile}
          className="block w-full text-sm text-gray-600 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-lavender file:px-4 file:py-2 file:font-semibold file:text-brand hover:file:bg-lavender/70"
        />
        <p className="mt-1.5 text-xs text-gray-500">JPEG, PNG, or PDF, up to 10 MB.</p>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Uploading..." : "Upload document"}
      </button>
    </form>
  )
}

export default DocumentUpload
