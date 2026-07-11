import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Course ID -> price in Ghanaian Cedi (GHS)
const COURSE_PRICES_GHS: Record<string, { amount: number; name: string }> = {
  "web-dev": { amount: 7500, name: "Full-Stack Web Development" },
  "mobile-dev": { amount: 6750, name: "Mobile App Development" },
  "cloud-eng": { amount: 8990, name: "Cloud Engineering & DevOps" },
  "cybersecurity": { amount: 5990, name: "Cybersecurity Fundamentals" },
  "ai-ml": { amount: 9750, name: "AI & Machine Learning" },
  "it-support": { amount: 4490, name: "IT Support & Administration" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { courseId } = await req.json();
    const course = COURSE_PRICES_GHS[courseId];
    if (!course) throw new Error(`Invalid course: ${courseId}`);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) throw new Error("Paystack not configured");

    const origin = req.headers.get("origin") ?? "";
    const callback_url = `${origin}/courses/enroll?payment=success&course=${courseId}`;

    const reference = `dten_${courseId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(course.amount * 100), // pesewas
        currency: "GHS",
        reference,
        callback_url,
        metadata: {
          user_id: user.id,
          course_id: courseId,
          course_name: course.name,
        },
      }),
    });

    const initData = await initRes.json();
    if (!initRes.ok || !initData?.status) {
      console.error("Paystack init error:", initData);
      throw new Error(initData?.message || "Failed to initialize payment");
    }

    return new Response(
      JSON.stringify({ url: initData.data.authorization_url, reference: initData.data.reference }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("create-checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
