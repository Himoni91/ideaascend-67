
-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload to posts bucket
CREATE POLICY "Authenticated users can upload post files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  auth.uid() = owner
);

-- Create policy to allow public to view files in posts bucket
CREATE POLICY "Public can view post files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posts');

-- Create policy to allow file owners to update their post files
CREATE POLICY "Users can update their own post files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'posts' AND owner = auth.uid());

-- Create policy to allow file owners to delete their post files
CREATE POLICY "Users can delete their own post files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'posts' AND owner = auth.uid());
