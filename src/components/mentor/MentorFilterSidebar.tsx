
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MentorSpecialty } from "@/types/mentor";
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

interface MentorFilterSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialties: MentorSpecialty[];
  selectedSpecialties: string[];
  onSpecialtyChange: (specialty: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  onClearFilters: () => void;
}

export default function MentorFilterSidebar({
  open,
  onOpenChange,
  specialties,
  selectedSpecialties,
  onSpecialtyChange,
  priceRange,
  onPriceRangeChange,
  minRating,
  onMinRatingChange,
  onClearFilters
}: MentorFilterSidebarProps) {
  // Temporary state for filters before applying
  const [tempSpecialties, setTempSpecialties] = useState<string[]>([...selectedSpecialties]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([...priceRange]);
  const [tempMinRating, setTempMinRating] = useState<number>(minRating);

  // Reset temp values when opening sidebar
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempSpecialties([...selectedSpecialties]);
      setTempPriceRange([...priceRange]);
      setTempMinRating(minRating);
    }
    onOpenChange(isOpen);
  };

  // Toggle specialty selection in temp state
  const toggleSpecialty = (specialty: string) => {
    setTempSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  // Apply filters and close sidebar
  const applyFilters = () => {
    // Update parent state with temp values
    selectedSpecialties.length = 0;
    selectedSpecialties.push(...tempSpecialties);
    onSpecialtyChange(tempSpecialties.join(',')); // Hack to trigger update
    onPriceRangeChange(tempPriceRange);
    onMinRatingChange(tempMinRating);
    onOpenChange(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setTempSpecialties([]);
    setTempPriceRange([0, 200]);
    setTempMinRating(0);
    onClearFilters();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="sticky top-0 bg-background z-10 pb-4">
          <SheetTitle className="flex justify-between items-center">
            <span>Filter Mentors</span>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Expertise */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-sm font-medium mb-3">Expertise</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specialties.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`filter-${specialty}`} 
                    checked={tempSpecialties.includes(specialty)}
                    onCheckedChange={() => toggleSpecialty(specialty)}
                  />
                  <Label 
                    htmlFor={`filter-${specialty}`}
                    className="text-sm cursor-pointer"
                  >
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
          </motion.div>
          
          <Separator />
          
          {/* Price Range */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex justify-between mb-3">
              <h3 className="text-sm font-medium">Price Range (USD)</h3>
              <p className="text-sm">${tempPriceRange[0]} - ${tempPriceRange[1]}</p>
            </div>
            <Slider
              value={tempPriceRange}
              min={0}
              max={200}
              step={5}
              onValueChange={(value: number[]) => setTempPriceRange([value[0], value[1]])}
              className="mb-6"
            />
          </motion.div>
          
          <Separator />
          
          {/* Minimum Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex justify-between mb-3">
              <h3 className="text-sm font-medium">Minimum Rating</h3>
              <p className="text-sm">{tempMinRating}+ stars</p>
            </div>
            <Slider
              value={[tempMinRating]}
              min={0}
              max={5}
              step={0.5}
              onValueChange={(value: number[]) => setTempMinRating(value[0])}
            />
          </motion.div>
        </div>
        
        <SheetFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <div className="flex w-full gap-2">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </SheetClose>
            <Button className="flex-1" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
