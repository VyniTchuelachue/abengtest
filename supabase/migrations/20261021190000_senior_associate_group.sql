-- Senior associates get their own section on the team page.
alter type public.team_group add value if not exists 'senior_associate' before 'lawyer';
