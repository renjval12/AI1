import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

export async function GET() {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  const accounts = await prisma.financialAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, type: true, name: true, mask: true, balance: true },
  })

  return Response.json({
    accounts: accounts.map((a) => ({ ...a, balance: a.balance.toString() })),
  })
}
