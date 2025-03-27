
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Image as ImageIcon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import type { EnhancedLinkPreview as EnhancedLinkPreviewType } from "@/hooks/use-enhanced-link-preview";

interface LinkPreviewProps {
  preview: EnhancedLinkPreviewType;
  className?: string;
  compact?: boolean;
}

export default function EnhancedLinkPreview({ preview, className, compact = false }: LinkPreviewProps) {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = () => {
    window.open(preview.url, "_blank", "noopener,noreferrer");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn("mt-3 overflow-hidden cursor-pointer hover:shadow-md transition-shadow", className)}
        onClick={handleClick}
      >
        <div className={cn("flex", compact ? "flex-row" : "flex-col sm:flex-row")}>
          {preview.image && !imageError ? (
            <div className={cn(
              "overflow-hidden bg-muted",
              compact ? "w-20 h-20" : "w-full sm:w-1/3 h-32 sm:h-auto"
            )}>
              <img 
                src={preview.image} 
                alt={preview.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={cn(
              "flex items-center justify-center bg-muted",
              compact ? "w-20 h-20" : "w-full sm:w-1/3 h-32 sm:h-auto"
            )}>
              {preview.favicon ? (
                <img 
                  src={preview.favicon} 
                  alt={preview.siteName || preview.domain} 
                  className="h-10 w-10 object-contain"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              ) : (
                <Globe className="h-10 w-10 text-muted-foreground opacity-40" />
              )}
            </div>
          )}
          
          <CardContent className={cn(
            "flex-1",
            compact ? "p-2 sm:p-3" : "p-3 sm:p-4"
          )}>
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center text-xs text-muted-foreground mb-1">
                  {preview.favicon && !compact && (
                    <img 
                      src={preview.favicon} 
                      alt={preview.siteName || preview.domain}
                      className="h-4 w-4 mr-1"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  )}
                  <span>{preview.siteName || preview.domain}</span>
                </div>
                
                <h3 className={cn(
                  "font-medium line-clamp-2 mb-1",
                  compact ? "text-xs" : "text-sm sm:text-base"
                )}>
                  {preview.title}
                </h3>
                
                {!compact && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {preview.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center text-xs text-primary mt-2">
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit {preview.mediaType === "video" ? "video" : "link"}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
