-- Texts shown in search results, set by the firm: a description for each profile, and a title for an
-- article when it differs from the heading on the page. Empty: the site derives them as before.
alter table public.team_members
  add column if not exists meta_description_en text not null default '',
  add column if not exists meta_description_fr text not null default '';
alter table public.articles
  add column if not exists seo_title_en text,
  add column if not exists seo_title_fr text;
