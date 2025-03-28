
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/help/SearchBar';
import { CategoryCard } from '@/components/help/CategoryCard';
import { FeaturedArticles } from '@/components/help/FeaturedArticles';
import { useHelpCenter } from '@/hooks/use-help-center';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const HelpCenter = () => {
  const { useCategories, useFeaturedArticles } = useHelpCenter();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: featuredArticles, isLoading: isFeaturedLoading } = useFeaturedArticles();

  return (
    <AppLayout>
      <Helmet>
        <title>Help Center | Idolyst</title>
      </Helmet>
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">How can we help?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search for answers or browse our categories to find what you need
          </p>
        </motion.div>
        
        <div className="mb-12">
          <SearchBar />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Browse Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category, index) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                className={
                  // Alternate colors for categories
                  index % 4 === 0 ? "border-blue-100 dark:border-blue-900/30" :
                  index % 4 === 1 ? "border-green-100 dark:border-green-900/30" :
                  index % 4 === 2 ? "border-purple-100 dark:border-purple-900/30" :
                  "border-amber-100 dark:border-amber-900/30"
                }
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Featured Articles</h2>
          <FeaturedArticles 
            articles={featuredArticles || []}
            isLoading={isFeaturedLoading} 
          />
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default HelpCenter;
