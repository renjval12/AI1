import { prisma } from "@/lib/prisma"

export async function GET(request) {
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase()
    if (!email)
        return Response.json(
            {
                error: "email is required"
            },
            {
                status: 400
            }
        )
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true
        }
    })
    return Response.json({ available: !user })
}
