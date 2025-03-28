
import React, { useEffect, useRef } from 'react';
import { HelpArticle } from '@/types/help';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedbackButtons } from './FeedbackButtons';
import { ChevronLeft, Eye, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ArticleContentProps {
  article: HelpArticle | undefined;
  isLoading: boolean;
}

export function ArticleContent({ article, isLoading }: ArticleContentProps) {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && article) {
      // Apply syntax highlighting to code blocks if using a library like Prism
      // Ensure content is safely rendered
      contentRef.current.innerHTML = article.content;
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Article not found</h2>
        <p className="text-muted-foreground mt-2">
          The article you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/help')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Help Center
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate(article.category ? 
            `/help/category/${article.category.slug}` : '/help')}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {article.category ? article.category.name : 'All Categories'}
        </Button>
        
        <h1 className="text-3xl font-bold">{article.title}</h1>
        
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CalendarClock className="inline mr-1 h-4 w-4" />
            Updated {formatDate(new Date(article.updated_at))}
          </div>
          <div className="flex items-center">
            <Eye className="inline mr-1 h-4 w-4" />
            {article.views_count} views
          </div>
        </div>
      </div>
      
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="bg-muted">
              {tag.tag}
            </Badge>
          ))}
        </div>
      )}
      
      <div 
        ref={contentRef}
        className="prose prose-sm sm:prose max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-img:rounded-md prose-a:text-primary"
      />
      
      <div className="border-t pt-6 mt-8">
        <FeedbackButtons articleId={article.id} />
      </div>
    </motion.div>
  );
}
