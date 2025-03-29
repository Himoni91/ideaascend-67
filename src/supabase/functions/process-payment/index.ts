import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Get Stripe API key from environment variables
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

// Import Stripe
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2023-08-16",
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    // Parse request body
    const { 
      amount, 
      currency = "usd", 
      description, 
      customer_email,
      session_id,
      mentor_id,
      mentee_id,
      payment_method_id,
      return_url
    } = await req.json();

    // Validate required fields
    if (!amount || !session_id || !mentor_id || !mentee_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    let paymentIntent;

    if (payment_method_id) {
      // Create a payment intent with the payment method
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description,
        payment_method: payment_method_id,
        confirm: true,
        return_url: return_url || "https://yourdomain.com/payment-success",
        metadata: {
          session_id,
          mentor_id,
          mentee_id,
        },
      });
    } else {
      // Create a payment intent without a payment method
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description,
        metadata: {
          session_id,
          mentor_id,
          mentee_id,
        },
      });
    }

    // Update the session with payment information
    const { error: updateError } = await supabase
      .from("mentor_sessions")
      .update({
        payment_id: paymentIntent.id,
        payment_status: paymentIntent.status,
        payment_amount: amount,
        payment_currency: currency,
        payment_provider: "stripe",
      })
      .eq("id", session_id);

    if (updateError) {
      console.error("Error updating session:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update session" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Return the payment intent
    return new Response(
      JSON.stringify({
        success: true,
        payment_intent: paymentIntent,
        client_secret: paymentIntent.client_secret,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Payment processing failed" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
