import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await supabaseUser.auth.getClaims(token);
    if (!claims?.claims) throw new Error("Unauthorized");
    const userId = claims.claims.sub;
    const userEmail = claims.claims.email as string;

    const { reference } = await req.json();
    if (!reference || typeof reference !== "string") throw new Error("Invalid reference");

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } }
    );
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData?.status || verifyData?.data?.status !== "success") {
      return new Response(
        JSON.stringify({ verified: false, message: verifyData?.data?.gateway_response || "Payment not successful" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const tx = verifyData.data;
    if (tx.metadata?.user_id && tx.metadata.user_id !== userId) {
      throw new Error("Reference does not belong to current user");
    }

    const courseId = tx.metadata?.course_id;
    const courseName = COURSE_NAMES[courseId] || tx.metadata?.course_name || "Course";
    const amountGhs = (tx.amount || 0) / 100;
    const studentEmail = tx.customer?.email || userEmail;

    // Idempotent upsert via service role
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await admin
      .from("enrollments")
      .select("enrollment_id")
      .eq("paystack_reference", reference)
      .maybeSingle();

    let enrollmentId = existing?.enrollment_id;
    if (!enrollmentId) {
      enrollmentId = generateEnrollmentId();
      const { error: insErr } = await admin.from("enrollments").insert({
        enrollment_id: enrollmentId,
        full_name: tx.metadata?.full_name || studentEmail.split("@")[0],
        email: studentEmail,
        course: courseName,
        source: "paystack",
        status: "Active",
        user_id: userId,
        paystack_reference: reference,
        payment_status: "paid",
        amount_ghs: amountGhs,
        paid_at: new Date().toISOString(),
      });
      if (insErr && !insErr.message.includes("duplicate")) throw insErr;
    } else {
      await admin.from("enrollments")
        .update({ payment_status: "paid", paid_at: new Date().toISOString(), amount_ghs: amountGhs, user_id: userId })
        .eq("enrollment_id", enrollmentId);
    }

    // Send receipt notification (admin inbox per sandbox restriction; includes student email)
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

    return new Response(
      JSON.stringify({
        verified: true,
        enrollment_id: enrollmentId,
        course: courseName,
        amount_ghs: amountGhs,
        email: studentEmail,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e: any) {
    console.error("verify-payment error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
