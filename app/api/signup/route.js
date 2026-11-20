import bcrypt from "bcryptjs"
import { z } from "zod"
import { runEvaluation } from "@/lib/alloy"
import { applyAlloyResponse, publicApplication } from "@/lib/kyc"
import { encryptPii } from "@/lib/pii"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

const US_NAMES = ["us", "usa", "united states", "united states of america"]

const signupSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(12, "Must be at least 12 characters").max(72), // bcrypt ignores anything past 72 bytes
  phone: z.string().trim().optional(),
  dob: z.iso.date(),
  ssn: z
    .string()
    .regex(/^\d{3}-?\d{2}-?\d{4}$/, "SSN must be 9 digits")
    .transform((s) => s.replace(/-/g, "")),
  address1: z.string().trim().min(1),
  address2: z.string().trim().optional(),
  locality: z.string().trim().min(1),
  state: z.string().trim().toUpperCase().length(2, "Use the 2-letter state code"),
  postcode: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "ZIP must be 5 digits"),
  country: z
    .string()
    .trim()
    .optional()
    .refine((c) => !c || US_NAMES.includes(c.toLowerCase()), "Only US addresses are supported"),
})

export async function POST(request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", fields: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    )
  }
  const input = parsed.data

  // The full SSN is only sent to Alloy, never stored. DOB is stored encrypted.
  const { encrypted, wrappedKey } = encryptPii(input.dob)

  let user
  try {
    user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        dobEncrypted: encrypted,
        piiDataKey: wrappedKey,
        ssnLast4: input.ssn.slice(-4),
        addresses: {
          create: {
            isCurrent: true,
            line1: input.address1,
            line2: input.address2 || null,
            city: input.locality,
            state: input.state,
            postalCode: input.postcode,
          },
        },
        applications: { create: {} },
      },
      select: { id: true, applications: true },
    })
  } catch (err) {
    if (err?.code === "P2002") {
      return Response.json({ error: "An account with that email already exists" }, { status: 409 })
    }
    throw err
  }

  const session = await getSession()
  session.userId = user.id
  await session.save()

  let result
  try {
    result = await runEvaluation(user.id, {
      name_first: input.firstName,
      name_last: input.lastName,
      birth_date: input.dob,
      document_ssn: input.ssn,
      email_address: input.email,
      phone_number: input.phone || undefined,
      address_line_1: input.address1,
      address_line_2: input.address2 || undefined,
      address_city: input.locality,
      address_state: input.state,
      address_postal_code: input.postcode,
      address_country_code: "US",
    })
  } catch {
    result = { status: 0, data: {} }
  }

  const application = await applyAlloyResponse(user.applications[0], result)
  return Response.json(publicApplication(application), { status: 201 })
}
