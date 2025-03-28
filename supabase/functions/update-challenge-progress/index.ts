
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userChallengeId, progressData, userId } = await req.json();

    // Validate request data
    if (!userChallengeId || !progressData || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, get the existing challenge data
    const { data: existingChallenge, error: fetchError } = await supabase
      .from('user_challenges')
      .select('progress, challenge_id, challenge:challenges(requirements, xp_reward)')
      .eq('id', userChallengeId)
      .single();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Merge existing progress with new progress
    const updatedProgress = {
      ...(existingChallenge.progress || {}),
      ...progressData
    };

    // Check if all requirements are met
    let status = 'in_progress';
    const requirements = existingChallenge.challenge?.requirements || {};
    const requirementsMet = Object.keys(requirements).every(key => 
      key in updatedProgress && updatedProgress[key] >= requirements[key]
    );

    if (requirementsMet) {
      status = 'completed';
    }

    // Update the challenge progress
    const { error: updateError } = await supabase
      .from('user_challenges')
      .update({
        progress: updatedProgress,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        xp_earned: status === 'completed' ? existingChallenge.challenge?.xp_reward : 0
      })
      .eq('id', userChallengeId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If challenge is completed, award XP
    if (status === 'completed') {
      const { error: awardXpError } = await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_amount: existingChallenge.challenge?.xp_reward || 0,
        p_type: 'challenge_completed',
        p_reference_id: existingChallenge.challenge_id
      });

      if (awardXpError) {
        console.error('Error awarding XP:', awardXpError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status, 
        completed: status === 'completed',
        xp_awarded: status === 'completed' ? existingChallenge.challenge?.xp_reward : 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
