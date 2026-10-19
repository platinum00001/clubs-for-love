/* Calendar: loads published events from Supabase (static cards in the page are the fallback).
 * Signed-in members can tap "I'm interested"; everyone sees a count (no names). */
(function () {
  const C4L = window.C4L, esc = (s) => C4L.esc(s);
  function fmt(e) {
    if (e.starts_on) return new Date(e.starts_on + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    return e.date_label || "Date TBA";
  }
  async function render() {
    const list = document.getElementById("events");
    const { sb, user } = await C4L.getUser();
    if (!sb) return;
    const [{ data: events, error }, { data: counts }, mine] = await Promise.all([
      sb.from("events").select("id, title, place, starts_on, date_label, description, sort").eq("published", true).order("sort").order("starts_on", { nullsFirst: false }),
      sb.rpc("event_interest_counts"),
      user ? sb.from("event_interest").select("event_id") : Promise.resolve({ data: [] })
    ]);
    if (error || !events || !events.length) return; // keep the static fallback
    const n = {}; (counts || []).forEach((c) => (n[c.event_id] = c.interested));
    const mineSet = new Set(((mine && mine.data) || []).map((m) => m.event_id));
    list.innerHTML = events.map((e) =>
      '<div class="card"><p class="eyebrow">' + esc(e.title) + "</p><h3>" + esc(e.place || "Place TBA") + '</h3><p class="muted">' + esc(fmt(e)) + "</p>" +
      (e.description ? "<p>" + esc(e.description) + "</p>" : "") +
      '<p class="hint">' + (n[e.id] ? esc(n[e.id]) + " interested" : "Be the first to say you're interested") + "</p>" +
      (user ? '<button class="btn sm ' + (mineSet.has(e.id) ? "ghost" : "") + '" data-ev="' + esc(e.id) + '" data-on="' + (mineSet.has(e.id) ? 1 : 0) + '">' + (mineSet.has(e.id) ? "✓ Interested — undo" : "I'm interested") + "</button>"
            : '<a class="btn sm ghost" href="account.html">Sign in to say you\'re interested</a>') + "</div>").join("");
    list.querySelectorAll("[data-ev]").forEach((b) => b.addEventListener("click", async () => {
      b.disabled = true;
      const r = b.dataset.on === "1" ? await sb.from("event_interest").delete().eq("event_id", b.dataset.ev).eq("user_id", user.id)
                                     : await sb.from("event_interest").insert({ event_id: b.dataset.ev });
      if (r.error) { b.disabled = false; alert(C4L.friendlyError(r.error)); return; }
      render();
    }));
  }
  document.addEventListener("DOMContentLoaded", render);
})();
