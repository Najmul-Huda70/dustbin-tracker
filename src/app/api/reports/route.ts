import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Report } from "@/models/Report";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dustbinId = searchParams.get("dustbinId");

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: true,
        source: "mock_fallback",
        reports: [],
      });
    }

    const filter: Record<string, string> = {};
    if (dustbinId) filter.dustbinId = dustbinId;

    const reports = await Report.find(filter).sort({ reportedAt: -1 }).limit(100);

    return NextResponse.json({
      success: true,
      source: "mongodb_atlas",
      count: reports.length,
      reports,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching reports";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dustbinId, problemCategory } = body;

    if (!dustbinId || !problemCategory) {
      return NextResponse.json(
        { success: false, error: "dustbinId and problemCategory are required" },
        { status: 400 }
      );
    }

    const conn = await connectToDatabase();
    let savedReport = null;

    if (conn) {
      savedReport = await Report.create({
        dustbinId,
        problemCategory,
        status: "pending",
        reportedAt: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Citizen report submitted successfully",
        report: savedReport || {
          dustbinId,
          problemCategory,
          status: "pending",
          reportedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error submitting report";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
