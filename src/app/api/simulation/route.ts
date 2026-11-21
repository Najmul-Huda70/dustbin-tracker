import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * POST /api/simulation
 * Public interactive simulation endpoint — sends demo alert email to any provided address
 * Body: { binId, distanceCm, recipientEmail, binName, zone }
 */

function getTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST;

  if (!user || !pass) return null;

  if (host) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

const TOTAL_DEPTH = 100;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { binId, distanceCm, recipientEmail, binName, zone } = body;

    // Validation
    if (!binId || typeof distanceCm !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing binId or distanceCm" },
        { status: 400 }
      );
    }

    // Validate recipient email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recipientEmail || !emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid recipient email address" },
        { status: 400 }
      );
    }

    // Calculate fill level from distance
    const effectiveDistance = Math.max(0, Math.min(TOTAL_DEPTH, distanceCm));
    const fillLevel = Math.round(((TOTAL_DEPTH - effectiveDistance) / TOTAL_DEPTH) * 100);

    let status: "normal" | "attention" | "critical" = "normal";
    if (fillLevel >= 80) status = "critical";
    else if (fillLevel >= 50) status = "attention";

    const alertTriggered = status === "critical";

    // Build email HTML
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dustbintracker.vercel.app";
    const statusColor = status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";
    const statusBg = status === "critical" ? "#fef2f2" : status === "attention" ? "#fffbeb" : "#f0fdf4";
    const statusLabel = status === "critical" ? "🚨 CRITICAL — Immediate Collection Required" : status === "attention" ? "⚠️ ATTENTION — Collection Needed Soon" : "✅ NORMAL — Bin is OK";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f7faf8; margin: 0; padding: 20px; color: #142217; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #064e3b, #059669); color: #fff; padding: 28px 24px; text-align: center; }
            .content { padding: 32px 24px; }
            .stat-box { background: ${statusBg}; border: 2px solid ${statusColor}22; border-radius: 16px; padding: 24px; text-align: center; margin: 20px 0; }
            .fill-num { font-size: 56px; font-weight: 900; color: ${statusColor}; line-height: 1; }
            .status-label { font-size: 13px; font-weight: 700; color: ${statusColor}; margin-top: 8px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .info-label { color: #64748b; font-weight: 600; }
            .info-value { color: #0f172a; font-weight: 700; font-family: monospace; }
            .hardware-box { background: #0f172a; border-radius: 14px; padding: 20px; margin: 20px 0; color: #94a3b8; font-family: monospace; font-size: 12px; line-height: 1.8; }
            .hw-title { color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
            .btn { display: inline-block; background: #059669; color: #fff !important; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 12px; margin-top: 16px; }
            .sim-badge { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px; }
            .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 32px; margin-bottom: 8px;">🗑️</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">DustbinTracker Alert</h1>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.85;">Smart IoT Waste Monitoring System</p>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <span class="sim-badge">🔬 Software Simulation Demo</span>
              </div>

              <div class="stat-box">
                <div class="fill-num">${fillLevel}%</div>
                <div class="status-label">${statusLabel}</div>
              </div>

              <div style="margin: 20px 0;">
                <div class="info-row">
                  <span class="info-label">Dustbin ID</span>
                  <span class="info-value">${binId}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Bin Name</span>
                  <span class="info-value" style="font-family: sans-serif;">${binName || "Smart Bin"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Zone / Area</span>
                  <span class="info-value" style="font-family: sans-serif;">${zone || "Dhaka"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Sensor Distance</span>
                  <span class="info-value">${distanceCm.toFixed(1)} cm</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Bin Total Depth</span>
                  <span class="info-value">100 cm</span>
                </div>
                <div class="info-row" style="border-bottom: none;">
                  <span class="info-label">Timestamp</span>
                  <span class="info-value" style="font-family: sans-serif;">${new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}</span>
                </div>
              </div>

              <div class="hardware-box">
                <div class="hw-title">⚙️ Hardware Pipeline — How This Alert Was Generated</div>
                <div>ESP32 → HC-SR04 Ultrasonic Sensor</div>
                <div>  Sensor Distance  : <span style="color: #fbbf24;">${distanceCm.toFixed(1)} cm</span></div>
                <div>  Bin Total Depth  : <span style="color: #fbbf24;">100 cm</span></div>
                <div>  Fill Level       : <span style="color: ${status === "critical" ? "#f87171" : status === "attention" ? "#fbbf24" : "#34d399"};">${fillLevel}%</span>  [= (100 - ${distanceCm.toFixed(0)}) / 100 × 100]</div>
                <div>  Status           : <span style="color: ${status === "critical" ? "#f87171" : status === "attention" ? "#fbbf24" : "#34d399"};">${status.toUpperCase()}</span></div>
                <div style="margin-top: 8px;">ESP32 → WiFi → Vercel API → MongoDB Atlas</div>
                <div>MongoDB Atlas → Nodemailer → <span style="color: #34d399;">Your Inbox ✓</span></div>
              </div>

              <div style="text-align: center;">
                <a href="${appUrl}/simulation" class="btn">🔬 Try Simulation Again →</a>
              </div>

              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-top: 20px; text-align: center;">
                This is a live demo of the DustbinTracker IoT system.<br>
                In production, this alert is triggered automatically by an ESP32 sensor.
              </p>
            </div>
            <div class="footer">
              © 2026 DustbinTracker · Smart Waste Management IoT System<br>
              <a href="${appUrl}" style="color: #059669;">dustbintracker.vercel.app</a>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const transporter = getTransporter();
    if (!transporter) {
      return NextResponse.json({
        success: false,
        error: "Email service not configured on server",
      }, { status: 500 });
    }

    const fromEmail =
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      '"DustbinTracker System" <alerts@dustbintracker.org>';

    const subject = alertTriggered
      ? `🚨 [CRITICAL] Dustbin ${binId} is ${fillLevel}% Full — Immediate Action Needed!`
      : `📊 [DustbinTracker] Bin ${binId} Status Update: ${fillLevel}% Full (${status})`;

    const info = await transporter.sendMail({
      from: fromEmail,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      fillLevel,
      status,
      alertTriggered,
      distanceCm,
      messageId: info.messageId,
      recipient: recipientEmail,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Simulation API Error]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
