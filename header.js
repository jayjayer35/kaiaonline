(function () {
  "use strict";

  // sound 
  const SOUNDS = {
    enabled: false,
    volume: 0.4,
    files: {
      click: "/assets/click.mp3",
      open:  "/assets/open.mp3",
      close: "/assets/close.mp3",
      hover: "/assets/hover.mp3",
      nav:   "/assets/nav.mp3",
    },
  };
  const _cache = {};
  window.kaiaSound = {
    play(name) {
      if (!SOUNDS.enabled) return;
      const src = SOUNDS.files[name];
      if (!src) { console.warn(`kaiaSound: no sound named "${name}"`); return; }
      try {
        if (!_cache[name]) { _cache[name] = new Audio(src); _cache[name].volume = SOUNDS.volume; }
        const s = _cache[name].cloneNode();
        s.volume = SOUNDS.volume;
        s.play().catch(() => {});
      } catch (e) {}
    },
  };

  // nav structure
  const NAV = [
    { label: "home", href: "indexnew.html", plain: true },
    {
      label: "kaia",
      children: [
        { label: "blog",     href: "/blog/index.html" },
        { label: "my lists", href: "lists.html" },
      ],
    },
    {
      label: "web",
      children: [
        { label: "guestbook", href: "https://kaiasei.atabook.org/" },
        { label: "indie sites",  href: "webrings.html" },
        { label: "webrings",  href: "webrings.html" },
        { label: "manifesto", href: "manifesto.html" },
        { label: "site archives",
          submenu: [
            { label: "archive 1 (original)", href: "/jacobonline-old/index.html" },
            { label: "archive 2 (revival)", href: "/ofb/indexrm.html" },
            { label: "archive 3 (ship log)", href: "/ofb/indexlog.html" },
            { label: "archive 4 (dashboard)", href: "/indexold.html" },
          ]
        },
      ],
    },
    {
      label: "for u",
      children: [
        { label: "bookmarks", href: "bookmarks.html" },
        { label: "creations", href: "mystuf.html" },
        { label: "recipes",   href: "myrecipes.html" },
      ],
    },
    {
      label: "other",
      children: [
        { label: "dont forget",      href: "dontforget.html" },
        { label: "an interaction",   href: "deepestfear.html" },
        { label: "friends",
          submenu: [
            { label: "hall of messages", href: "msgs.html" },
            { label: "VRChat photos!", href: "vrcmemories.html" },
          ]
        },
        { label: "shrines",
          submenu: [
            { label: "outer wilds", href: "wilds.html" },
            ],
        },
        { label: "template", href: "template.html" },
      ],
    },
  ];

  // apply saved theme 
  const savedTheme = localStorage.getItem("kaia-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  // styles 
  function injectStyles() {
    if (document.getElementById("kaia-header-styles")) return;
    const style = document.createElement("style");
    style.id = "kaia-header-styles";
    style.textContent = `
      /* spacer to prevent content from hiding under the fixed header */
      #kaia-header-spacer {
        width: 100%;
      }

      @font-face {
        font-family: "NDS";
        src: url("/rework/assets/fonts/nds.ttf") format("truetype");
        font-display: swap;
      }

      /* ── single unified bar (Light Mode Defaults) ── */
      :root {
        --hdr-bg: #9eb4d1;
        --hdr-border-top: #c4d6e8;
        --hdr-border-bottom: #7e8ba3;
        --hdr-shadow-1: #cddaea;
        --hdr-shadow-2: #6a7d96;
        --hdr-text: #fff;
        --hdr-text-shadow: #5a7a9a;
        --hdr-hover-bg: rgba(255,255,255,0.18);
        
        --drop-bg: #dce8f4;
        --drop-border: #9ca7c3;
        --drop-border-top: #c4d6e8;
        --drop-shadow: #7e8ba3;
        --drop-text: #444;
        --drop-hover-bg: #b6c6df;
        --drop-hover-text: #2a3a50;
        
        --pill-bg: rgba(0,0,0,0.15);
        --pill-border: rgba(0,0,0,0.2);
        --steam-text: #dce8f4;
        --steam-shadow: #4a6a8a;
      }

      /* ── single unified bar (Dark Mode Overrides) ── */
      body.dark-mode {
        --hdr-bg: #2a3340;
        --hdr-border-top: #4a5a70;
        --hdr-border-bottom: #1a2028;
        --hdr-shadow-1: #3a4a60;
        --hdr-shadow-2: #10141a;
        --hdr-text: #e0e8f0;
        --hdr-text-shadow: #000;
        --hdr-hover-bg: rgba(0,0,0,0.25);
        
        --drop-bg: #1e2530;
        --drop-border: #151a22;
        --drop-border-top: #3a4a60;
        --drop-shadow: #0d1117;
        --drop-text: #a8b8cc;
        --drop-hover-bg: #2d3846;
        --drop-hover-text: #e0e8f0;
        
        --pill-bg: rgba(0,0,0,0.4);
        --pill-border: rgba(0,0,0,0.6);
        --steam-text: #6b9ac4;
        --steam-shadow: #000;
      }

      #kaia-single-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 9999;
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        justify-content: space-between;
        background: var(--hdr-bg);
        border-top: 2px solid var(--hdr-border-top);
        border-bottom: 3px solid var(--hdr-border-bottom);
        box-shadow:
          inset 0 1px 0 var(--hdr-shadow-1),
          inset 0 -2px 0 var(--hdr-shadow-2),
          0 4px 8px rgba(0, 0, 0, 0.25);
        min-height: 2.375rem;
        font-family: 'NDS', monospace, sans-serif;
        font-weight: bold;
        transition: background 0.3s, border-color 0.3s;
      }

      /* ── nav section (left) ── */
      .ksb-nav {
        display: flex;
        align-items: stretch;
        flex-wrap: wrap;
      }

      .ksb-nav .ds-item {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .ksb-nav .ds-link {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0 1.125rem;
        height: 2.375rem;
        color: var(--hdr-text);
        text-decoration: none;
        font-size: 1.5rem;
        letter-spacing: 0.06em;
        text-shadow: 0 1px 0 var(--hdr-text-shadow);
        white-space: nowrap;
        cursor: pointer;
        transition: background 0.1s;
        user-select: none;
        box-sizing: border-box;
      }

      .ksb-nav .ds-link:hover,
      .ksb-nav .ds-item.open > .ds-link {
        background: var(--hdr-hover-bg);
      }

      .ksb-nav .ds-arrow {
        font-size: 0.5rem;
        opacity: 0.55;
        margin-top: 0.125rem;
        transition: transform 0.15s;
        display: inline-block;
      }
      .ksb-nav .ds-item.open > .ds-link .ds-arrow {
        transform: rotate(180deg);
      }

      .ksb-nav .ds-dropdown {
        position: absolute;
        top: calc(100% + 3px);
        left: 50%;
        transform: translateX(-50%);
        background: var(--drop-bg);
        border: 1px solid var(--drop-border);
        border-top: 2px solid var(--drop-border-top);
        border-radius: 0;
        box-shadow: 2px 3px 0 var(--drop-shadow), inset 0 1px 0 rgba(255,255,255,0.1);
        min-width: 9rem;
        z-index: 300;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.18s ease, visibility 0.18s ease;
        padding: 0.1rem 0;
      }

      .ksb-nav .ds-item.open > .ds-dropdown,
      .ksb-nav .ds-item:hover > .ds-dropdown {
        opacity: 1;
        visibility: visible;
      }

      .ksb-nav .ds-dropdown a {
        display: block;
        padding: 0.2rem 0.75rem;
        color: var(--drop-text);
        text-decoration: none;
        white-space: nowrap;
        letter-spacing: 0.02em;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        transition: background 0.1s, padding-left 0.1s, color 0.1s;
        font-size: 1rem;
        text-shadow: none;
        line-height: 1.5;
        box-sizing: border-box;
      }
      .ksb-nav .ds-dropdown a:last-child { border-bottom: none; }
      .ksb-nav .ds-dropdown a:hover {
        background: var(--drop-hover-bg);
        color: var(--drop-hover-text);
        padding-left: 1rem;
        cursor: pointer;
      }

      /* ── status section (right) ── */
      .ksb-status {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        padding: 0 1rem;
        color: var(--hdr-text);
        text-shadow: 0 1px 0 var(--hdr-text-shadow);
        font-size: 1rem;
      }

      .ksb-status-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .sb-theme-btn {
        cursor: pointer;
        user-select: none;
        opacity: 0.8;
        transition: opacity 0.2s, transform 0.1s;
        padding: 0 0.25rem;
      }
      .sb-theme-btn:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      .sb-clock {
        font-size: 1.25rem;
        letter-spacing: 0.05em;
      }

      .sb-date {
        opacity: 0.85;
      }

      .sb-stat {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .sb-stat-label {
        opacity: 0.8;
      }

      .sb-pill {
        width: 2.2rem;
        height: 0.4rem;
        background: var(--pill-bg);
        border: 1px solid var(--pill-border);
        overflow: hidden;
      }

      .sb-pill-fill {
        height: 100%;
        transition: width 1.2s ease;
      }
      .sb-pill-fill.hp  { background: #8ced8c; }
      .sb-pill-fill.bat { background: #8cc6ed; }

      .sb-pill-val {
        min-width: 1.8rem;
        opacity: 0.9;
      }

      .sb-steam {
        opacity: 0.9;
      }
      .sb-steam span { color: var(--steam-text); text-shadow: 0 1px 0 var(--steam-shadow); }

      .sb-visitors {
        opacity: 0.85;
      }

      /* ── responsive ── */
      @media (max-width: 60rem) {
        #kaia-single-bar { justify-content: center; }
        .ksb-status { justify-content: center; padding-bottom: 0.25rem; }
      }
      @media (max-width: 37.5rem) {
        .ksb-nav .ds-link { font-size: 1rem; padding: 0 0.625rem; height: 2rem; }
        #kaia-single-bar  { min-height: 2rem; }
        .ksb-status { font-size: 0.875rem; gap: 0.5rem; }
        .sb-clock { font-size: 1rem; }
      }
      .ds-submenu-wrap {
        position: relative;
      }

      .ds-submenu {
        position: absolute;
        top: -1px;
        left: calc(100% + 2px);

        background: var(--drop-bg);
        border: 1px solid var(--drop-border);
        border-top: 2px solid var(--drop-border-top);

        min-width: 9rem;

        opacity: 0;
        visibility: hidden;

        transition: opacity 0.18s ease;

        box-shadow:
          2px 3px 0 var(--drop-shadow),
          inset 0 1px 0 rgba(255,255,255,0.1);

        z-index: 500;
      }

      .ds-submenu-wrap:hover > .ds-submenu {
        opacity: 1;
        visibility: visible;
      }

      .ds-submenu-arrow {
        float: right;
        opacity: 0.6;
      }
    `;
    document.head.appendChild(style);
  }

  // build unified header 
  function buildHeader() {
    const bar = document.createElement("header");
    bar.id = "kaia-single-bar";

    // left side nav
    const navWrap = document.createElement("div");
    navWrap.className = "ksb-nav";

    NAV.forEach((item) => {
      const wrap = document.createElement("div");
      wrap.className = "ds-item";

      if (item.plain) {
        const a = document.createElement("a");
        a.href = item.href;
        a.className = "ds-link";
        a.textContent = item.label;
        a.addEventListener("click",      () => window.kaiaSound.play("click"));
        a.addEventListener("mouseenter", () => window.kaiaSound.play("hover"));
        wrap.appendChild(a);
      } else {
        const trigger = document.createElement("span");
        trigger.className = "ds-link";
        trigger.textContent = item.label + " ";
        const arrow = document.createElement("span");
        arrow.className = "ds-arrow";
        arrow.textContent = "▼";
        trigger.appendChild(arrow);
        wrap.appendChild(trigger);

        const menu = document.createElement("div");
        menu.className = "ds-dropdown";
        item.children.forEach((child) => {

          if (child.submenu) {

            const wrapSub = document.createElement("div");
            wrapSub.className = "ds-submenu-wrap";

            const trigger = document.createElement("a");
            trigger.href = "#";
            trigger.innerHTML =
              child.label +
              '<span class="ds-submenu-arrow">&gt;</span>';

            wrapSub.appendChild(trigger);

            const subMenu = document.createElement("div");
            subMenu.className = "ds-submenu";

            child.submenu.forEach((sub) => {
              const subA = document.createElement("a");
              subA.href = sub.href;
              subA.textContent = sub.label;

              subA.addEventListener("click", () =>
                window.kaiaSound.play("click"));

              subA.addEventListener("mouseenter", () =>
                window.kaiaSound.play("hover"));

              subMenu.appendChild(subA);
            });

            wrapSub.appendChild(subMenu);
            menu.appendChild(wrapSub);

          } else {

            const a = document.createElement("a");
            a.href = child.href;
            a.textContent = child.label;

            a.addEventListener("click", () =>
              window.kaiaSound.play("click"));

            a.addEventListener("mouseenter", () =>
              window.kaiaSound.play("hover"));

            menu.appendChild(a);
          }
        });
        wrap.appendChild(menu);

        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = wrap.classList.contains("open");
          document.querySelectorAll(".ksb-nav .ds-item.open")
            .forEach(el => el.classList.remove("open"));
          if (!isOpen) {
            wrap.classList.add("open");
            window.kaiaSound.play("open");
          } else {
            window.kaiaSound.play("close");
          }
        });
        trigger.addEventListener("mouseenter", () => window.kaiaSound.play("nav"));
      }

      navWrap.appendChild(wrap);
    });

    // right side status
    const statWrap = document.createElement("div");
    statWrap.className = "ksb-status";
    statWrap.innerHTML = `
      <div class="ksb-status-group">
        <span class="sb-theme-btn" id="sb-theme-btn" title="Toggle Dark Mode">[ ☾ ]</span>
        <span class="sb-clock" id="sb-clock">00:00</span>
        <span class="sb-date"  id="sb-date"></span>
      </div>
      <div class="ksb-status-group">
        <span class="sb-stat">
          <span class="sb-stat-label">hp</span>
          <div class="sb-pill"><div class="sb-pill-fill hp" id="sb-hp" style="width:85%"></div></div>
          <span class="sb-pill-val" id="sb-hp-val">85%</span>
        </span>
        <span class="sb-stat">
          <span class="sb-stat-label">bat</span>
          <div class="sb-pill"><div class="sb-pill-fill bat" id="sb-bat" style="width:60%"></div></div>
          <span class="sb-pill-val" id="sb-bat-val">60%</span>
        </span>
      </div>
      <div class="ksb-status-group">
        <span class="sb-steam">steam: <span id="sb-status">…</span> · play: <span id="sb-game">…</span></span>
        <span class="sb-visitors">#<span id="sb-visitors">…</span></span>
      </div>
    `;

    bar.appendChild(navWrap);
    bar.appendChild(statWrap);

    document.addEventListener("click", () => {
      document.querySelectorAll(".ksb-nav .ds-item.open")
        .forEach(el => el.classList.remove("open"));
    });

    return bar;
  }

  // run
  function startRuntime() {
    // theme toggle
    const themeBtn = document.getElementById("sb-theme-btn");
    const updateThemeIcon = () => {
      if (document.body.classList.contains("dark-mode")) {
        themeBtn.textContent = "[ ☼ ]";
      } else {
        themeBtn.textContent = "[ ☾ ]";
      }
    };
    if (themeBtn) {
      updateThemeIcon(); // set initial icon
      themeBtn.addEventListener("click", () => {
        window.kaiaSound.play("click");
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
          localStorage.setItem("kaia-theme", "dark");
        } else {
          localStorage.setItem("kaia-theme", "light");
        }
        updateThemeIcon();
      });
    }

    // clock
    function tickClock() {
      const now  = new Date();
      const h    = String(now.getHours()).padStart(2, "0");
      const m    = String(now.getMinutes()).padStart(2, "0");
      const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const clockEl = document.getElementById("sb-clock");
      const dateEl  = document.getElementById("sb-date");
      if (clockEl) clockEl.textContent = `${h}:${m}`;
      if (dateEl)  dateEl.textContent  = `${days[now.getDay()]} ${now.getDate()}`; 
    }
    tickClock();
    setInterval(tickClock, 10000);

    // hp / battery
    let hp  = Math.floor(Math.random() * 31) + 70;
    let bat = Math.floor(Math.random() * 101);
    const stateMap = {
      "0":"silent","1":"active!","2":"busy",
      "3":"away~","4":"snooze","5":"trade","6":"play",
    };
    function nudge(v) {
      return Math.min(100, Math.max(0,
        v + (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 4) + 1)));
    }
    function updateStats() {
      hp  = nudge(hp);
      bat = nudge(bat);
      const hpEl  = document.getElementById("sb-hp");
      const batEl = document.getElementById("sb-bat");
      const hpV   = document.getElementById("sb-hp-val");
      const batV  = document.getElementById("sb-bat-val");
      if (hpEl)  hpEl.style.width  = `${hp}%`;
      if (batEl) batEl.style.width = `${bat}%`;
      if (hpV)   hpV.textContent   = `${hp}%`;
      if (batV)  batV.textContent  = `${bat}%`;
      // steam 
      fetch("/.netlify/functions/getSteamStatus")
        .then(r => r.json())
        .then(d => {
          const s = document.getElementById("sb-status");
          const g = document.getElementById("sb-game");
          if (s) s.textContent = stateMap[String(d.status)] || "…";
          if (g) g.textContent = d.game || "n/a";
        })
        .catch(() => {
          const g = document.getElementById("sb-game");
          if (g) g.textContent = "n/a";
        });
    }
    updateStats();

    // visitor count
    const id = localStorage.getItem("visitorID") || crypto.randomUUID();
    localStorage.setItem("visitorID", id);
    fetch(`/.netlify/functions/countVisits?visitorID=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.totalCount !== undefined) {
          const el = document.getElementById("sb-visitors");
          if (el) el.textContent = d.totalCount;
          /* also update any #visitor-count element on the page */
          const el2 = document.getElementById("visitor-count");
          if (el2) el2.textContent = d.totalCount;
        }
      })
      .catch(() => {});
  }

  // inject everything 
  function inject() {
    if (document.getElementById("kaia-single-bar")) return;
    injectStyles();

    // fixed header
    const spacer = document.createElement("div");
    spacer.id = "kaia-header-spacer";

    const headerBar = buildHeader();

    // in to DOM
    document.body.insertBefore(spacer, document.body.firstChild);
    document.body.insertBefore(headerBar, document.body.firstChild);

    startRuntime();

    // dynamic
    const syncSpacer = () => {
      spacer.style.height = headerBar.offsetHeight + "px";
    };
    window.addEventListener("resize", syncSpacer);
    setTimeout(syncSpacer, 50); // make sure render first
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

  window.injectHeader = inject;
})();