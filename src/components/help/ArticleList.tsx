
import React from 'react';
import { HelpArticle } from '@/types/help';
import { ArticleCard } from './ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface ArticleListProps {
  articles: HelpArticle[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function ArticleList({ 
  articles, 
  isLoading, 
  emptyMessage = "No articles found" 
}: ArticleListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
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
        {emptyMessage}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <ArticleCard key={article.id} article={article} index={index} />
      ))}
    </div>
  );
}
