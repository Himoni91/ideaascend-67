
import { useState, useEffect } from "react";
import { useLinkPreview } from "./use-link-preview";

export interface EnhancedLinkPreview {
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
  domain: string;
  mediaType: "link" | "image" | "video" | "audio";
}

export function useEnhancedLinkPreview(content: string) {
  const [linkPreview, setLinkPreview] = useState<EnhancedLinkPreview | null>(null);
  const { preview } = useLinkPreview(content);

  useEffect(() => {
    if (!preview) {
      setLinkPreview(null);
      return;
    }

    // Extract domain from URL
    let domain = "";
    try {
      const url = new URL(preview.url);
      domain = url.hostname.replace("www.", "");
    } catch (e) {
      console.error("Invalid URL:", preview.url);
    }

    // Determine media type based on URL pattern or content
    let mediaType: "link" | "image" | "video" | "audio" = "link";
    if (preview.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      mediaType = "image";
    } else if (preview.url.match(/\.(mp4|webm|mov|avi|wmv)$/i) || 
        preview.url.includes("youtube.com/watch") || 
        preview.url.includes("youtu.be/") ||
        preview.url.includes("vimeo.com")) {
      mediaType = "video";
    } else if (preview.url.match(/\.(mp3|wav|ogg|flac)$/i) || 
        preview.url.includes("spotify.com") ||
        preview.url.includes("soundcloud.com")) {
      mediaType = "audio";
    }

    // Create enhanced preview
    const enhanced: EnhancedLinkPreview = {
      url: preview.url,
      title: preview.title || domain,
      description: preview.description || "",
      image: preview.image,
      favicon: null, // We could add favicon fetching here in the future
      siteName: preview.domain || null,
      domain,
      mediaType
    };

    setLinkPreview(enhanced);
  }, [preview]);

  return { linkPreview };
}
