
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { PostCategory } from "@/types/post";

interface CategoryFilterProps {
  categories: PostCategory[];
  activeCategory: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  activeCategory, 
  onChange 
}: CategoryFilterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative mb-6">
      <ScrollArea 
        className="pb-2 max-w-full" 
        orientation="horizontal"
      >
        <div className="flex space-x-2 pb-1 pt-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => onChange("All")}
              size="sm"
              variant={activeCategory === "All" ? "default" : "outline"}
              className={`
                rounded-full whitespace-nowrap h-8 px-4
                ${activeCategory === "All" 
                  ? "bg-idolyst-blue text-white hover:bg-idolyst-blue/90" 
                  : "hover:bg-muted"
                }
                transition-all duration-300 ease-in-out
              `}
            >
              All
            </Button>
          </motion.div>

          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Button
                onClick={() => onChange(category.name)}
                size="sm"
                variant={activeCategory === category.name ? "default" : "outline"}
                className={`
                  rounded-full whitespace-nowrap h-8 px-4
                  ${activeCategory === category.name 
                    ? (category.color 
                      ? `bg-[${category.color}] text-white hover:bg-[${category.color}]/90` 
                      : "bg-idolyst-blue text-white hover:bg-idolyst-blue/90") 
                    : "hover:bg-muted"
                  }
                  transition-all duration-300 ease-in-out
                `}
              >
                {category.icon && (
                  <span className="mr-1.5">{category.icon}</span>
                )}
                {category.name}
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
