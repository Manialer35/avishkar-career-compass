import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Email-based admin allowlist (Google sign-in users)
const ADMIN_EMAILS = ["neerajmadkar35@gmail.com", "khot.md@gmail.com"];

// Phone-based admin allowlist (legacy)
const ADMIN_PHONES = ["+918888769281", "+918484843232"];

type VerifyAdminBody = {
  firebaseUserId?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as VerifyAdminBody;
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

    console.log("[verify-admin] payload:", {
      hasFirebaseUserId: Boolean(firebaseUserId),
      email: normalizedEmail || null,
      phoneNumber: phoneNumber || null,
    });

    // We never grant admin based on email alone unless we can tie it to a user id.
    if (!firebaseUserId) {
      return new Response(JSON.stringify({ isAdmin: false, reason: "missing_user_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Service role client (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );

    // 1) Prefer checking user_roles for this firebase user id
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", firebaseUserId)
      .maybeSingle();

    if (error) {
      console.error("[verify-admin] Error reading user_roles:", error);
      // Do not 400 here; returning false avoids locking everyone out due to transient issues.
      return new Response(JSON.stringify({ isAdmin: false, reason: "roles_read_error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2) If missing role row, auto-grant admin when email is allowlisted
    if (!data && normalizedEmail && ADMIN_EMAILS.includes(normalizedEmail)) {
      const { error: upsertError } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          {
            user_id: firebaseUserId,
            role: "admin",
            phone_number: phoneNumber || null,
          },
          { onConflict: "user_id" },
        );

      if (upsertError) {
        console.error("[verify-admin] Error upserting admin role:", upsertError);
        return new Response(JSON.stringify({ isAdmin: false, reason: "roles_upsert_error" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      console.log("[verify-admin] auto-granted admin via allowlisted email", normalizedEmail);

      return new Response(JSON.stringify({ isAdmin: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 3) Fallback: legacy phone allowlist (only when we have phone)
    if (!data && phoneNumber && ADMIN_PHONES.includes(phoneNumber)) {
      return new Response(JSON.stringify({ isAdmin: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const isAdmin = data?.role === "admin";
    console.log("[verify-admin] resolved", { firebaseUserId, isAdmin });

    return new Response(JSON.stringify({ isAdmin }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[verify-admin] Unhandled error:", error);
    return new Response(JSON.stringify({ isAdmin: false, reason: "unhandled_error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
