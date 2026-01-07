-- 1. Create a public bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create a policy to allow anyone to READ (SELECT) avatars
CREATE POLICY "Public Avatars are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 3. Create a policy to allow authenticated users to UPLOAD avatars
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

-- 4. Create a policy to allow users to UPDATE their own avatars
CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

-- 5. Create a policy to allow users to DELETE their own avatars
CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

-- 
-- Repeat for 'webtoon-images' bucket just in case
-- 

INSERT INTO storage.buckets (id, name, public) 
VALUES ('webtoon-images', 'webtoon-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Webtoon images are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'webtoon-images');

CREATE POLICY "Users can upload webtoon images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'webtoon-images');

CREATE POLICY "Users can update webtoon images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'webtoon-images');

CREATE POLICY "Users can delete webtoon images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'webtoon-images');
