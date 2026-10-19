/* Staff page (admins only): counts, every form with photos, status updates, gift
 * acknowledgments (opens a pre-written email in your own mail app), CSV, and events. */
(function () {
  const C4L = window.C4L, esc = (s) => C4L.esc(s);
  const KIND = { donation: "Gear donation", pickup: "Pickup", request: "Need clubs", affiliate: "Drop site", sponsor: "Round", contact: "Message" };
  const STATUSES = ["new", "contacted", "scheduled", "received", "matched", "closed", "spam"];
  let sb, rows = [];

  function kv(d) {
    return Object.keys(d || {}).filter((k) => d[k] !== false && d[k] !== "").map((k) => k.replace(/_/g, " ") + ": " + (Array.isArray(d[k]) ? d[k].join(", ") : d[k] === true ? "yes" : d[k])).join("\n");
  }
  function ackMail(r) {
    const body = "Hi " + r.name + ",\n\nThank you for your gift to Clubs for Love. This email acknowledges that we received the following on " + new Date().toLocaleDateString() + ":\n\n" +
      ([].concat((r.details || {}).items || []).join(", ") || "golf gear") + "\n\nNo goods or services were provided in exchange for this gift. We do not appraise donated items; any value is for you to determine.\n\nWith thanks,\nClubs for Love — Cape Cod\n" + C4L.email();
    return "mailto:" + encodeURIComponent(r.email) + "?subject=" + encodeURIComponent("Your gift to Clubs for Love — acknowledgment") + "&body=" + encodeURIComponent(body);
  }
  function csv() {
    const head = ["created_at", "kind", "status", "name", "email", "phone", "wants_ack", "ack_sent_at", "details", "photos", "admin_note"];
    const lines = [head].concat(rows.map((r) => [r.created_at, r.kind, r.status, r.name, r.email, r.phone || "", r.wants_ack, r.ack_sent_at || "", kv(r.details).replace(/\n/g, "; "), (r.photo_paths || []).length, r.admin_note || ""]));
    const text = lines.map((l) => l.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = "clubs-for-love-forms.csv"; a.click();
  }

  async function loadStats() {
    const { data, error } = await sb.rpc("admin_stats");
    const el = document.getElementById("stats");
    if (error) { el.textContent = C4L.friendlyError(error); return; }
    const k = data.by_kind || {};
    const items = [["New, not handled", data.open_new], ["Gear donations", k.donation || 0], ["Pickups", k.pickup || 0], ["Need clubs", k.request || 0], ["Drop-site apps", k.affiliate || 0], ["Round offers", k.sponsor || 0], ["Messages", k.contact || 0], ["Acks to send", data.acks_pending], ["Members", data.members], ["Event interest", data.event_interest]];
    el.innerHTML = items.map((i) => '<div class="stat"><b>' + esc(i[1]) + "</b><span>" + esc(i[0]) + "</span></div>").join("");
  }

  async function loadRows() {
    const kind = document.getElementById("f-kind").value, status = document.getElementById("f-status").value;
    let q = sb.from("submissions").select("*").order("created_at", { ascending: false }).limit(300);
    if (kind) q = q.eq("kind", kind);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    const list = document.getElementById("subs");
    if (error) { list.textContent = C4L.friendlyError(error); return; }
    rows = data || [];
    if (!rows.length) { list.innerHTML = '<p class="hint">No forms match.</p>'; return; }
    list.innerHTML = rows.map((r, i) =>
      '<details class="sub" data-i="' + i + '"><summary><span class="pill ' + esc(r.status) + '">' + esc(r.status) + "</span><strong>" + esc(KIND[r.kind] || r.kind) + "</strong> · " + esc(r.name) + ' · <span class="hint">' + esc(new Date(r.created_at).toLocaleString()) + "</span>" + ((r.photo_paths || []).length ? ' · <span class="hint">' + r.photo_paths.length + " photo(s)</span>" : "") + (r.wants_ack && !r.ack_sent_at ? ' · <span class="pill new">ack wanted</span>' : "") + "</summary>" +
      '<p><a href="mailto:' + esc(r.email) + '">' + esc(r.email) + "</a>" + (r.phone ? " · " + esc(r.phone) : "") + (r.user_id ? ' · <span class="hint">member</span>' : ' · <span class="hint">guest</span>') + "</p>" +
      '<pre class="kv">' + esc(kv(r.details) || "(no details)") + '</pre><div class="sub-photos" data-photos></div>' +
      '<div class="two"><div class="field"><label>Status</label><select data-status>' + STATUSES.map((s) => "<option" + (s === r.status ? " selected" : "") + ">" + s + "</option>").join("") + '</select></div>' +
      '<div class="field"><label>Staff note</label><input type="text" data-note maxlength="2000" value="' + esc(r.admin_note || "") + '"></div></div>' +
      '<p><button class="btn sm" data-save>Save</button> ' +
      ((r.kind === "donation" || r.kind === "pickup") ? '<a class="btn sm ghost" href="' + esc(ackMail(r)) + '">Write gift acknowledgment</a> <button class="btn sm ghost" data-acked>' + (r.ack_sent_at ? "Ack sent " + esc(new Date(r.ack_sent_at).toLocaleDateString()) : "Mark ack sent") + "</button> " : "") +
      '<button class="linklike" data-del>Delete</button> <span data-msg class="hint"></span></p></details>').join("");
    list.querySelectorAll("details.sub").forEach((d) => {
      const r = rows[+d.dataset.i], msg = d.querySelector("[data-msg]");
      d.addEventListener("toggle", async () => {
        const box = d.querySelector("[data-photos]");
        if (!d.open || box.dataset.loaded || !(r.photo_paths || []).length) return;
        box.dataset.loaded = 1;
        const { data } = await sb.storage.from(C4L.cfg().PHOTO_BUCKET).createSignedUrls(r.photo_paths, 3600);
        box.innerHTML = (data || []).map((u) => u.signedUrl ? '<a href="' + esc(u.signedUrl) + '" target="_blank" rel="noopener"><img alt="Donation photo" src="' + esc(u.signedUrl) + '"></a>' : "").join("");
      });
      d.querySelector("[data-save]").addEventListener("click", async () => {
        const { error } = await sb.from("submissions").update({ status: d.querySelector("[data-status]").value, admin_note: d.querySelector("[data-note]").value.trim() || null }).eq("id", r.id);
        msg.textContent = error ? C4L.friendlyError(error) : "Saved."; if (!error) loadStats();
      });
      const acked = d.querySelector("[data-acked]");
      if (acked) acked.addEventListener("click", async () => {
        const { error } = await sb.from("submissions").update({ ack_sent_at: new Date().toISOString() }).eq("id", r.id);
        msg.textContent = error ? C4L.friendlyError(error) : "Marked."; if (!error) { acked.textContent = "Ack sent today"; loadStats(); }
      });
      d.querySelector("[data-del]").addEventListener("click", async () => {
        if (!confirm("Delete this form and its photos permanently?")) return;
        if ((r.photo_paths || []).length) await sb.storage.from(C4L.cfg().PHOTO_BUCKET).remove(r.photo_paths);
        const { error } = await sb.from("submissions").delete().eq("id", r.id);
        if (error) msg.textContent = C4L.friendlyError(error); else { loadRows(); loadStats(); }
      });
    });
  }

  async function loadEvents() {
    const { data } = await sb.from("events").select("*").order("sort");
    const el = document.getElementById("ev-list");
    el.innerHTML = (data || []).map((e) => "<tr><td>" + esc(e.title) + "</td><td>" + esc(e.place || "") + "</td><td>" + esc(e.starts_on || e.date_label || "") + '</td><td><button class="linklike" data-pub="' + esc(e.id) + '" data-v="' + (e.published ? 0 : 1) + '">' + (e.published ? "Published — hide" : "Hidden — publish") + '</button> · <button class="linklike" data-evdel="' + esc(e.id) + '">Delete</button></td></tr>').join("");
    el.querySelectorAll("[data-pub]").forEach((b) => b.addEventListener("click", async () => { await sb.from("events").update({ published: b.dataset.v === "1" }).eq("id", b.dataset.pub); loadEvents(); }));
    el.querySelectorAll("[data-evdel]").forEach((b) => b.addEventListener("click", async () => { if (confirm("Delete this event?")) { await sb.from("events").delete().eq("id", b.dataset.evdel); loadEvents(); } }));
  }

  async function init() {
    const area = document.getElementById("staff-area");
    const got = await C4L.getUser(); sb = got.sb;
    if (!sb) { area.innerHTML = '<p class="notice info">Accounts are not switched on.</p>'; return; }
    if (!got.user) { area.innerHTML = '<p class="notice info">Please <a href="account.html">sign in</a> first.</p>'; return; }
    const { data: roles, error } = await sb.rpc("my_roles");
    if (error) { area.innerHTML = '<p class="notice info">' + esc(C4L.friendlyError(error)) + "</p>"; return; }
    if (!roles || !roles.admin) { area.innerHTML = "<p>Signed in as " + esc(got.user.email) + '. This page is for Clubs for Love staff. If you should have access, email <a href="mailto:' + esc(C4L.email()) + '">' + esc(C4L.email()) + "</a>.</p>"; return; }
    area.innerHTML = '<p>Signed in as <strong>' + esc(got.user.email) + '</strong> (admin).</p>' +
      '<section class="card"><h2 style="margin-top:0;font-size:1.4rem">At a glance</h2><div class="stats" id="stats">Loading…</div></section>' +
      '<section class="card" style="margin-top:1rem"><h2 style="margin-top:0;font-size:1.4rem">Forms</h2><div class="two">' +
      '<div class="field"><label for="f-kind">Kind</label><select id="f-kind"><option value="">All</option>' + Object.keys(KIND).map((k) => '<option value="' + k + '">' + esc(KIND[k]) + "</option>").join("") + "</select></div>" +
      '<div class="field"><label for="f-status">Status</label><select id="f-status"><option value="">All</option>' + STATUSES.map((s) => "<option>" + s + "</option>").join("") + "</select></div></div>" +
      '<p><button class="btn sm ghost" id="csv" type="button">Download CSV</button> <button class="btn sm ghost" id="refresh" type="button">Refresh</button></p><div id="subs">Loading…</div></section>' +
      '<section class="card" style="margin-top:1rem"><h2 style="margin-top:0;font-size:1.4rem">Calendar events</h2><div class="table-wrap"><table class="data"><thead><tr><th>Title</th><th>Place</th><th>Date</th><th></th></tr></thead><tbody id="ev-list"></tbody></table></div>' +
      '<form id="ev-add" style="margin-top:1rem"><div class="two"><div class="field"><label for="ev-title">Title</label><input id="ev-title" type="text" required maxlength="120"></div><div class="field"><label for="ev-place">Place</label><input id="ev-place" type="text" maxlength="160"></div>' +
      '<div class="field"><label for="ev-date">Date <span class="opt">optional</span></label><input id="ev-date" type="date"></div><div class="field"><label for="ev-label">Or a label <span class="opt">e.g. Date TBA</span></label><input id="ev-label" type="text" maxlength="60"></div></div>' +
      '<div class="field"><label for="ev-desc">Description <span class="opt">optional</span></label><textarea id="ev-desc" maxlength="1000"></textarea></div><button class="btn sm" type="submit">Add event</button> <span id="ev-msg" class="hint"></span></form></section>';
    document.getElementById("f-kind").addEventListener("change", loadRows);
    document.getElementById("f-status").addEventListener("change", loadRows);
    document.getElementById("refresh").addEventListener("click", () => { loadRows(); loadStats(); });
    document.getElementById("csv").addEventListener("click", csv);
    document.getElementById("ev-add").addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = (id) => document.getElementById(id).value.trim() || null;
      const { error } = await sb.from("events").insert({ title: v("ev-title"), place: v("ev-place"), starts_on: v("ev-date"), date_label: v("ev-label"), description: v("ev-desc") });
      document.getElementById("ev-msg").textContent = error ? C4L.friendlyError(error) : "Added.";
      if (!error) { e.target.reset(); loadEvents(); }
    });
    loadStats(); loadRows(); loadEvents();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
