import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RECIPIENT = "daryltecheducationalnetwork@gmail.com";

interface NotificationPayload {
  type: "contact" | "booking" | "enrollment" | "task_submitted" | "task_assigned" | "payment_receipt";
  data: Record<string, string>;
}

function buildEmail(payload: NotificationPayload): { subject: string; html: string } {
  const { type, data } = payload;

  if (type === "contact") {
    return {
      subject: `New Contact Inquiry from ${data.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `,
    };
  }

  if (type === "booking") {
    return {
      subject: `New Booking Request from ${data.name}`,
      html: `
        <h2>New Consultation Booking</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Preferred Date:</strong> ${data.preferred_date}</p>
        <p><strong>Preferred Time:</strong> ${data.preferred_time}</p>
        <p><strong>Message:</strong> ${data.message || "N/A"}</p>
      `,
    };
  }

  if (type === "task_submitted") {
    return {
      subject: `New Task Submission: ${data.task_title} by ${data.student_name}`,
      html: `
        <h2>New Task Submission</h2>
        <p><strong>Student:</strong> ${data.student_name}</p>
        <p><strong>Email:</strong> ${data.student_email || "N/A"}</p>
        <p><strong>Course:</strong> ${data.course}</p>
        <p><strong>Task:</strong> ${data.task_title}</p>
        <p><strong>Enrollment ID:</strong> ${data.enrollment_id || "N/A"}</p>
        <p>Please review this submission in the dashboard.</p>
      `,
    };
  }

  if (type === "task_assigned") {
    return {
      subject: `Task Assigned: ${data.task_title} to ${data.student_name}`,
      html: `
        <h2>Task Assigned</h2>
        <p><strong>Student:</strong> ${data.student_name}</p>
        <p><strong>Course:</strong> ${data.course}</p>
        <p><strong>Task:</strong> ${data.task_title}</p>
        <p><strong>Due Date:</strong> ${data.due_date || "No deadline"}</p>
      `,
    };
  }

  if (type === "payment_receipt") {
    return {
      subject: `Payment Receipt — ${data.course} (GH₵${data.amount_ghs})`,
      html: `
        <h2>Payment Confirmed ✅</h2>
        <p>Thank you! Your payment has been received and your enrollment is now active.</p>
        <table style="border-collapse:collapse;margin-top:12px">
          <tr><td style="padding:6px 12px"><strong>Student Email</strong></td><td style="padding:6px 12px">${data.email}</td></tr>
          <tr><td style="padding:6px 12px"><strong>Course</strong></td><td style="padding:6px 12px">${data.course}</td></tr>
          <tr><td style="padding:6px 12px"><strong>Amount Paid</strong></td><td style="padding:6px 12px">GH₵${data.amount_ghs}</td></tr>
          <tr><td style="padding:6px 12px"><strong>Enrollment ID</strong></td><td style="padding:6px 12px"><code>${data.enrollment_id}</code></td></tr>
          <tr><td style="padding:6px 12px"><strong>Paystack Reference</strong></td><td style="padding:6px 12px"><code>${data.reference}</code></td></tr>
        </table>
        <p style="margin-top:16px">Welcome to <strong>Daryl Tech & Educational Network</strong>. You can now log in to your dashboard to begin learning.</p>
      `,
    };
  }

  // enrollment
  return {
    subject: `New Enrollment: ${data.full_name} — ${data.course}`,
    html: `
      <h2>New Course Enrollment</h2>
      <p><strong>Enrollment ID:</strong> ${data.enrollment_id}</p>
      <p><strong>Student:</strong> ${data.full_name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
      <p><strong>Course:</strong> ${data.course}</p>
      <p><strong>CV Uploaded:</strong> ${data.cv_url ? "Yes" : "No"}</p>
    `,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { subject, html } = buildEmail(payload);

    // Route receipts to the customer's email; everything else goes to admin inbox.
    const recipient =
      payload.type === "payment_receipt" && payload.data.email
        ? payload.data.email
        : RECIPIENT;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Daryl Tech <onboarding@resend.dev>",
        to: [recipient],
        bcc: payload.type === "payment_receipt" ? [RECIPIENT] : undefined,
        subject,
        html,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend error:", resData);
      return new Response(JSON.stringify({ error: "Email send failed", details: resData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
