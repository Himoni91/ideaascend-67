
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.7";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

interface PaymentRequest {
  amount: number;
  currency: string;
  payment_method: string;
  description: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Parse the request body
    const requestData: PaymentRequest = await req.json();
    const { amount, currency, payment_method, description, metadata } = requestData;

    console.log('Processing payment:', { amount, currency, payment_method, description });

    // Validate required fields
    if (!amount || !currency || !payment_method || !description) {
      throw new Error('Missing required payment information');
    }

    // Generate a mock payment ID and timestamp
    const timestamp = new Date().toISOString();
    const mockPaymentId = `pay_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

    // Create a mock payment response
    const paymentResponse = {
      id: mockPaymentId,
      amount,
      currency,
      payment_method,
      description,
      status: 'succeeded',
      created_at: timestamp,
      metadata
    };

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: paymentResponse
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment processing error:', error.message);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
