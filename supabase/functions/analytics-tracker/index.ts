
// Follow this setup guide to integrate the Deno runtime into your application:
// https://docs.deno.com/runtime/manual/

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { event_type, event_source, metadata, user_id } = await req.json();

    // Validate required fields
    if (!event_type) {
      return new Response(
        JSON.stringify({ error: 'event_type is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Get Supabase URL and key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract user ID from auth header if not provided in request
    let effectiveUserId = user_id;
    if (!effectiveUserId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError) {
          console.error('Error getting user from token:', userError);
        } else if (user) {
          effectiveUserId = user.id;
        }
      }
    }

    // Record the analytics event
    if (effectiveUserId) {
      const { error: eventError } = await supabase
        .from('analytics_events')
        .insert({
          user_id: effectiveUserId,
          event_type,
          event_source,
          metadata: metadata || {}
        });

      if (eventError) {
        console.error('Error recording analytics event:', eventError);
        return new Response(
          JSON.stringify({ error: 'Failed to record analytics event' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Update appropriate user metrics based on event type
      if (['page_view', 'profile_view', 'pitch_view'].includes(event_type)) {
        let updateFields = {};
        
        switch (event_type) {
          case 'page_view':
            updateFields = { page_views: supabase.rpc('increment') };
            break;
          case 'profile_view':
            updateFields = { profile_views: supabase.rpc('increment') };
            break;
          case 'pitch_view':
            updateFields = { pitch_views: supabase.rpc('increment') };
            break;
        }

        // Update user_analytics table
        const { error: updateError } = await supabase
          .from('user_analytics')
          .upsert(
            { 
              user_id: effectiveUserId,
              ...updateFields
            },
            { 
              onConflict: 'user_id'
            }
          );

        if (updateError) {
          console.error('Error updating user analytics:', updateError);
        }
      }

      // Update realtime analytics
      const { error: realtimeError } = await supabase
        .from('realtime_analytics')
        .upsert(
          {
            id: '00000000-0000-0000-0000-000000000000', // Use a fixed ID for the singleton record
            active_users: supabase.rpc('increment', { value: 0 }), // This will be updated by trigger
            page_views_last_hour: supabase.rpc('increment'),
            most_active_page: event_source || 'unknown',
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'id'
          }
        );

      if (realtimeError) {
        console.error('Error updating realtime analytics:', realtimeError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
