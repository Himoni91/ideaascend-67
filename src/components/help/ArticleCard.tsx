
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { HelpArticle } from '@/types/help';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: HelpArticle;
  index?: number;
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const navigate = useNavigate();

  // Extract plain text from HTML content for preview
  const getTextPreview = (html: string, maxLength: number = 120) => {
    const plainText = html.replace(/<[^>]*>?/gm, '');
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/20"
        onClick={() => navigate(`/help/article/${article.slug}`)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{article.title}</CardTitle>
            {article.is_featured && (
              <Badge variant="secondary" className="ml-2 shrink-0">Featured</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>Updated {formatDate(new Date(article.updated_at))}</span>
            <span className="flex items-center">
              <Eye className="h-3 w-3 inline mr-1" /> 
              {article.views_count}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-2 mb-3">
            {getTextPreview(article.content)}
          </CardDescription>
          <div className="flex flex-wrap gap-1 mt-2">
            {article.category && (
              <Badge variant="outline" className="text-primary border-primary/30">
                {article.category.name}
              </Badge>
            )}
            {article.tags && article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="bg-muted">
                {tag.tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
