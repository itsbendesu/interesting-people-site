import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAlumniEmail } from "@/lib/alumni-list";

const ALUMNI_PRICE = 6999;
const ALUMNI_FRIEND_PRICE = 7999;

const alumniSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(50),
  bio: z.string().min(3, "Tell us a little about yourself").max(500),
  teachSkill: z.string().max(300).optional(),
  links: z.array(z.string().min(1)).optional().default([]),
  ticketType: z.enum(["alumni", "alumni-friend"]),
  priorEvent: z.enum(["IP3", "IP2", "IP1"]).optional(),
  referredBy: z.string().max(200).optional(),
  timezone: z.string().max(100).optional().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = alumniSchema.parse(body);

    const amount = data.ticketType === "alumni" ? ALUMNI_PRICE : ALUMNI_FRIEND_PRICE;

    // Alumni-rate gate: email must be on the curated alumni list.
    // Alumni-friend tier is open — anyone can apply at that rate.
    if (data.ticketType === "alumni" && !isAlumniEmail(data.email)) {
      return NextResponse.json(
        {
          error: "ALUMNI_EMAIL_NOT_FOUND",
          message:
            "We don't have this email on our IP alumni list. If you were at IP1, IP2, or IP3 and think this is a mistake, email hello@interestingpeople.com and we'll sort it out. If a friend passed this along, they likely meant to send you to /alumni/friend.",
          friendUrl: "/alumni/friend",
        },
        { status: 403 }
      );
    }

    const existing = await prisma.applicant.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "It looks like you already have an application. Reach out to hello@interestingpeople.com if you need help." },
        { status: 400 }
      );
    }

    const prompt = await prisma.prompt.findFirst({ where: { active: true } });
    if (!prompt) {
      return NextResponse.json(
        { error: "No active prompts configured" },
        { status: 500 }
      );
    }

    const heardAbout =
      data.ticketType === "alumni"
        ? `Alumni outreach (${data.priorEvent ?? "past attendee"})`
        : `Alumni referral${data.referredBy ? ` — referred by ${data.referredBy}` : ""}`;

    const result = await prisma.$transaction(async (tx) => {
      const applicant = await tx.applicant.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          ticketType: data.ticketType,
          scholarshipAmount: `$${amount.toLocaleString("en-US")}`,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          roleCompany: "",
          heardAbout,
          priorEvents: data.priorEvent || undefined,
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
          videoUrl: "alumni-outreach",
          videoDurationSec: 0,
          status: "SUBMITTED",
        },
      });

      return { applicant, submission };
    });

    const ipBrainUrl = process.env.IP_BRAIN_URL || "https://ipevents.co";
    const autoAccept = data.ticketType === "alumni";

    after(async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (process.env.WEBHOOK_SECRET) headers["x-webhook-secret"] = process.env.WEBHOOK_SECRET;
        const createRes = await fetch(`${ipBrainUrl}/api/events/ip4/applications`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            ticket_type: data.ticketType,
            price_override: amount,
            heard_about: heardAbout,
            prior_events: data.priorEvent || null,
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

        // Alumni tier: past attendees are auto-accepted (triggers acceptance email + payment link).
        // Alumni-friend tier: stays in submitted for a quick reviewer check.
        if (autoAccept && createRes.ok) {
          const created = (await createRes.json()) as { id?: string; deduplicated?: boolean };
          if (created.id && !created.deduplicated) {
            await fetch(`${ipBrainUrl}/api/events/ip4/applications/${created.id}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ status: "accepted" }),
              signal: AbortSignal.timeout(8000),
            });
          }
        }
      } catch (err) {
        console.warn("IPHQ webhook failed:", err instanceof Error ? err.message : "unknown");
      }
    });

    return NextResponse.json({
      success: true,
      submissionId: result.submission.id,
      amount,
      autoAccepted: autoAccept,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      return NextResponse.json({ error: issue.message }, { status: 400 });
    }

    console.error("Alumni registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
