(function () {
  "use strict";

  // ── ALERT BAR ───────────────────────────────────────────────────────────────
  // Set to null or "" to hide the alert bar entirely.
  const ALERT_TEXT = "gay activites taking place (i love my new alert bar) :3";

  // ── PLAYLIST ────────────────────────────────────────────────────────────────
  // { file: "/music/filename.mp3", name: "Display Name" }
  // Shuffle is on by default. A song-select dropdown lists all tracks.
  const PLAYLIST = [
    { file: "/music/again.mp3",  name: "again, someday - kaiasei" },
    { file: "/music/moonsetter.mp3",  name: "Moonsetter - Homestuck" },
    { file: "/music/paradise.mp3",  name: "Welcome to Paradise - Emile van Krieken"   },
    { file: "/music/onceupon.mp3",  name: "Once upon a time... - Synthion"   },
    { file: "/music/aLupi.mp3",  name: "a Lupi - Synthion"   },
    { file: "/music/tea.mp3",  name: "Kokoro's Oolong Tea - Yusuka Tanaka"   },
    { file: "/music/memories.mp3",  name: "Comforting Memories - Kumi Tanioka" },
    { file: "/music/secunda.mp3",  name: "Secunda - Jeremy Soule"   },
    { file: "/music/xeno.mp3",  name: "Xeno Arcadia - Mason Lindroth & Chuck Salamone"   },
    { file: "/music/look.mp3",  name: "Something to Look For - Andrew Prahlow" },
    { file: "/music/timber.mp3",  name: "Timber Hearth - Andrew Prahlow" },
    { file: "/music/reprise.mp3",  name: "Outer Wilds Reprise - Andrew Prahlow" },
  ];

  const MUSIC_KEY   = "kaia-music";   // localStorage key
  const DEFAULT_VOL = 0.03;           // 0.0 – 1.0


  // ── UI SOUNDS ───────────────────────────────────────────────────────────────
  const SOUNDS = {
    enabled: true,
    volume: 0.2,
    files: {
      click: "/altsite/fx/1leaventry.wav",
      open:  "/altsite/fx/1selectentry.wav",
      close: "/altsite/fx/1selectentry.wav",
      hover: "/altsite/fx/shiplog_highlight2.wav",
      nav:   "/altsite/fx/shiplog_highlight2.wav",
    },
  };
  const _cache = {};
  window.kaiaSound = {
    play(name) {
      if (!SOUNDS.enabled) return;
      const src = SOUNDS.files[name];
      if (!src) return;
      try {
        if (!_cache[name]) { _cache[name] = new Audio(src); _cache[name].volume = SOUNDS.volume; }
        const s = _cache[name].cloneNode();
        s.volume = SOUNDS.volume;
        s.play().catch(() => {});
      } catch (e) {}
    },
  };

  // ── NAV STRUCTURE ───────────────────────────────────────────────────────────
  const NAV = [
    { label: "home", href: "/indexnew.html", plain: true },
    {
      label: "kaia",
      children: [
        { label: "blog",     href: "/blog/index.html" },
        { label: "my lists", href: "/lists.html" },
        { label: "photo museum",   href: "/museum.html" },
        { label: "friends",
          submenu: [
            { label: "hall of messages", href: "/msgs.html" },
          ]
        },
      ],
      
    },
    {
      label: "web",
      children: [
        { label: "guestbook",   href: "https://kaiasei.atabook.org/" },
        { label: "indie sites", href: "/indiesites.html" },
        { label: "webrings",    href: "/webrings.html" },
        { label: "manifesto",   href: "/manifesto.html" },
        { label: "site archives",
          submenu: [
            { label: "archive 1 (original)", href: "/jacobonline-old/index.html" },
            { label: "archive 2 (revival)",  href: "/ofb/indexrm.html" },
            { label: "archive 3 (ship log)", href: "/ofb/indexlog.html" },
            { label: "archive 4 (dashboard)",href: "/indexold.html" },
          ]
        },
      ],
    },
    {
      label: "for u",
      children: [
        { label: "bookmarks", href: "/bookmarks.html" },
        { label: "creations", href: "/mystuf.html" },
        { label: "recipes",   href: "/myrecipes.html" },
      ],
    },
    {
      label: "other",
      children: [
        { label: "dont forget",    href: "/dontforget.html" },
        { label: "an interaction", href: "/deepestfear.html" },
        { label: "shrines",
          submenu: [
            { label: "outer wilds", href: "/wilds.html" },
          ],
        },
        { label: "template", href: "/template.html" },
      ],
    },
  ];

  // ── APPLY SAVED THEME ───────────────────────────────────────────────────────
  const savedTheme = localStorage.getItem("kaia-theme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");

  // ── STYLES ──────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("kaia-header-styles")) return;
    const style = document.createElement("style");
    style.id = "kaia-header-styles";
    style.textContent = `
      #kaia-header-spacer { width: 100%; }

      @font-face {
        font-family: "NDS";
        src: url("/rework/assets/fonts/nds.ttf") format("truetype");
        font-display: swap;
      }

      :root {
        --hdr-bg:            #9eb4d1;
        --hdr-border-top:    #c4d6e8;
        --hdr-border-bottom: #7e8ba3;
        --hdr-shadow-1:      #cddaea;
        --hdr-shadow-2:      #6a7d96;
        --hdr-text:          #fff;
        --hdr-text-shadow:   #5a7a9a;
        --hdr-hover-bg:      rgba(255,255,255,0.18);
        --drop-bg:           #dce8f4;
        --drop-border:       #9ca7c3;
        --drop-border-top:   #c4d6e8;
        --drop-shadow:       #7e8ba3;
        --drop-text:         #444;
        --drop-hover-bg:     #b6c6df;
        --drop-hover-text:   #2a3a50;
        --pill-bg:           rgba(0,0,0,0.15);
        --pill-border:       rgba(0,0,0,0.2);
        --steam-text:        #dce8f4;
        --steam-shadow:      #4a6a8a;
        --alert-bg:          #f5e6a0;
        --alert-text:        #5a4a00;
        --alert-border:      #c8a800;
      }

      body.dark-mode {
        --hdr-bg:            #2a3340;
        --hdr-border-top:    #4a5a70;
        --hdr-border-bottom: #1a2028;
        --hdr-shadow-1:      #3a4a60;
        --hdr-shadow-2:      #10141a;
        --hdr-text:          #e0e8f0;
        --hdr-text-shadow:   #000;
        --hdr-hover-bg:      rgba(0,0,0,0.25);
        --drop-bg:           #1e2530;
        --drop-border:       #151a22;
        --drop-border-top:   #3a4a60;
        --drop-shadow:       #0d1117;
        --drop-text:         #a8b8cc;
        --drop-hover-bg:     #2d3846;
        --drop-hover-text:   #e0e8f0;
        --pill-bg:           rgba(0,0,0,0.4);
        --pill-border:       rgba(0,0,0,0.6);
        --steam-text:        #6b9ac4;
        --steam-shadow:      #000;
        --alert-bg:          #2a2200;
        --alert-text:        #f0d060;
        --alert-border:      #7a6000;
      }

      /* alert bar */
      #kaia-alert-bar {
        width: 100%;
        background: var(--alert-bg);
        color: var(--alert-text);
        border-bottom: 1px solid var(--alert-border);
        font-family: 'NDS', monospace, sans-serif;
        font-size: 0.9rem;
        padding: 0.25rem 2.5rem 0.25rem 0.75rem;
        text-align: center;
        position: relative;
        box-sizing: border-box;
        transition: background 0.3s, color 0.3s;
      }
      #kaia-alert-close {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        font-size: 1rem;
        opacity: 0.6;
        background: none;
        border: none;
        color: inherit;
        font-family: inherit;
        line-height: 1;
        padding: 0 0.2rem;
      }
      #kaia-alert-close:hover { opacity: 1; }

      /* main bar */
      #kaia-single-bar {
        position: fixed;
        top: 0; left: 0;
        width: 100%;
        z-index: 9999;
        box-sizing: border-box;
        background: var(--hdr-bg);
        border-top: 2px solid var(--hdr-border-top);
        border-bottom: 3px solid var(--hdr-border-bottom);
        box-shadow:
          inset 0 1px 0 var(--hdr-shadow-1),
          inset 0 -2px 0 var(--hdr-shadow-2),
          0 4px 8px rgba(0,0,0,0.25);
        font-family: 'NDS', monospace, sans-serif;
        font-weight: bold;
        transition: background 0.3s, border-color 0.3s;
      }

      #kaia-bar-row {
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        justify-content: space-between;
        min-height: 2.375rem;
      }

      /* ── music row ─────────────────────────────────────────────────────────── */
      #kaia-music-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.18rem 0.75rem;
        border-top: 1px solid rgba(255,255,255,0.12);
        background: rgba(0,0,0,0.10);
        flex-wrap: wrap;
        font-size: 0.82rem;
        color: var(--hdr-text);
        min-height: 1.85rem;
        box-sizing: border-box;
      }
      body.dark-mode #kaia-music-row { background: rgba(0,0,0,0.22); }

      /* ♪ icon + song name on the left */
      #ksb-music-left {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }
      #ksb-music-note {
        opacity: 0.55;
        font-size: 0.9rem;
        flex-shrink: 0;
        line-height: 1;
      }
      #ksb-song-name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        opacity: 0.92;
        text-shadow: 0 1px 0 var(--hdr-text-shadow);
        font-size: 0.82rem;
        letter-spacing: 0.03em;
        cursor: default;
        font-style: italic;
      }

      /* ── right-side controls cluster ─────────────────────────────────────── */
      #ksb-music-right {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        flex-shrink: 0;
      }

      /* transport pill: prev / play / next grouped together */
      #ksb-transport {
        display: flex;
        align-items: stretch;
        border: 1px solid rgba(255,255,255,0.28);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.2);
        overflow: hidden;
        flex-shrink: 0;
      }
      .ksb-music-btn {
        background: rgba(255,255,255,0.06);
        border: none;
        border-right: 1px solid rgba(255,255,255,0.15);
        color: var(--hdr-text);
        font-family: 'NDS', monospace, sans-serif;
        font-size: 0.72rem;
        padding: 0.12rem 0.45rem;
        cursor: pointer;
        line-height: 1;
        transition: background 0.1s;
        user-select: none;
        flex-shrink: 0;
        letter-spacing: 0.02em;
      }
      .ksb-music-btn:last-child { border-right: none; }
      .ksb-music-btn:hover      { background: rgba(255,255,255,0.18); }
      .ksb-music-btn:active     { background: rgba(255,255,255,0.28); }
      /* play button slightly wider + bolder */
      #ksb-play { padding: 0.12rem 0.55rem; font-size: 0.8rem; }

      /* repeat button — standalone pill, changes appearance when active */
      #ksb-repeat {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.22);
        color: var(--hdr-text);
        font-family: 'NDS', monospace, sans-serif;
        font-size: 0.72rem;
        padding: 0.12rem 0.42rem;
        cursor: pointer;
        line-height: 1;
        transition: background 0.1s, border-color 0.1s, color 0.1s;
        user-select: none;
        flex-shrink: 0;
        letter-spacing: 0.02em;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.2);
        opacity: 0.55;
      }
      #ksb-repeat:hover { opacity: 0.85; background: rgba(255,255,255,0.12); }
      #ksb-repeat.on {
        opacity: 1;
        background: rgba(255,255,255,0.18);
        border-color: rgba(255,255,255,0.55);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 0 4px rgba(255,255,255,0.15);
      }

      /* volume strip */
      .ksb-vol-wrap {
        display: flex;
        align-items: center;
        gap: 0.28rem;
        flex-shrink: 0;
        border: 1px solid rgba(255,255,255,0.18);
        padding: 0.1rem 0.4rem;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .ksb-vol-label {
        opacity: 0.55;
        font-size: 0.72rem;
        letter-spacing: 0.04em;
      }
      #ksb-volume {
        -webkit-appearance: none;
        appearance: none;
        width: 3.5rem;
        height: 0.3rem;
        background: rgba(255,255,255,0.2);
        outline: none;
        cursor: pointer;
        border: none;
        border-radius: 0;
      }
      #ksb-volume::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 0.55rem; height: 0.8rem;
        background: var(--hdr-text);
        border: 1px solid rgba(0,0,0,0.25);
        cursor: pointer;
        border-radius: 0;
      }
      #ksb-volume::-moz-range-thumb {
        width: 0.55rem; height: 0.8rem;
        background: var(--hdr-text);
        border: 1px solid rgba(0,0,0,0.25);
        cursor: pointer;
        border-radius: 0;
        box-sizing: border-box;
      }

      /* song select dropdown */
      #ksb-song-select-wrap {
        position: relative;
        flex-shrink: 0;
      }
      #ksb-song-select-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.22);
        color: var(--hdr-text);
        font-family: 'NDS', monospace, sans-serif;
        font-size: 0.72rem;
        padding: 0.12rem 0.42rem;
        cursor: pointer;
        line-height: 1;
        transition: background 0.1s, border-color 0.1s;
        user-select: none;
        letter-spacing: 0.03em;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.2);
      }
      #ksb-song-select-btn:hover,
      #ksb-song-select-wrap.open #ksb-song-select-btn {
        background: rgba(255,255,255,0.18);
        border-color: rgba(255,255,255,0.5);
      }
      #ksb-song-list {
        position: absolute;
        top: calc(100% + 5px);
        right: 0;
        background: var(--drop-bg);
        border: 1px solid var(--drop-border);
        border-top: 2px solid var(--drop-border-top);
        box-shadow: 2px 4px 0 var(--drop-shadow);
        min-width: 13rem;
        max-height: 12rem;
        overflow-y: auto;
        z-index: 400;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.15s, visibility 0.15s;
        scrollbar-width: thin;
        scrollbar-color: var(--drop-border) transparent;
      }
      #ksb-song-select-wrap.open #ksb-song-list {
        opacity: 1;
        visibility: visible;
      }
      .ksb-song-option {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.22rem 0.65rem;
        color: var(--drop-text);
        font-family: 'NDS', monospace, sans-serif;
        font-size: 0.82rem;
        white-space: nowrap;
        cursor: pointer;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        transition: background 0.08s, padding-left 0.08s;
        text-shadow: none;
        font-weight: normal;
      }
      .ksb-song-option:last-child { border-bottom: none; }
      .ksb-song-option:hover {
        background: var(--drop-hover-bg);
        color: var(--drop-hover-text);
        padding-left: 0.95rem;
      }
      .ksb-song-option.active {
        font-weight: bold;
        color: var(--drop-hover-text);
        background: rgba(100,160,220,0.15);
      }
      .ksb-song-option.active::before {
        content: "▶";
        font-size: 0.55rem;
        opacity: 0.7;
        flex-shrink: 0;
      }
      body.dark-mode .ksb-song-option.active { background: rgba(100,160,220,0.1); }

      /* nav */
      .ksb-nav { display: flex; align-items: stretch; flex-wrap: wrap; }
      .ksb-nav .ds-item { position: relative; display: inline-flex; align-items: center; }
      .ksb-nav .ds-link {
        display: flex; align-items: center; gap: 0.25rem;
        padding: 0 1.125rem; height: 2.375rem;
        color: var(--hdr-text); text-decoration: none;
        font-size: 1.5rem; letter-spacing: 0.06em;
        text-shadow: 0 1px 0 var(--hdr-text-shadow);
        white-space: nowrap; cursor: pointer;
        transition: background 0.1s; user-select: none; box-sizing: border-box;
      }
      .ksb-nav .ds-link:hover,
      .ksb-nav .ds-item.open > .ds-link { background: var(--hdr-hover-bg); }
      .ksb-nav .ds-arrow {
        font-size: 0.5rem; opacity: 0.55; margin-top: 0.125rem;
        transition: transform 0.15s; display: inline-block;
      }
      .ksb-nav .ds-item.open > .ds-link .ds-arrow { transform: rotate(180deg); }
      .ksb-nav .ds-dropdown {
        position: absolute; top: calc(100% + 3px); left: 50%; transform: translateX(-50%);
        background: var(--drop-bg); border: 1px solid var(--drop-border);
        border-top: 2px solid var(--drop-border-top);
        box-shadow: 2px 3px 0 var(--drop-shadow), inset 0 1px 0 rgba(255,255,255,0.1);
        min-width: 9rem; z-index: 300;
        opacity: 0; visibility: hidden;
        transition: opacity 0.18s ease, visibility 0.18s ease;
        padding: 0.1rem 0;
      }
      .ksb-nav .ds-item.open > .ds-dropdown,
      .ksb-nav .ds-item:hover > .ds-dropdown { opacity: 1; visibility: visible; }
      .ksb-nav .ds-dropdown a {
        display: block; padding: 0.2rem 0.75rem;
        color: var(--drop-text); text-decoration: none;
        white-space: nowrap; letter-spacing: 0.02em;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        transition: background 0.1s, padding-left 0.1s, color 0.1s;
        font-size: 1rem; text-shadow: none; line-height: 1.5; box-sizing: border-box;
      }
      .ksb-nav .ds-dropdown a:last-child { border-bottom: none; }
      .ksb-nav .ds-dropdown a:hover {
        background: var(--drop-hover-bg); color: var(--drop-hover-text);
        padding-left: 1rem; cursor: pointer;
      }

      /* status */
      .ksb-status {
        display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
        padding: 0 1rem; color: var(--hdr-text);
        text-shadow: 0 1px 0 var(--hdr-text-shadow); font-size: 1rem;
      }
      .ksb-status-group { display: flex; align-items: center; gap: 0.5rem; }
      .sb-theme-btn {
        cursor: pointer; user-select: none; opacity: 0.8;
        transition: opacity 0.2s, transform 0.1s; padding: 0 0.25rem;
      }
      .sb-theme-btn:hover { opacity: 1; transform: scale(1.1); }
      .sb-clock { font-size: 1.25rem; letter-spacing: 0.05em; }
      .sb-date  { opacity: 0.85; }
      .sb-stat  { display: flex; align-items: center; gap: 0.25rem; }
      .sb-stat-label { opacity: 0.8; }
      .sb-pill {
        width: 2.2rem; height: 0.4rem;
        background: var(--pill-bg); border: 1px solid var(--pill-border); overflow: hidden;
      }
      .sb-pill-fill { height: 100%; transition: width 1.2s ease; }
      .sb-pill-fill.hp  { background: #8ced8c; }
      .sb-pill-fill.bat { background: #8cc6ed; }
      .sb-pill-val { min-width: 1.8rem; opacity: 0.9; }
      .sb-steam { opacity: 0.9; }
      .sb-steam span { color: var(--steam-text); text-shadow: 0 1px 0 var(--steam-shadow); }
      .sb-visitors { opacity: 0.85; }

      /* submenus */
      .ds-submenu-wrap { position: relative; }
      .ds-submenu {
        position: absolute; top: -1px; left: calc(100% + 2px);
        background: var(--drop-bg); border: 1px solid var(--drop-border);
        border-top: 2px solid var(--drop-border-top); min-width: 9rem;
        opacity: 0; visibility: hidden; transition: opacity 0.18s ease;
        box-shadow: 2px 3px 0 var(--drop-shadow), inset 0 1px 0 rgba(255,255,255,0.1);
        z-index: 500;
      }
      .ds-submenu-wrap:hover > .ds-submenu { opacity: 1; visibility: visible; }
      .ds-submenu-arrow { float: right; opacity: 0.6; }

      /* responsive */
      @media (max-width: 60rem) {
        #kaia-single-bar { justify-content: center; }
        .ksb-status { justify-content: center; padding-bottom: 0.25rem; }
      }
      @media (max-width: 37.5rem) {
        .ksb-nav .ds-link { font-size: 1rem; padding: 0 0.625rem; height: 2rem; }
        #kaia-bar-row     { min-height: 2rem; }
        .ksb-status       { font-size: 0.875rem; gap: 0.5rem; }
        .sb-clock         { font-size: 1rem; }
        #kaia-music-row   { font-size: 0.8rem; gap: 0.3rem; }
        #ksb-volume       { width: 3rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── BUILD HEADER DOM ────────────────────────────────────────────────────────
  function buildHeader() {
    const bar = document.createElement("header");
    bar.id = "kaia-single-bar";

    // alert bar
    if (ALERT_TEXT) {
      const alertBar = document.createElement("div");
      alertBar.id = "kaia-alert-bar";
      alertBar.textContent = ALERT_TEXT;
      const closeBtn = document.createElement("button");
      closeBtn.id = "kaia-alert-close";
      closeBtn.textContent = "✕";
      closeBtn.title = "Dismiss";
      closeBtn.addEventListener("click", () => {
        alertBar.style.display = "none";
        sessionStorage.setItem("kaia-alert-dismissed", "1");
        syncSpacer();
      });
      alertBar.appendChild(closeBtn);
      if (sessionStorage.getItem("kaia-alert-dismissed") === "1") {
        alertBar.style.display = "none";
      }
      bar.appendChild(alertBar);
    }

    // nav + status row
    const barRow = document.createElement("div");
    barRow.id = "kaia-bar-row";

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
            const subTrigger = document.createElement("a");
            subTrigger.href = "#";
            subTrigger.innerHTML = child.label + '<span class="ds-submenu-arrow">&gt;</span>';
            wrapSub.appendChild(subTrigger);
            const subMenu = document.createElement("div");
            subMenu.className = "ds-submenu";
            child.submenu.forEach((sub) => {
              const subA = document.createElement("a");
              subA.href = sub.href;
              subA.textContent = sub.label;
              subA.addEventListener("click",      () => window.kaiaSound.play("click"));
              subA.addEventListener("mouseenter", () => window.kaiaSound.play("hover"));
              subMenu.appendChild(subA);
            });
            wrapSub.appendChild(subMenu);
            menu.appendChild(wrapSub);
          } else {
            const a = document.createElement("a");
            a.href = child.href;
            a.textContent = child.label;
            a.addEventListener("click",      () => window.kaiaSound.play("click"));
            a.addEventListener("mouseenter", () => window.kaiaSound.play("hover"));
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
        <span class="sb-steam">steam: <span id="sb-status">…</span> - playing: <span id="sb-game">…</span></span>
        <span class="sb-visitors">-  unique visitor #<span id="sb-visitors">…</span></span>
      </div>
    `;

    barRow.appendChild(navWrap);
    barRow.appendChild(statWrap);
    bar.appendChild(barRow);

    // music row
    if (PLAYLIST.length > 0) {
      const musicRow = document.createElement("div");
      musicRow.id = "kaia-music-row";
      musicRow.innerHTML = `
        <div id="ksb-music-left">
          <span id="ksb-music-note">♪</span>
          <span id="ksb-song-name">—</span>
        </div>
        <div id="ksb-music-right">
          <div id="ksb-transport">
            <button class="ksb-music-btn" id="ksb-prev" title="Previous">◄◄</button>
            <button class="ksb-music-btn" id="ksb-play" title="Play / Pause">►</button>
            <button class="ksb-music-btn" id="ksb-next" title="Next">►►</button>
          </div>
          <button id="ksb-repeat" title="Toggle repeat">⟳ off</button>
          <div class="ksb-vol-wrap">
            <span class="ksb-vol-label">vol</span>
            <input type="range" id="ksb-volume" min="0" max="1" step="0.01" value="${DEFAULT_VOL}">
          </div>
          <div id="ksb-song-select-wrap">
            <button id="ksb-song-select-btn" title="Song list">▼ songs</button>
            <div id="ksb-song-list"></div>
          </div>
        </div>
      `;
      bar.appendChild(musicRow);
    }

    document.addEventListener("click", () => {
      document.querySelectorAll(".ksb-nav .ds-item.open")
        .forEach(el => el.classList.remove("open"));
      const sw = document.getElementById("ksb-song-select-wrap");
      if (sw) sw.classList.remove("open");
    });

    return bar;
  }

  // ── MUSIC PLAYER ────────────────────────────────────────────────────────────
  // Seamless cross-page playback strategy:
  //   - On every timeupdate (fires ~4x/sec), we write currentTime to localStorage.
  //   - On page load we read that saved time and seek immediately via
  //     "loadedmetadata" so the audio resumes at the exact position.
  //   - We also record a wall-clock timestamp alongside the saved time so we can
  //     compensate for the few hundred ms of page-load overhead and seek even
  //     more accurately.
  //   - play() is attempted unconditionally when wasPlaying=true; modern browsers
  //     permit this when the user has previously interacted with the origin.
  //   - PLAYLIST entries: { file: "/music/foo.mp3", name: "Display Name" }
  //     The `file` path is never shown to the user — only `name` is displayed.
  //   - Shuffle is on by default; previous button walks actual play history.
  //   - Song-select dropdown lists all tracks by display name.

  let _audio      = null;
  let _shuffleQ   = [];   // PLAYLIST indices in shuffle order
  let _qPos       = 0;    // current position in _shuffleQ
  let _history    = [];   // stack of _shuffleQ positions we've actually played
  let _histPos    = -1;   // pointer into _history (-1 = live / at the front)
  let _playing    = false;
  let _repeat     = false;  // loop current track when true

  // Fisher-Yates shuffle
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function saveState() {
    const state = {
      shuffleQ:  _shuffleQ,
      qPos:      _qPos,
      history:   _history,
      histPos:   _histPos,
      time:      _audio ? _audio.currentTime : 0,
      savedAt:   Date.now(),           // wall-clock snapshot for drift correction
      volume:    _audio ? _audio.volume : DEFAULT_VOL,
      playing:   _playing,
      repeat:    _repeat,
    };
    try { localStorage.setItem(MUSIC_KEY, JSON.stringify(state)); } catch(e) {}
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(MUSIC_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }

  function currentTrackIdx() {
    if (_histPos >= 0 && _histPos < _history.length) {
      return _shuffleQ[_history[_histPos]];
    }
    return _shuffleQ[_qPos];
  }

  function updateUI() {
    const nameEl  = document.getElementById("ksb-song-name");
    const playBtn = document.getElementById("ksb-play");
    if (nameEl)  nameEl.textContent  = PLAYLIST[currentTrackIdx()].name;
    if (playBtn) playBtn.textContent = _playing ? "⏸" : "►";
    updateSongList();
  }

  function updateSongList() {
    const list = document.getElementById("ksb-song-list");
    if (!list) return;
    const active = currentTrackIdx();
    Array.from(list.children).forEach((el) => {
      el.classList.toggle("active", parseInt(el.dataset.idx) === active);
    });
  }

  function buildSongList() {
    const list = document.getElementById("ksb-song-list");
    if (!list) return;
    list.innerHTML = "";
    PLAYLIST.forEach((track, i) => {
      const btn = document.createElement("div");
      btn.className = "ksb-song-option";
      // Always show the display name — the file path is never exposed in the UI
      btn.textContent = track.name;
      btn.dataset.idx = i;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        jumpToTrack(i);
        const sw = document.getElementById("ksb-song-select-wrap");
        if (sw) sw.classList.remove("open");
      });
      list.appendChild(btn);
    });
  }

  // Jump to a specific PLAYLIST index directly (bypasses shuffle order)
  function jumpToTrack(playlistIdx, seekTo) {
    const vol = _audio ? _audio.volume : DEFAULT_VOL;
    // find it in shuffleQ or append it
    let qIdx = _shuffleQ.indexOf(playlistIdx);
    if (qIdx === -1) {
      _shuffleQ.push(playlistIdx);
      qIdx = _shuffleQ.length - 1;
    }
    pushHistory(_qPos);
    _qPos    = qIdx;
    _histPos = -1;
    loadTrack(playlistIdx, seekTo || 0, vol);
    if (_playing) _audio.play().catch(() => {});
    saveState();
  }

  function pushHistory(qIdx) {
    // trim any forward-history branch when the user acts from mid-history
    if (_histPos >= 0) {
      _history = _history.slice(_histPos);
      _histPos = -1;
    }
    _history.unshift(qIdx);
    if (_history.length > 100) _history.pop(); // cap memory
  }

  function loadTrack(playlistIdx, seekTo, vol) {
    if (_audio) { _audio.pause(); _audio.src = ""; }

    _audio = new Audio(PLAYLIST[playlistIdx].file);
    _audio.volume = (vol !== undefined) ? vol : DEFAULT_VOL;

    const volEl = document.getElementById("ksb-volume");
    if (volEl) volEl.value = _audio.volume;

    // Seek to the saved position once metadata is ready.
    // We also compensate for the small wall-clock gap since the state was saved
    // so the audio resumes exactly where it left off even across page loads.
    if (seekTo > 0) {
      _audio.addEventListener("loadedmetadata", () => {
        _audio.currentTime = Math.min(seekTo, _audio.duration || seekTo);
      }, { once: true });
    }

    _audio.addEventListener("ended", () => {
      if (_repeat) {
        _audio.currentTime = 0;
        _audio.play().catch(() => {});
      } else {
        goNext();
      }
    });

    // Persist position frequently so cross-page resume is seamless.
    // We write on every timeupdate (~4 Hz) rather than just every second.
    _audio.addEventListener("timeupdate", () => {
      if (_playing) saveState();
    });

    updateUI();
  }

  function goNext() {
    const vol = _audio ? _audio.volume : DEFAULT_VOL;
    if (_histPos > 0) {
      // we stepped back previously — go forward through history
      _histPos--;
      const trackIdx = _shuffleQ[_history[_histPos]];
      loadTrack(trackIdx, 0, vol);
    } else {
      // normal advance: push current onto history, move queue forward
      pushHistory(_qPos);
      _qPos = (_qPos + 1) % _shuffleQ.length;
      // when we exhaust the queue, reshuffle and extend (no repeat)
      if (_qPos === 0) {
        const newShuffle = shuffle(PLAYLIST.map((_, i) => i));
        _shuffleQ = _shuffleQ.concat(newShuffle);
        _qPos = _shuffleQ.length - newShuffle.length;
      }
      loadTrack(_shuffleQ[_qPos], 0, vol);
    }
    if (_playing) _audio.play().catch(() => {});
    saveState();
  }

  function goPrev() {
    const vol = _audio ? _audio.volume : DEFAULT_VOL;
    // If we're more than 3 s into the track, restart it first (standard behaviour)
    if (_audio && _audio.currentTime > 3) {
      _audio.currentTime = 0;
      updateUI();
      saveState();
      return;
    }
    // Walk backwards through actual play history
    if (_histPos < 0) {
      // Not yet walking history — push current position so we can come back forward
      pushHistory(_qPos);
      _histPos = 1; // jump past the entry we just pushed (that's where we are now)
    } else {
      _histPos++;
    }
    if (_histPos >= _history.length) {
      _histPos = _history.length - 1;
    }
    const trackIdx = _shuffleQ[_history[_histPos]];
    loadTrack(trackIdx, 0, vol);
    if (_playing) _audio.play().catch(() => {});
    saveState();
  }

  function startMusicRuntime() {
    if (PLAYLIST.length === 0) return;

    buildSongList();

    const saved = loadState();

    // Restore or initialise the shuffle queue
    if (saved && saved.shuffleQ && saved.shuffleQ.length > 0) {
      _shuffleQ = saved.shuffleQ;
      _qPos     = saved.qPos    || 0;
      _history  = saved.history || [];
      _histPos  = (saved.histPos !== undefined) ? saved.histPos : -1;
      _repeat   = !!saved.repeat;
    } else {
      _shuffleQ = shuffle(PLAYLIST.map((_, i) => i));
      _qPos     = 0;
      _history  = [];
      _histPos  = -1;
    }

    // Calculate the compensated seek position.
    // savedAt is the wall-clock time when saveState() last ran.
    // If we were playing, the song has been advancing while the page loaded,
    // so we add the elapsed wall-clock time to get the correct position.
    let startTime = (saved && saved.time) ? saved.time : 0;
    if (saved && saved.playing && saved.savedAt) {
      const driftSec = (Date.now() - saved.savedAt) / 1000;
      startTime = startTime + driftSec;
    }

    const startVol   = (saved && saved.volume) ? saved.volume : DEFAULT_VOL;
    const wasPlaying = saved ? !!saved.playing : false;

    loadTrack(currentTrackIdx(), startTime, startVol);

    // Attempt immediate resume.  Browsers permit this when the user has already
    // interacted with the origin (which they have — they navigated here from
    // another page on the same site).
    if (wasPlaying) {
      _playing = true;
      _audio.play().catch(() => {
        // Autoplay was blocked (e.g. first-ever visit with no prior interaction).
        // Fall back to paused state; user can press play manually.
        _playing = false;
        updateUI();
      });
      updateUI();
    }

    // ── Controls ──────────────────────────────────────────────────────────────
    const playBtn = document.getElementById("ksb-play");
    const prevBtn = document.getElementById("ksb-prev");
    const nextBtn = document.getElementById("ksb-next");
    const volEl   = document.getElementById("ksb-volume");
    const selWrap = document.getElementById("ksb-song-select-wrap");
    const selBtn  = document.getElementById("ksb-song-select-btn");

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (_playing) {
          _audio.pause();
          _playing = false;
        } else {
          _audio.play().catch(() => {});
          _playing = true;
        }
        updateUI();
        saveState();
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", goPrev);
    if (nextBtn) nextBtn.addEventListener("click", goNext);

    if (volEl) {
      volEl.value = startVol;
      volEl.addEventListener("input", () => {
        if (_audio) _audio.volume = parseFloat(volEl.value);
        saveState();
      });
    }

    if (selBtn && selWrap) {
      selBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        selWrap.classList.toggle("open");
      });
    }

    // repeat button
    const repeatBtn = document.getElementById("ksb-repeat");
    if (repeatBtn) {
      // sync initial visual state from restored save
      if (_repeat) { repeatBtn.classList.add("on"); repeatBtn.textContent = "⟳ on"; }
      repeatBtn.addEventListener("click", () => {
        _repeat = !_repeat;
        repeatBtn.classList.toggle("on", _repeat);
        repeatBtn.textContent = _repeat ? "⟳ on" : "⟳ off";
        saveState();
      });
    }
  }

  // ── GENERAL RUNTIME ─────────────────────────────────────────────────────────
  function startRuntime() {
    const themeBtn = document.getElementById("sb-theme-btn");
    const updateThemeIcon = () => {
      if (!themeBtn) return;
      themeBtn.textContent = document.body.classList.contains("dark-mode") ? "[ ☼ ]" : "[ ☾ ]";
    };
    if (themeBtn) {
      updateThemeIcon();
      themeBtn.addEventListener("click", () => {
        window.kaiaSound.play("click");
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("kaia-theme",
          document.body.classList.contains("dark-mode") ? "dark" : "light");
        updateThemeIcon();
      });
    }

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

    let hp  = Math.floor(Math.random() * 31) + 70;
    let bat = Math.floor(Math.random() * 101);
    const stateMap = { "0":"offline","1":"active!","2":"busy","3":"away~","4":"snooze","5":"trade","6":"play" };
    function nudge(v) {
      return Math.min(100, Math.max(0,
        v + (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 4) + 1)));
    }
    function updateStats() {
      hp = nudge(hp); bat = nudge(bat);
      const hpEl  = document.getElementById("sb-hp");
      const batEl = document.getElementById("sb-bat");
      const hpV   = document.getElementById("sb-hp-val");
      const batV  = document.getElementById("sb-bat-val");
      if (hpEl)  hpEl.style.width  = `${hp}%`;
      if (batEl) batEl.style.width = `${bat}%`;
      if (hpV)   hpV.textContent   = `${hp}%`;
      if (batV)  batV.textContent  = `${bat}%`;
      fetch("/.netlify/functions/getSteamStatus")
        .then(r => r.json())
        .then(d => {
          const s = document.getElementById("sb-status");
          const g = document.getElementById("sb-game");
          if (s) s.textContent = stateMap[String(d.status)] || "…";
          if (g) g.textContent = d.game || "n/a";
        })
        .catch(() => { const g = document.getElementById("sb-game"); if (g) g.textContent = "n/a"; });
    }
    updateStats();

    const id = localStorage.getItem("visitorID") || crypto.randomUUID();
    localStorage.setItem("visitorID", id);
    fetch(`/.netlify/functions/countVisits?visitorID=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.totalCount !== undefined) {
          const el  = document.getElementById("sb-visitors");
          const el2 = document.getElementById("visitor-count");
          if (el)  el.textContent  = d.totalCount;
          if (el2) el2.textContent = d.totalCount;
        }
      })
      .catch(() => {});

    startMusicRuntime();
  }

  // ── SPACER ──────────────────────────────────────────────────────────────────
  let _spacer    = null;
  let _headerBar = null;
  function syncSpacer() {
    if (_spacer && _headerBar) _spacer.style.height = _headerBar.offsetHeight + "px";
  }

  // ── INJECT ──────────────────────────────────────────────────────────────────
  function inject() {
    if (document.getElementById("kaia-single-bar")) return;
    injectStyles();

    _spacer    = document.createElement("div");
    _spacer.id = "kaia-header-spacer";
    _headerBar = buildHeader();

    document.body.insertBefore(_spacer,    document.body.firstChild);
    document.body.insertBefore(_headerBar, document.body.firstChild);

    startRuntime();

    window.addEventListener("resize", syncSpacer);
    setTimeout(syncSpacer, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

  window.injectHeader = inject;
})();