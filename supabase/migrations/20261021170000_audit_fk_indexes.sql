-- Covering indexes for the audit foreign keys (Supabase performance advisor).
create index if not exists articles_created_by_idx on public.articles (created_by);
create index if not exists articles_updated_by_idx on public.articles (updated_by);
create index if not exists practice_areas_updated_by_idx on public.practice_areas (updated_by);
create index if not exists team_members_created_by_idx on public.team_members (created_by);
create index if not exists team_members_updated_by_idx on public.team_members (updated_by);
