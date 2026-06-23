
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies: users manage only their own folder (folder = auth.uid())
CREATE POLICY "wardrobe own read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "wardrobe own write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "wardrobe own delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "photos own read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'current-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "photos own write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'current-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "photos own delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'current-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
