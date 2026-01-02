import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Keep consistent with verify-admin
const ADMIN_EMAILS = ["neerajmadkar35@gmail.com", "khot.md@gmail.com"];
const ADMIN_PHONES = ["+918888769281", "+918484843232"];

type MaterialPayload = {
  title?: string;
  name?: string;
  description?: string | null;
  downloadurl?: string | null;
  thumbnailurl?: string | null;
  ispremium?: boolean | null;
  price?: number;
  folder_id?: string | null;
  is_upcoming?: boolean;
};

type AdminStudyMaterialsBody = {
  action?: "create" | "update" | "delete";
  firebaseUserId?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  id?: string | null;
  material?: MaterialPayload | null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as AdminStudyMaterialsBody;

    const action = body.action;
    const firebaseUserId =
      typeof body.firebaseUserId === "string" && body.firebaseUserId.trim()
        ? body.firebaseUserId.trim()
        : "";

    const normalizedEmail =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const phoneNumber =
      typeof body.phoneNumber === "string" && body.phoneNumber.trim()
        ? body.phoneNumber.trim()
        : "";

    const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : "";
    const material = (body.material ?? null) as MaterialPayload | null;

    if (!action) {
      return new Response(JSON.stringify({ ok: false, error: "missing_action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!firebaseUserId) {
      return new Response(JSON.stringify({ ok: false, error: "missing_user_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );

    // Check admin role
    const { data: roleRow, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", firebaseUserId)
      .maybeSingle();

    if (roleError) {
      console.error("[admin-study-materials] user_roles read error:", roleError);
      return new Response(JSON.stringify({ ok: false, error: "roles_read_error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let isAdmin = roleRow?.role === "admin";

    // Match verify-admin behavior: allowlisted email can auto-grant admin
    if (!isAdmin && normalizedEmail && ADMIN_EMAILS.includes(normalizedEmail)) {
      const { error: upsertError } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: firebaseUserId, role: "admin", phone_number: phoneNumber || null },
          { onConflict: "user_id" },
        );

      if (upsertError) {
        console.error("[admin-study-materials] role upsert error:", upsertError);
        return new Response(JSON.stringify({ ok: false, error: "roles_upsert_error" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      isAdmin = true;
    }

    // Legacy fallback
    if (!isAdmin && phoneNumber && ADMIN_PHONES.includes(phoneNumber)) {
      isAdmin = true;
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ ok: false, error: "not_admin" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("[admin-study-materials] action:", action, "id:", id || null);

    if (action === "delete") {
      if (!id) {
        return new Response(JSON.stringify({ ok: false, error: "missing_id" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const { data: deleted, error } = await supabaseAdmin
        .from("study_materials")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("[admin-study-materials] delete error:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ ok: true, deleted: deleted ?? { id } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!material) {
      return new Response(JSON.stringify({ ok: false, error: "missing_material" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "create") {
      const { data: created, error } = await supabaseAdmin
        .from("study_materials")
        .insert(material)
        .select("*")
        .single();

      if (error) {
        console.error("[admin-study-materials] create error:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ ok: true, material: created }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "update") {
      if (!id) {
        return new Response(JSON.stringify({ ok: false, error: "missing_id" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const { data: updated, error } = await supabaseAdmin
        .from("study_materials")
        .update(material)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("[admin-study-materials] update error:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ ok: true, material: updated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "unsupported_action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[admin-study-materials] Unhandled error:", error);
    return new Response(JSON.stringify({ ok: false, error: "unhandled_error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
