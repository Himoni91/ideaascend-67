
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
    const { order_id } = await req.json();
    
    // Validate inputs
    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
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
    
    // Capture the PayPal order
    const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    const captureData = await captureResponse.json();
    
    if (!captureResponse.ok) {
      console.error('PayPal capture error:', captureData);
      return new Response(
        JSON.stringify({ error: captureData.message || 'Failed to capture payment' }),
        { status: captureResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the capture ID to the client
    return new Response(
      JSON.stringify({ 
        capture_id: captureData.purchase_units[0]?.payments?.captures[0]?.id || captureData.id,
        status: captureData.status,
        order_id: captureData.id
      }),
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
