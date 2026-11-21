import { NextRequest, NextResponse } from "next/server";
import { sendCriticalAlertEmail } from "@/lib/nodemailer";

/**
 * Test endpoint to verify Nodemailer SMTP delivery
 * GET /api/alerts/test-email?to=your-email@example.com
 * or POST with body: { "to": "your-email@example.com" }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to");

  const result = await sendCriticalAlertEmail({
    binId: "BIN-DHK-TEST",
    fillLevel: 88,
    distanceCm: 12,
    zone: "Dhanmondi (Test Run)",
    locationName: "Test Node Location",
    moderatorEmail: to || undefined,
  });

  return NextResponse.json({
    message: "Test critical email dispatch executed",
    result,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { to } = body;

    const result = await sendCriticalAlertEmail({
      binId: "BIN-DHK-TEST",
      fillLevel: 85,
      distanceCm: 15,
      zone: "Gulshan (Test)",
      locationName: "Gulshan-2 Park",
      moderatorEmail: to || undefined,
    });

    return NextResponse.json({
      message: "Test critical email dispatch executed",
      result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
