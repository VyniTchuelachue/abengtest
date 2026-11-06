-- The dashboard takes over content that was written in the code: a photo for each
-- practice area, the rankings, awards, memberships and contributions, and the firm's
-- public phone numbers and email addresses.

-- ---------------------------------------------------------------------------
-- Practice areas: the photo behind each card
-- ---------------------------------------------------------------------------
alter table public.practice_areas add column image_path text;

update public.practice_areas set image_path = '/images/practice/' || slug || '-v2.jpg'
where slug in ('corporate-commercial-ohada', 'mergers-acquisitions', 'banking-finance', 'energy-infrastructure', 'real-estate-construction', 'tax-customs-exchange', 'regulatory-public-law', 'compliance-investigations', 'data-technology', 'employment-immigration', 'intellectual-property', 'environment-esg', 'litigation-arbitration', 'debt-recovery-insolvency', 'maritime-transport', 'private-client');

-- ---------------------------------------------------------------------------
-- Rankings, awards, memberships and contributions
-- ---------------------------------------------------------------------------
create table public.recognitions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('ranking', 'award', 'membership', 'contribution')),
  name_en text not null check (char_length(name_en) between 2 and 200),
  name_fr text not null check (char_length(name_fr) between 2 and 200),
  recipient text not null default '' check (char_length(recipient) <= 120),
  year text not null default '' check (char_length(year) <= 40),
  detail_en text not null default '' check (char_length(detail_en) <= 1000),
  detail_fr text not null default '' check (char_length(detail_fr) <= 1000),
  -- One entry per photo: { path, cutout (image without its background, optional), year }.
  photos jsonb not null default '[]'::jsonb check (jsonb_typeof(photos) = 'array'),
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create index recognitions_order_idx on public.recognitions (sort_order);
create index recognitions_updated_by_idx on public.recognitions (updated_by);
create trigger recognitions_touch before update on public.recognitions
  for each row execute function private.touch_row();

alter table public.recognitions enable row level security;
create policy "recognitions readable" on public.recognitions
  for select to anon, authenticated using (published or (select private.is_staff()));
create policy "recognitions insert by staff" on public.recognitions
  for insert to authenticated with check ((select private.is_staff()));
create policy "recognitions update by staff" on public.recognitions
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "recognitions delete by admin" on public.recognitions
  for delete to authenticated using ((select private.is_admin()));

-- The items shown on the site until now, with their wording unchanged.
insert into public.recognitions (kind, name_en, name_fr, recipient, year, detail_en, detail_fr, photos, sort_order)
values
  ($q$ranking$q$, $q$Chambers Global$q$, $q$Chambers Global$q$, $q$The Abeng Law Firm$q$, $q$2026$q$, $q$Ranked in General Business Law: Cameroon. Also ranked in the 2022 and 2024 editions.$q$, $q$Classé en « General Business Law: Cameroon ». Également classé dans les éditions 2022 et 2024.$q$, $q$[{"path":"/images/recognitions/chambers-global-2024.jpg","cutout":"/images/recognitions/cutouts/chambers-global-2024.webp","year":"2024"},{"path":"/images/recognitions/chambers-global-2022.jpg","cutout":"/images/recognitions/cutouts/chambers-global-2022.webp","year":"2022"}]$q$::jsonb, 10),
  ($q$ranking$q$, $q$Chambers Global$q$, $q$Chambers Global$q$, $q$Roland Abeng$q$, $q$2026$q$, $q$Individually ranked in General Business Law: Cameroon. Also ranked in the 2019 edition.$q$, $q$Classé à titre individuel en « General Business Law: Cameroon ». Également classé dans l'édition 2019.$q$, $q$[{"path":"/images/recognitions/chambers-global-2019.jpg","cutout":"/images/recognitions/cutouts/chambers-global-2019.webp","year":"2019"}]$q$::jsonb, 20),
  ($q$ranking$q$, $q$IFLR1000$q$, $q$IFLR1000$q$, $q$The Abeng Law Firm$q$, $q$2021/22$q$, $q$Recommended firm, Financial and Corporate, in the 31st edition.$q$, $q$Cabinet recommandé, Financial and Corporate, dans la 31e édition.$q$, $q$[{"path":"/images/recognitions/iflr1000-2021-22.jpg","cutout":"/images/recognitions/cutouts/iflr1000-2021-22.webp","year":"2021/22"}]$q$::jsonb, 30),
  ($q$award$q$, $q$Cameroon Union of Young Lawyers (UJA)$q$, $q$Union des jeunes avocats du Cameroun (UJA)$q$, $q$Roland Abeng$q$, $q$$q$, $q$Distinction in recognition of his continuous support and contributions to the professional development of young lawyers.$q$, $q$Distinction en reconnaissance de son soutien constant et de sa contribution à la formation professionnelle des jeunes avocats.$q$, $q$[{"path":"/images/recognitions/uja-cameroon.jpg","cutout":"/images/recognitions/cutouts/uja-cameroon.webp","year":""}]$q$::jsonb, 40),
  ($q$award$q$, $q$American Bar Association, Section of International Law$q$, $q$American Bar Association, Section of International Law$q$, $q$$q$, $q$2008–2009$q$, $q$Best Stand-Alone Program Award, conferred on the programme “Good Governance in Cameroon”.$q$, $q$Best Stand-Alone Program Award, décerné au programme « Good Governance in Cameroon ».$q$, $q$[{"path":"/images/recognitions/aba-international-law-award-2008-09.jpg","cutout":"/images/recognitions/cutouts/aba-international-law-award-2008-09.webp","year":"2008–2009"}]$q$::jsonb, 50),
  ($q$membership$q$, $q$TAGLaw$q$, $q$TAGLaw$q$, $q$The Abeng Law Firm$q$, $q$$q$, $q$Member of TAGLaw, an international alliance of independent law firms.$q$, $q$Membre de TAGLaw, alliance internationale de cabinets d'avocats indépendants.$q$, $q$[{"path":"/images/recognitions/taglaw-15-years.jpg","cutout":"/images/recognitions/cutouts/taglaw-15-years.webp","year":""}]$q$::jsonb, 60),
  ($q$membership$q$, $q$TRACE$q$, $q$TRACE$q$, $q$The Abeng Law Firm$q$, $q$$q$, $q$Member of TRACE, an international anti-bribery compliance network.$q$, $q$Membre de TRACE, réseau international de conformité anticorruption.$q$, $q$[]$q$::jsonb, 70),
  ($q$membership$q$, $q$Miranda Alliance$q$, $q$Miranda Alliance$q$, $q$The Abeng Law Firm$q$, $q$$q$, $q$$q$, $q$$q$, $q$[]$q$::jsonb, 80),
  ($q$contribution$q$, $q$The World Bank$q$, $q$Banque mondiale$q$, $q$Roland Abeng$q$, $q$2011$q$, $q$Certificate of Appreciation for his contribution to Doing Business 2011: Making a Difference for Entrepreneurs.$q$, $q$Certificat de reconnaissance pour sa contribution au rapport Doing Business 2011 : Making a Difference for Entrepreneurs.$q$, $q$[{"path":"/images/recognitions/world-bank-doing-business-2011.jpg","cutout":"/images/recognitions/cutouts/world-bank-doing-business-2011.webp","year":"2011"}]$q$::jsonb, 90),
  ($q$contribution$q$, $q$The World Justice Project$q$, $q$World Justice Project$q$, $q$Roland Abeng$q$, $q$2012–2013$q$, $q$Certificate of Contribution to the World Justice Project Rule of Law Index 2012–2013 report.$q$, $q$Certificat de contribution au rapport Rule of Law Index 2012–2013 du World Justice Project.$q$, $q$[{"path":"/images/recognitions/world-justice-project-2012-13.jpg","cutout":"/images/recognitions/cutouts/world-justice-project-2012-13.webp","year":"2012–2013"}]$q$::jsonb, 100);

-- ---------------------------------------------------------------------------
-- The firm's public contact details: a single row, changed by administrators only
-- ---------------------------------------------------------------------------
create table public.site_contact (
  id boolean primary key default true check (id),
  phones text[] not null check (cardinality(phones) between 1 and 6),
  emails text[] not null check (cardinality(emails) between 1 and 6),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create index site_contact_updated_by_idx on public.site_contact (updated_by);
create trigger site_contact_touch before update on public.site_contact
  for each row execute function private.touch_row();

alter table public.site_contact enable row level security;
create policy "site contact is public" on public.site_contact
  for select to anon, authenticated using (true);
create policy "site contact update by admin" on public.site_contact
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

insert into public.site_contact (phones, emails)
values (array['+237 233420208'], array['contact@theabenglawfirm.com']);
