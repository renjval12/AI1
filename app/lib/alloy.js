// app/lib/alloy.js
import crypto from "node:crypto"

const BASE_URL = process.env.ALLOY_BASE_URL ?? "https://sandbox.alloy.co/v1"

const basicAuth = () =>
    `Basic ${Buffer.from(`${process.env.ALLOY_WORKFLOW_TOKEN}:${process.env.ALLOY_WORKFLOW_SECRET}`).toString("base64")}`

// Returns { status, data }. Network errors and timeouts throw, so callers should catch them.
async function alloyFetch(path, {
    method = "POST", json, body, headers = {} } = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            Authorization: basicAuth(),
            ...(json && { "Content-Type": "application/json" }),
            ...headers,
        },
        body: json ? JSON.stringify(json) : body,
        signal: AbortSignal.timeout(20_000),
    })
    const data = await res.json().catch(() => ({}))
    return { status: res.status, data }
}

// ALLOY_DEMO=true skips Alloy, for demos without Alloy credentials. The applicant's last name picks the result:
//   "Needsinfo" -> manual review that asks for a phone number, "Review" -> manual review,
//   "Denied" -> denied, anything else -> approved
// It also turns on the review buttons that let you approve or deny an application in manual review.
// Never turn it on anywhere real people sign up.
export const DEMO = process.env.ALLOY_DEMO === "true"

const demoResult = (status, data) => ({ status, data: { ...data, summary: { ...data.summary, tags: ["demo"] } } })

function demoEvaluation(fields) {
    const tokens = { evaluation_token: `L-demo-${crypto.randomUUID()}`, entity_token: `P-demo-${crypto.randomUUID()}` }
    switch (fields.name_last?.toLowerCase()) {
        case "needsinfo":
            return demoResult(200, { ...tokens, required: [{ key: "phone_number" }] }) // 200 Waiting
        case "review":
            return demoResult(201, { ...tokens, summary: { outcome: "Manual Review" } })
        case "denied":
            return demoResult(201, { ...tokens, summary: { outcome: "Denied" } })
        default:
            return demoResult(201, { ...tokens, summary: { outcome: "Approved" } })
    }
}

// fields use Alloy's names (name_first, document_ssn, ...). GET /parameters lists what your workflow needs.
export async function runEvaluation(userId, fields) {
    if (DEMO) return demoEvaluation(fields)
    return alloyFetch("/evaluations", {
        json: fields,
        headers: { "Alloy-External-Entity-ID": userId },
    })
}

// Supplies the fields a 206 response asked for. Alloy merges them into the original evaluation.
export async function updateEvaluation(evaluationToken, fields) {
    if (DEMO) return demoResult(201, { evaluation_token: evaluationToken, summary: { outcome: "Approved" } })
    return alloyFetch(`/evaluations/${evaluationToken}`, { method: "PATCH", json: fields })
}

// Two steps: create the document record, then PUT the file bytes to it
export async function uploadDocument(entityToken, { name, extension, type, bytes }) {
    if (DEMO) return { status: 201, data: {}, documentToken: `D-demo-${crypto.randomUUID()}` }
    const created = await alloyFetch(`/entities/${entityToken}/documents`, {
        json: { name, extension, type },
    })
    const documentToken = created.data.document_token
    if (created.status >= 300 || !documentToken) return created

    const uploaded = await alloyFetch(`/entities/${entityToken}/documents/${documentToken}`, {
        method: "PUT",
        body: bytes,
        headers: { "Content-Type": "application/octet-stream" },
    })
    return { ...uploaded, documentToken }
}

// Alloy signs JSON.stringify(body) with HMAC-SHA256 and sends the base64 digest as the Authorization header
// https://developer.alloy.com/public/docs/hash-based-message-authentication-code-hmac
export function verifyWebhook(rawBody, signature) {
    const secret = process.env.ALLOY_WEBHOOK_SECRET
    if (!secret || !signature) return false

    const given = Buffer.from(signature, "base64")
    const matches = (text) => {
        const expected = crypto.createHmac("sha256", secret).update(text).digest()
        return given.length === expected.length && crypto.timingSafeEqual(given, expected)
    }

    if (matches(rawBody)) return true
    // In case the body on the wire isn't byte-for-byte what Alloy stringified
    try {
        return matches(JSON.stringify(JSON.parse(rawBody)))
    } catch {
        return false
    }
}
