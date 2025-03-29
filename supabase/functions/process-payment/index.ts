
// Import from deno.land standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Import Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
// Import shared CORS headers
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { sessionId, paymentMethod, amount, currency = "usd" } = await req.json();

    // Validate required fields
    if (!sessionId || !paymentMethod || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process payment (mock implementation)
    const paymentResult = {
      success: true,
      paymentId: `pay_${Date.now()}`,
      amount,
      currency,
      createdAt: new Date().toISOString(),
    };

    // Update session with payment information
    const { error: updateError } = await supabase
      .from("mentor_sessions")
      .update({ 
        payment_status: "paid",
        payment_id: paymentResult.paymentId,
        payment_amount: amount,
        payment_currency: currency,
        payment_date: paymentResult.createdAt
      })
      .eq("id", sessionId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update session with payment information", details: updateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        paymentId: paymentResult.paymentId,
        sessionId
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
