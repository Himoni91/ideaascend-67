
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create posts bucket for media uploads if it doesn't exist
    const { data: buckets } = await supabaseClient.storage.listBuckets();
    const postsBucket = buckets?.find(bucket => bucket.name === 'posts');

    if (!postsBucket) {
      const { error } = await supabaseClient.storage.createBucket('posts', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4']
      });

      if (error) {
        throw error;
      }
    }
    
    // Create profiles bucket if it doesn't exist
    const profilesBucket = buckets?.find(bucket => bucket.name === 'profiles');

    if (!profilesBucket) {
      const { error } = await supabaseClient.storage.createBucket('profiles', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
      });

      if (error) {
        throw error;
      }
    }

    // Create post_views table if it doesn't exist
    const { error: tableError } = await supabaseClient.rpc('create_post_views_table_if_not_exists');
    
    if (tableError) {
      console.error("Error creating post_views table:", tableError);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Storage setup completed successfully' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
