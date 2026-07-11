// Paystack webhook handler — verifies HMAC SHA512 signature, then creates/updates enrollment.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const COURSE_NAMES: Record<string, string> = {
  "web-dev": "Full-Stack Web Development",
  "mobile-dev": "Mobile App Development",
  "cloud-eng": "Cloud Engineering & DevOps",
  "cybersecurity": "Cybersecurity Fundamentals",
  "ai-ml": "AI & Machine Learning",
  "it-support": "IT Support & Administration",
};

function generateEnrollmentId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "DTEN-";
  for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const raw = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const expected = createHmac("sha512", secret).update(raw).digest("hex");
    if (!signature || signature !== expected) {
      console.warn("Invalid Paystack signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(raw);
    if (event.event !== "charge.success") {
      return new Response(JSON.stringify({ ok: true, ignored: event.event }), { status: 200 });
    }

    const tx = event.data;
    const reference = tx.reference;
    const courseId = tx.metadata?.course_id;
    const courseName = COURSE_NAMES[courseId] || tx.metadata?.course_name || "Course";
    const amountGhs = (tx.amount || 0) / 100;
    const studentEmail = tx.customer?.email;
    const userId = tx.metadata?.user_id || null;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await admin
      .from("enrollments")
      .select("enrollment_id, payment_status")
      .eq("paystack_reference", reference)
      .maybeSingle();

    let enrollmentId = existing?.enrollment_id;
    const alreadyPaid = existing?.payment_status === "paid";

    if (!enrollmentId) {
      enrollmentId = generateEnrollmentId();
      await admin.from("enrollments").insert({
        enrollment_id: enrollmentId,
        full_name: tx.metadata?.full_name || studentEmail?.split("@")[0] || "Student",
        email: studentEmail,
        course: courseName,
        source: "paystack-webhook",
        status: "Active",
        user_id: userId,
        paystack_reference: reference,
        payment_status: "paid",
        amount_ghs: amountGhs,
        paid_at: new Date().toISOString(),
      });
    } else if (!alreadyPaid) {
      await admin.from("enrollments")
        .update({ payment_status: "paid", paid_at: new Date().toISOString(), amount_ghs: amountGhs })
        .eq("enrollment_id", enrollmentId);
    } else {
      return new Response(JSON.stringify({ ok: true, already: true }), { status: 200 });
    }

    // Send confirmation receipt (sandbox: routed to admin inbox).
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "payment_receipt",
        data: {
          enrollment_id: enrollmentId,
          email: studentEmail,
          course: courseName,
          amount_ghs: amountGhs.toFixed(2),
          reference,
        },
      }),
    }).catch((e) => console.error("notify error", e));

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    console.error("paystack-webhook error", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
