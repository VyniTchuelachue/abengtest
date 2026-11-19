-- Privacy notice of 19 November 2026: recorded consent on every form submission, CVs with applications
-- (kept in a private bucket), and a closing date from which the six-month retention period runs.

alter table public.contact_messages
  add column if not exists kind text not null default 'enquiry',
  add column if not exists consent_at timestamptz,
  add column if not exists consent_purpose text,
  add column if not exists consent_notice_version text,
  add column if not exists cv_path text,
  add column if not exists cv_name text,
  add column if not exists cv_size integer,
  add column if not exists closed_at timestamptz;

alter table public.contact_messages drop constraint if exists contact_messages_kind_check;
alter table public.contact_messages add constraint contact_messages_kind_check check (kind in ('enquiry', 'application'));

-- Applications sent before this change came through the contact form with the careers subject.
update public.contact_messages set kind = 'application' where subject in ('Careers', 'Recrutement') and kind = 'enquiry';

-- From now on no submission is stored without its consent record, and no application without its CV.
-- NOT VALID: messages received before the notice was published are kept as they are.
alter table public.contact_messages drop constraint if exists contact_messages_consent_recorded;
alter table public.contact_messages add constraint contact_messages_consent_recorded
  check (consent_at is not null and consent_purpose is not null and consent_notice_version is not null) not valid;
alter table public.contact_messages drop constraint if exists contact_messages_application_cv;
alter table public.contact_messages add constraint contact_messages_application_cv
  check (kind <> 'application' or cv_path is not null) not valid;

-- Visitors (through the site's server) may only add new enquiries; applications, which carry a CV, are
-- stored by the server with its own key after the file has been checked.
drop policy if exists "anyone can submit a message" on public.contact_messages;
create policy "anyone can submit a message" on public.contact_messages for insert to anon, authenticated
  with check (status = 'new' and kind = 'enquiry' and cv_path is null and closed_at is null);

create index if not exists contact_messages_retention_idx on public.contact_messages (kind, closed_at, created_at);

-- Private bucket for CVs: PDF or DOCX, 5 MB at most, never public. Only staff can read or delete them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('applications', 'applications', false, 5242880,
        array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "applications readable by staff" on storage.objects;
create policy "applications readable by staff" on storage.objects for select to authenticated
  using (bucket_id = 'applications' and (select private.is_staff()));
drop policy if exists "applications delete by staff" on storage.objects;
create policy "applications delete by staff" on storage.objects for delete to authenticated
  using (bucket_id = 'applications' and (select private.is_staff()));
