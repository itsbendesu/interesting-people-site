import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

// Early "lead" capture. Called (debounced) from the apply wizard the moment a
// visitor has entered a valid name + email on step 1 — well before they finish
// the written form or record a video. Idempotent upsert keyed by email.
//
// This NEVER blocks the applicant: every failure path returns 200 so the wizard
// UI is unaffected. It also never overwrites richer captured data with blanks.
const leadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  ticketType: z.string().max(30).optional(),
  lastStep: z.string().max(30).optional(),
  // Honeypot — bots fill this; real users leave it empty.
  website: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = await checkRateLimit(`lead:${identifier}`, RATE_LIMITS.lead);
    if (!rateLimit.success) {
      // Silently no-op — this is background capture, not a user action.
      return NextResponse.json({ ok: true });
    }

    const body = await request.json();
    const data = leadSchema.parse(body);

    // Honeypot tripped — pretend success, store nothing.
    if (data.website && data.website.length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Already a completed applicant — nothing to recover.
    const existingApplicant = await prisma.applicant.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existingApplicant) {
      return NextResponse.json({ ok: true });
    }

    // Only set optional fields when non-empty, so a later sparse call (e.g. just
    // name + email) can't clobber a phone/ticketType captured earlier.
    const update: Record<string, string> = { name: data.name };
    if (data.phone) update.phone = data.phone;
    if (data.ticketType) update.ticketType = data.ticketType;
    if (data.lastStep) update.lastStep = data.lastStep;

    await prisma.applicationLead.upsert({
      where: { email: data.email },
      create: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? "",
        ticketType: data.ticketType ?? "",
        lastStep: data.lastStep ?? "basics",
      },
      update,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Never surface errors to the applicant — capture is best-effort.
    if (!(err instanceof z.ZodError)) {
      console.error("apply/lead error:", err);
    }
    return NextResponse.json({ ok: true });
  }
}
