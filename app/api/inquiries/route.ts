import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { sendInquiryNotification } from "@/app/lib/mailer";
import { inquirySchema } from "@/app/lib/public-validation";
import { clientIp, isSubmissionThrottled } from "@/app/lib/admin/rate-limit";
import { safeEqual } from "@/app/lib/admin/session-token";

export async function POST(request: Request) {
  try {
    if (await isSubmissionThrottled("inquiry", clientIp(request))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly, or message us on WhatsApp." },
        { status: 429 }
      );
    }

    const parsed = inquirySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).join("; ") },
        { status: 400 }
      );
    }
    const b = parsed.data;

    const result = await query(
      `INSERT INTO inquiries (name, phone, email, interest, message, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [b.name, b.phone, b.email, b.interest, b.message]
    );

    // Send email notification to shop (non-blocking — don't await)
    sendInquiryNotification({
      name: b.name,
      phone: b.phone,
      email: b.email,
      interest: b.interest,
      message: b.message,
    }).catch((err) => console.error("[mailer] Inquiry email failed:", err));

    return NextResponse.json(
      { success: true, message: "Inquiry saved successfully.", id: (result as any).insertId },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error saving inquiry:", error);
    return NextResponse.json(
      { error: "Failed to save inquiry. Please try again or message via WhatsApp." },
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
    const rows = await query("SELECT COUNT(*) as total FROM inquiries");
    return NextResponse.json({ success: true, count: rows });
  } catch (error: unknown) {
    console.error("[inquiries] count failed:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
