import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dustbin } from "@/models/Dustbin";

/**
 * Endpoint for ESP32 / Wokwi IoT Hardware Telemetry
 * POST /api/bins/telemetry
 * Payload: { binId: "BIN-DHK-104", distanceCm: 22 }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { binId, distanceCm, fillLevel: directFillLevel } = body;

    if (!binId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: binId" },
        { status: 400 }
      );
    }

    const totalDepth = 100; // Standard 100 cm bin depth
    let computedFill = 0;
    let isAnomaly = false;

    if (typeof distanceCm === "number") {
      // Noise & Anomaly Filtering: HC-SR04 valid range is 2cm to 400cm
      if (distanceCm < 0 || distanceCm > 400) {
        isAnomaly = true;
      }

      // Calculate percentage: closer to sensor = fuller bin
      const effectiveDistance = Math.max(0, Math.min(totalDepth, distanceCm));
      computedFill = Math.round(((totalDepth - effectiveDistance) / totalDepth) * 100);
    } else if (typeof directFillLevel === "number") {
      computedFill = Math.max(0, Math.min(100, Math.round(directFillLevel)));
    } else {
      return NextResponse.json(
        { success: false, error: "Provide either distanceCm or fillLevel" },
        { status: 400 }
      );
    }

    // Determine status according to proposal thresholds
    let status: "normal" | "attention" | "critical" = "normal";
    if (computedFill >= 80) {
      status = "critical";
    } else if (computedFill >= 50) {
      status = "attention";
    }

    const alertTriggered = status === "critical" && !isAnomaly;

    // Connect and persist to MongoDB Atlas if connection string provided
    const conn = await connectToDatabase();
    let savedRecord = null;

    if (conn) {
      savedRecord = await Dustbin.findOneAndUpdate(
        { binId },
        {
          $set: {
            currentDistanceCm: distanceCm ?? (totalDepth - (computedFill * totalDepth) / 100),
            fillLevel: computedFill,
            status,
            isAnomaly,
            lastReportedAt: new Date(),
          },
          $setOnInsert: {
            name: `Smart Bin ${binId}`,
            zone: "Dhanmondi",
            latitude: 23.7465,
            longitude: 90.376,
            totalDepthCm: totalDepth,
            moderatorEmail: "moderator@dustbintracker.org",
          },
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Telemetry processed successfully",
      telemetry: {
        binId,
        distanceCm: distanceCm ?? null,
        fillLevel: computedFill,
        status,
        isAnomaly,
        alertTriggered,
        timestamp: new Date().toISOString(),
      },
      persistedInDatabase: Boolean(conn),
      record: savedRecord,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Telemetry API Error]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
