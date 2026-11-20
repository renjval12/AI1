import { z } from "zod"
import { DEMO } from "@/lib/alloy"
import { applyReviewDecision, publicApplication } from "@/lib/kyc"
import { prisma } from "@/lib/prisma"
import { getUserId, notFound, unauthorized } from "@/lib/session"

const reviewSchema = z.object({ outcome: z.enum(["Approved", "Denied"]) })

// Demo only: stands in for the reviewer who decides a manual review in Alloy.
// Outside demo mode this route is a 404, so applicants can never decide their own review.
export async function POST(request, { params }) {
  if (!DEMO) return notFound()

  const userId = await getUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  if (!z.uuid().safeParse(id).success) return notFound()

  const application = await prisma.kycApplication.findFirst({ where: { id, userId } })
  if (!application) return notFound()
  if (application.status !== "in_review") {
    return Response.json({ error: "This application isn't in review" }, { status: 409 })
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'outcome must be "Approved" or "Denied"' }, { status: 400 })
  }

  const updated = await applyReviewDecision(application, parsed.data.outcome, "demo_reviewer")
  return Response.json(publicApplication(updated))
}
