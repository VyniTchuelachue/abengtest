# The Abeng Law Firm — website and administration

Public bilingual website (EN/FR) and a French-language dashboard at `/admin`, in one Next.js app.

- **Next.js 16** (App Router, React 19, TypeScript), **Tailwind CSS 4**
- **Supabase**: Postgres (RLS on every table), Auth (dashboard accounts), Storage (bucket `media` for portraits and article images)
- **Vercel** hosting (functions pinned to Paris, `cdg1`, next to the Supabase project in `eu-west-3`)

## How content reaches the site

Public pages are pre-rendered and cached (refreshed at least hourly). Every save in the dashboard
calls `updateTag(...)`, so the affected pages are rebuilt on the next visit: publishing, editing,
hiding or deleting needs no redeploy. Profiles and articles created after a deploy render on demand.

## Project layout

```
app/[locale]/…            public pages (/en/…, /fr/… — French URLs such as /fr/equipe are rewrites, see lib/routes.ts)
app/admin/…               dashboard (sign-in, news, team, messages, categories, users, account)
app/admin/actions/…       server actions — each checks the staff role, validates with zod, writes through RLS
lib/data.ts               cached public queries
lib/dictionaries.ts       all public copy, EN + FR
proxy.ts                  locale redirect + dashboard session gate
supabase/migrations/      schema, policies, storage (apply in order)
supabase/seed/            firm content (team bios EN/FR, practice areas) and studio portraits
scripts/                  asset processing and seeding
```

## Environment variables

| Name | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | all | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | all | publishable key (safe in the browser; RLS protects data) |
| `NEXT_PUBLIC_SITE_URL` | all | canonical origin, e.g. `https://www.abenglaw.com` (used for canonical, hreflang, sitemap) |
| `SUPABASE_SECRET_KEY` | server only, optional | enables inviting dashboard users from `/admin/utilisateurs`. Never prefix with `NEXT_PUBLIC_` |
| `RESEND_API_KEY` | server only, optional | turns on an email to contact@theabenglawfirm.com for each contact message or job application (messages are always stored in the dashboard) |
| `CONTACT_FROM_EMAIL` | server only, optional | sender address once theabenglawfirm.com is verified in Resend, e.g. `Site Abeng Law <site@theabenglawfirm.com>`; without it Resend's test sender is used, which only delivers to the email of the Resend account |
| `CONTACT_NOTIFY_EMAIL` | server only, optional | sends the alerts to another inbox instead (testing) |

## Local development

```bash
npm install
npm run dev
```

## Before going live

1. Vercel: set the variables above for Production (and Preview), with `NEXT_PUBLIC_SITE_URL` = the final domain.
2. Supabase › Authentication › URL configuration: Site URL = the final domain; add `https://<domain>/admin/auth/callback` to the redirect URLs (password reset and invitations).
3. Supabase › Authentication › Sign In / Providers: turn **off** "Allow new users to sign up" (accounts are created by invitation only), and turn **on** leaked-password protection.
4. Change the temporary administrator password (`/admin/compte`).
5. Optional: configure custom SMTP in Supabase so reset/invitation emails come from the firm's domain.

## Roles

- **Éditeur**: news, profiles, ordering, messages, categories.
- **Administrateur**: everything above, plus deleting profiles and categories, and managing dashboard users.
