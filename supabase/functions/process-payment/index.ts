
// Import the Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3'
import { stripe } from './stripe.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Define Deno variable for TypeScript
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
    serve(handler: (req: Request) => Promise<Response> | Response): void;
  };
}

// Get Supabase URL and key from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { sessionId, mentorId, menteeId, sessionData } = await req.json()

    // Process payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      // Update the database to mark session as paid
      const { data, error } = await supabase
        .from('mentor_sessions')
        .update({
          payment_status: 'completed',
          payment_id: session.id,
          payment_amount: session.amount_total ? session.amount_total / 100 : 0,
          payment_provider: 'stripe'
        })
        .eq('id', sessionData.session_id)
        .select()

      if (error) {
        console.error('Database update error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update payment status' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
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
        })

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

Deno.serve(handler)
