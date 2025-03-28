
// Import Supabase client from ESM directly with the correct version
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from '../_shared/cors.ts';

export async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { sessionId, mentorId, menteeId, sessionData } = await req.json();

    // Get Supabase URL and key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Since we don't have actual Stripe integration yet, we'll simulate a successful payment
    const mockSession = {
      payment_status: 'paid',
      id: sessionId || `mock_${Date.now()}`,
      amount_total: sessionData.price ? sessionData.price * 100 : 0
    };

    if (mockSession.payment_status === 'paid') {
      // Update the database to mark session as paid
      const { data, error } = await supabase
        .from('mentor_sessions')
        .update({
          payment_status: 'completed',
          payment_id: mockSession.id,
          payment_amount: mockSession.amount_total ? mockSession.amount_total / 100 : 0,
          payment_provider: 'mock'
        })
        .eq('id', sessionData.session_id)
        .select();

      if (error) {
        console.error('Database update error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update payment status' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Create notification for the mentor
      await supabase
        .from('notifications')
        .insert({
          user_id: mentorId,
          sender_id: menteeId,
          notification_type: 'payment_received',
          related_id: sessionData.session_id,
          related_type: 'mentor_session',
          message: 'Payment has been received for your session'
        });

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}

// This line is needed for Deno to handle requests
Deno.serve(handler);
