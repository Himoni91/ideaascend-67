
import React from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/help/SearchBar';
import { ArticleCategory } from '@/components/help/ArticleCategory';
import { Helmet } from 'react-helmet';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Help Category | Idolyst</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>
        
        <ArticleCategory categorySlug={slug} />
      </div>
    </AppLayout>
  );
};

export default CategoryPage;
