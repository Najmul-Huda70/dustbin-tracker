import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dustbin } from "@/models/Dustbin";
import { TelemetryLog } from "@/models/TelemetryLog";
import { sendCriticalAlertEmail } from "@/lib/nodemailer";

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
    let historyLogged = false;

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
            moderatorEmail: process.env.DEFAULT_MODERATOR_EMAIL || "tempostand7@gmail.com",
          },
          $setOnInsert: {
            name: `Smart Bin ${binId}`,
            zone: "Dhanmondi",
            latitude: 23.7465,
            longitude: 90.376,
            totalDepthCm: totalDepth,
            moderatorEmail: process.env.DEFAULT_MODERATOR_EMAIL || "tempostand7@gmail.com",
          },
        },
        { upsert: true, new: true }
      );

      // Save historical snapshot every 5 minutes (or immediately on critical threshold alert)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentLog = await TelemetryLog.findOne({
        binId,
        recordedAt: { $gte: fiveMinutesAgo },
      }).sort({ recordedAt: -1 });

      if (!recentLog || alertTriggered) {
        await TelemetryLog.create({
          binId,
          fillLevel: computedFill,
          distanceCm: distanceCm ?? (totalDepth - (computedFill * totalDepth) / 100),
          status,
          isAnomaly,
          recordedAt: new Date(),
        });
        historyLogged = true;
      }
    }

    // If critical threshold reached (>= 80%) without anomaly, dispatch automated Nodemailer alert
    let emailResult = null;
    if (alertTriggered) {
      emailResult = await sendCriticalAlertEmail({
        binId,
        fillLevel: computedFill,
        distanceCm,
        zone: savedRecord?.zone || "Dhanmondi",
        locationName: savedRecord?.name || "Smart IoT Dustbin",
        moderatorEmail:
          process.env.DEFAULT_MODERATOR_EMAIL ||
          savedRecord?.moderatorEmail ||
          "tempostand7@gmail.com",
      });
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
      historySnapshotSaved: historyLogged,
      emailAlert: emailResult,
      record: savedRecord,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Telemetry API Error]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
