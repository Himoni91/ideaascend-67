
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, paymentDetails } = await req.json();

    // Validate inputs
    if (!sessionId || !paymentDetails) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      return new Response(
        JSON.stringify({ error: 'Session not found', details: sessionError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process payment (This is where you'd integrate with a payment processor)
    // Mocking a successful payment for demo purposes
    const paymentId = `pay_${Math.random().toString(36).substring(2, 15)}`;
    
    // Update session with payment info
    const { data, error } = await supabase
      .from('mentor_sessions')
      .update({
        payment_status: 'completed',
        payment_id: paymentId,
        payment_provider: paymentDetails.provider,
        payment_amount: paymentDetails.amount,
        payment_currency: paymentDetails.currency || 'USD'
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to update session', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification for the mentor
    await supabase
      .from('notifications')
      .insert({
        user_id: session.mentor_id,
        sender_id: session.mentee_id,
        notification_type: 'payment_completed',
        related_id: sessionId,
        related_type: 'mentor_session',
        message: 'Payment completed for your mentorship session'
      });

    return new Response(
      JSON.stringify({ success: true, payment_id: paymentId, session: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
