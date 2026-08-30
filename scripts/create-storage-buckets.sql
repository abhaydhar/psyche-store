-- ============================================
-- Supabase Storage Bucket Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('tshirt-designs', 'tshirt-designs', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-blanks', 'product-blanks', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('order-mockups', 'order-mockups', true) ON CONFLICT DO NOTHING;

-- Public read access policies for all buckets
CREATE POLICY "Public read tshirt-designs" ON storage.objects FOR SELECT USING (bucket_id = 'tshirt-designs');
CREATE POLICY "Public insert tshirt-designs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tshirt-designs');

CREATE POLICY "Public read product-blanks" ON storage.objects FOR SELECT USING (bucket_id = 'product-blanks');
CREATE POLICY "Public insert product-blanks" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-blanks');

CREATE POLICY "Public read order-mockups" ON storage.objects FOR SELECT USING (bucket_id = 'order-mockups');
CREATE POLICY "Public insert order-mockups" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'order-mockups');
