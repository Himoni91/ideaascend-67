
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/use-categories';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PopularCategories() {
  const { categories } = useCategories();
  const navigate = useNavigate();
  const [popularCategories, setPopularCategories] = useState<typeof categories>([]);
  
  useEffect(() => {
    // In a real app, you'd sort by post count or other popularity metrics
    // For now, we'll just use the first 5 categories or randomize
    if (categories.length) {
      const sortedCategories = [...categories]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      
      setPopularCategories(sortedCategories);
    }
  }, [categories]);
  
  const handleCategoryClick = (categoryName: string) => {
    navigate(`/?category=${categoryName}`);
  };
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Popular Categories</h3>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {popularCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant="outline"
                className={cn(
                  "cursor-pointer px-3 py-1 hover:bg-muted",
                  category.color && "hover:text-white"
                )}
                style={{ 
                  backgroundColor: category.color ? `${category.color}20` : undefined,
                  color: category.color ? `${category.color}` : undefined
                }}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
