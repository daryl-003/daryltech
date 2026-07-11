import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roleData } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, enrollment_id, status } = await req.json();

    switch (action) {
      case "set_status": {
        if (!["Active", "Inactive"].includes(status)) throw new Error("Invalid status");
        const { error } = await supabase
          .from("enrollments").update({ status }).eq("enrollment_id", enrollment_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "delete_student": {
        const { data: enr } = await supabase
          .from("enrollments").select("email").eq("enrollment_id", enrollment_id).maybeSingle();
        if (!enr) throw new Error("Enrollment not found");

        // hard delete enrollment + related task submissions + progress
        await supabase.from("task_submissions").delete().eq("enrollment_id", enrollment_id);
        await supabase.from("course_progress").delete().eq("enrollment_id", enrollment_id);
        await supabase.from("enrollments").delete().eq("enrollment_id", enrollment_id);

        // Try to find the auth user by email & remove account if present
        const { data: profile } = await supabase
          .from("profiles").select("user_id").eq("email", enr.email).maybeSingle();
        if (profile?.user_id) {
          await supabase.auth.admin.deleteUser(profile.user_id);
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      default:
        throw new Error("Invalid action");
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
