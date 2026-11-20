import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
})

// Compared against when the email doesn't exist, so a wrong email takes as long as a wrong password
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12)

export async function POST(request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: "Email and password are required" }, { status: 400 })
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, kycStatus: true },
  })
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !passwordOk) {
    return Response.json({ error: "Incorrect email or password" }, { status: 401 })
  }

  const session = await getSession()
  session.userId = user.id
  await session.save()

  return Response.json({ kycStatus: user.kycStatus })
}
