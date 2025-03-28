
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
    const { provider, amount, currency = 'INR', description, metadata } = await req.json();
    
    // Validate inputs
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!provider || !['razorpay', 'paypal', 'free'].includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle authentication
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
    
    // For free sessions, just return a success
    if (provider === 'free' || amount === 0) {
      return new Response(
        JSON.stringify({ 
          payment_id: `free_${Date.now()}_${user.id.substring(0, 8)}`,
          provider: 'free',
          status: 'success'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle Razorpay integration
    if (provider === 'razorpay') {
      const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
      const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
      
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.error('Razorpay credentials not configured');
        return new Response(
          JSON.stringify({ error: 'Payment service misconfigured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Create Razorpay order
      const razorpayUrl = 'https://api.razorpay.com/v1/orders';
      const authHeader = `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`;
      
      const response = await fetch(razorpayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay uses smallest currency unit (paise for INR)
          currency,
          receipt: `receipt_${Date.now()}_${user.id.substring(0, 6)}`,
          notes: {
            description,
            user_id: user.id,
            ...metadata
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Razorpay error:', result);
        return new Response(
          JSON.stringify({ error: result.error?.description || 'Failed to create order' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return the order ID to the client
      return new Response(
        JSON.stringify({ order_id: result.id, provider: 'razorpay' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle PayPal integration
    if (provider === 'paypal') {
      const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
      const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET');
      
      if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
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
          'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)}`
        },
        body: 'grant_type=client_credentials'
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('PayPal token error:', tokenData);
        return new Response(
          JSON.stringify({ error: 'Failed to authenticate with PayPal' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toString()
              },
              description
            }
          ],
          application_context: {
            brand_name: 'Idolyst',
            return_url: 'https://idolyst.com/payment-success',
            cancel_url: 'https://idolyst.com/payment-cancel'
          }
        })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        console.error('PayPal order error:', orderData);
        return new Response(
          JSON.stringify({ error: 'Failed to create PayPal order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return the order ID and approval URL to the client
      const approvalLink = orderData.links.find((link: any) => link.rel === 'approve');
      
      return new Response(
        JSON.stringify({ 
          order_id: orderData.id,
          provider: 'paypal',
          approval_url: approvalLink.href
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Should not reach here
    return new Response(
      JSON.stringify({ error: 'Unsupported payment provider' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
