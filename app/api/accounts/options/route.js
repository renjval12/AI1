import { accountOptions } from "@/lib/demoAccounts"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

// The accounts an approved user can pick from
export async function GET() {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { kycStatus: true } })
  if (user?.kycStatus !== "approved") {
    return Response.json({ error: "Accounts can be picked once, after approval" }, { status: 409 })
  }

  return Response.json({
    options: accountOptions.map(({ transactions, ...option }) => option),
  })
}
