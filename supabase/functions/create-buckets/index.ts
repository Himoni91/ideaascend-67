
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

    // Check if profile_images bucket exists
    const { data: buckets } = await supabaseClient.storage.listBuckets();
    const profileImagesBucket = buckets?.find(bucket => bucket.name === 'profile_images');

    if (!profileImagesBucket) {
      // Create profile_images bucket if it doesn't exist
      const { error } = await supabaseClient.storage.createBucket('profile_images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
      });

      if (error) {
        throw error;
      }

      // Set policy for the bucket
      await supabaseClient.storage.from('profile_images').createPolicy('public-read', {
        name: 'public-read',
        definition: {
          type: 'READ',
          permissions: ['SELECT'],
          resources: ['objects'],
          predicates: [],
          roles: ['anon', 'authenticated']
        }
      });

      await supabaseClient.storage.from('profile_images').createPolicy('authenticated-write', {
        name: 'authenticated-write',
        definition: {
          type: 'WRITE',
          permissions: ['INSERT', 'UPDATE', 'DELETE'],
          resources: ['objects'],
          predicates: [],
          roles: ['authenticated']
        }
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Storage buckets setup completed successfully' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error setting up buckets:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
