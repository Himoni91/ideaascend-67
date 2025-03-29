
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MentorFilter as MentorFilterType } from '@/types/mentor';
import { Badge } from '@/components/ui/badge';

interface MentorFilterProps {
  filters: MentorFilterType;
  onChange: (filters: MentorFilterType) => void;
}

const MentorFilter: React.FC<MentorFilterProps> = ({ filters, onChange }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>(
    filters.priceRange || [0, 500]
  );
  
  const specialties = [
    'Startup Strategy',
    'Product Development',
    'Fundraising',
    'Marketing',
    'User Acquisition',
    'Technical Architecture',
    'UX Design',
    'Business Model',
    'Team Building',
    'Pitch Deck',
    'Financial Modeling',
    'Growth Hacking',
    'Sales',
    'Customer Development',
    'Other'
  ];
  
  const handleSpecialtyChange = (specialty: string) => {
    const currentSpecialties = filters.expertise || [];
    const newSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty];
    
    onChange({
      ...filters,
      expertise: newSpecialties
    });
  };
  
  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1] || 500];
    setPriceRange(newRange);
    onChange({
      ...filters,
      priceRange: newRange
    });
  };
  
  const handleRatingChange = (rating: number) => {
    onChange({
      ...filters,
      rating
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {specialties.map(specialty => (
            <Badge
              key={specialty}
              variant={filters.expertise?.includes(specialty) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleSpecialtyChange(specialty)}
            >
              {specialty}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-3">Price Range ($ per hour)</h3>
        <Slider
          defaultValue={[priceRange[0], priceRange[1]]}
          max={500}
          step={10}
          onValueChange={handlePriceRangeChange}
          className="mb-2"
        />
        <div className="flex justify-between">
          <span className="text-xs">${priceRange[0]}</span>
          <span className="text-xs">${priceRange[1]}</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-3">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={() => handleRatingChange(rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer">
                {rating}+ stars
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorFilter;
