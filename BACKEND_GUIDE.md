# Backend and dashboard: setup, testing and admin access

Test site: https://abengtest-smoky.vercel.app · Dashboard: https://abengtest-smoky.vercel.app/admin

The backend is Supabase (database, logins, image storage) plus Vercel (hosting and the server code). The dashboard is the
`/admin` part of the same site. This guide lists what is still missing, how to fix each item, and how to test everything afterwards.

---

## 1. Where things stand

### Accounts and connections

| Account | State | What it affects |
| --- | --- | --- |
| **Supabase** (project `ksnqtrbutyzqakvaqhhq`, region Paris) | Working. The site reads and writes it normally. | Database, dashboard logins, uploaded images. |
| **Supabase connector inside Claude** | **Disconnected.** | Only Claude's ability to change the database for you. The site does not use it. |
| **Vercel** (project `abengtest`) | Working; deploys automatically from GitHub. | Hosting. One setting is wrong (see step A). |
| **GitHub** (`VyniTchuelachue/abengtest`) | Working. | Source code; every push redeploys the test site. |
| **Resend** (email sending) | **Not created yet.** | Email alerts for contact messages and job applications; invitation and password emails (step D). |

### What already works

- Database tables with row-level security, the `media` image bucket (10 MB per file; JPEG, PNG, WebP, AVIF).
- Dashboard sign-in, news (drafts, preview, scheduling, FR/EN, categories, images), team profiles (portraits, order,
  publish/hide/inactive, delete), messages, categories, your account page.
- Contact and careers forms: every message is saved and appears in **Messages** (applications carry a *Candidature* badge).
- Changes saved in the dashboard appear on the site without a redeploy.
- `/admin` is closed to anyone not signed in, and signed-in accounts must also be on the staff list.

### What is missing (do these in order)

| | Task | Why |
| --- | --- | --- |
| A | Fix `NEXT_PUBLIC_SITE_URL` in Vercel | It points to `abengtest-tchuelachue.vercel.app`, which is behind Vercel's own login. Invitation links and the sitemap use it. |
| B | Set the Supabase sign-in URLs | Password-reset and invitation links only work for addresses listed there. |
| C | Lock down Supabase sign-ups | Accounts should exist only by invitation. |
| D | Create Resend, verify the firm's domain, connect it, fix the email links | Without it: no email to contact@theabenglawfirm.com, and Supabase can't reliably send invitations or password resets. |
| E | Add `SUPABASE_SECRET_KEY` in Vercel (if not already there) | Needed to invite users from **Utilisateurs**. |
| F | Change the temporary admin password | The current one was generated during setup. |
| G | Optional: reconnect Supabase in Claude | Only if you want Claude to make database changes (for example the dashboard field for the profile-page photos). |

---

## 2. How to do each task

### A. Vercel: site address

1. Go to vercel.com → project **abengtest** → **Settings** → **Environment Variables**.
2. Find `NEXT_PUBLIC_SITE_URL` → **Edit** → value `https://abengtest-smoky.vercel.app` (no slash at the end) → Save.
   Tick **Production** and **Preview**.
3. Redeploy so the change is built in: **Deployments** → newest deployment → **⋯** → **Redeploy**.
4. Check: open https://abengtest-smoky.vercel.app/robots.txt — the `Sitemap:` line must show `abengtest-smoky`.

When the final domain is ready (for example `www.theabenglawfirm.com`), change this value to it and redo B with that domain.

### B. Supabase: sign-in URLs

1. supabase.com → project **ksnqtrbutyzqakvaqhhq** → **Authentication** → **URL Configuration**.
2. **Site URL**: `https://abengtest-smoky.vercel.app`
3. **Redirect URLs** → **Add URL**, add both:
   - `https://abengtest-smoky.vercel.app/admin/auth/callback`
   - `http://localhost:3000/admin/auth/callback` (for local work)
4. Save.

### C. Supabase: sign-up and password rules

1. **Authentication** → **Sign In / Providers** → **Email**: keep Email enabled, turn **off** *Allow new users to sign up*. Save.
   (The dashboard never offers sign-up; this also blocks it at the source.)
2. Same page or **Authentication** → **Attack Protection** (depending on the dashboard version): turn **on** leaked-password
   protection if your plan offers it, and set the minimum password length to at least 10.

### D. Email: Resend and the firm's domain

The website cannot send email by itself. Resend sends it (free up to a few thousand emails a month).

**D1. Create the account**
1. Sign up at resend.com, preferably with `contact@theabenglawfirm.com`.

**D2. Verify the domain** (lets the site send from an `@theabenglawfirm.com` address to anyone)
1. Resend → **Domains** → **Add domain** → `theabenglawfirm.com` → choose the region closest to Europe.
2. Resend shows 3–4 DNS records (an MX and TXT records for a `send` subdomain, and a DKIM TXT record `resend._domainkey`).
3. Add them where the domain's DNS is managed (the registrar or host that runs the firm's email). Copy each name and value exactly.
   They don't touch the firm's existing mailbox records.
4. Back in Resend, click **Verify**. It can take from a few minutes to a few hours.

**D3. Connect the website**
1. Resend → **API Keys** → **Create API key** → name `abengtest site`, permission **Sending access** → copy the key (shown once).
2. Vercel → **Settings** → **Environment Variables** → **Add**:
   - `RESEND_API_KEY` = the key → mark **Sensitive** → Production and Preview.
   - `CONTACT_FROM_EMAIL` = `Site Abeng Law <site@theabenglawfirm.com>` (only once D2 shows *Verified*).
3. Redeploy (as in A3).

Until the domain is verified, leave `CONTACT_FROM_EMAIL` unset: Resend's test sender then delivers **only** to the address
the Resend account was created with. That is why signing up with contact@theabenglawfirm.com matters.

**D4. Let Supabase send its emails through Resend** (invitations, password resets)

Supabase's built-in email only delivers to members of your Supabase organisation and only a few per hour, so staff would not
receive invitations or reset links.
1. Resend → create a second API key named `supabase smtp`.
2. Supabase → **Authentication** → **Emails** → **SMTP Settings** → enable **Custom SMTP**:
   - Sender email: `noreply@theabenglawfirm.com` · Sender name: `The Abeng Law Firm`
   - Host: `smtp.resend.com` · Port: `465` · Username: `resend` · Password: the `supabase smtp` key
3. Save.

**D5. Point the invitation and reset emails at the dashboard** (required for those links to work)

Supabase → **Authentication** → **Emails** → **Templates**. In each template below, replace the link in the message body
(the `href` that contains `{{ .ConfirmationURL }}`) with the address shown, then **Save**:
- **Invite user**: `{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=invite&next=/admin/compte?bienvenue=1`
- **Reset password**: `{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/admin/compte?reinitialisation=1`

These links work even when the email is opened on another device than the one that asked for it. You can also translate
the subject and text of these emails into French on the same screen.

**Where the firm's DNS is:** `theabenglawfirm.com` uses GoDaddy name servers (`ns41/ns42.domaincontrol.com`); its email is
Microsoft 365 with Proofpoint filtering. Add the Resend records in GoDaddy → **My Products** → the domain → **DNS**.
Don't change the existing MX, SPF or Microsoft records. If the first alerts don't arrive, check the Proofpoint quarantine
and allow `theabenglawfirm.com` mail sent through Resend.

### E. Supabase secret key in Vercel (user invitations)

1. Supabase → **Project Settings** → **API Keys** → **Secret keys** → create or reveal one, copy it.
2. Vercel → **Environment Variables**: check whether `SUPABASE_SECRET_KEY` exists. If not, **Add** it, mark **Sensitive**,
   Production and Preview. **Never** add the `NEXT_PUBLIC_` prefix to it.
3. Redeploy.
4. Check: Dashboard → **Utilisateurs**. If the page no longer shows the message about `SUPABASE_SECRET_KEY`, invitations are on.

### F. Change the temporary admin password

1. Open https://abengtest-smoky.vercel.app/admin and sign in with `mrvynitchuelachue@gmail.com` and the temporary password
   stored in `ADMIN_ACCESS.local.md` (in the project folder; that file is never uploaded to GitHub).
2. **Mon compte** → set a new password of 10+ characters → save.
3. Delete `ADMIN_ACCESS.local.md` or remove the password line from it.

### G. Optional: reconnect Supabase for Claude

Claude desktop app → **Settings** → **Connectors** → **Supabase** → disconnect, then connect again and approve access
to the project. Start a new session afterwards. Then Claude can, for example, add the dashboard field for the profile-page
photos (that part is ready but needs one new database column).

---

## 3. Setting up the dashboard on a computer

There is nothing to install: the dashboard is a website.

**On the computer you will use for administration**
1. Open Chrome or Edge, go to https://abengtest-smoky.vercel.app/admin and sign in.
2. Make it feel like an app (optional):
   - Chrome: **⋮** → **Cast, save and share** → **Install page as app…** (or **Create shortcut…** with *Open as window* ticked).
   - Edge: **⋯** → **Apps** → **Install this site as an app**.
   An *Abeng Law administration* icon appears on the desktop and in the Start menu.
3. You stay signed in on that computer until you click **Se déconnecter**. On a shared computer, always sign out.
4. Let the browser's password manager save the password, or use the firm's password manager.

**Giving someone else access**
- **With email working (D + E done):** Dashboard → **Utilisateurs** → enter their email, name and role → **Inviter une personne**.
  They receive an email, click the link, land on **Mon compte** and choose their password.
- **Without email (fallback):**
  1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**: email + password, tick *Auto confirm*.
  2. Copy the new user's **UID**.
  3. Supabase → **Table Editor** → table `staff` → **Insert row**: `user_id` = the UID, `email`, `full_name`, `role` = `admin` or `editor`.
  4. Give them the password in person; they change it in **Mon compte**.

**Roles**
- **Éditeur**: news, profiles, ordering, messages, categories.
- **Administrateur**: everything, plus deleting profiles and categories, and managing users.

An account that exists in Supabase Auth but is **not** in the `staff` table cannot open the dashboard.

---

## 4. Testing the backend and the dashboard

Do this after A–F. Keep two windows open: the dashboard, and the public site in a **private window** (so you see what visitors see).
After each save, refresh the public page.

**Access control**
- [ ] Private window → `/admin` → you are sent to the sign-in page.
- [ ] Wrong password → "Adresse email ou mot de passe incorrect."
- [ ] Correct password → **Tableau de bord** with counts for news, drafts, profiles and unread messages.

**News (Actualités)**
- [ ] **Rédiger une actualité**: French title and text, an image, a category → **Enregistrer le brouillon**.
- [ ] **Aperçu** (available once saved) shows the article as on the site; `/fr/actualites` does **not** list it yet.
- [ ] Add the English version → **Publier** → it appears on `/fr/actualites` and `/en/insights` within seconds.
- [ ] Set a future publication date → status *Programmé*; it stays hidden until that date.
- [ ] Edit the text → the change shows on the site. **Dépublier** → it disappears. Delete → it is gone.

**Team (Équipe)**
- [ ] Edit a biography → the profile page shows the new text.
- [ ] Use the up/down arrows next to a member → the order changes on `/fr/equipe`.
- [ ] **Masquer** a member → they disappear from the team page; **Publier** → they return.
- [ ] Upload a new portrait (JPEG/PNG/WebP, under 10 MB) → it shows on the card and profile.
- [ ] Add a test member as *Masqué*, publish, check, then delete (Administrateur only).

**Categories**
- [ ] Create a category, use it on a draft, rename it, delete it.

**Messages and email**
- [ ] Send a message from `/fr/contact` → it appears in **Messages** with a *Nouveau* badge and the menu counter goes up.
- [ ] The email arrives at contact@theabenglawfirm.com (check spam the first time); **Reply** goes to the sender.
- [ ] Send an application from `/fr/recrutement` → *Candidature* badge; email subject "Nouvelle candidature : <name>".
- [ ] **Marquer comme lu**, **Archiver** (then **Restaurer** from the archive view), delete.

**Users and passwords**
- [ ] Invite a second address as *Éditeur* → the email arrives → the link opens **Mon compte** → set a password.
- [ ] Signed in as that editor: no **Utilisateurs** menu; deleting a profile is refused.
- [ ] **Mot de passe oublié ?** on the sign-in page → email → link → new password works.
- [ ] **Se déconnecter** → back to the sign-in page; `/admin` now asks for sign-in again.

**On a phone**
- [ ] Sign in on a phone; the gold menu button opens the dashboard menu; a news draft can be edited.

If something fails, note the step, the time and any message shown. The Vercel logs (project → **Logs**) show server errors.

---

## 5. Before the real launch

1. Add the final domain in Vercel (**Settings** → **Domains**) and point the DNS to it.
2. Change `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.
3. Redo step B with the final domain (Site URL and redirect URL).
4. Run the test list again on the final domain.
5. Only then replace the current production site (requires your approval).
