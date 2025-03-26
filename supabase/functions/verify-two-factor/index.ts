
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

// Create a Supabase client with the Admin key
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    // Get request body
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return new Response(
        JSON.stringify({ error: "User ID and verification code are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get the user verification record
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from("user_verification")
      .select("*")
      .eq("id", userId)
      .single();

    if (verificationError) {
      console.error("Error fetching verification data:", verificationError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch verification data" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // In a real implementation, you would verify the code using a proper TOTP library
    // For demo purposes, we'll just check if it's a 6-digit number
    if (code.length === 6 && /^\d+$/.test(code)) {
      // Update verification timestamp
      await supabaseAdmin
        .from("user_verification")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", userId);

      return new Response(
        JSON.stringify({ success: true, message: "Verification successful" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid verification code" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
