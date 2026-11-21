import nodemailer from "nodemailer";

/**
 * Configure Nodemailer SMTP Transporter
 * Supports Gmail App Password, Custom SMTP (Hostinger, cPanel, Brevo, SendGrid, Mailgun, etc.)
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Fallback to Gmail service if host is not explicitly set
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

const FROM_EMAIL =
  process.env.SMTP_FROM ||
  process.env.EMAIL_FROM ||
  '"DustbinTracker System" <alerts@dustbintracker.org>';

export interface CriticalAlertPayload {
  binId: string;
  fillLevel: number;
  distanceCm?: number;
  zone?: string;
  locationName?: string;
  moderatorEmail?: string;
}

/**
 * Sends critical fill-level alert (>= 80%) to responsible area moderator
 */
export async function sendCriticalAlertEmail(payload: CriticalAlertPayload) {
  const {
    binId,
    fillLevel,
    distanceCm,
    zone = "Dhanmondi",
    locationName = "Sector Zone Bin",
    moderatorEmail,
  } = payload;

  // Prioritize configured moderator email (tempostand7@gmail.com)
  const recipient =
    process.env.DEFAULT_MODERATOR_EMAIL ||
    (moderatorEmail && !moderatorEmail.includes("dustbintracker.org") ? moderatorEmail : null) ||
    process.env.EMAIL_USER ||
    "tempostand7@gmail.com";

  const transporter = getTransporter();

  if (!transporter || !recipient) {
    console.warn(
      `[Nodemailer] SMTP credentials or recipient not configured. Simulated Critical Email Alert for ${binId} (${fillLevel}% full).`
    );
    return {
      success: false,
      simulated: true,
      message: "SMTP credentials not provided in environment variables.",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dustbintracker.vercel.app";
  const mapLink = `${appUrl}/map?binId=${encodeURIComponent(binId)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7faf8; margin: 0; padding: 20px; color: #142217; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #dc2626; color: #ffffff; padding: 24px; text-align: center; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: bold; padding: 4px 12px; rounded-full; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px; }
          .stat-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0; }
          .stat-number { font-size: 42px; font-weight: 900; color: #dc2626; line-height: 1; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
          .info-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
          .info-label { color: #64748b; font-weight: 600; width: 40%; }
          .info-value { color: #0f172a; font-weight: bold; }
          .btn { display: inline-block; background: #059669; color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-align: center; margin-top: 10px; }
          .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 22px;">🚨 Critical Waste Fill Alert</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">DustbinTracker Smart IoT Monitoring</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="badge">Immediate Collection Required</span>
            </div>
            
            <div class="stat-box">
              <div class="stat-number">${fillLevel}%</div>
              <div style="font-size: 13px; color: #991b1b; font-weight: 600; margin-top: 6px;">Threshold Exceeded (≥ 80%)</div>
            </div>

            <p style="font-size: 15px; line-height: 1.5; color: #334155;">
              Dustbin <strong style="font-family: monospace; color: #0f172a;">${binId}</strong> in zone <strong>${zone}</strong> has crossed the critical waste capacity threshold. A collection crew should be dispatched immediately to prevent overflow and street littering.
            </p>

            <table class="info-table">
              <tr>
                <td class="info-label">Dustbin ID:</td>
                <td class="info-value" style="font-family: monospace;">${binId}</td>
              </tr>
              <tr>
                <td class="info-label">Zone / Area:</td>
                <td class="info-value">${zone} (${locationName})</td>
              </tr>
              <tr>
                <td class="info-label">Current Distance:</td>
                <td class="info-value">${distanceCm !== undefined ? `${distanceCm} cm` : "N/A"}</td>
              </tr>
              <tr>
                <td class="info-label">Reported At:</td>
                <td class="info-value">${new Date().toLocaleTimeString()} • ${new Date().toLocaleDateString()}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 24px;">
              <a href="${mapLink}" class="btn">View Bin on Live Map →</a>
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} DustbinTracker System. Automated alert sent via Nodemailer.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: recipient,
      subject: `🚨 [CRITICAL ALERT] Dustbin ${binId} is ${fillLevel}% Full (${zone})`,
      html: htmlContent,
    });

    console.log(`[Nodemailer] Critical alert sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Nodemailer] Failed to send email alert:", error);
    return { success: false, error };
  }
}

export interface CitizenReportPayload {
  dustbinId: string;
  problemCategory: string;
  reportedAt?: Date;
  moderatorEmail?: string;
}

/**
 * Sends notification when a citizen submits a public QR scan report
 */
export async function sendCitizenReportAlertEmail(payload: CitizenReportPayload) {
  const {
    dustbinId,
    problemCategory,
    reportedAt = new Date(),
    moderatorEmail,
  } = payload;

  // Prioritize configured moderator email (tempostand7@gmail.com)
  const recipient =
    process.env.DEFAULT_MODERATOR_EMAIL ||
    (moderatorEmail && !moderatorEmail.includes("dustbintracker.org") ? moderatorEmail : null) ||
    process.env.EMAIL_USER ||
    "tempostand7@gmail.com";

  const transporter = getTransporter();

  if (!transporter || !recipient) {
    console.warn(
      `[Nodemailer] Simulated Citizen Report Email for ${dustbinId}: "${problemCategory}"`
    );
    return { success: false, simulated: true };
  }

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; background: #f7faf8;">
      <div style="max-width: 550px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px;">
        <h2 style="color: #059669; margin-top: 0;">📋 New Citizen Dustbin Report</h2>
        <p style="color: #475569; font-size: 14px;">A citizen has scanned the QR code and submitted a report:</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Dustbin ID:</strong> <span style="font-family: monospace;">${dustbinId}</span></p>
          <p style="margin: 4px 0;"><strong>Issue Reported:</strong> <span style="color: #dc2626; font-weight: bold;">${problemCategory}</span></p>
          <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date(reportedAt).toLocaleString()}</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">Please verify the situation on your assigned zone dashboard.</p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: recipient,
      subject: `📋 [Citizen Report] Issue at Dustbin ${dustbinId}: ${problemCategory}`,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Nodemailer] Citizen report email failed:", error);
    return { success: false, error };
  }
}
