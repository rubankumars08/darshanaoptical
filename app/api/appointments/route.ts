import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { sendAppointmentConfirmation } from "@/app/lib/mailer";
import { appointmentSchema } from "@/app/lib/public-validation";
import { clientIp, isSubmissionThrottled } from "@/app/lib/admin/rate-limit";
import { safeEqual } from "@/app/lib/admin/session-token";

export async function POST(request: Request) {
  try {
    // Open to the internet with no captcha, so cap how often one address can post.
    if (await isSubmissionThrottled("appointment", clientIp(request))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly, or call the shop directly." },
        { status: 429 }
      );
    }

    const parsed = appointmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ") },
        { status: 400 }
      );
    }
    const b = parsed.data;

    const result = await query(
      `INSERT INTO appointments (name, phone, email, preferred_date, preferred_time, test_type, wears_glasses, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [b.name, b.phone, b.email, b.preferred_date, b.preferred_time, b.test_type, b.wears_glasses, b.notes]
    );

    // Send dual email notifications (shop owner + customer confirmation if email provided)
    sendAppointmentConfirmation({
      name: b.name,
      phone: b.phone,
      email: b.email,
      testType: b.test_type,
      preferredDate: b.preferred_date,
      preferredTime: b.preferred_time,
      wearsGlasses: b.wears_glasses,
      notes: b.notes,
    }).catch((err) => console.error("[mailer] Appointment email failed:", err));

    return NextResponse.json(
      { success: true, message: "Appointment request saved successfully.", id: (result as any).insertId },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error saving appointment:", error);
    return NextResponse.json(
      { error: "Failed to save appointment. Please try again or call us directly." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const secret = request.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_API_SECRET;
  if (!secret || !expected || !safeEqual(secret, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await query("SELECT COUNT(*) as total FROM appointments");
    return NextResponse.json({ success: true, count: rows });
  } catch (error: unknown) {
    // Never echo the database error back to the caller.
    console.error("[appointments] count failed:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
