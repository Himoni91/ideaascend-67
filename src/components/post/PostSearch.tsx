
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { usePostSearch } from "@/hooks/use-post-search";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedPostCard from "./EnhancedPostCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function PostSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { searchQuery, setSearchQuery, searchResults, isLoading } = usePostSearch();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  const searchContent = (
    <div className="w-full space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
          autoFocus
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-10 w-10"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {searchQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
                {searchResults.map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  // For mobile, use a dialog
  if (isMobile) {
    return (
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Search className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-md">
          {searchContent}
        </DialogContent>
      </Dialog>
    );
  }
  
  // For desktop, show inline
  return (
    <div className="w-full max-w-md">
      {searchContent}
    </div>
  );
}
