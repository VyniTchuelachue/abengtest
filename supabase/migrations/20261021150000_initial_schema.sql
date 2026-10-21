-- Abeng Law — initial schema
-- Content (team, practice areas, articles), staff roles, contact messages,
-- media storage and Row Level Security.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Staff (administrators of the dashboard)
-- ---------------------------------------------------------------------------
create type public.staff_role as enum ('admin', 'editor');

create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.staff_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff s where s.user_id = (select auth.uid()));
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff s
    where s.user_id = (select auth.uid()) and s.role = 'admin'
  );
$$;

revoke all on function private.is_staff() from public;
revoke all on function private.is_admin() from public;
grant execute on function private.is_staff() to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

create or replace function private.touch_row()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  if (select auth.uid()) is not null then
    new.updated_by = (select auth.uid());
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Practice areas
-- ---------------------------------------------------------------------------
create type public.practice_group as enum ('transactions', 'regulatory', 'disputes', 'sectors');

create table public.practice_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  slug_fr text not null unique check (slug_fr ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  group_key public.practice_group not null,
  sort_order integer not null default 0,
  title_en text not null check (char_length(title_en) between 2 and 160),
  title_fr text not null check (char_length(title_fr) between 2 and 160),
  summary_en text not null default '',
  summary_fr text not null default '',
  scope_en text[] not null default '{}',
  scope_fr text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create index practice_areas_order_idx on public.practice_areas (group_key, sort_order);
create trigger practice_areas_touch before update on public.practice_areas
  for each row execute function private.touch_row();

-- ---------------------------------------------------------------------------
-- Team members (lawyers, paralegals, administrative staff)
-- ---------------------------------------------------------------------------
create type public.team_group as enum ('partner', 'lawyer', 'paralegal', 'administration');
create type public.profile_status as enum ('published', 'hidden', 'inactive');

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  full_name text not null check (char_length(full_name) between 2 and 120),
  group_key public.team_group not null default 'lawyer',
  status public.profile_status not null default 'hidden',
  sort_order integer not null default 0,
  featured boolean not null default false,
  title_en text not null default '' check (char_length(title_en) <= 160),
  title_fr text not null default '' check (char_length(title_fr) <= 160),
  bio_en text not null default '' check (char_length(bio_en) <= 12000),
  bio_fr text not null default '' check (char_length(bio_fr) <= 12000),
  focus_areas_en text[] not null default '{}',
  focus_areas_fr text[] not null default '{}',
  qualifications_en text[] not null default '{}',
  qualifications_fr text[] not null default '{}',
  bar_admission_en text check (char_length(bar_admission_en) <= 240),
  bar_admission_fr text check (char_length(bar_admission_fr) <= 240),
  languages_en text[] not null default '{}',
  languages_fr text[] not null default '{}',
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  linkedin_url text check (linkedin_url is null or linkedin_url ~* '^https://([a-z]+\.)?linkedin\.com/'),
  photo_path text check (photo_path is null or char_length(photo_path) <= 300),
  photo_position text not null default '50% 25%' check (photo_position ~ '^[0-9]{1,3}% [0-9]{1,3}%$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by uuid references auth.users (id) on delete set null
);
create index team_members_listing_idx on public.team_members (status, group_key, sort_order);
create trigger team_members_touch before update on public.team_members
  for each row execute function private.touch_row();

create table public.team_member_practice_areas (
  member_id uuid not null references public.team_members (id) on delete cascade,
  practice_area_id uuid not null references public.practice_areas (id) on delete cascade,
  primary key (member_id, practice_area_id)
);
create index team_member_practice_areas_area_idx on public.team_member_practice_areas (practice_area_id);

-- ---------------------------------------------------------------------------
-- News & insights
-- ---------------------------------------------------------------------------
create table public.article_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en text not null check (char_length(name_en) between 2 and 80),
  name_fr text not null check (char_length(name_fr) between 2 and 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create type public.article_status as enum ('draft', 'published');

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  status public.article_status not null default 'draft',
  published_at timestamptz,
  category_id uuid references public.article_categories (id) on delete set null,
  author_id uuid references public.team_members (id) on delete set null,
  cover_path text check (cover_path is null or char_length(cover_path) <= 300),
  cover_alt_en text check (char_length(cover_alt_en) <= 240),
  cover_alt_fr text check (char_length(cover_alt_fr) <= 240),
  title_en text check (char_length(title_en) <= 200),
  title_fr text check (char_length(title_fr) <= 200),
  excerpt_en text check (char_length(excerpt_en) <= 600),
  excerpt_fr text check (char_length(excerpt_fr) <= 600),
  body_en text check (char_length(body_en) <= 200000),
  body_fr text check (char_length(body_fr) <= 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint articles_has_title check (coalesce(title_en, '') <> '' or coalesce(title_fr, '') <> ''),
  constraint articles_published_has_date check (status = 'draft' or published_at is not null)
);
create index articles_listing_idx on public.articles (status, published_at desc);
create index articles_category_idx on public.articles (category_id);
create index articles_author_idx on public.articles (author_id);
create trigger articles_touch before update on public.articles
  for each row execute function private.touch_row();

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------
create type public.message_status as enum ('new', 'read', 'archived');

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 40),
  subject text check (char_length(subject) <= 120),
  message text not null check (char_length(message) between 10 and 5000),
  locale text not null default 'en' check (locale in ('en', 'fr')),
  status public.message_status not null default 'new',
  created_at timestamptz not null default now()
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.staff enable row level security;
alter table public.practice_areas enable row level security;
alter table public.team_members enable row level security;
alter table public.team_member_practice_areas enable row level security;
alter table public.article_categories enable row level security;
alter table public.articles enable row level security;
alter table public.contact_messages enable row level security;

-- staff: members see their own row; admins manage everyone
create policy "staff read own or admin" on public.staff
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "staff insert by admin" on public.staff
  for insert to authenticated with check ((select private.is_admin()));
create policy "staff update by admin" on public.staff
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "staff delete by admin" on public.staff
  for delete to authenticated using ((select private.is_admin()) and user_id <> (select auth.uid()));

-- practice areas: public read, staff write, admin delete
create policy "practice areas are public" on public.practice_areas
  for select to anon, authenticated using (true);
create policy "practice areas insert by staff" on public.practice_areas
  for insert to authenticated with check ((select private.is_staff()));
create policy "practice areas update by staff" on public.practice_areas
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "practice areas delete by admin" on public.practice_areas
  for delete to authenticated using ((select private.is_admin()));

-- team members: published profiles are public; staff see and edit all; admins delete
create policy "team members readable" on public.team_members
  for select to anon, authenticated
  using (status = 'published' or (select private.is_staff()));
create policy "team members insert by staff" on public.team_members
  for insert to authenticated with check ((select private.is_staff()));
create policy "team members update by staff" on public.team_members
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "team members delete by admin" on public.team_members
  for delete to authenticated using ((select private.is_admin()));

create policy "member practice areas readable" on public.team_member_practice_areas
  for select to anon, authenticated
  using (
    (select private.is_staff())
    or exists (
      select 1 from public.team_members m
      where m.id = member_id and m.status = 'published'
    )
  );
create policy "member practice areas insert by staff" on public.team_member_practice_areas
  for insert to authenticated with check ((select private.is_staff()));
create policy "member practice areas delete by staff" on public.team_member_practice_areas
  for delete to authenticated using ((select private.is_staff()));

-- categories
create policy "categories are public" on public.article_categories
  for select to anon, authenticated using (true);
create policy "categories insert by staff" on public.article_categories
  for insert to authenticated with check ((select private.is_staff()));
create policy "categories update by staff" on public.article_categories
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "categories delete by admin" on public.article_categories
  for delete to authenticated using ((select private.is_admin()));

-- articles: published (and due) articles are public; staff manage all
create policy "articles readable" on public.articles
  for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or (select private.is_staff()));
create policy "articles insert by staff" on public.articles
  for insert to authenticated with check ((select private.is_staff()));
create policy "articles update by staff" on public.articles
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "articles delete by staff" on public.articles
  for delete to authenticated using ((select private.is_staff()));

-- contact messages: anyone may submit a new message; only staff can read or manage
create policy "anyone can submit a message" on public.contact_messages
  for insert to anon, authenticated with check (status = 'new');
create policy "messages readable by staff" on public.contact_messages
  for select to authenticated using ((select private.is_staff()));
create policy "messages update by staff" on public.contact_messages
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "messages delete by staff" on public.contact_messages
  for delete to authenticated using ((select private.is_staff()));

-- ---------------------------------------------------------------------------
-- Storage: public "media" bucket for portraits and article images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "media readable by staff" on storage.objects
  for select to authenticated using (bucket_id = 'media' and (select private.is_staff()));
create policy "media upload by staff" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select private.is_staff()));
create policy "media update by staff" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select private.is_staff()))
  with check (bucket_id = 'media' and (select private.is_staff()));
create policy "media delete by staff" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select private.is_staff()));
