
import React from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/help/SearchBar';
import { ArticleContent } from '@/components/help/ArticleContent';
import { useHelpCenter } from '@/hooks/use-help-center';
import { Helmet } from 'react-helmet-async';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { useArticle } = useHelpCenter();
  const { data: article, isLoading } = useArticle(slug);

  return (
    <AppLayout>
      <Helmet>
        <title>{article ? `${article.title} | Help Center` : 'Article | Help Center'} | Idolyst</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>
        
        <ArticleContent article={article} isLoading={isLoading} />
      </div>
    </AppLayout>
  );
};

export default ArticlePage;
