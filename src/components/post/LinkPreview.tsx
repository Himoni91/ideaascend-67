
import { LinkPreview as LinkPreviewType } from "@/types/post";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LinkPreviewProps {
  preview: LinkPreviewType;
  className?: string;
}

export default function LinkPreview({ preview, className }: LinkPreviewProps) {
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
        <div className="flex flex-col sm:flex-row">
          {preview.image ? (
            <div className="w-full sm:w-1/3 h-32 sm:h-auto overflow-hidden bg-muted">
              <img 
                src={preview.image} 
                alt={preview.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
                }}
              />
            </div>
          ) : (
            <div className="w-full sm:w-1/3 h-32 sm:h-auto flex items-center justify-center bg-muted">
              <ImageIcon className="h-10 w-10 text-muted-foreground opacity-40" />
            </div>
          )}
          
          <CardContent className="p-3 sm:p-4 flex-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {preview.domain}
                </div>
                <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-1">
                  {preview.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {preview.description}
                </p>
              </div>
              
              <div className="flex items-center text-xs text-primary mt-2">
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit link
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
