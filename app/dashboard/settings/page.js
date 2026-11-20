import Link from "next/link"
import { redirect } from "next/navigation"
import { formatPhone } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/session"

const Row = ({ label, children }) => (
  <div className="grid gap-1 py-4 sm:grid-cols-3">
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="text-gray-900 sm:col-span-2">{children}</dd>
  </div>
)

const Settings = async () => {
  const userId = await getUserId()
  if (!userId) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      ssnLast4: true,
      createdAt: true,
      addresses: { where: { isCurrent: true }, take: 1 },
    },
  })
  if (!user) redirect("/login")

  const address = user.addresses[0]

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link href="/dashboard" className="inline-block text-sm font-semibold text-gray-400 transition hover:text-white">
        ← Back to dashboard
      </Link>

      <section className="card">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender text-xl font-extrabold text-brand" aria-hidden="true">
            {user.firstName[0]}
            {user.lastName[0]}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-500">
              Member since {user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
          <Row label="Email">{user.email}</Row>
          <Row label="Phone">
            {user.phone ? formatPhone(user.phone) : <span className="text-gray-400">Not added</span>}
          </Row>
          <Row label="Address">
            {address ? (
              <>
                {address.line1}
                {address.line2 && <>, {address.line2}</>}
                <br />
                {address.city}, {address.state} {address.postalCode}
              </>
            ) : (
              <span className="text-gray-400">Not added</span>
            )}
          </Row>
          <Row label="SSN">•••-••-{user.ssnLast4}</Row>
        </dl>
        <p className="mt-4 text-sm text-gray-500">To change any of these details, contact support.</p>
      </section>
    </div>
  )
}

export default Settings
