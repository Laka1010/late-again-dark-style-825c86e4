
-- Fix profile PII exposure: only own profile (admins keep their existing policy)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Restrict bucket listing on product-images: drop overly broad policies, allow only admins to list/manage
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND (qual LIKE '%product-images%' OR with_check LIKE '%product-images%')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Public read of individual objects (URL-based access still works), but restrict bucket listing
CREATE POLICY "product-images public read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] IS NOT NULL);

CREATE POLICY "product-images admin write"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "product-images admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "product-images admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
