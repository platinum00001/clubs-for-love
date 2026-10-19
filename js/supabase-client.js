/* Supabase loader + small shared helpers for Clubs for Love.
 * supabase-js loads from a CDN only when config.js has a URL and publishable key.
 * All queries go to this site's own schema (config SUPABASE_SCHEMA = "clubs4love"). */
(function () {
  const C4L = (window.C4L = window.C4L || {});
  const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js";
  let promise = null, settingsPromise = null;
  const cfg = () => window.C4L_CONFIG || {};
  C4L.cfg = cfg;
  C4L.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  };
  C4L.supabaseConfigured = function () {
    const c = cfg();
    return !!(c.SUPABASE_URL && c.SUPABASE_ANON_KEY && /^https:\/\//.test(c.SUPABASE_URL));
  };
  // Absolute URL of a page in this site (works on the /clubs-for-love/ sub-path).
  C4L.pageURL = function (page) { return new URL(page, location.href).href.split("#")[0].split("?")[0]; };
  C4L.getSupabase = function () {
    if (promise) return promise;
    if (!C4L.supabaseConfigured()) return (promise = Promise.resolve(null));
    promise = new Promise(function (resolve) {
      const s = document.createElement("script");
      s.src = CDN; s.crossOrigin = "anonymous";
      s.onload = function () {
        try {
          const c = cfg();
          resolve(window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
            db: { schema: c.SUPABASE_SCHEMA || "clubs4love" },
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
          }));
        } catch (e) { console.warn(e); resolve(null); }
      };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return promise;
  };
  C4L.getUser = async function () {
    const sb = await C4L.getSupabase();
    if (!sb) return { sb: null, user: null };
    const { data } = await sb.auth.getSession();
    return { sb, user: data && data.session ? data.session.user : null };
  };
  // Which sign-in methods are switched on in Supabase (public endpoint).
  C4L.authSettings = function () {
    if (settingsPromise) return settingsPromise;
    const c = cfg();
    if (!C4L.supabaseConfigured()) return (settingsPromise = Promise.resolve(null));
    settingsPromise = fetch(c.SUPABASE_URL + "/auth/v1/settings", { headers: { apikey: c.SUPABASE_ANON_KEY } })
      .then((r) => (r.ok ? r.json() : null)).catch(() => null);
    return settingsPromise;
  };
  C4L.schemaNotReady = function (error) {
    if (!error) return false;
    return /PGRST106|Invalid schema|schema must be one of/i.test(String(error.message || "") + " " + String(error.code || ""));
  };
  // Plain-language errors (never show raw codes).
  C4L.friendlyError = function (error) {
    if (!error) return "";
    const m = String(error.message || error);
    if (C4L.schemaNotReady(error)) return "Online saving is being switched on. Please use the email option for now.";
    if (/JWT|not authenticated|sign in first/i.test(m)) return "Please sign in again.";
    if (/Failed to fetch|NetworkError/i.test(m)) return "We couldn't reach the server. Check your connection and try again.";
    return m;
  };
})();
