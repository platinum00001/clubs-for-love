/* Member accounts (Supabase Auth): email link, password, Google / Facebook ("coming soon" until
 * switched on), plus profile, my forms, my event interest, and delete-my-data. */
(function () {
  const C4L = window.C4L;
  const esc = (s) => C4L.esc(s);
  const ACCOUNT_URL = () => C4L.pageURL("account.html");
  const KIND = { donation: "Gear donation", pickup: "Pickup", request: "Need clubs", affiliate: "Drop site", sponsor: "Round", contact: "Message" };
  const STATUS = { new: "Received by site", contacted: "We wrote you", scheduled: "Scheduled", received: "Gear received", matched: "Matched", closed: "Closed", spam: "Closed" };
  const PROVIDERS = { google: "Google", facebook: "Facebook" };
  let recoveryMode = false;

  function urlAuthError() {
    const q = new URLSearchParams(location.search), h = new URLSearchParams(location.hash.replace(/^#/, ""));
    const d = h.get("error_description") || q.get("error_description");
    if (!d) return "";
    history.replaceState(null, "", location.pathname);
    if (/provider is not enabled|Unsupported provider/i.test(d)) return "That sign-in option isn't switched on yet. Please use email for now.";
    if (/expired|invalid/i.test(d)) return "That sign-in link has expired or was already used. Please request a new one.";
    return d.replace(/\+/g, " ");
  }
  function googleIcon() { return '<svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'; }
  function fbIcon() { return '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>'; }
  function friendlyAuth(error) {
    const m = String(error.message || "");
    if (/rate limit|too many/i.test(m)) return "Too many tries — please wait a few minutes and try again.";
    if (/Invalid login credentials/i.test(m)) return "That email and password don't match. Try the email link instead?";
    if (/Email not confirmed/i.test(m)) return "Please confirm your email first (check your inbox), or use the email link.";
    if (/sending.*email|confirmation email/i.test(m)) return "We couldn't send the email right now. Please try again later, or write " + C4L.email() + ".";
    return m;
  }

  function localList() {
    const list = C4L.localDonations ? C4L.localDonations() : [];
    return '<section class="card" id="on-this-phone" style="margin-top:1rem"><h2 style="margin-top:0;font-size:1.4rem">Saved on this phone</h2>' +
      (list.length ? '<ul>' + list.map((d) => "<li>" + esc(new Date(d.at).toLocaleDateString()) + " — " + esc(KIND[d.kind] || d.kind) + (d.items && d.items.length ? ": " + esc([].concat(d.items).join(", ")) : "") + (d.date ? " · " + esc(d.date) : "") + "</li>").join("") + "</ul>" +
        '<button class="linklike" id="clear-local" type="button">Clear this list</button>'
        : '<p class="hint">Nothing yet. When you tick “Save this donation” on a gear form, a copy stays here on this device only.</p>') + "</section>";
  }
  function hookLocal() {
    const b = document.getElementById("clear-local");
    if (b) b.addEventListener("click", () => { C4L.clearLocalDonations(); render(); });
  }

  function authForm(area, sb, notice) {
    area.innerHTML =
      (notice ? '<p class="notice info" role="alert">' + esc(notice) + "</p>" : "") +
      '<section class="card"><h2 style="margin-top:0;font-size:1.5rem">Sign in or create a free account</h2>' +
      '<p class="hint">You never need an account to give gear or ask for clubs. An account lets you see the forms you sent, follow events, and keep your details handy.</p>' +
      '<div class="oauth-row">' + Object.keys(PROVIDERS).map((p) => '<button type="button" class="btn oauth" data-provider="' + p + '">' + (p === "google" ? googleIcon() : fbIcon()) + "<span>Continue with " + PROVIDERS[p] + '</span><span class="soon" hidden>Soon</span></button>').join("") + "</div>" +
      '<p id="oauth-msg" class="hint" role="status"></p>' +
      '<div class="divider"><span>or use your email</span></div>' +
      '<form id="magic"><div class="field"><label for="ml-email">Email</label><input id="ml-email" type="email" autocomplete="email" required></div>' +
      '<button class="btn" type="submit">Email me a sign-in link</button> <span id="ml-msg" class="hint" role="status"></span>' +
      '<p class="hint">No password needed. New here? The link creates your account.</p></form></section>' +
      '<div class="grid g2" style="margin-top:1rem"><form id="signin" class="card"><h2 style="margin-top:0;font-size:1.3rem">Sign in with a password</h2>' +
      '<div class="field"><label for="si-email">Email</label><input id="si-email" type="email" autocomplete="email" required></div>' +
      '<div class="field"><label for="si-pass">Password</label><input id="si-pass" type="password" autocomplete="current-password" required></div>' +
      '<button class="btn" type="submit">Sign in</button> <button class="linklike" type="button" id="forgot">Forgot password?</button><p id="si-msg" class="hint" role="status"></p></form>' +
      '<form id="signup" class="card"><h2 style="margin-top:0;font-size:1.3rem">Create an account with a password</h2>' +
      '<div class="field"><label for="su-email">Email</label><input id="su-email" type="email" autocomplete="email" required></div>' +
      '<div class="field"><label for="su-pass">Password (8+ characters)</label><input id="su-pass" type="password" minlength="8" autocomplete="new-password" required></div>' +
      '<label class="choice"><input type="checkbox" id="su-terms" required><span>I agree to the <a href="terms.html">terms</a> and <a href="privacy.html">privacy policy</a>.</span></label>' +
      '<p style="margin-top:12px"><button class="btn" type="submit">Create account</button></p><p id="su-msg" class="hint" role="status"></p></form></div>' +
      '<p class="hint" style="margin-top:1rem">Creating an account does <strong>not</strong> sign you up for any emails. Using Google or Facebook with the same email opens the same account.</p>' + localList();
    hookLocal();
    // Mark providers that aren't switched on yet as "Soon".
    C4L.authSettings().then(function (st) {
      if (!st || !st.external) return;
      area.querySelectorAll("[data-provider]").forEach((b) => { if (!st.external[b.dataset.provider]) b.querySelector(".soon").hidden = false; });
    });
    area.querySelectorAll("[data-provider]").forEach((b) => b.addEventListener("click", async () => {
      const p = b.getAttribute("data-provider"), msg = document.getElementById("oauth-msg");
      const st = await C4L.authSettings();
      if (st && st.external && !st.external[p]) { msg.textContent = PROVIDERS[p] + " sign-in is coming soon. For now, please use the email link or a password below."; return; }
      msg.textContent = "Opening " + PROVIDERS[p] + "…";
      const { error } = await sb.auth.signInWithOAuth({ provider: p, options: { redirectTo: ACCOUNT_URL() } });
      if (error) msg.textContent = /not enabled|Unsupported provider/i.test(error.message) ? PROVIDERS[p] + " sign-in is coming soon. Please use email for now." : error.message;
    }));
    document.getElementById("magic").addEventListener("submit", async (e) => {
      e.preventDefault();
      const m = document.getElementById("ml-msg"); m.textContent = "Sending…";
      const { error } = await sb.auth.signInWithOtp({ email: document.getElementById("ml-email").value.trim(), options: { emailRedirectTo: ACCOUNT_URL(), shouldCreateUser: true } });
      m.textContent = error ? friendlyAuth(error) : "Check your email for a sign-in link (check spam too).";
    });
    document.getElementById("signin").addEventListener("submit", async (e) => {
      e.preventDefault();
      const { error } = await sb.auth.signInWithPassword({ email: document.getElementById("si-email").value.trim(), password: document.getElementById("si-pass").value });
      document.getElementById("si-msg").textContent = error ? friendlyAuth(error) : "Signed in.";
      if (!error) render();
    });
    document.getElementById("forgot").addEventListener("click", async () => {
      const email = document.getElementById("si-email").value.trim(), m = document.getElementById("si-msg");
      if (!email) { m.textContent = "Type your email above first, then tap “Forgot password?”."; return; }
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: ACCOUNT_URL() });
      m.textContent = error ? friendlyAuth(error) : "If that email has an account, we sent a link to set a new password.";
    });
    document.getElementById("signup").addEventListener("submit", async (e) => {
      e.preventDefault();
      const { data, error } = await sb.auth.signUp({ email: document.getElementById("su-email").value.trim(), password: document.getElementById("su-pass").value, options: { emailRedirectTo: ACCOUNT_URL() } });
      document.getElementById("su-msg").textContent = error ? friendlyAuth(error) : (data.session ? "Account created — you're signed in." : "Check your email to confirm your account, then sign in.");
      if (!error && data.session) render();
    });
  }

  function recoveryForm(area, sb) {
    area.innerHTML = '<form id="newpass" class="card"><h2 style="margin-top:0">Set a new password</h2>' +
      '<div class="field"><label for="np">New password (8+ characters)</label><input id="np" type="password" minlength="8" autocomplete="new-password" required></div>' +
      '<button class="btn" type="submit">Save new password</button> <span id="np-msg" role="status"></span></form>';
    document.getElementById("newpass").addEventListener("submit", async (e) => {
      e.preventDefault();
      const { error } = await sb.auth.updateUser({ password: document.getElementById("np").value });
      document.getElementById("np-msg").textContent = error ? friendlyAuth(error) : "Password updated.";
      if (!error) { recoveryMode = false; setTimeout(render, 800); }
    });
  }

  async function dashboard(area, sb, user) {
    const head = '<p>Signed in as <strong>' + esc(user.email) + '</strong>. <button class="btn sm ghost" id="signout">Sign out</button> <span id="staff-link"></span></p>';
    // Create this site's profile row on first sign-in (no trigger on the shared login table).
    const up = await sb.from("profiles").upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });
    if (up.error) {
      area.innerHTML = head + '<p class="notice info">' + esc(C4L.friendlyError(up.error)) + "</p>" + localList();
      document.getElementById("signout").addEventListener("click", async () => { await sb.auth.signOut(); render(); });
      hookLocal(); return;
    }
    const [{ data: p }, { data: subs }, { data: interest }, { data: roles }] = await Promise.all([
      sb.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      sb.from("submissions").select("id, kind, status, created_at, details").order("created_at", { ascending: false }).limit(50),
      sb.from("event_interest").select("event_id, created_at, events(title, place, date_label, starts_on)").order("created_at", { ascending: false }),
      sb.rpc("my_roles")
    ]);
    const prof = p || {};
    const roleOpts = [["", "—"], ["donor", "I give gear"], ["golfer", "I'm in recovery and want to play"], ["coach", "Coach"], ["house", "Sober house / program"], ["business", "Course, shop or simulator"], ["volunteer", "Volunteer"]];
    area.innerHTML = head +
      '<form id="profile" class="card"><h2 style="margin-top:0;font-size:1.4rem">My details</h2><div class="two">' +
      '<div class="field"><label for="p-name">First name or nickname <span class="opt">optional</span></label><input id="p-name" type="text" maxlength="80" value="' + esc(prof.display_name || "") + '"></div>' +
      '<div class="field"><label for="p-town">Town <span class="opt">optional</span></label><input id="p-town" type="text" maxlength="60" value="' + esc(prof.town || "") + '"></div>' +
      '<div class="field"><label for="p-role">I am… <span class="opt">optional</span></label><select id="p-role">' + roleOpts.map((o) => '<option value="' + o[0] + '"' + (prof.role === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>").join("") + "</select></div>" +
      '<div class="field"><label for="p-phone">Phone <span class="opt">optional</span></label><input id="p-phone" type="tel" maxlength="30" value="' + esc(prof.phone || "") + '"></div></div>' +
      '<button class="btn" type="submit">Save</button> <span id="p-msg" class="hint" role="status"></span></form>' +
      '<section class="card" style="margin-top:1rem"><h2 style="margin-top:0;font-size:1.4rem">Forms I sent while signed in</h2>' +
      ((subs && subs.length) ? '<div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>What</th><th>Status</th><th></th></tr></thead><tbody>' + subs.map((s) =>
        "<tr><td>" + esc(new Date(s.created_at).toLocaleDateString()) + "</td><td>" + esc(KIND[s.kind] || s.kind) + (s.details && s.details.items ? ": " + esc([].concat(s.details.items).join(", ")) : "") + '</td><td><span class="pill ' + esc(s.status) + '">' + esc(STATUS[s.status] || s.status) + '</span></td><td><button class="linklike del-sub" data-id="' + esc(s.id) + '">Delete</button></td></tr>').join("") + "</tbody></table></div>"
        : '<p class="hint">None yet. <a href="donate.html">Donate gear</a>, <a href="pickup.html">book a pickup</a> or <a href="request.html">ask for clubs</a> while signed in and they show up here.</p>') + "</section>" +
      '<section class="card" style="margin-top:1rem"><h2 style="margin-top:0;font-size:1.4rem">Events I\'m interested in</h2>' +
      ((interest && interest.length) ? "<ul>" + interest.map((i) => "<li>" + esc(i.events ? i.events.title : "Event") + (i.events ? " — " + esc(i.events.place || "") + ", " + esc(i.events.starts_on || i.events.date_label || "") : "") + "</li>").join("") + "</ul>" : '<p class="hint">None yet. See the <a href="calendar.html">calendar</a>.</p>') + "</section>" +
      localList() +
      '<section class="card" style="margin-top:1rem" id="delete"><h2 style="margin-top:0;font-size:1.4rem">Delete my data</h2><p>This permanently deletes your Clubs for Love profile, the forms you sent while signed in, and your event interest.</p>' +
      '<button class="btn sm ghost" id="wipe">Delete all my Clubs for Love data</button> <span id="wipe-msg" role="status"></span>' +
      '<p class="hint">To also close the login itself, or to remove forms you sent as a guest, email <a data-email href="#"></a>. See <a href="privacy.html#data-deletion">data deletion</a>.</p></section>';
    area.querySelectorAll("[data-email]").forEach((a) => { a.href = "mailto:" + C4L.email(); a.textContent = C4L.email(); });
    if (roles && roles.admin) document.getElementById("staff-link").innerHTML = '<a class="btn sm" href="staff.html">Staff page</a>';
    document.getElementById("signout").addEventListener("click", async () => { await sb.auth.signOut(); render(); });
    document.getElementById("profile").addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = (id) => document.getElementById(id).value.trim() || null;
      const { error } = await sb.from("profiles").update({ display_name: v("p-name"), town: v("p-town"), role: v("p-role"), phone: v("p-phone") }).eq("id", user.id);
      document.getElementById("p-msg").textContent = error ? "Couldn't save: " + C4L.friendlyError(error) : "Saved.";
    });
    area.querySelectorAll(".del-sub").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Delete this form from your account? If we have not handled it yet, we may not see it.")) return;
      await sb.from("submissions").delete().eq("id", b.dataset.id); render();
    }));
    hookLocal();
    document.getElementById("wipe").addEventListener("click", async () => {
      if (!confirm("Delete ALL your Clubs for Love data? This cannot be undone.")) return;
      const { error } = await sb.rpc("delete_my_data");
      if (error) { document.getElementById("wipe-msg").textContent = "Couldn't delete: " + C4L.friendlyError(error); return; }
      await sb.auth.signOut(); render("Your Clubs for Love data was deleted and you are signed out.");
    });
  }

  async function render(notice) {
    const area = document.getElementById("account-area");
    const { sb, user } = await C4L.getUser();
    if (!sb) { area.innerHTML = '<div class="notice info"><strong>Accounts are coming soon.</strong> You can still give gear, book a pickup, or ask for clubs — no login needed.</div>' + localList(); hookLocal(); return; }
    if (!C4L._authHooked) {
      C4L._authHooked = true;
      sb.auth.onAuthStateChange((evt) => { if (evt === "PASSWORD_RECOVERY") { recoveryMode = true; recoveryForm(area, sb); } });
    }
    if (recoveryMode) return recoveryForm(area, sb);
    if (!user) authForm(area, sb, typeof notice === "string" ? notice : urlAuthError()); else dashboard(area, sb, user);
  }
  document.addEventListener("DOMContentLoaded", () => render());
})();
