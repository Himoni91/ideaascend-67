
import React from 'react';
import { HelpArticle } from '@/types/help';
import { ArticleCard } from './ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface FeaturedArticlesProps {
  articles: HelpArticle[];
  isLoading: boolean;
}

export function FeaturedArticles({ articles, isLoading }: FeaturedArticlesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!articles.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-muted-foreground"
      >
        No featured articles yet.
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <ArticleCard key={article.id} article={article} index={index} />
      ))}
    </div>
  );
}
