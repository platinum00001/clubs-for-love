/*
 * Clubs for Love — public site configuration (edit here, nowhere else).
 * The Supabase URL and publishable key are PUBLIC by design: security is enforced by
 * Row Level Security in supabase/schema.sql. NEVER put a service_role / secret key here.
 * Clear SUPABASE_URL to run the site with accounts switched off (forms fall back to email).
 */
window.C4L_CONFIG = {
  SUPABASE_URL: "https://oiousqgzqcjanikglkxl.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_IJHa5taHcttV2DSZq45fWQ_bVbRDbA2", // publishable key (safe to publish)
  SUPABASE_SCHEMA: "clubs4love",     // this site's own schema in the shared "james-sites" project
  PHOTO_BUCKET: "clubs4love-photos", // private bucket: public can upload, only admins can view
  SITE_URL: "https://platinum00001.github.io/clubs-for-love/",

  // The one inbox for the whole site. NOTE: clubs4lovema@gmail.com is being created by James;
  // until it exists, mail sent to it will bounce. Change it here and every page follows.
  CONTACT_EMAIL: "clubs4lovema@gmail.com",

  // TODO(James): social accounts are NOT created yet. Paste the full profile URL once each
  // account exists; empty entries show as "coming soon" (see docs/SETUP.md for suggested handles).
  SOCIAL: {
    instagram: "", // TODO e.g. https://www.instagram.com/clubs4love/
    facebook: "",  // TODO e.g. https://www.facebook.com/clubs4love
    x: ""          // TODO e.g. https://x.com/clubs4love
  }
};
