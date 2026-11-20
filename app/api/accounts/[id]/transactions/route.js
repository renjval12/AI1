import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getUserId, notFound, unauthorized } from "@/lib/session"

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.uuid().optional(), // id of the last transaction on the previous page
})

export async function GET(request, { params }) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  if (!z.uuid().safeParse(id).success) return notFound()

  const query = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!query.success) {
    return Response.json({ error: "Invalid limit or cursor" }, { status: 400 })
  }
  const { limit, cursor } = query.data

  // Filtering on userId too, so one user can't read another user's account
  const account = await prisma.financialAccount.findFirst({ where: { id, userId }, select: { id: true } })
  if (!account) return notFound()

  const rows = await prisma.transaction.findMany({
    where: { accountId: id },
    orderBy: [{ postedOn: "desc" }, { id: "desc" }],
    take: limit + 1, // one extra, to know if there's another page
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: { id: true, amount: true, merchantName: true, category: true, postedOn: true, pending: true },
  })

  const page = rows.slice(0, limit)
  return Response.json({
    transactions: page.map((t) => ({
      ...t,
      amount: t.amount.toString(),
      postedOn: t.postedOn.toISOString().slice(0, 10),
    })),
    nextCursor: rows.length > limit ? page.at(-1).id : null,
  })
}
