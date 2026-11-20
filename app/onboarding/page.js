import Link from "next/link"
import { redirect } from "next/navigation"
import DemoReviewControls from "../components/DemoReviewControls"
import DocumentUpload from "../components/DocumentUpload"
import NeedsInfoForm from "../components/NeedsInfoForm"
import OnboardingSteps from "../components/OnboardingSteps"
import { DEMO } from "@/lib/alloy"
import { documentLabel } from "@/lib/kycFields"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/session"

// What to tell the user for every status except approved and active.
// tone picks the icon: "waiting" for things still in progress, "alert" for everything else.
const statusCopy = {
  pending: {
    tone: "waiting",
    title: "We're still checking your details",
    body: "This usually only takes a moment. Refresh this page to see if it's done.",
  },
  pending_vendor: {
    tone: "waiting",
    title: "We're still checking your details",
    body: "This usually only takes a moment. Refresh this page to see if it's done.",
  },
  in_review: {
    tone: "waiting",
    title: "We're taking a closer look",
    body: "Someone on our team is reviewing your application. This can take up to 2 days.",
  },
  error_retrying: {
    tone: "alert",
    title: "We hit a problem checking your details",
    body: "This is on our end, not yours. Please check back later.",
  },
  denied: {
    tone: "alert",
    title: "We couldn't open an account for you",
    body: "We weren't able to verify your identity.",
  },
}

const icons = {
  approved: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  waiting: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5M12 16h.01" />
    </>
  ),
}

const StatusIcon = ({ name }) => (
  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender text-brand ring-8 ring-lavender/40" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  </span>
)

const Onboarding = async () => {
  const userId = await getUserId()
  if (!userId) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      kycStatus: true,
      reapplyAfter: true,
      applications: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, requiredFields: true, attemptCount: true },
      },
    },
  })
  if (!user) redirect("/login")
  if (user.kycStatus === "active") redirect("/dashboard")

  const application = user.applications[0]

  // There's no documents table, so the audit log is the record of what's been uploaded
  const uploads =
    application && user.kycStatus === "in_review"
      ? await prisma.auditLog.findMany({
          where: { applicationId: application.id, action: "document_uploaded" },
          orderBy: { createdAt: "asc" },
          select: { id: true, details: true, createdAt: true },
        })
      : []

  if (user.kycStatus === "approved") {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="card w-full max-w-lg space-y-6">
          <OnboardingSteps current={2} />
          <StatusIcon name="approved" />
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">You're approved, {user.firstName}!</h1>
            <p className="text-gray-600">
              Your identity is verified. Next, pick the accounts you'd like to open. It only takes a second.
            </p>
          </div>
          <Link href="/onboarding/accounts" className="btn-primary">
            Choose your accounts →
          </Link>
        </div>
      </div>
    )
  }

  // needs_info is no longer set (it's part of review now), but older test applications may still have it
  const copy = statusCopy[user.kycStatus] ?? statusCopy.in_review
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-lg space-y-6">
        <OnboardingSteps current={1} />
        <StatusIcon name={copy.tone} />
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">{copy.title}</h1>
          <p className="text-gray-600">{copy.body}</p>
          {user.kycStatus === "denied" && user.reapplyAfter && (
            <p className="text-gray-600">
              You can apply again after{" "}
              <strong className="text-gray-900">
                {user.reapplyAfter.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </strong>
              .
            </p>
          )}
        </div>

        {/* Manual review: answer any questions Alloy asked, and upload documents for the reviewer */}
        {user.kycStatus === "in_review" && application?.requiredFields.length > 0 && (
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <div>
              <h2 className="font-bold">Answer a few questions</h2>
              <p className="mt-1 text-sm text-gray-600">
                We're missing some details. Send them here and we'll keep going.
              </p>
            </div>
            {/* The key changes after every attempt, so a second round of questions starts with a fresh form */}
            <NeedsInfoForm
              key={application.attemptCount}
              applicationId={application.id}
              requiredFields={application.requiredFields}
            />
          </div>
        )}

        {user.kycStatus === "in_review" && application && (
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <div>
              <h2 className="font-bold">Upload a document</h2>
              <p className="mt-1 text-sm text-gray-600">
                A photo ID or proof of address gives our team what they need to finish your review.
              </p>
            </div>

            {uploads.length > 0 && (
              <ul className="space-y-2">
                {uploads.map((upload) => (
                  <li key={String(upload.id)} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700" aria-hidden="true">
                      ✓
                    </span>
                    <span className="flex-1 font-semibold">{documentLabel(upload.details?.type)}</span>
                    <span className="text-gray-500">
                      Uploaded {upload.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <DocumentUpload applicationId={application.id} />
          </div>
        )}

        {DEMO && user.kycStatus === "in_review" && application && (
          <DemoReviewControls applicationId={application.id} />
        )}

        <Link href="/" className="inline-block text-sm font-semibold text-brand hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

export default Onboarding
