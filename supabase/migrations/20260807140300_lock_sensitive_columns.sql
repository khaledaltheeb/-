revoke update on table public.profiles from authenticated;
grant update (display_name, avatar_url, phone, locale, updated_at) on table public.profiles to authenticated;

revoke insert, update on table public.content from authenticated;
grant insert (content_type, slug, title, excerpt, body_json, body_text, sector_id, category_id, audience, author_id, seo_title, seo_description, canonical_url, robots_index, robots_follow, schema_json, featured_image_url, is_featured) on table public.content to authenticated;
grant update (content_type, slug, title, excerpt, body_json, body_text, sector_id, category_id, audience, seo_title, seo_description, canonical_url, robots_index, robots_follow, schema_json, featured_image_url, is_featured, updated_at) on table public.content to authenticated;

revoke insert, update on table public.specialists from authenticated;
grant insert (user_id, slug, full_name, professional_title, bio, email, phone, website_url, country, region, city, latitude, longitude, languages, specialties, qualifications, license_number, years_experience, offers_remote, offers_in_person, show_email, show_phone, show_map) on table public.specialists to authenticated;
grant update (slug, full_name, professional_title, bio, email, phone, website_url, country, region, city, latitude, longitude, languages, specialties, qualifications, license_number, years_experience, offers_remote, offers_in_person, show_email, show_phone, show_map, updated_at) on table public.specialists to authenticated;

revoke insert, update on table public.centers from authenticated;
grant insert (manager_user_id, slug, name, description, logo_url, cover_url, email, phone, website_url, country, region, city, address, latitude, longitude, working_hours) on table public.centers to authenticated;
grant update (slug, name, description, logo_url, cover_url, email, phone, website_url, country, region, city, address, latitude, longitude, working_hours, updated_at) on table public.centers to authenticated;
