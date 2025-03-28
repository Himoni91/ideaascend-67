
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { method, paymentProvider, amount, currency, description, metadata } = await req.json();

    // Log the payment request
    console.log(`Processing ${paymentProvider} payment:`, { amount, currency, description });

    // Mock successful payment processing
    const paymentId = `${paymentProvider}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Return the payment result
    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        amount,
        currency,
        provider: paymentProvider
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
