
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

serve(async (req) => {
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
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
      });

      if (error) {
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Storage setup completed successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
