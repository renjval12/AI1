// app/lib/session.js
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"

const sessionOptions = {
  cookieName: "ai1_session",
  password: process.env.SESSION_SECRET, // at least 32 characters
  ttl: 60 * 60 * 8, // 8 hours
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
}

export async function getSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not set. Add one to .env.local (openssl rand -base64 32).")
  }
  return getIronSession(await cookies(), sessionOptions)
}

// The signed-in user's id, or null
export async function getUserId() {
  const session = await getSession()
  return session.userId ?? null
}

export const unauthorized = () => Response.json({ error: "Not signed in" }, { status: 401 })
export const notFound = () => Response.json({ error: "Not found" }, { status: 404 })
