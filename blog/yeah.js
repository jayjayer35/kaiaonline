
(() => {
  const ENDPOINT = "/api/yeah";
  const VISITOR_KEY = "kaia-yeah-visitor";
  const TIMEOUT_MS = 12000;

  const FACE_IDLE = [
    "..#####..",
    ".#.....#.",
    "#..#.#..#",
    "#..#.#..#",
    "#.......#",
    "#.#...#.#",
    "#..###..#",
    ".#.....#.",
    "..#####..",
  ];
  const FACE_YEAH = [
    "..#####..",
    ".#######.",
    "###.#.###",
    "###.#.###",
    "#########",
    "##.....##",
    "###...###",
    ".#######.",
    "..#####..",
  ];
  const pixelSvg = (rows, cls) => {
    let rects = "";
    rows.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c === "#") rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      })
    );
    return `<svg class="${cls}" viewBox="0 0 9 9" aria-hidden="true" shape-rendering="crispEdges" fill="currentColor">${rects}</svg>`;
  };

  /* ---------- who is this visitor ---------- */
  const makeId = () =>
    (crypto.randomUUID ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join(""));
  let visitor = "";
  try {
    visitor = localStorage.getItem(VISITOR_KEY) || "";
    if (!/^[a-z0-9-]{8,64}$/.test(visitor)) {
      visitor = makeId();
      localStorage.setItem(VISITOR_KEY, visitor);
    }
  } catch (e) {
    visitor = makeId(); // storage blocked: works for this visit only
  }
  const mine = new Set(); // ids this visitor has yeah'd (filled in by the server)

  /* ---------- talking to /api/yeah ---------- */
  async function api(options = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const url = options.method === "POST" ? ENDPOINT : `${ENDPOINT}?visitor=${encodeURIComponent(visitor)}`;
      const res = await fetch(url, { ...options, signal: ctrl.signal, headers: { "content-type": "application/json" } });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.ok) throw new Error((data && data.error) || `http ${res.status}`);
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------- post ids ---------- */
  // same recipe used to pre-fill data-yeah-id: date + title slug.
  // if a new post has no data-yeah-id, it gets one this way — but
  // editing its title/date later would reset its count, so pinning
  // the id with data-yeah-id is safer.
  const slug = (t) =>
    (t || "")
      .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      .slice(0, 40).replace(/-+$/, "") || "untitled";

  function deriveId(article) {
    const time = article.querySelector(".post-header time");
    const m = time && time.textContent.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const date = m ? `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}` : "nodate";
    const header = article.querySelector(".post-header");
    const h2 = header && header.nextElementSibling && header.nextElementSibling.tagName === "H2"
      ? header.nextElementSibling : null;
    return `${date}-${slug(h2 ? h2.textContent : "")}`;
  }

  /* ---------- build buttons ---------- */
  const posts = [...document.querySelectorAll("main article.post")].filter((a) => !a.hasAttribute("data-no-yeah"));
  const used = new Set(posts.map((a) => a.dataset.yeahId).filter(Boolean));
  const widgets = new Map(); // id -> { btn, countEl, count }

  const plural = (n) => (n === 1 ? "1 yeah" : `${n} yeahs`);

  function render(w) {
    const on = mine.has(w.id);
    w.btn.classList.toggle("is-yeahed", on);
    w.btn.setAttribute("aria-pressed", on ? "true" : "false");
    w.label.textContent = on ? "yeah'd!" : "yeah!";
    if (typeof w.count === "number") {
      w.countEl.textContent = w.count;
      w.bar.dataset.empty = w.count === 0 ? "true" : "false";
      w.btn.setAttribute("aria-label", `${on ? "un-yeah" : "yeah"} this post (${plural(w.count)})`);
    } else {
      w.countEl.textContent = w.count === null ? "?" : "…";
    }
  }

  posts.forEach((article) => {
    let id = article.dataset.yeahId;
    if (!id) {
      const base = deriveId(article);
      id = base;
      for (let k = 2; used.has(id); k++) id = `${base}-${k}`;
      used.add(id);
      article.dataset.yeahId = id;
      console.info(`[yeah] post has no data-yeah-id, using "${id}". add data-yeah-id="${id}" to pin it.`);
    }
    if (widgets.has(id)) return;

    const bar = document.createElement("div");
    bar.className = "yeah-bar";
    bar.innerHTML = `
      <button type="button" class="yeah-btn" aria-pressed="false" disabled>
        ${pixelSvg(FACE_IDLE, "yeah-face yeah-face--idle")}
        ${pixelSvg(FACE_YEAH, "yeah-face yeah-face--on")}
        <span class="yeah-label">yeah!</span>
      </button>
      <span class="yeah-count" aria-live="polite">…</span>`;

    const tags = article.querySelector(":scope > .tags");
    tags ? tags.prepend(bar) : article.appendChild(bar); // sits at the start of the tags line

    const w = {
      id, bar,
      btn: bar.querySelector(".yeah-btn"),
      label: bar.querySelector(".yeah-label"),
      countEl: bar.querySelector(".yeah-count"),
      count: undefined,
      busy: false,
    };
    widgets.set(id, w);
    w.btn.addEventListener("click", () => toggle(w));
    render(w);
  });

  if (!widgets.size) return;

  /* ---------- click ---------- */
  function burst(w) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pop = document.createElement("span");
    pop.className = "yeah-pop";
    pop.textContent = "yeah!";
    w.bar.appendChild(pop);
    pop.addEventListener("animationend", () => pop.remove());
  }

  async function toggle(w) {
    if (w.busy || typeof w.count !== "number") return;
    const adding = !mine.has(w.id);
    const before = w.count;

    // optimistic update so it feels instant
    adding ? mine.add(w.id) : mine.delete(w.id);
    w.count = Math.max(0, before + (adding ? 1 : -1));
    render(w);
    if (adding) burst(w);

    w.busy = true;
    w.btn.classList.add("is-busy");
    try {
      const res = await api({
        method: "POST",
        body: JSON.stringify({ id: w.id, visitor, yeah: adding }),
      });
      w.count = res.count;
    } catch (err) {
      // put everything back if the server didn't take it
      adding ? mine.delete(w.id) : mine.add(w.id);
      w.count = before;
      w.btn.classList.remove("is-shake");
      void w.btn.offsetWidth;
      w.btn.classList.add("is-shake");
      console.warn("[yeah] couldn't save:", err.message);
    } finally {
      w.busy = false;
      w.btn.classList.remove("is-busy");
      render(w);
    }
  }

  /* ---------- initial load ---------- */
  api()
    .then(({ counts, mine: yours }) => {
      yours.forEach((id) => mine.add(id));
      widgets.forEach((w) => {
        w.count = Number(counts[w.id]) || 0;
        w.btn.disabled = false;
        render(w);
      });
    })
    .catch((err) => {
      console.warn("[yeah] couldn't load counts:", err.message);
      widgets.forEach((w) => { w.count = null; w.btn.title = "yeahs are napping right now"; render(w); });
    });
})();