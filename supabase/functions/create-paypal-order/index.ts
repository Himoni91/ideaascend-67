
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const { amount, currency = 'USD', description, metadata } = await req.json();
    
    // Validate inputs
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const auth = req.headers.get('Authorization');
    if (!auth) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user ID from auth token
    const token = auth.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get PayPal API credentials
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('PayPal credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service misconfigured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get PayPal access token
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('PayPal token error:', tokenData);
      return new Response(
        JSON.stringify({ error: 'Failed to authorize with payment provider' }),
        { status: tokenResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create PayPal order
    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          description: description,
          custom_id: user.id,
          soft_descriptor: 'Idolyst'
        }],
        application_context: {
          brand_name: 'Idolyst',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: 'https://your-app.com/success',
          cancel_url: 'https://your-app.com/cancel'
        }
      })
    });
    
    const orderData = await orderResponse.json();
    
    if (!orderResponse.ok) {
      console.error('PayPal order error:', orderData);
      return new Response(
        JSON.stringify({ error: orderData.message || 'Failed to create order' }),
        { status: orderResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the order ID to the client
    return new Response(
      JSON.stringify({ order_id: orderData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
