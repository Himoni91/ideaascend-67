
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { 
      provider, 
      amount, 
      currency = 'USD', 
      description, 
      metadata 
    } = requestData;

    // Create supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process payment based on provider
    let paymentResponse;
    
    // For mock implementation
    if (provider === 'razorpay') {
      console.log(`[Razorpay] Processing payment: ${amount} ${currency}`);
      paymentResponse = {
        id: `rzp_${crypto.randomUUID().replace(/-/g, '')}`,
        amount,
        currency,
        status: 'success'
      };
    } else if (provider === 'paypal') {
      console.log(`[PayPal] Processing payment: ${amount} ${currency}`);
      paymentResponse = {
        id: `pp_${crypto.randomUUID().replace(/-/g, '')}`,
        amount,
        currency,
        status: 'success'
      };
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid payment provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log payment to payment_transactions table
    const { data: transactionData, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        provider,
        amount,
        currency,
        payment_id: paymentResponse.id,
        status: 'completed',
        description,
        metadata
      })
      .select()
      .single();
      
    if (transactionError) {
      console.error('Error logging payment:', transactionError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment: paymentResponse,
        transaction: transactionData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Payment processing failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
