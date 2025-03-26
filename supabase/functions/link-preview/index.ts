
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

    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IdolystBot/1.0; +https://idolyst.app)"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return new Response(
        JSON.stringify({ 
          url,
          title: url,
          description: "Not an HTML page",
          domain: new URL(url).hostname.replace("www.", ""),
          image: null
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const html = await response.text();
    
    // Extract metadata
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    
    // Extract Open Graph title if available
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : "";
    
    // Extract description
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    let description = descriptionMatch ? descriptionMatch[1].trim() : "";
    
    // Extract Open Graph description if available
    const ogDescriptionMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
    if (ogDescriptionMatch && ogDescriptionMatch[1].trim()) {
      description = ogDescriptionMatch[1].trim();
    }
    
    // Extract Open Graph image if available
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
    let image = ogImageMatch ? ogImageMatch[1].trim() : null;
    
    // If no OG image, try to find the first image
    if (!image) {
      const imageMatch = html.match(/<img[^>]+src=["'](.*?)["'][^>]*>/i);
      image = imageMatch ? imageMatch[1].trim() : null;
      
      // Convert relative URLs to absolute
      if (image && !image.startsWith("http")) {
        const baseUrl = new URL(url);
        image = new URL(image, baseUrl.origin).toString();
      }
    }
    
    return new Response(
      JSON.stringify({
        url,
        title: ogTitle || title || url,
        description: description || "No description available",
        image,
        domain: new URL(url).hostname.replace("www.", "")
      }),
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
