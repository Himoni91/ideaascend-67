
import React from 'react';
import { HelpCategory } from '@/types/help';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleList } from './ArticleList';
import { useHelpCenter } from '@/hooks/use-help-center';
import * as LucideIcons from 'lucide-react';

interface ArticleCategoryProps {
  categorySlug: string;
}

export function ArticleCategory({ categorySlug }: ArticleCategoryProps) {
  const navigate = useNavigate();
  const { useCategories, useArticlesByCategory } = useHelpCenter();
  
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: articles, isLoading: isArticlesLoading } = useArticlesByCategory(categorySlug);
  
  const category = categories?.find(c => c.slug === categorySlug);

  // Dynamically get the icon component
  const IconComponent = category?.icon && (LucideIcons as Record<string, React.FC<{ className?: string }>>)[category.icon] 
    ? (LucideIcons as Record<string, React.FC<{ className?: string }>>)[category.icon]
    : LucideIcons.HelpCircle;

  if (isCategoriesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Category not found</h2>
        <p className="text-muted-foreground mt-2">
          The category you're looking for doesn't exist or has been moved.
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
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        onClick={() => navigate('/help')}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        All Categories
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-4 rounded-full">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      <ArticleList 
        articles={articles || []} 
        isLoading={isArticlesLoading}
        emptyMessage={`No articles in ${category.name} yet.`}
      />
    </div>
  );
}
