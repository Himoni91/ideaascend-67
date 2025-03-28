
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCategory } from '@/types/help';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface CategoryCardProps {
  category: HelpCategory;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const navigate = useNavigate();
  
  // Get the icon dynamically from lucide-react
  let IconComponent = HelpCircle;
  if (category.icon && typeof category.icon === 'string' && category.icon in LucideIcons) {
    IconComponent = (LucideIcons as any)[category.icon] || HelpCircle;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "cursor-pointer h-full hover:shadow-md transition-all border-2 hover:border-primary/20", 
          className
        )}
        onClick={() => navigate(`/help/category/${category.slug}`)}
      >
        <CardHeader className="pb-2">
          <div className="bg-primary/10 p-3 w-12 h-12 rounded-full mb-2 flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{category.name}</CardTitle>
          <CardDescription>{category.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Click to browse articles
        </CardContent>
      </Card>
    </motion.div>
  );
}
