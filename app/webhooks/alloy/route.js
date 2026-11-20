// app/webhooks/alloy/route.js
import { verifyWebhook } from "@/lib/alloy"
import { prisma } from "@/lib/prisma"

// Store the event and return fast. Alloy times out after 10s and retries anything that isn't a 2xx.
// The worker processes stored events and sets processedAt.
export async function POST(request) {
  const raw = await request.text()
  if (!verifyWebhook(raw, request.headers.get("authorization"))) {
    return Response.json({ error: "Bad signature" }, { status: 401 })
  }

  let event
  try {
    event = JSON.parse(raw)
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 })
  }
  if (!event.request_token || !event.type) {
    return Response.json({ error: "Missing request_token or type" }, { status: 400 })
  }

  // Alloy can send the same event more than once. The unique requestToken skips repeats.
  await prisma.alloyWebhookEvent.createMany({
    data: [{ requestToken: event.request_token, type: event.type, payload: event }],
    skipDuplicates: true,
  })

  return new Response(null, { status: 200 })
}
