-- Practice areas become editable pages: a full description, a visibility switch
-- and one display order across the whole list (the groups are no longer shown).

alter table public.practice_areas
  add column body_en text not null default '' check (char_length(body_en) <= 20000),
  add column body_fr text not null default '' check (char_length(body_fr) <= 20000),
  add column published boolean not null default true;

alter table public.practice_areas alter column group_key set default 'regulatory';

drop policy "practice areas are public" on public.practice_areas;
create policy "practice areas readable" on public.practice_areas
  for select to anon, authenticated
  using (published or (select private.is_staff()));

drop index if exists public.practice_areas_order_idx;
create index practice_areas_order_idx on public.practice_areas (sort_order);

-- One order for the whole list, keeping the order visitors saw (group, then position).
with ordered as (
  select id, row_number() over (
    order by array_position(array['transactions', 'regulatory', 'disputes', 'sectors']::public.practice_group[], group_key), sort_order
  ) as n
  from public.practice_areas
)
update public.practice_areas p set sort_order = o.n * 10 from ordered o where o.id = p.id;

-- Pages requested by the firm; hidden until the firm supplies the approved text.
insert into public.practice_areas (slug, slug_fr, title_en, title_fr, published, sort_order)
values
  ('cybercrime-digital-disputes', 'cybercriminalite-contentieux-numerique', 'Cybercrime & Digital Disputes', 'Cybercriminalité et contentieux du numérique', false, 1000),
  ('criminal-law-proceedings', 'droit-penal-procedure-penale', 'Criminal Law & Criminal Proceedings', 'Droit pénal et procédure pénale', false, 1010),
  ('insurance-law-disputes', 'droit-assurances-contentieux', 'Insurance Law & Insurance Disputes', 'Droit des assurances et contentieux de l’assurance', false, 1020),
  ('legal-due-diligence-audits', 'audits-juridiques-verifications-prealables', 'Legal Due Diligence & Legal Audits', 'Audits juridiques et vérifications préalables', false, 1030)
on conflict (slug) do nothing;
