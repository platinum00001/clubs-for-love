# Clubs for Love — setup and James's manual steps

Live site: https://platinum00001.github.io/clubs-for-love/
Repo: https://github.com/platinum00001/clubs-for-love
Database: Supabase project **james-sites** (`oiousqgzqcjanikglkxl`), schema **`clubs4love`**
Photos: private storage bucket **`clubs4love-photos`** (public can upload, only admins can view)
Contact email (one constant in `config.js` → `CONTACT_EMAIL`): **clubs4lovema@gmail.com**
> That Gmail account is being created by James. Until it exists, mail to it bounces. If the
> address changes, edit `CONTACT_EMAIL` in `config.js` — every page picks it up.

The site works today without any of the steps below: every form falls back to a pre-filled email
to the contact address. Steps 1–2 switch on online saving, accounts and the staff page.

---

## 1. Expose the `clubs4love` schema (required — 1 minute)

Until this is done, the database answers **406 / "Invalid schema: clubs4love"** and the forms use
the email fallback. (This is the only expected error in the browser console.)

1. Open https://supabase.com/dashboard/project/oiousqgzqcjanikglkxl/integrations/data_api/overview
   (Project Settings → Data API).
2. Under **Exposed schemas**, add `clubs4love` (keep `public`, `graphql_public`, and add
   `milestones` and `rtr_app` too if they aren't there yet — the other two apps need them).
3. Save.

## 2. Add the sign-in redirect URL (required for login links)

1. Open https://supabase.com/dashboard/project/oiousqgzqcjanikglkxl/auth/url-configuration
2. Under **Redirect URLs**, add: `https://platinum00001.github.io/clubs-for-love/**`
3. Save. **Do not change the Site URL** — it's shared with the other sites.

## 3. Make yourself an admin (for the Staff page)

Sign in once on https://platinum00001.github.io/clubs-for-love/account.html, then run in the
Supabase SQL editor (replace the email):

```sql
insert into clubs4love.admins (user_id, note)
select id, 'James' from auth.users where email = 'clubs4lovema@gmail.com'
on conflict do nothing;
```

The **Staff page** (`staff.html`) then shows: counts, every form with its photos, status updates
(new → contacted → scheduled → received → matched → closed), a one-tap pre-written gift
acknowledgment email (opens in your own mail app), "mark ack sent", CSV download, and calendar
events (add / hide / delete).

Remove an admin: `delete from clubs4love.admins where user_id = (select id from auth.users where email = '…');`

## 4. Google and Facebook sign-in (optional — same project-wide setup as the other apps)

The buttons already show on the account page with a **"Soon"** tag and a friendly "coming soon"
message. They turn on automatically once the providers are enabled — and one setup covers
Clubs for Love, Root to Rise app and Recovery Milestones because they share the project.

**Google**
1. https://console.cloud.google.com/apis/credentials → Create credentials → OAuth client ID → Web application.
2. Authorized redirect URI: `https://oiousqgzqcjanikglkxl.supabase.co/auth/v1/callback`
3. OAuth consent screen: app name, support email, add the privacy URL
   `https://platinum00001.github.io/clubs-for-love/privacy.html` (or the shared one you use).
4. Paste the Client ID and Secret in Supabase → Authentication → Sign In / Providers → Google → Enable.

**Facebook**
1. https://developers.facebook.com/apps → Create app → "Authenticate and request data from users with Facebook Login".
2. Facebook Login → Settings → Valid OAuth Redirect URI: `https://oiousqgzqcjanikglkxl.supabase.co/auth/v1/callback`
3. App settings → Basic: Privacy Policy URL `https://platinum00001.github.io/clubs-for-love/privacy.html`,
   User data deletion → "Data deletion instructions URL":
   `https://platinum00001.github.io/clubs-for-love/privacy.html#data-deletion`
4. Paste the App ID and Secret in Supabase → Authentication → Providers → Facebook → Enable. Switch the app to Live.

## 5. Email sending via Resend (recommended)

Supabase's built-in email is rate-limited (a few per hour) and only meant for testing — sign-in
links and password resets will fail under real use until a custom SMTP sender is set.
1. Create a free account at https://resend.com (3,000 emails/month free) and verify a domain you own.
2. Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP:
   host `smtp.resend.com`, port `465`, user `resend`, password = your Resend API key,
   sender e.g. `Clubs for Love <hello@yourdomain>`.
3. One SMTP setting covers all the apps in this project.

The site itself sends **no** emails. Gift acknowledgments are written from the Staff page into
your own mail app. (A future step could email new-form alerts to the inbox automatically.)

## 6. Reserve social handles (James — do not let anyone else create these)

Suggested, in order of preference. Checked October 19, 2026:

| Handle | X (checked via X API) | Facebook | Instagram |
|---|---|---|---|
| `clubs4love` | **Available** (no account) | No public page found* | Unknown* |
| `clubsforlove` | **Available** | No public page found* | Unknown* |
| `clubs4lovema` | **Available** | No public page found* | Unknown* |
| `clubs4lovecc` | **Available** | — | — |
| `clubs4lovecapecod` (too long for X's 15-char limit) | n/a | No public page found* | Unknown* |

\* Facebook and Instagram hide profile pages behind a login for automated checks, so these are
not certain. Try the handle in each app's sign-up screen.

When an account exists, paste its full URL into `SOCIAL` in `config.js` (e.g.
`instagram: "https://www.instagram.com/clubs4love/"`). The footer's "Follow" buttons switch from
"soon" to live links. Use `og.jpg` (1200×630) as the first post / cover image and
`images/icon-512.png` as the profile picture.

## 7. Housekeeping

- One 8×8-pixel test image was uploaded while testing the photo bucket:
  `clubs4love-photos/submissions/00000000-0000-4000-8000-c4c4c4c4c4c4/1.jpg`. Supabase blocks deleting
  it with SQL; delete it from Storage in the dashboard when convenient (harmless if left).
- Security advisors: no ERRORs. Once the schema is exposed you may see WARNs that
  `clubs4love.is_admin`, `health` and `event_interest_counts` are callable by the public — that is
  intentional (they reveal only true/false, a version string, and per-event counts).
- Spam guard: hidden honeypot field, max 6 forms per email per hour, max 120 forms per 10 minutes
  site-wide, 12 photos per form, 8 MB per photo, images only.

## Schema summary (`supabase/schema.sql`, safe to re-run)

| Table | Who can do what |
|---|---|
| `submissions` | Anyone: insert (status forced to `new`). Member: read/delete own (sent while signed in). Admin: read/update/delete all. |
| `profiles` | Member: own row (created on first sign-in by the site — no trigger on `auth.users`). Admin: read. |
| `events` | Anyone: read published. Admin: manage. Seeded with the three "Date TBA" events. |
| `event_interest` | Member: add/remove own "I'm interested". Public sees counts only via `event_interest_counts()`. |
| `admins` | Managed in the SQL editor only. |

Functions: `health()`, `my_roles()`, `admin_stats()`, `delete_my_data()`, `event_interest_counts()`.
RLS test: `tests/rls.test.sql` (run in the SQL editor; it rolls itself back and reports
`RLS TEST RESULT: ALL PASS (30 checks)`).
