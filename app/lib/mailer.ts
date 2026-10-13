import nodemailer, { Transporter } from "nodemailer";

// ─── Singleton Transporter ───────────────────────────────────────────────────

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  const user = process.env.SMTP_FROM;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "[mailer] SMTP_FROM and SMTP_PASS env variables are required. " +
      "Add them to .env.local."
    );
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return _transporter;
}

// ─── Shared Store Metadata ───────────────────────────────────────────────────

const STORE_INFO = {
  name: "Darshana Optical",
  phone: "+91 88705 71536",
  phoneRaw: "918870571536",
  email: "darshanaoptical31@gmail.com",
  address: "Tvk Nagar, Salem Bypass Road, opposite Vasanth & Co, Harur, Tamil Nadu – 636 903",
  mapsUrl: "https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9",
  websiteUrl: "https://darshanaoptical.com",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "As soon as possible";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Email Types ─────────────────────────────────────────────────────────────

export interface AppointmentEmailData {
  name: string;
  phone: string;
  email?: string | null;
  testType: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  wearsGlasses?: string | null;
  notes?: string | null;
}

export interface InquiryEmailData {
  name: string;
  phone: string;
  email?: string | null;
  interest: string;
  message?: string | null;
}

// ─── 1. Eye Test Booking: Dual Email (Owner + Customer) ───────────────────────

export async function sendAppointmentConfirmation(
  data: AppointmentEmailData
): Promise<void> {
  const transporter = getTransporter();
  const ownerEmail = process.env.SMTP_FROM!;
  const dateDisplay = formatDate(data.preferredDate);
  const timeDisplay = data.preferredTime || "Flexible";

  // ── A. Email to Store Owner / Staff ──
  const ownerHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:#0f172a;padding:28px 32px;border-bottom:4px solid #fc5a06;">
                  <span style="background:#fc5a06;color:#ffffff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.8px;">
                    New Appointment Alert
                  </span>
                  <h1 style="margin:12px 0 0;color:#ffffff;font-size:22px;font-weight:800;">
                    Eye Test Booking Request
                  </h1>
                  <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">
                    Submitted via Darshana Optical Website
                  </p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">
                    A new eye examination request has been submitted by <strong>${data.name}</strong>. Details below:
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;width:140px;">Customer Name</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#0f172a;">${data.name}</td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Phone Number</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#fc5a06;"><a href="tel:${data.phone}" style="color:#fc5a06;text-decoration:none;">${data.phone}</a></td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Customer Email</td><td style="padding:8px 0;font-size:13px;color:#0f172a;">${data.email || 'Not provided'}</td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Service Requested</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;">${data.testType}</td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Preferred Date</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;">${dateDisplay}</td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Preferred Time</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;">${timeDisplay}</td></tr>
                    ${data.wearsGlasses ? `<tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Currently Wears Glasses?</td><td style="padding:8px 0;font-size:13px;color:#0f172a;">${data.wearsGlasses}</td></tr>` : ''}
                    ${data.notes ? `<tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Notes / Concerns</td><td style="padding:8px 0;font-size:13px;color:#0f172a;font-style:italic;">${data.notes}</td></tr>` : ''}
                  </table>

                  <!-- Action Buttons -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="tel:${data.phone}" style="display:inline-block;background:#fc5a06;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-right:12px;">
                          📞 Call Customer
                        </a>
                        <a href="https://wa.me/91${data.phone.replace(/[^0-9]/g, '')}" style="display:inline-block;background:#25d366;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                          💬 Message on WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
                  Darshana Optical Internal Notifications · Harur, Tamil Nadu
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const tasks: Promise<any>[] = [
    transporter.sendMail({
      from: `"Darshana Optical System" <${ownerEmail}>`,
      to: ownerEmail,
      subject: `🔔 New Eye Test Booking: ${data.name} (${data.phone})`,
      html: ownerHtml,
      replyTo: data.email || ownerEmail,
    }),
  ];

  // ── B. Email to Customer (if email provided) ──
  if (data.email && data.email.includes("@")) {
    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg, #fc5a06 0%, #ea580c 100%);padding:36px 32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
                      Darshana Optical
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;">
                      Eye Care &amp; Premium Eyewear · Harur
                    </p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding:36px 32px;">
                    <p style="margin:0 0 12px;font-size:16px;color:#0f172a;">
                      Dear <strong>${data.name}</strong>,
                    </p>
                    <p style="margin:0 0 24px;font-size:14.5px;color:#334155;line-height:1.6;">
                      Thank you for choosing <strong>Darshana Optical</strong>. We have successfully received your eye testing appointment request. Our team will review your requested slot and confirm shortly.
                    </p>

                    <!-- Summary Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #ffedd5;border-radius:14px;padding:24px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:0 0 14px;border-bottom:1px solid #fed7aa;">
                          <span style="font-size:12px;font-weight:800;color:#ea580c;text-transform:uppercase;letter-spacing:0.5px;">
                            Appointment Summary
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:14px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr><td style="padding:6px 0;font-size:13px;color:#7c2d12;width:140px;">Service</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:#431407;">${data.testType}</td></tr>
                            <tr><td style="padding:6px 0;font-size:13px;color:#7c2d12;">Date</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:#431407;">${dateDisplay}</td></tr>
                            <tr><td style="padding:6px 0;font-size:13px;color:#7c2d12;">Time Window</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:#431407;">${timeDisplay}</td></tr>
                            <tr><td style="padding:6px 0;font-size:13px;color:#7c2d12;">Phone</td><td style="padding:6px 0;font-size:13px;color:#431407;">${data.phone}</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Visit Tips -->
                    <div style="background:#f8fafc;border-left:4px solid #fc5a06;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:28px;">
                      <h4 style="margin:0 0 8px;font-size:13.5px;color:#0f172a;">Important tips for your visit:</h4>
                      <ul style="margin:0;padding-left:20px;font-size:13px;color:#475569;line-height:1.6;">
                        <li>If you wear glasses or contact lenses, please bring your existing pair with you.</li>
                        <li>A comprehensive eye examination typically takes 20 to 30 minutes.</li>
                      </ul>
                    </div>

                    <!-- Store Location & Contact -->
                    <p style="margin:0 0 6px;font-size:13px;color:#334155;line-height:1.5;">
                      📍 <strong>Address:</strong> ${STORE_INFO.address}
                    </p>
                    <p style="margin:0 0 20px;font-size:13px;color:#334155;line-height:1.5;">
                      📞 <strong>Phone:</strong> <a href="tel:${STORE_INFO.phone}" style="color:#fc5a06;text-decoration:none;font-weight:600;">${STORE_INFO.phone}</a>
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://wa.me/${STORE_INFO.phoneRaw}?text=Hi%20Darshana%20Optical,%20checking%20on%20my%20appointment" style="display:inline-block;background:#25d366;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13.5px;">
                            💬 Chat on WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f1f5f9;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:12px;color:#64748b;">
                      © ${new Date().getFullYear()} ${STORE_INFO.name} · Harur, Tamil Nadu<br />
                      <a href="${STORE_INFO.websiteUrl}" style="color:#fc5a06;text-decoration:none;">${STORE_INFO.websiteUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    tasks.push(
      transporter.sendMail({
        from: `"${STORE_INFO.name}" <${ownerEmail}>`,
        to: data.email,
        subject: `Appointment Request Confirmed — Darshana Optical`,
        html: customerHtml,
      })
    );
  }

  // Execute both mail dispatches safely
  const results = await Promise.allSettled(tasks);
  results.forEach((res, i) => {
    if (res.status === "rejected") {
      console.error(`[mailer] Appointment email #${i + 1} failed:`, res.reason);
    }
  });
}

// ─── 2. Inquiry Notification: Dual Email (Owner + Customer) ───────────────────

export async function sendInquiryNotification(
  data: InquiryEmailData
): Promise<void> {
  const transporter = getTransporter();
  const ownerEmail = process.env.SMTP_FROM!;

  // ── A. Email to Store Owner / Staff ──
  const ownerHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:#0f172a;padding:28px 32px;border-bottom:4px solid #fc5a06;">
                  <span style="background:#fc5a06;color:#ffffff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.8px;">
                    New Website Inquiry
                  </span>
                  <h1 style="margin:12px 0 0;color:#ffffff;font-size:22px;font-weight:800;">
                    Customer Inquiry Received
                  </h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;width:130px;">Name</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#0f172a;">${data.name}</td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Phone</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#fc5a06;"><a href="tel:${data.phone}" style="color:#fc5a06;text-decoration:none;">${data.phone}</a></td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Email</td><td style="padding:8px 0;font-size:13px;color:#0f172a;">${data.email || 'Not provided'}</td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Interest</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;">${data.interest}</td></tr>
                    <tr><td style="padding:8px 0;font-size:13px;color:#64748b;">Message</td><td style="padding:8px 0;font-size:14px;color:#334155;line-height:1.5;">${data.message || 'No additional message provided.'}</td></tr>
                  </table>

                  <!-- Actions -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="tel:${data.phone}" style="display:inline-block;background:#fc5a06;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-right:12px;">
                          📞 Call Customer
                        </a>
                        <a href="https://wa.me/91${data.phone.replace(/[^0-9]/g, '')}" style="display:inline-block;background:#25d366;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                          💬 Message on WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
                  Darshana Optical Internal Notifications · Harur
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const tasks: Promise<any>[] = [
    transporter.sendMail({
      from: `"Darshana Optical Website" <${ownerEmail}>`,
      to: ownerEmail,
      subject: `📩 New Customer Inquiry: ${data.name} (${data.interest})`,
      html: ownerHtml,
      replyTo: data.email || ownerEmail,
    }),
  ];

  // ── B. Email to Customer (if email provided) ──
  if (data.email && data.email.includes("@")) {
    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg, #fc5a06 0%, #ea580c 100%);padding:36px 32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
                      Darshana Optical
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;">
                      Eye Care &amp; Premium Eyewear · Harur
                    </p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding:36px 32px;">
                    <p style="margin:0 0 12px;font-size:16px;color:#0f172a;">
                      Dear <strong>${data.name}</strong>,
                    </p>
                    <p style="margin:0 0 20px;font-size:14.5px;color:#334155;line-height:1.6;">
                      Thank you for contacting <strong>Darshana Optical</strong>. We have received your inquiry regarding <strong>${data.interest}</strong>. Our optometrist or customer support team will be in touch with you shortly.
                    </p>

                    <!-- Inquiry Summary -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px;margin-bottom:24px;">
                      <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:130px;">Inquiry Topic</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:#0f172a;">${data.interest}</td></tr>
                      ${data.message ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Your Message</td><td style="padding:6px 0;font-size:13.5px;color:#334155;font-style:italic;">"${data.message}"</td></tr>` : ''}
                    </table>

                    <p style="margin:0 0 8px;font-size:13.5px;color:#334155;line-height:1.5;">
                      Need immediate optical advice or looking for a specific frame? Feel free to call us directly:
                    </p>
                    <p style="margin:0 0 20px;font-size:13px;color:#334155;line-height:1.5;">
                      📞 <strong>Phone:</strong> <a href="tel:${STORE_INFO.phone}" style="color:#fc5a06;text-decoration:none;font-weight:600;">${STORE_INFO.phone}</a><br />
                      📍 <strong>Address:</strong> ${STORE_INFO.address}
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://wa.me/${STORE_INFO.phoneRaw}?text=Hi%20Darshana%20Optical,%20following%20up%20on%20my%20inquiry" style="display:inline-block;background:#25d366;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13.5px;">
                            💬 Chat on WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f1f5f9;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:12px;color:#64748b;">
                      © ${new Date().getFullYear()} ${STORE_INFO.name} · Harur, Tamil Nadu<br />
                      <a href="${STORE_INFO.websiteUrl}" style="color:#fc5a06;text-decoration:none;">${STORE_INFO.websiteUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    tasks.push(
      transporter.sendMail({
        from: `"${STORE_INFO.name}" <${ownerEmail}>`,
        to: data.email,
        subject: `Thank you for contacting Darshana Optical!`,
        html: customerHtml,
      })
    );
  }

  // Execute both mail dispatches safely
  const results = await Promise.allSettled(tasks);
  results.forEach((res, i) => {
    if (res.status === "rejected") {
      console.error(`[mailer] Inquiry email #${i + 1} failed:`, res.reason);
    }
  });
}
