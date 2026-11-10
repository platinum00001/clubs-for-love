/* Clubs for Love — client-side FAQ chat. No network, no tracking, no AI. */
(function () {
  const DATA = window.C4L_FAQ;
  if (!DATA) return;

  const STOP = new Set("a an the to for of in on at is are am was were be do does did can i we you they my your our how what when where why who whom which that this it me and or if so just please".split(" "));

  function email() {
    try {
      if (window.C4L && typeof C4L.email === "function") return C4L.email();
    } catch (e) {}
    return (window.C4L_CONFIG || {}).CONTACT_EMAIL || "";
  }

  function fill(s) {
    return String(s == null ? "" : s).replace(/\{email\}/g, email());
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9+#]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokensOf(s) {
    return normalize(s).split(" ").filter(Boolean);
  }

  function hasPhrase(q, phrase) {
    const p = normalize(phrase);
    return p ? (" " + q + " ").indexOf(" " + p + " ") !== -1 || q.indexOf(p) !== -1 : false;
  }

  function hasToken(tokenSet, word) {
    const w = normalize(word);
    return w && tokenSet.has(w);
  }

  function scoreTopic(q, tokenSet, topic) {
    let s = 0;
    (topic.phrases || []).forEach(function (phrase) {
      if (hasPhrase(q, phrase)) s += 5;
    });
    (topic.keywords || []).forEach(function (kw) {
      const k = normalize(kw);
      if (!k) return;
      if (k.indexOf(" ") !== -1) {
        if (hasPhrase(q, k)) s += 3;
      } else if (tokenSet.has(k)) {
        s += STOP.has(k) ? 0 : 2;
      }
    });
    (topic.negative || []).forEach(function (neg) {
      const n = normalize(neg);
      if (!n) return;
      if (n.indexOf(" ") !== -1 ? hasPhrase(q, n) : tokenSet.has(n)) s -= 4;
    });
    return s;
  }

  function matchTopic(query) {
    const q = normalize(query);
    if (!q) return null;
    const tokenSet = new Set(tokensOf(q));
    let best = null;
    let bestScore = 0;
    (DATA.topics || []).forEach(function (topic) {
      const s = scoreTopic(q, tokenSet, topic);
      if (s > bestScore) {
        bestScore = s;
        best = topic;
      }
    });
    if (!best || bestScore < 3) return null;
    return best;
  }

  function isHello(q) {
    const n = normalize(q);
    return /^(hi|hello|hey|howdy|good morning|good afternoon|good evening|yo|hiya)( there)?$/.test(n);
  }

  function isThanks(q) {
    const n = normalize(q);
    return /^(thanks|thank you|thankyou|thx|ty|cheers|ok thanks|okay thanks)( so much| very much)?$/.test(n);
  }

  function answerFor(query, chipId) {
    if (chipId) {
      const topic = (DATA.topics || []).find(function (t) { return t.id === chipId; });
      if (topic) return topic;
    }
    if (isHello(query)) return { id: "hello", text: DATA.hello || DATA.greeting, links: [] };
    if (isThanks(query)) return { id: "thanks", text: DATA.thanks, links: [] };
    return matchTopic(query) || Object.assign({ id: "fallback" }, DATA.fallback);
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] == null || attrs[k] === false) return;
        if (k === "className") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else node.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function paragraphize(text) {
    const wrap = el("div", { className: "c4l-faq-bubble" });
    fill(text).split(/\n{2,}/).forEach(function (part) {
      wrap.appendChild(el("p", { text: part }));
    });
    return wrap;
  }

  function linkRow(links) {
    if (!links || !links.length) return null;
    const row = el("div", { className: "c4l-faq-links" });
    links.forEach(function (link) {
      const href = fill(link.href);
      const a = el("a", {
        className: "c4l-faq-link",
        href: href,
        text: fill(link.label)
      });
      if (/^(mailto:|tel:|https?:)/i.test(href)) {
        if (/^https?:/i.test(href)) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener");
        }
      }
      row.appendChild(a);
    });
    return row;
  }

  const root = el("div", { className: "c4l-faq", id: "c4l-faq" });
  const launcher = el("button", {
    type: "button",
    className: "c4l-faq-launcher",
    "aria-expanded": "false",
    "aria-controls": "c4l-faq-panel",
    "aria-label": "Open questions chat"
  }, [
    el("span", { className: "c4l-faq-launcher-icon", "aria-hidden": "true" }, [
      (function () {
        const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        s.setAttribute("viewBox", "0 0 24 24");
        s.setAttribute("fill", "none");
        s.setAttribute("stroke", "currentColor");
        s.setAttribute("stroke-width", "2");
        s.innerHTML = '<path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v6A3.5 3.5 0 0 1 16.5 16H11l-4.5 4v-4H7.5A3.5 3.5 0 0 1 4 12.5z"/>';
        return s;
      })()
    ]),
    el("span", { className: "c4l-faq-launcher-label", text: "Questions?" })
  ]);

  const titleId = "c4l-faq-title";
  const panel = el("div", {
    id: "c4l-faq-panel",
    className: "c4l-faq-panel",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": titleId,
    hidden: true
  });

  const closeBtn = el("button", {
    type: "button",
    className: "c4l-faq-close",
    "aria-label": "Close questions chat",
    text: "×"
  });

  const header = el("div", { className: "c4l-faq-header" }, [
    el("img", {
      className: "c4l-faq-mark",
      src: "images/mark-64.png",
      width: "32",
      height: "32",
      alt: "",
      decoding: "async"
    }),
    el("div", { className: "c4l-faq-heading" }, [
      el("p", { id: titleId, text: DATA.title || "Clubs for Love" }),
      el("p", { className: "c4l-faq-sub", text: DATA.subtitle || "Questions?" })
    ]),
    closeBtn
  ]);

  const log = el("div", { className: "c4l-faq-log", role: "log", "aria-live": "polite", "aria-relevant": "additions" });
  const chipsWrap = el("div", { className: "c4l-faq-chips", "aria-label": "Quick questions" });
  const input = el("input", {
    id: "c4l-faq-input",
    className: "c4l-faq-input",
    type: "text",
    autocomplete: "off",
    enterkeyhint: "send",
    maxlength: "400",
    placeholder: "Ask a question…"
  });
  const sendBtn = el("button", { type: "submit", className: "c4l-faq-send", "aria-label": "Send question", text: "Send" });
  const form = el("form", { className: "c4l-faq-form" }, [
    el("label", { className: "sr-only", for: "c4l-faq-input", text: "Ask a question" }),
    input,
    sendBtn
  ]);

  panel.appendChild(header);
  panel.appendChild(log);
  panel.appendChild(chipsWrap);
  panel.appendChild(form);
  root.appendChild(panel);
  root.appendChild(launcher);

  function focusables() {
    return Array.prototype.slice.call(panel.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(function (n) { return n.offsetParent !== null || n === input; });
  }

  function addMsg(role, topic) {
    const row = el("div", { className: "c4l-faq-msg c4l-faq-msg--" + role });
    if (role === "user") {
      row.appendChild(el("div", { className: "c4l-faq-bubble", text: topic }));
    } else {
      row.appendChild(paragraphize(topic.text));
      const links = linkRow(topic.links);
      if (links) row.appendChild(links);
    }
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  let greeted = false;
  function greet() {
    if (greeted) return;
    greeted = true;
    addMsg("bot", { text: DATA.greeting, links: [] });
  }

  function renderChips() {
    chipsWrap.textContent = "";
    (DATA.chips || []).forEach(function (chip) {
      const btn = el("button", { type: "button", className: "c4l-faq-chip", text: chip.label });
      btn.addEventListener("click", function () {
        addMsg("user", chip.label);
        addMsg("bot", answerFor(chip.label, chip.id));
        input.focus();
      });
      chipsWrap.appendChild(btn);
    });
  }

  let lastFocus = null;
  let open = false;

  function setOpen(next) {
    open = !!next;
    if (open) {
      lastFocus = document.activeElement;
      panel.removeAttribute("hidden");
      launcher.setAttribute("aria-expanded", "true");
      launcher.setAttribute("aria-label", "Close questions chat");
      root.classList.add("is-open");
      greet();
      window.setTimeout(function () {
        input.focus();
      }, 10);
    } else {
      panel.setAttribute("hidden", "");
      launcher.setAttribute("aria-expanded", "false");
      launcher.setAttribute("aria-label", "Open questions chat");
      root.classList.remove("is-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      else launcher.focus();
    }
  }

  launcher.addEventListener("click", function () { setOpen(!open); });
  closeBtn.addEventListener("click", function () { setOpen(false); });

  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key !== "Tab") return;
    const list = focusables();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const q = (input.value || "").trim();
    if (!q) return;
    input.value = "";
    addMsg("user", q);
    addMsg("bot", answerFor(q));
  });

  renderChips();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(root); });
  } else {
    document.body.appendChild(root);
  }

  window.C4L_FAQ_CHAT = {
    match: matchTopic,
    answer: answerFor,
    score: function (query) {
      const q = normalize(query);
      const tokenSet = new Set(tokensOf(q));
      return (DATA.topics || []).map(function (t) {
        return { id: t.id, score: scoreTopic(q, tokenSet, t) };
      }).sort(function (a, b) { return b.score - a.score; });
    },
    open: function () { setOpen(true); },
    close: function () { setOpen(false); }
  };
})();
