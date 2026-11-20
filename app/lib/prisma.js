// app/lib/prisma.js
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

// Reuse one client across hot reloads in dev, or you'll run out of connections
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
