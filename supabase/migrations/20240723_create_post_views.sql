
-- Create post_views table
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_anonymous BOOLEAN DEFAULT false,
  UNIQUE(post_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting views
CREATE POLICY "Anyone can insert post views" 
  ON public.post_views 
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Create policy for viewing post views
CREATE POLICY "Users can view post views on their posts" 
  ON public.post_views 
  FOR SELECT 
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM public.posts WHERE user_id = auth.uid()
    )
  );

-- Add realtime pub/sub for post views
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_views;

-- Add function to record detailed view analytics
CREATE OR REPLACE FUNCTION public.record_post_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update post engagement metrics
  INSERT INTO public.post_analytics (
    post_id,
    views,
    unique_viewers,
    referral_source
  )
  VALUES (
    NEW.post_id,
    1,
    1,
    'direct'
  )
  ON CONFLICT (post_id)
  DO UPDATE SET
    views = public.post_analytics.views + 1,
    unique_viewers = (
      SELECT COUNT(DISTINCT viewer_id)
      FROM public.post_views
      WHERE post_id = NEW.post_id
    ),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create post_analytics table
CREATE TABLE IF NOT EXISTS public.post_analytics (
  post_id UUID PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on post_analytics
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for post owner to see analytics
CREATE POLICY "Post owner can view analytics" 
  ON public.post_analytics 
  FOR SELECT 
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM public.posts WHERE user_id = auth.uid()
    )
  );

-- Add trigger for recording post view analytics
CREATE TRIGGER record_post_analytics_on_view
  AFTER INSERT ON public.post_views
  FOR EACH ROW
  EXECUTE FUNCTION public.record_post_analytics();

-- Add link_preview column to posts table if it doesn't exist
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS link_preview JSONB DEFAULT NULL;
