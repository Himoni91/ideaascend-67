
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedTabsProps {
  categories: { id: string; name: string; icon: string | null; color: string | null }[];
  activeCategory: string;
  onChange: (category: string) => void;
}

export default function FeedTabs({
  categories,
  activeCategory,
  onChange,
}: FeedTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check if we need scroll buttons
  const checkScrollButtons = () => {
    if (!tabsRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  // Scroll tabs
  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    
    const scrollAmount = direction === 'left' ? -200 : 200;
    tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Set up scroll checking
  useEffect(() => {
    const tabsElement = tabsRef.current;
    if (!tabsElement) return;
    
    const handleScroll = () => checkScrollButtons();
    tabsElement.addEventListener('scroll', handleScroll);
    
    // Initial check
    checkScrollButtons();
    
    // Check again after possible reflows/resizes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollButtons();
    });
    resizeObserver.observe(tabsElement);
    
    return () => {
      tabsElement.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [categories]);

  // Find active index for animation
  useEffect(() => {
    const index = ['All', ...categories.map(cat => cat.name)].findIndex(
      name => name === activeCategory
    );
    setActiveIndex(index >= 0 ? index : 0);
  }, [activeCategory, categories]);

  // All Categories button plus category tabs
  const allCategories = { id: 'all', name: 'All Posts', icon: null, color: null };
  const tabsWithAll = [allCategories, ...categories];

  return (
    <div className="relative mb-6">
      <div className="flex items-center">
        {/* Left scroll button */}
        <AnimatePresence>
          {showLeftScroll && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full absolute left-0 z-10 bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={() => scrollTabs('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tabs container */}
        <div className="w-full relative">
          {/* Active tab indicator */}
          <div className="absolute bottom-1 left-0 h-0.5 z-0 hidden md:block">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ 
                left: `${activeIndex * (100 / tabsWithAll.length)}%`,
                width: `${100 / tabsWithAll.length}%`
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
          
          {/* Scrollable tabs */}
          <div
            ref={tabsRef}
            className="flex space-x-2 overflow-x-auto scrollbar-none pb-1 px-1 mx-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tabsWithAll.map((category, index) => (
              <Button
                key={category.id}
                onClick={() => onChange(category.id === 'all' ? 'All' : category.name)}
                className={cn(
                  "rounded-full whitespace-nowrap transition-all flex items-center gap-1",
                  activeCategory === (category.id === 'all' ? 'All' : category.name)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
                style={
                  category.id !== 'all' && activeCategory === category.name && category.color
                    ? { backgroundColor: category.color }
                    : undefined
                }
              >
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Right scroll button */}
        <AnimatePresence>
          {showRightScroll && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full absolute right-0 z-10 bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={() => scrollTabs('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
