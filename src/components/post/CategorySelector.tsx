
import { useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (selectedIds: string[]) => void;
  showClearButton?: boolean;
  maxDisplay?: number;
}

export default function CategorySelector({
  selectedCategories,
  onChange,
  showClearButton = true,
  maxDisplay = 3,
}: CategorySelectorProps) {
  const { categories, isLoading } = useCategories();
  const [open, setOpen] = useState(false);

  const handleToggleCategory = (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    onChange(newSelection);
  };

  const handleClearCategories = () => {
    onChange([]);
  };

  // Get names of selected categories for display
  const selectedCategoryNames = selectedCategories
    .map(id => categories.find(cat => cat.id === id)?.name)
    .filter(Boolean);

  // Display badges or summary text
  const displayText = () => {
    if (selectedCategoryNames.length === 0) {
      return "Select categories";
    } else if (selectedCategoryNames.length <= maxDisplay) {
      return selectedCategoryNames.join(", ");
    } else {
      return `${selectedCategoryNames.slice(0, maxDisplay).join(", ")} +${selectedCategoryNames.length - maxDisplay} more`;
    }
  };

  // Display badges for selected categories
  const selectedBadges = () => {
    if (selectedCategoryNames.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedCategories.map(id => {
          const category = categories.find(cat => cat.id === id);
          if (!category) return null;
          
          return (
            <Badge 
              key={category.id} 
              style={{ backgroundColor: category.color || undefined }}
              className="flex items-center gap-1"
            >
              {category.icon && <span>{category.icon}</span>}
              {category.name}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCategory(category.id);
                }}
                className="ml-1 hover:text-destructive"
              >
                <Trash className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
        {showClearButton && selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCategories}
            className="h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between overflow-hidden"
          >
            <div className="truncate text-left">
              {displayText()}
            </div>
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {isLoading ? (
                <div className="p-4 text-center">Loading categories...</div>
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left",
                        selectedCategories.includes(category.id) && "bg-muted"
                      )}
                      onClick={() => handleToggleCategory(category.id)}
                    >
                      <div className="flex items-center w-full">
                        {category.icon && (
                          <span className="mr-2">{category.icon}</span>
                        )}
                        <span className="flex-grow truncate">{category.name}</span>
                        {selectedCategories.includes(category.id) && (
                          <Check className="h-4 w-4 ml-2" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {selectedBadges()}
    </div>
  );
}
