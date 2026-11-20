// app/api/accounts/select/route.js
import { z } from "zod"
import { accountCreateData, accountOptions } from "@/lib/demoAccounts"
import { prisma } from "@/lib/prisma"
import { getUserId, unauthorized } from "@/lib/session"

const optionIds = accountOptions.map((o) => o.id)

const selectSchema = z.object({
  optionIds: z.array(z.enum(optionIds)).min(1),
})

// Links the chosen accounts and moves the user from approved to active
export async function POST(request) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  const parsed = selectSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: `Pick at least one of: ${optionIds.join(", ")}` }, { status: 400 })
  }
  const chosen = accountOptions.filter((o) => parsed.data.optionIds.includes(o.id))

  const linked = await prisma.$transaction(async (tx) => {
    // Only flips approved -> active, so a double submit can't link the accounts twice
    const { count } = await tx.user.updateMany({
      where: { id: userId, kycStatus: "approved" },
      data: { kycStatus: "active" },
    })
    if (count === 0) return null

    const accounts = []
    for (const option of chosen) {
      accounts.push(
        await tx.financialAccount.create({
          data: accountCreateData(userId, option),
          select: { id: true, type: true, name: true, mask: true, balance: true },
        })
      )
    }

    await tx.auditLog.create({
      data: {
        userId,
        actor: "api",
        action: "accounts_linked",
        fromStatus: "approved",
        toStatus: "active",
        details: { optionIds: chosen.map((o) => o.id) },
      },
    })

    return accounts
  })

  if (!linked) {
    return Response.json({ error: "Accounts can be picked once, after approval" }, { status: 409 })
  }

  return Response.json(
    { accounts: linked.map((a) => ({ ...a, balance: a.balance.toString() })) },
    { status: 201 }
  )
}
