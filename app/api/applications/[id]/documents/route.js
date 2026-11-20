import { z } from "zod"
import { uploadDocument } from "@/lib/alloy"
import { DOCUMENT_EXTENSIONS, DOCUMENT_MAX_BYTES, documentTypes } from "@/lib/kycFields"
import { prisma } from "@/lib/prisma"
import { getUserId, notFound, unauthorized } from "@/lib/session"

const TYPES = documentTypes.map((t) => t.value)

export async function POST(request, { params }) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  if (!z.uuid().safeParse(id).success) return notFound()

  const application = await prisma.kycApplication.findFirst({ where: { id, userId } })
  if (!application) return notFound()
  // Documents are only collected during manual review
  if (application.status !== "in_review" || !application.entityToken) {
    return Response.json({ error: "This application isn't accepting documents" }, { status: 409 })
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get("file")
  const type = form?.get("type")
  if (!(file instanceof File) || !TYPES.includes(type)) {
    return Response.json({ error: "Choose a document type and a file" }, { status: 400 })
  }
  const extension = DOCUMENT_EXTENSIONS[file.type]
  if (!extension) {
    return Response.json({ error: "File must be a JPEG, PNG, or PDF" }, { status: 400 })
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    return Response.json({ error: "File must be 10 MB or smaller" }, { status: 400 })
  }

  let result
  try {
    result = await uploadDocument(application.entityToken, {
      name: `${type}.${extension}`,
      extension,
      type,
      bytes: Buffer.from(await file.arrayBuffer()),
    })
  } catch {
    result = { status: 0 }
  }
  if (result.status < 200 || result.status >= 300) {
    return Response.json({ error: "Upload failed, please try again" }, { status: 502 })
  }

  await prisma.auditLog.create({
    data: {
      userId,
      applicationId: application.id,
      actor: "api",
      action: "document_uploaded",
      details: { documentToken: result.documentToken, type },
    },
  })

  return Response.json({ documentToken: result.documentToken }, { status: 201 })
}
