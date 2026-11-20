// app/lib/kyc.js
import { prisma } from "@/lib/prisma"

const DENIAL_COOLDOWN_DAYS = 30
const REVIEW_SLA_HOURS = 48
const NOTIFY_ON = ["approved", "denied", "in_review"]

// Alloy's summary.outcome -> the AlloyOutcome enum
const OUTCOMES = { Approved: "Approved", Denied: "Denied", "Manual Review": "ManualReview" }

// Alloy's HTTP status says whether decisioning finished: 201 complete, 202 waiting on a vendor,
// 200 waiting on missing data (with a `required` list), 206 exited the workflow early with its default outcome.
// needs_info is no longer used: when Alloy is waiting on missing data, the application goes to manual review,
// and the review screen asks for the fields (requiredFields) alongside the document upload.
function statusFromAlloy(statusCode, data) {
  if (statusCode === 202) return "pending_vendor"
  if (statusCode < 200 || statusCode >= 300) return "error_retrying" // network error (status 0), 4xx, or 5xx
  // Decided by the response itself rather than the status code, so it works whichever code Alloy uses
  if (data.required?.length > 0) return "in_review"
  const outcome = data.summary?.outcome
  if (outcome === "Approved") return "approved"
  if (outcome === "Denied") return "denied"
  return "in_review" // Manual Review, or no outcome we recognize: a person should look
}

// Moves an application (and its user) to a new status in one transaction: updates both rows,
// writes the audit log, and queues the email. applicationData is any extra columns to save on the application.
async function recordStatus(application, status, { applicationData = {}, actor, action, details }) {
  const now = new Date()

  return prisma.$transaction(async (tx) => {
    const updated = await tx.kycApplication.update({
      where: { id: application.id },
      data: {
        status,
        ...applicationData,
        // Answering review questions can land back in review. Keep the original start and deadline when it does.
        ...(status === "in_review" && {
          reviewStartedAt: application.reviewStartedAt ?? now,
          slaDueAt: application.slaDueAt ?? new Date(now.getTime() + REVIEW_SLA_HOURS * 60 * 60 * 1000),
        }),
        ...((status === "approved" || status === "denied") && { decidedAt: now }),
      },
    })

    await tx.user.update({
      where: { id: application.userId },
      data: {
        kycStatus: status,
        ...(status === "approved" && { approvedAt: now }),
        ...(status === "denied" && {
          reapplyAfter: new Date(now.getTime() + DENIAL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000),
        }),
      },
    })

    await tx.auditLog.create({
      data: {
        userId: application.userId,
        applicationId: application.id,
        actor,
        action,
        fromStatus: application.status,
        toStatus: status,
        details,
      },
    })

    // Queued for the email worker. The unique index means one email per application per template.
    if (NOTIFY_ON.includes(status)) {
      await tx.notification.createMany({
        data: [{ applicationId: application.id, template: status }],
        skipDuplicates: true,
      })
    }

    return updated
  })
}

// Saves an Alloy evaluation response onto the application and the user.
// result is { status, data } from lib/alloy.js, or { status: 0, data: {} } when the call threw.
export async function applyAlloyResponse(application, { status: statusCode, data }, actor = "api") {
  const status = statusFromAlloy(statusCode, data)

  const alloyFields =
    status === "error_retrying"
      ? { lastErrorCode: statusCode ? String(statusCode) : "network" }
      : {
          evaluationToken: data.evaluation_token ?? undefined,
          entityToken: data.entity_token ?? undefined,
          applicationToken: data.application_token ?? undefined,
          outcome: OUTCOMES[data.summary?.outcome],
          outcomeReasons: (data.summary?.outcome_reasons ?? []).map((r) => (typeof r === "string" ? r : r.name)),
          tags: data.summary?.tags ?? [],
          requiredFields: (data.required ?? []).map((r) => (typeof r === "string" ? r : r.key)),
          exitedEarly: statusCode === 206,
        }

  return recordStatus(application, status, {
    applicationData: { alloyStatusCode: statusCode || null, attemptCount: { increment: 1 }, ...alloyFields },
    actor,
    action: "status_change",
    details: { alloyStatusCode: statusCode },
  })
}

// A reviewer's decision on an application in manual review: outcome is "Approved" or "Denied".
// The demo review buttons use this now. The webhook worker should too, for create:reviews:is_entity events.
export async function applyReviewDecision(application, outcome, actor) {
  return recordStatus(application, outcome === "Approved" ? "approved" : "denied", {
    applicationData: { outcome: OUTCOMES[outcome], requiredFields: [] },
    actor,
    action: "review_decided",
    details: { outcome },
  })
}

// What the applicant is allowed to see. Tags and outcome reasons stay internal.
export const publicApplication = (app) => ({
  id: app.id,
  status: app.status,
  requiredFields: app.status === "in_review" ? app.requiredFields : [],
  slaDueAt: app.slaDueAt,
  decidedAt: app.decidedAt,
  createdAt: app.createdAt,
})
