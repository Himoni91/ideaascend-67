
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface LinkPreviewResponse {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

serve(async (req) => {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add a timeout for the fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IdolystBot/1.0; +https://idolyst.com)',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        return new Response(
          JSON.stringify({ url, domain: new URL(url).hostname }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const html = await response.text();
      
      // Simple HTML parsing
      const getMetaContent = (name: string) => {
        const match = html.match(new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
                     html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i'));
        return match ? match[1] : '';
      };

      const getTitle = () => {
        const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
        return titleMatch ? titleMatch[1] : '';
      };

      const preview: LinkPreviewResponse = {
        url,
        title: getMetaContent('og:title') || getMetaContent('twitter:title') || getTitle(),
        description: getMetaContent('og:description') || getMetaContent('description') || getMetaContent('twitter:description'),
        image: getMetaContent('og:image') || getMetaContent('twitter:image'),
        domain: new URL(url).hostname,
      };

      return new Response(
        JSON.stringify(preview),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
