
import { X, FileVideo, FileImage, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface MediaPreviewProps {
  file: File;
  preview: string;
  onRemove: () => void;
}

export default function MediaPreview({ file, preview, onRemove }: MediaPreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  return (
    <motion.div 
      className="relative mt-3 rounded-md overflow-hidden border group"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isImage ? (
        <img 
          src={preview} 
          alt="Media preview" 
          className="max-h-[200px] w-full object-contain bg-muted/30"
        />
      ) : isVideo ? (
        <video 
          src={preview} 
          controls 
          className="max-h-[200px] w-full object-contain bg-muted/30"
        />
      ) : (
        <div className="h-[100px] flex flex-col items-center justify-center bg-muted/30 p-4">
          <File className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium truncate max-w-full">{file.name}</p>
          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          variant="destructive"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={onRemove}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="absolute top-2 right-2">
        <Button
          className="rounded-full h-8 w-8 p-0 bg-black/60 hover:bg-black/80 backdrop-blur-sm"
          size="icon"
          variant="ghost"
          onClick={onRemove}
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>
    </motion.div>
  );
}
