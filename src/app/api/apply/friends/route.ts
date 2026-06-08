import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const friendsSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(50),
  bio: z.string().min(3, "Tell us a little about yourself").max(500),
  teachSkill: z.string().max(300).optional(),
  links: z.array(z.string().min(1)).optional().default([]),
  ticketType: z.enum(["friends-hotel", "friends-local", "patron-hotel", "patron-local", "gratis-hotel", "gratis-local"]),
  amount: z.number().min(0),
  timezone: z.string().max(100).optional().default(""),
}).refine(
  (data) => !data.ticketType.startsWith("patron") || data.amount >= 1,
  { message: "Patron tickets require an amount of at least $1", path: ["amount"] }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = friendsSchema.parse(body);

    // Check for duplicate email
    const existing = await prisma.applicant.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      // Idempotent: this email is already registered — almost always the same
      // person retrying after a cosmetic error (the first submit committed, then
      // the UI showed a failure). Returning a 400 here gave them a scary
      // dead-end and permanently blocked every retry. Instead treat it as
      // success so the page shows the confirmation. We do NOT create a duplicate
      // or re-fire the IPHQ webhook (the original registration already did).
      const priorSubmission = await prisma.submission.findFirst({
        where: { applicantId: existing.id },
        select: { id: true },
      });
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        submissionId: priorSubmission?.id ?? null,
      });
    }

    // Grab any active prompt (required FK on Submission)
    const prompt = await prisma.prompt.findFirst({
      where: { active: true },
    });
    if (!prompt) {
      return NextResponse.json(
        { error: "No active prompts configured" },
        { status: 500 }
      );
    }

    // Create applicant + submission in one transaction
    const result = await prisma.$transaction(async (tx) => {
      const applicant = await tx.applicant.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          ticketType: data.ticketType,
          scholarshipAmount: `$${data.amount.toLocaleString("en-US")}`,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          roleCompany: "",
          heardAbout: "Friend of Andrew (invited)",
          threeWords: "",
          bio: data.bio,
          teachSkill: data.teachSkill || undefined,
          links: data.links.length > 0 ? data.links : undefined,
        },
      });

      const submission = await tx.submission.create({
        data: {
          applicantId: applicant.id,
          promptId: prompt.id,
          videoUrl: "friend-invite",
          videoDurationSec: 0,
          status: "SUBMITTED",
        },
      });

      return { applicant, submission };
    });

    // Fire webhook to IPHQ
    const ipBrainUrl = process.env.IP_BRAIN_URL || "https://ipevents.co";
    after(async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (process.env.WEBHOOK_SECRET) headers["x-webhook-secret"] = process.env.WEBHOOK_SECRET;
        await fetch(`${ipBrainUrl}/api/events/ip4/applications`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            ticket_type: data.ticketType,
            price_override: data.amount,
            heard_about: "Friend of Andrew (invited)",
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            bio: data.bio,
            links: data.links,
            video_url: null,
            video_duration_sec: 0,
            prompt_text: null,
            source_id: result.submission.id,
            teach_skill: data.teachSkill || null,
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch (err) {
        console.warn("IPHQ webhook failed:", err instanceof Error ? err.message : "unknown");
      }
    });

    return NextResponse.json({
      success: true,
      submissionId: result.submission.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      return NextResponse.json(
        { error: issue.message },
        { status: 400 }
      );
    }

    console.error("Friends registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
