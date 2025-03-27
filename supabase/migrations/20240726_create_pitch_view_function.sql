
-- Function to increment pitch view count
CREATE OR REPLACE FUNCTION public.increment_pitch_view(
  pitch_id uuid,
  viewer_id uuid DEFAULT NULL
) 
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update view count in pitches table
  UPDATE public.pitches
  SET trending_score = trending_score + 1
  WHERE id = pitch_id;

  -- We could also insert into a pitch_views table here if we had one
  -- Similar to how post_views works
END;
$$;
