// app/api/applications/[id]/route.js
import { z } from "zod"
import { updateEvaluation } from "@/lib/alloy"
import { applyAlloyResponse, publicApplication } from "@/lib/kyc"
import { fieldFor } from "@/lib/kycFields"
import { prisma } from "@/lib/prisma"
import { getUserId, notFound, unauthorized } from "@/lib/session"

async function findOwnApplication(params) {
  const userId = await getUserId()
  if (!userId) return { error: unauthorized() }

  const { id } = await params
  if (!z.uuid().safeParse(id).success) return { error: notFound() }

  const application = await prisma.kycApplication.findFirst({ where: { id, userId } })
  if (!application) return { error: notFound() }
  return { application }
}

// Status polling for the signup flow
export async function GET(request, { params }) {
  const { application, error } = await findOwnApplication(params)
  if (error) return error
  return Response.json(publicApplication(application))
}

// During manual review, sends the extra fields Alloy asked for and re-runs the evaluation
export async function PATCH(request, { params }) {
  const { application, error } = await findOwnApplication(params)
  if (error) return error

  const waitingOnFields = application.status === "in_review" && application.requiredFields.length > 0
  if (!waitingOnFields || !application.evaluationToken) {
    return Response.json({ error: "This application isn't waiting on more information" }, { status: 409 })
  }

  const body = z.record(z.string(), z.string().trim()).safeParse(await request.json().catch(() => null))
  const values = body.success ? body.data : {}

  // Only forward the keys Alloy asked for, cleaned and checked
  const fields = {}
  const missing = []
  const invalid = []
  for (const key of application.requiredFields) {
    const field = fieldFor(key)
    if (!values[key]) {
      missing.push(key)
      continue
    }
    const value = field.clean ? field.clean(values[key]) : values[key]
    if (field.valid && !field.valid(value)) {
      invalid.push(key)
      continue
    }
    fields[key] = value
  }
  if (missing.length > 0 || invalid.length > 0) {
    return Response.json({ error: "Some fields are missing or invalid", missing, invalid }, { status: 400 })
  }

  // The phone number also belongs on the profile, so it shows up in Settings
  if (fields.phone_number) {
    await prisma.user.update({ where: { id: application.userId }, data: { phone: fields.phone_number } })
  }

  let result
  try {
    result = await updateEvaluation(application.evaluationToken, fields)
  } catch {
    result = { status: 0, data: {} }
  }

  const updated = await applyAlloyResponse(application, result)
  return Response.json(publicApplication(updated))
}
