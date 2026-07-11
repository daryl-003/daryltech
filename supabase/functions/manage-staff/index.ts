import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateStaffId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "STAFF-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "create_staff": {
        const { email, full_name, department, password } = body;
        if (!email || !full_name || !password) {
          throw new Error("Email, full name, and password are required");
        }

        // Create auth user
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { display_name: full_name },
        });
        if (createErr) throw createErr;

        const staffId = generateStaffId();

        // Insert staff member record
        const { error: staffErr } = await supabase.from("staff_members").insert({
          staff_id: staffId,
          user_id: newUser.user.id,
          full_name,
          email,
          department: department || null,
          created_by: user.id,
        });
        if (staffErr) throw staffErr;

        // Assign staff role
        const { error: roleErr } = await supabase.from("user_roles").insert({
          user_id: newUser.user.id,
          role: "staff",
        });
        if (roleErr) throw roleErr;

        return new Response(JSON.stringify({ staff_id: staffId, email, full_name }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "remove_staff": {
        const { staff_id } = body;
        const { data: staff } = await supabase
          .from("staff_members").select("*").eq("staff_id", staff_id).maybeSingle();
        if (!staff) throw new Error("Staff member not found");

        if (staff.user_id) {
          await supabase.from("user_roles").delete()
            .eq("user_id", staff.user_id).eq("role", "staff");
          // hard delete the auth user as well
          await supabase.auth.admin.deleteUser(staff.user_id);
        }
        await supabase.from("staff_members").delete().eq("staff_id", staff_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "set_staff_status": {
        const { staff_id, status } = body;
        if (!["active", "inactive"].includes(status)) throw new Error("Invalid status");
        const { data: staff } = await supabase
          .from("staff_members").select("*").eq("staff_id", staff_id).maybeSingle();
        if (!staff) throw new Error("Staff member not found");

        await supabase.from("staff_members").update({ status }).eq("staff_id", staff_id);

        // If deactivating, revoke staff role; if reactivating, restore it
        if (staff.user_id) {
          if (status === "inactive") {
            await supabase.from("user_roles").delete()
              .eq("user_id", staff.user_id).eq("role", "staff");
          } else {
            const { data: existing } = await supabase
              .from("user_roles").select("id")
              .eq("user_id", staff.user_id).eq("role", "staff").maybeSingle();
            if (!existing) {
              await supabase.from("user_roles").insert({ user_id: staff.user_id, role: "staff" });
            }
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list_staff": {
        const { data } = await supabase
          .from("staff_members").select("*").order("created_at", { ascending: false });
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create_admin": {
        const { email: adminEmail } = body;
        if (!adminEmail) throw new Error("Email is required");

        // Find user by email in profiles
        const { data: profile } = await supabase
          .from("profiles").select("user_id, email").eq("email", adminEmail).maybeSingle();
        if (!profile) throw new Error("User not found. They must register first.");

        // Check if already admin
        const { data: existing } = await supabase
          .from("user_roles").select("*")
          .eq("user_id", profile.user_id).eq("role", "admin").maybeSingle();
        if (existing) throw new Error("User is already an admin");

        await supabase.from("user_roles").insert({ user_id: profile.user_id, role: "admin" });

        return new Response(JSON.stringify({ success: true, email: adminEmail }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "remove_admin": {
        const { user_id: targetUserId } = body;
        // Check if main admin
        const { data: targetProfile } = await supabase
          .from("profiles").select("email").eq("user_id", targetUserId).maybeSingle();
        if (targetProfile?.email === "darrylshub@gmail.com") {
          throw new Error("Cannot remove the main administrator");
        }

        await supabase.from("user_roles").delete()
          .eq("user_id", targetUserId).eq("role", "admin");

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list_admins": {
        const { data: adminRoles } = await supabase
          .from("user_roles").select("user_id").eq("role", "admin");
        if (!adminRoles?.length) {
          return new Response(JSON.stringify([]), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const userIds = adminRoles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles").select("user_id, email, display_name").in("user_id", userIds);

        const result = (profiles || []).map(p => ({
          user_id: p.user_id,
          email: p.email,
          display_name: p.display_name,
          is_main: p.email === "darrylshub@gmail.com",
        }));

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
