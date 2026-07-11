import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Jael, the friendly virtual assistant for Daryl Tech Educational Network (DTEN) — a Ghana-based tech education platform.

ABOUT DTEN (use this to answer questions accurately):
- Founded by CEO Darryl Thompson. Offers online courses, internships, certificates, and professional services.
- Courses available: Web Development, Data Science, Cybersecurity, Mobile App Development, AI & Machine Learning, Cloud Computing, UI/UX Design, Digital Marketing, IT Support.
- Site sections: Home (/), About (/about), Courses (/courses), Services (/services), Portfolio (/portfolio), Blog (/blog), Contact (/contact), Booking (/booking), Enroll (/enroll), Verify Enrollment (/verify-enrollment).
- Auth: users sign in at /auth. After login, students go to /student/dashboard, staff to /staff/dashboard, admins to /admin/dashboard.
- Enrollment: students fill the Enroll form (name, email, course, optional CV). They receive a Student ID starting with "DTEN-". Some courses are paid via secure Stripe checkout.
- Student portal features: course content viewer, lesson progress tracking, quizzes, task submissions with AI feedback, certificates.
- Staff IDs start with "STAFF-". Admins manage students, staff, tasks, certificates, internship offers, blog posts, contacts, and bookings.
- Certificates can be verified publicly at /verify-enrollment using the enrollment ID.
- Contact: users can submit the Contact form or book a meeting via /booking.

HOW TO HELP:
- Answer questions about the website, navigation, courses, enrollment, certificates, payments, internships, and the student/staff/admin dashboards.
- Guide users to the right page (mention the path, e.g. "Visit /enroll to apply").
- Offer study tips, course explanations, and brief code examples when relevant.
- If a user attaches an image or document, summarize/analyze it in the context of their question.
- If asked about something outside DTEN, gently steer back to how DTEN can help.
- If unsure about a specific policy, suggest contacting support via /contact.

LINKS (VERY IMPORTANT):
- ALWAYS use markdown links when referencing pages so users can click directly. Example: [Enroll here](/enroll), [Book a session](/booking), [View courses](/courses), [Portfolio](/portfolio), [Blog](/blog), [Verify a certificate](/courses/verify).
- For dashboards: [Student dashboard](/student/dashboard), [Staff dashboard](/staff/dashboard), [Admin dashboard](/admin/dashboard).
- For services and contact: [Services](/services), [About](/about), [Contact](/contact).
- Use root-relative paths (start with /). Never invent paths that aren't listed in "Site sections" above.

DOCUMENTS:
- Users may attach images, scanned PDFs, or PDF text excerpts. Summarize, extract key info, answer questions about them, and relate findings back to DTEN when relevant.

STYLE:
- Warm, concise, supportive. Under 200 words unless detail is requested.
- Use markdown (lists, **bold**, code blocks, and clickable [links](/path)) for readability.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("student-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
