
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalyticsEvent {
  userId: string;
  eventType: string;
  eventSource?: string;
  metadata?: any;
}

interface AnalyticsMetricUpdate {
  userId: string;
  metric: string;
  amount: number;
}

// Create a Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or key')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// Main handler for the edge function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const supabase = createSupabaseClient()
    
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse the request body
    const body = await req.json()
    const { action } = body
    
    // Handle different analytics actions
    switch (action) {
      case 'recordEvent': {
        const { userId, eventType, eventSource, metadata } = body as AnalyticsEvent
        
        if (!userId || !eventType) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Insert event into analytics_events table
        const { data, error } = await supabase
          .from('analytics_events')
          .insert({
            user_id: userId,
            event_type: eventType,
            event_source: eventSource,
            metadata: metadata || {}
          })
        
        if (error) throw error
        
        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'updateMetric': {
        const { userId, metric, amount } = body as AnalyticsMetricUpdate
        
        if (!userId || !metric) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // First, get the current analytics record
        const { data: existingData, error: fetchError } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (fetchError) {
          // If no record exists, create one
          if (fetchError.code === 'PGRST116') {
            const newRecord = {
              user_id: userId,
              [metric]: amount
            }
            
            const { data: insertData, error: insertError } = await supabase
              .from('user_analytics')
              .insert(newRecord)
              .select()
            
            if (insertError) throw insertError
            
            return new Response(
              JSON.stringify({ success: true, data: insertData }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          throw fetchError
        }
        
        // Update the metric
        const updates = {
          [metric]: (existingData[metric] || 0) + amount
        }
        
        // If updating page_views, recalculate engagement rate
        if (metric === 'page_views') {
          const totalInteractions = (existingData.total_comments || 0) + (existingData.total_posts || 0)
          updates.engagement_rate = (totalInteractions / Math.max((existingData.page_views || 0) + amount, 1)) * 100
        }
        
        const { data: updateData, error: updateError } = await supabase
          .from('user_analytics')
          .update(updates)
          .eq('user_id', userId)
          .select()
        
        if (updateError) throw updateError
        
        return new Response(
          JSON.stringify({ success: true, data: updateData }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'generateSnapshot': {
        // Call the database function to generate snapshots
        const { data, error } = await supabase.rpc('generate_analytics_snapshot')
        
        if (error) throw error
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Analytics tracker error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
