
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { user_id, challenge_id, progress } = await req.json();

    if (!user_id || !challenge_id || !progress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client with Admin key for server-side operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current challenge data
    const { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('requirements, xp_reward')
      .eq('id', challenge_id)
      .single();

    if (challengeError) {
      console.error('Error fetching challenge:', challengeError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch challenge data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get current user challenge data
    const { data: userChallengeData, error: userChallengeError } = await supabase
      .from('user_challenges')
      .select('id, progress, status')
      .eq('user_id', user_id)
      .eq('challenge_id', challenge_id)
      .single();

    // If no user challenge record exists yet, create one
    if (userChallengeError && userChallengeError.code === 'PGRST116') {
      const { data: newChallenge, error: createError } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user_id,
          challenge_id: challenge_id,
          status: 'in_progress',
          progress: progress
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user challenge:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user challenge' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: newChallenge,
          message: 'Challenge started and progress updated' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (userChallengeError) {
      console.error('Error fetching user challenge:', userChallengeError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user challenge data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update the user challenge with new progress
    const updatedProgress = { ...userChallengeData.progress, ...progress };
    
    // Check if all requirements are met
    let status = userChallengeData.status;
    let completed = false;
    const requirements = challengeData.requirements || {};
    
    const requirementsMet = Object.keys(requirements).every(key => 
      key in updatedProgress && updatedProgress[key] >= requirements[key]
    );

    // If all requirements are met and challenge is not already completed, mark as completed
    if (requirementsMet && status !== 'completed') {
      status = 'completed';
      completed = true;
    }

    // Update the user challenge
    const { data: updatedChallenge, error: updateError } = await supabase
      .from('user_challenges')
      .update({
        progress: updatedProgress,
        status: status,
        completed_at: completed ? new Date().toISOString() : null,
        xp_earned: completed ? challengeData.xp_reward : 0
      })
      .eq('id', userChallengeData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user challenge:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user challenge' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // If challenge was completed, award XP
    if (completed) {
      const { error: awardXpError } = await supabase.rpc('award_xp', {
        p_user_id: user_id,
        p_amount: challengeData.xp_reward,
        p_type: 'challenge_completed',
        p_reference_id: challenge_id
      });

      if (awardXpError) {
        console.error('Error awarding XP:', awardXpError);
        // Continue despite XP award error - we'll still return success for the progress update
      }

      // Create notification for completed challenge
      await supabase
        .from('notifications')
        .insert({
          user_id: user_id,
          notification_type: 'challenge_completed',
          related_id: challenge_id,
          related_type: 'challenge',
          message: `You completed a challenge and earned ${challengeData.xp_reward} XP!`
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedChallenge,
        completed: completed,
        message: completed ? 'Challenge completed!' : 'Progress updated'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing challenge progress:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
