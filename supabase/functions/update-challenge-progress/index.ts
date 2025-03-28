
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Set up CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase URL or service role key');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request data
    const { user_id, challenge_id, progress_key, progress_value } = await req.json();

    if (!user_id) {
      throw new Error('Missing user_id parameter');
    }

    if (!challenge_id && !progress_key) {
      throw new Error('Missing either challenge_id or progress_key parameter');
    }

    let result;

    // Check if we need to find challenges by a specific progress key
    if (progress_key) {
      // Find all challenge requirements that include this key
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('id, requirements')
        .filter('requirements', 'cs', `{"${progress_key}":`);

      if (challengesError) throw challengesError;

      // For each matching challenge, update user progress
      const updates = [];
      for (const challenge of challenges) {
        // Check if the user has already started this challenge
        const { data: userChallenges, error: userChallengeError } = await supabase
          .from('user_challenges')
          .select('id, status, progress')
          .eq('user_id', user_id)
          .eq('challenge_id', challenge.id)
          .in('status', ['not_started', 'in_progress']);

        if (userChallengeError) throw userChallengeError;

        if (userChallenges && userChallenges.length > 0) {
          const userChallenge = userChallenges[0];
          
          // Update the progress
          const updatedProgress = {
            ...userChallenge.progress,
            [progress_key]: progress_value
          };

          // Check if all requirements are met
          let status = 'in_progress';
          const requirements = challenge.requirements || {};
          const requirementsMet = Object.keys(requirements).every(key => 
            key in updatedProgress && updatedProgress[key] >= requirements[key]
          );

          if (requirementsMet) {
            status = 'completed';
          }

          // Update the user challenge
          const update = supabase
            .from('user_challenges')
            .update({
              progress: updatedProgress,
              status,
              completed_at: status === 'completed' ? new Date().toISOString() : null,
              xp_earned: status === 'completed' ? challenge.xp_reward : 0
            })
            .eq('id', userChallenge.id);

          updates.push(update);

          // If challenge is completed, award XP
          if (status === 'completed') {
            const awardXp = supabase.rpc('award_xp', {
              p_user_id: user_id,
              p_amount: challenge.xp_reward,
              p_type: 'challenge_completed',
              p_reference_id: challenge.id
            });
            
            updates.push(awardXp);
          }
        }
      }

      // Execute all updates
      if (updates.length > 0) {
        await Promise.all(updates);
      }

      result = { success: true, message: `Updated progress for ${updates.length} challenges` };
    } else {
      // We're updating a specific challenge
      // Check if the user has already started this challenge
      const { data: userChallenges, error: userChallengeError } = await supabase
        .from('user_challenges')
        .select('id, status, progress, challenge:challenges(requirements, xp_reward)')
        .eq('user_id', user_id)
        .eq('challenge_id', challenge_id)
        .in('status', ['not_started', 'in_progress'])
        .single();

      if (userChallengeError) {
        // If the user hasn't started this challenge, create a new entry
        if (userChallengeError.code === 'PGRST116') {
          const { data: challenge, error: challengeError } = await supabase
            .from('challenges')
            .select('requirements, xp_reward')
            .eq('id', challenge_id)
            .single();

          if (challengeError) throw challengeError;

          // Initialize a new user challenge
          const { data: newUserChallenge, error: createError } = await supabase
            .from('user_challenges')
            .insert({
              user_id,
              challenge_id,
              status: 'in_progress',
              progress: {}
            })
            .select('id')
            .single();

          if (createError) throw createError;

          result = { success: true, message: 'Challenge started', challenge_id };
        } else {
          throw userChallengeError;
        }
      } else {
        // Update the existing user challenge
        const userChallenge = userChallenges;
        
        result = { success: true, message: 'Challenge progress updated', challenge_id };
      }
    }

    // Return success response
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
