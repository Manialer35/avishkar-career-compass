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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firebaseUserId, email, phoneNumber } = await req.json();

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    // Service role client (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );

    // 1) If we have the Firebase user id, prefer checking roles table
    if (firebaseUserId) {
      const { data, error } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", firebaseUserId)
        .maybeSingle();

      if (error) {
        console.error("[verify-admin] Error reading user_roles:", error);
        throw new Error("Failed to verify admin status");
      }

      // If role row missing but email is allowlisted, auto-grant admin
      if (!data && normalizedEmail && ADMIN_EMAILS.includes(normalizedEmail)) {
        const { error: upsertError } = await supabaseAdmin
          .from("user_roles")
          .upsert(
            {
              user_id: firebaseUserId,
              role: "admin",
              phone_number: phoneNumber ?? null,
            },
            { onConflict: "user_id" },
          );

        if (upsertError) {
          console.error("[verify-admin] Error upserting admin role:", upsertError);
        }

        return new Response(JSON.stringify({ isAdmin: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ isAdmin: data?.role === "admin" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2) Email-only check (fallback)
    if (normalizedEmail) {
      return new Response(
        JSON.stringify({ isAdmin: ADMIN_EMAILS.includes(normalizedEmail) }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // 3) Phone-only check (legacy fallback)
    if (phoneNumber) {
      // Prefer local allowlist to avoid RPC dependence
      const isAdmin = ADMIN_PHONES.includes(phoneNumber);
      return new Response(JSON.stringify({ isAdmin }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ isAdmin: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[verify-admin] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
