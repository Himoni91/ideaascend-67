import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DiscoverFilter as FilterType, DiscoverCategory } from "@/hooks/use-discover";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DiscoverFilterProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  categories: DiscoverCategory[];
  contentType?: string;
  onContentTypeChange?: (type: string) => void;
}

export function DiscoverFilter({ 
  filters, 
  onFiltersChange, 
  categories,
  contentType,
  onContentTypeChange
}: DiscoverFilterProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.category ? [filters.category] : []
  );
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "popular">(filters.sortBy || "latest");
  const [isFeatured, setIsFeatured] = useState(filters.featured || false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  useEffect(() => {
    const timerId = setTimeout(() => {
      onFiltersChange({
        ...filters,
        searchTerm
      });
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [searchTerm, filters, onFiltersChange]);
  
  const applyFilters = () => {
    onFiltersChange({
      ...filters,
      category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy,
      featured: isFeatured
    });
    setIsFilterOpen(false);
  };
  
  const resetFilters = () => {
    setSelectedTags([]);
    setSelectedCategories([]);
    setSearchTerm("");
    setSortBy("latest");
    setIsFeatured(false);
    
    onFiltersChange({
      contentType: filters.contentType,
      searchTerm: "",
      tags: undefined,
      category: undefined,
      sortBy: "latest",
      featured: false
    });
    
    setIsFilterOpen(false);
  };
  
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([category]);
    }
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const handleContentTypeChange = (type: string) => {
    if (onContentTypeChange) {
      onContentTypeChange(type);
    }
  };
  
  const allTags = Array.from(
    new Set(
      categories.flatMap(category => 
        category.description?.split(',').map(t => t.trim()) || []
      )
    )
  ).filter(tag => tag.length > 0);
  
  const hasActiveFilters = 
    selectedTags.length > 0 || 
    selectedCategories.length > 0 || 
    isFeatured || 
    sortBy !== "latest";
  
  const handleSortByChange = (value: string) => {
    if (value === "latest" || value === "trending" || value === "popular") {
      setSortBy(value);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for people, ideas, content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1.5 h-7 w-7 rounded-full"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {selectedCategories.length + selectedTags.length + (isFeatured ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filter Results</SheetTitle>
                <SheetDescription>
                  Customize your search results with the following filters
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Sort By</h4>
                  <Select value={sortBy} onValueChange={handleSortByChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="popular">Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Categories</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() => toggleCategory(category.name)}
                        />
                        <Label 
                          htmlFor={`category-${category.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {allTags.length > 0 && (
                  <>
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                          <Badge 
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="featured-only"
                    checked={isFeatured}
                    onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                  />
                  <Label 
                    htmlFor="featured-only"
                    className="text-sm cursor-pointer"
                  >
                    Featured content only
                  </Label>
                </div>
              </div>
              
              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex items-center"
          >
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-3">Filter by:</span>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 3).map(category => (
                <Badge
                  key={category.id}
                  variant={filters.category === category.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    onFiltersChange({
                      ...filters,
                      category: filters.category === category.name ? undefined : category.name
                    });
                  }}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {hasActiveFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 flex-wrap"
        >
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCategories.map(category => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {category}
              <X 
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSelectedCategories(selectedCategories.filter(c => c !== category));
                  applyFilters();
                }}
              />
            </Badge>
          ))}
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSelectedTags(selectedTags.filter(t => t !== tag));
                  applyFilters();
                }}
              />
            </Badge>
          ))}
          {isFeatured && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Featured
              <X 
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setIsFeatured(false);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          {sortBy !== "latest" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {sortBy}
              <X 
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSortBy("latest");
                  applyFilters();
                }}
              />
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={resetFilters}
          >
            Clear All
          </Button>
        </motion.div>
      )}
    </div>
  );
}
