/* Every form on the site: saves to Supabase (clubs4love.submissions), with photos going to the
 * private "clubs4love-photos" bucket. No login needed. If online saving isn't available, the
 * sender gets a one-tap email to the site inbox with the same details instead. */
(function () {
  const C4L = window.C4L;
  const esc = (s) => C4L.esc(s);
  const LOCAL_KEY = "c4l_saved_donations";
  const KIND_LABEL = { donation: "Gear donation", pickup: "Pickup request", request: "Need clubs", affiliate: "Drop site application", sponsor: "Donate / sponsor a round", contact: "Message" };

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
  }
  // Shrink big phone photos before upload (keeps uploads quick; HEIC etc. upload as-is).
  function shrink(file) {
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 600000) return resolve(file);
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        const max = 1800, r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob((b) => resolve(b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file), "image/jpeg", 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function setupPhotos(form) {
    const box = form.querySelector("[data-photos]");
    if (!box) return null;
    const files = [];
    const thumbs = box.querySelector(".thumbs"), empty = thumbs.innerHTML;
    function draw() {
      if (!files.length) { thumbs.innerHTML = empty; return; }
      thumbs.innerHTML = files.map((f, i) => '<div class="thumb"><img alt="Photo ' + (i + 1) + '" src="' + f.url + '"><button type="button" aria-label="Remove photo ' + (i + 1) + '" data-rm="' + i + '">×</button></div>').join("") +
        '<span>' + files.length + " photo" + (files.length > 1 ? "s" : "") + " ready</span>";
      thumbs.querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", () => { const f = files.splice(+b.dataset.rm, 1)[0]; URL.revokeObjectURL(f.url); draw(); }));
    }
    box.querySelectorAll("input[type=file]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        Array.from(inp.files || []).forEach(function (f) {
          if (!/^image\//.test(f.type) && !/\.(heic|heif)$/i.test(f.name)) return;
          if (files.length >= 12) return;
          if (f.size > 25 * 1024 * 1024) return;
          files.push({ file: f, url: URL.createObjectURL(f) });
        });
        inp.value = ""; draw();
      });
    });
    box.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => box.querySelector("#" + b.dataset.pick).click()));
    files.clear = function () { files.forEach((f) => URL.revokeObjectURL(f.url)); files.splice(0, files.length); draw(); };
    return files;
  }

  function collect(form) {
    const fd = new FormData(form), details = {};
    const top = { name: "", email: "", phone: "" };
    for (const [k, v] of fd.entries()) {
      if (v instanceof File || k === "website") continue;
      const val = String(v).trim();
      if (k in top) { top[k] = val; continue; }
      if (!val) continue;
      if (details[k] !== undefined) details[k] = [].concat(details[k], val); else details[k] = val;
    }
    form.querySelectorAll("input[type=checkbox][data-multi]").forEach((c) => { if (!Array.isArray(details[c.name]) && details[c.name] !== undefined) details[c.name] = [details[c.name]]; });
    form.querySelectorAll("input[type=checkbox]:not([data-multi])").forEach((c) => { details[c.name] = c.checked; });
    return { top, details };
  }

  function summaryText(kind, top, details, photoCount) {
    const lines = [KIND_LABEL[kind] + " — Clubs for Love", "", "Name: " + top.name, "Email: " + top.email];
    if (top.phone) lines.push("Phone: " + top.phone);
    Object.keys(details).forEach((k) => { const v = details[k]; if (v === false) return; lines.push(k.replace(/_/g, " ") + ": " + (Array.isArray(v) ? v.join(", ") : v === true ? "yes" : v)); });
    if (photoCount) lines.push("", "(" + photoCount + " photo" + (photoCount > 1 ? "s" : "") + " — please attach to this email)");
    return lines.join("\n");
  }

  function mailtoFallback(kind, top, details, photoCount) {
    const body = summaryText(kind, top, details, photoCount);
    return "mailto:" + C4L.email() + "?subject=" + encodeURIComponent(KIND_LABEL[kind] + " — " + top.name) + "&body=" + encodeURIComponent(body.slice(0, 1800));
  }

  function saveLocal(kind, top, details, id) {
    try {
      const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      list.unshift({ id: id || null, kind, at: new Date().toISOString(), name: top.name, items: details.items || [], collect: details.collect || "", town: details.town || "", date: details.date || "" });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 30)));
    } catch (e) {}
  }
  C4L.localDonations = function () { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch (e) { return []; } };
  C4L.clearLocalDonations = function () { try { localStorage.removeItem(LOCAL_KEY); } catch (e) {} };

  function init(form) {
    const kind = form.dataset.kind, files = setupPhotos(form);
    const status = form.querySelector(".form-status"), btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      status.innerHTML = "";
      if (form.querySelector("[name=website]") && form.querySelector("[name=website]").value) { form.reset(); status.innerHTML = '<div class="notice ok">Thank you — sent.</div>'; return; }
      const { top, details } = collect(form);
      // Gear forms: need at least one photo, and a photo for each kind of gear is asked for.
      if (files && form.dataset.needPhoto !== undefined && !files.length) {
        status.innerHTML = '<div class="notice err">Please add at least one photo of what you are giving.</div>';
        form.querySelector("[data-photos]").scrollIntoView({ behavior: "smooth", block: "center" }); return;
      }
      if (form.querySelector("[data-require-one]")) {
        const g = form.querySelector("[data-require-one]");
        if (!g.querySelector("input:checked")) { status.innerHTML = '<div class="notice err">' + esc(g.dataset.requireOne) + "</div>"; g.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      }
      btn.disabled = true; const label = btn.textContent; btn.textContent = "Sending…";
      const fallback = mailtoFallback(kind, top, details, files ? files.length : 0);
      let saved = false, errMsg = "";
      try {
        const { sb } = await C4L.getUser();
        if (!sb) throw new Error("offline");
        // Make sure the database is reachable before uploading any photos (avoids orphan uploads).
        const hc = await sb.rpc("health");
        if (hc.error) throw hc.error;
        const folder = "submissions/" + uuid() + "/", paths = [];
        if (files && files.length) {
          btn.textContent = "Uploading photos…";
          for (let i = 0; i < files.length; i++) {
            const f = await shrink(files[i].file);
            const ext = ((f.name.match(/\.(\w{1,5})$/) || [])[1] || "jpg").toLowerCase();
            const p = folder + (i + 1) + "." + ext;
            const up = await sb.storage.from(C4L.cfg().PHOTO_BUCKET).upload(p, f, { contentType: f.type || "image/jpeg", upsert: false });
            if (up.error) throw up.error;
            paths.push(p);
          }
          btn.textContent = "Sending…";
        }
        const row = { kind, name: top.name, email: top.email, phone: top.phone || null, details, photo_paths: paths, wants_ack: !!details.acknowledgment };
        const { error } = await sb.from("submissions").insert(row);
        if (error) throw error;
        saved = true;
      } catch (err) {
        errMsg = err && err.message === "offline" ? "" : C4L.friendlyError(err);
        if (err && err.message !== "offline") console.warn("Submission not saved online:", err.message || err);
      }
      btn.disabled = false; btn.textContent = label;
      if (details.save_local) saveLocal(kind, top, details);
      if (saved) {
        status.innerHTML = '<div class="notice ok" role="status"><strong>Thank you — it\'s in.</strong> ' + esc(form.dataset.thanks || "We'll write you at " + top.email + ".") +
          (details.save_local ? " A copy is saved on this phone (see <a href=\"account.html#on-this-phone\">My account</a>)." : "") + "</div>";
        form.reset(); if (files) files.clear();
      } else {
        status.innerHTML = '<div class="notice info" role="status"><strong>Almost done.</strong> ' + (errMsg ? esc(errMsg) + " " : "") +
          'Tap below to send this by email to ' + esc(C4L.email()) + (files && files.length ? " — please attach your photos to the email." : ".") +
          '<p style="margin:.6rem 0 0"><a class="btn sm" href="' + esc(fallback) + '">Send by email</a></p></div>';
      }
      status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
  document.addEventListener("DOMContentLoaded", function () { document.querySelectorAll("form.c4l[data-kind]").forEach(init); });
})();
