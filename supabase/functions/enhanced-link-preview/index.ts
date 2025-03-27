
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extract } from "https://esm.sh/link-preview-js@3.0.5";

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
    const { url } = await req.json();
    
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL parameter is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Processing link preview for: ${url}`);
    
    // Use link-preview-js to extract metadata
    const metadata = await extract(url, {
      timeout: 5000,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    
    // Transform the metadata into a consistent format
    const preview = {
      url: metadata.url || url,
      title: metadata.title || "No title available",
      description: metadata.description || "No description available",
      image: metadata.images && metadata.images.length > 0 ? metadata.images[0] : null,
      domain: new URL(metadata.url || url).hostname.replace("www.", ""),
      favicon: metadata.favicon || null,
      siteName: metadata.siteName || null,
      mediaType: metadata.mediaType || "website"
    };

    console.log(`Successfully extracted preview for: ${url}`);
    
    return new Response(
      JSON.stringify(preview),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing link preview:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
