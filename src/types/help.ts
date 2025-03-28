
export type HelpCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type HelpArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category_id: string | null;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  tags?: HelpArticleTag[];
  category?: HelpCategory;
};

export type HelpArticleTag = {
  id: string;
  article_id: string;
  tag: string;
  created_at: string;
};

export type HelpFeedback = {
  id: string;
  article_id: string;
  user_id: string;
  is_helpful: boolean;
  feedback_text: string | null;
  created_at: string;
};

export type HelpContactSubmission = {
  id: string;
  user_id?: string;
  name?: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
};

export type HelpSearchResult = {
  article: HelpArticle;
  relevance: number;
};
