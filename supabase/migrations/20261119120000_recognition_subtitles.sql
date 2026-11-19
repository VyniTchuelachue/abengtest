-- The line under a recognition's name on the Firm page (e.g. "Rule of Law Index"), in each language.
-- When empty, the page shows the recipient, or the year when there is no recipient.
-- Photos may also carry their own caption for the home page tabs: keys caption_en / caption_fr in `photos`.
alter table public.recognitions
  add column if not exists subtitle_en text not null default '',
  add column if not exists subtitle_fr text not null default '';
