import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect /pay/:id to IPHQ where the actual payment route lives.
 * Old acceptance emails linked to interestingpeople.com/pay/... but
 * the /pay route is on dashboard.interestingpeople.com.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const iphqUrl = process.env.IPHQ_URL || "https://dashboard.interestingpeople.com";
  return NextResponse.redirect(`${iphqUrl}/pay/${id}`, 307);
}
