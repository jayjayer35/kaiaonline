//hey thanks for looking at my code! its sparsely notated, but maybe you can learn from it. 
//i also have a habit of just commenting out stuffi  dont wanna use (like all that unused music in there...) so try to not pay 
//mind to all of that. have fun going thru my mess!
(function () {
  "use strict";

  const ALERT_TEXT = "";

  const PLAYLIST = [
    // comment out whichever songs i dont want in the playlist
    //{ file: "/music/again.mp3",  name: "again, someday - kaiasei" },
    //{ file: "/music/moonsetter.mp3",  name: "Moonsetter - Homestuck" },
    //{ file: "/music/ki.mp3",  name: "Ki - C418" },
    //{ file: "/music/alpha.mp3",  name: "Alpha - C418" },
    //{ file: "/music/runningsky.mp3",  name: "Running Sky - Toby Fox" },
    //{ file: "/music/castlefunk.mp3",  name: "Castle Funk - Toby Fox" },
    { file: "/music/castletown.mp3",  name: "My Castle Town - Toby Fox" },
    //{ file: "/music/story.mp3",  name: "Before the Story - Toby Fox" },
    { file: "/music/walking.mp3",  name: "Walking Home - Toby Fox" },
    //{ file: "/music/comehome.mp3",  name: "You Can Always Come Home - Toby Fox" },
    { file: "/music/inlove.mp3",  name: "I guess I'm in love feat. Itoki Hana - Toby Fox" },
    { file: "/music/dinersong.mp3",  name: "The Diner Song of Best Friends - Toby Fox" },
    { file: "/music/scarletforest.mp3",  name: "Scarlet Forest - Toby Fox" },
    { file: "/music/byyourside.mp3",  name: "By Your Side. - OMORI" },
    { file: "/music/trees.mp3",  name: "Trees... - OMORI" },
    { file: "/music/tulip.mp3",  name: "A Home For Flowers - OMORI" },
    //{ file: "/music/scarlet.mp3",  name: "Scarlet Forest - Toby Fox & Trevor Alan Gomes" },
    //{ file: "/music/scarfor.mp3",  name: "Field of Hopes and Dreams (Credits Version) - Toby Fox & Trevor Alan Gomes" },
    //{ file: "/music/paradise.mp3",  name: "Welcome to Paradise - Emile van Krieken"   },
    //{ file: "/music/onceupon.mp3",  name: "Once upon a time... - Synthion"   },
    //{ file: "/music/aLupi.mp3",  name: "a Lupi - Synthion"   },
    { file: "/music/tea.mp3",  name: "Kokoro's Oolong Tea - Yusuka Tanaka"   },
    { file: "/music/memories.mp3",  name: "Comforting Memories - Kumi Tanioka" },
    //{ file: "/music/secunda.mp3",  name: "Secunda - Jeremy Soule"   },
    //{ file: "/music/xeno.mp3",  name: "Xeno Arcadia - Mason Lindroth & Chuck Salamone"   },
    //{ file: "/music/look.mp3",  name: "Something to Look For - Andrew Prahlow" },
    //{ file: "/music/timber.mp3",  name: "Timber Hearth - Andrew Prahlow" },
    //{ file: "/music/reprise.mp3",  name: "Outer Wilds Reprise - Andrew Prahlow" },
    { file: "/music/millhouse.mp3",  name: "The Millhouse - Talisk" },
    { file: "/music/raven.mp3",  name: "Fall (Raven's Descent) - ConcernedApe" },
    { file: "/music/ghost.mp3",  name: "Fall (Ghost Synth) - ConcernedApe" },
    { file: "/music/mushroom.mp3",  name: "Fall (The Smell of Mushroom) - ConcernedApe" },
    { file: "/music/house.mp3",  name: "House - Harvest Moon Tree of Tranquility OST"   },
    { file: "/music/easytake.mp3",  name: "Taking it Easy - Harvest Moon: Story of Seasons Grand Bazaar OST" },

    // hidden songs: not in the song list and never come up on shuffle,
    // only play from THEME_SONGS. keep these at the bottom of the list
    { file: "/music/dadfriend.mp3",  name: "Your Dad's Best Friend - Toby Fox", hidden: true },
  ];

  // playlist positions of the normal (not hidden) songs, used for shuffling
  function normalTracks() {
    return PLAYLIST.map((t, i) => i).filter(i => !PLAYLIST[i].hidden);
  }

  // EDIT ME: songs that fade in when someone switches to a theme while the
  // music is playing (picks one at random). use the same file paths as PLAYLIST.
  const THEME_SONGS = {
    omori:   ["/music/byyourside.mp3", "/music/trees.mp3", "/music/tulip.mp3"],
    flowery: ["/music/dadfriend.mp3"],
  };
  // EDIT ME: themes listed here hard-cut instead of fading: the old song
  // stops dead and the new one starts right away at full volume
  const THEME_SONG_CUT = ["flowery"];
  const THEME_FADE_OUT = 800;   // ms to fade out the old song
  const THEME_FADE_IN  = 2500;  // ms to fade in the new one

  const MUSIC_KEY   = "kaia-music";   // localStorage key
  const DEFAULT_VOL = 0.03;           // 0.0 – 1.0


  // ui sounds
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

  // nav structure
  const NAV = [
    { label: "home", href: "/indexnew.html", plain: true },
    {
      label: "kaia",
      children: [
        { label: "the webmistress",     href: "/kaia.html" },
        { label: "her diary",     href: "/blog/index.html" },
        { label: "scrapbook",   href: "/scrapbook.html" },
        { label: "friends", badge: "",
          submenu: [
            { label: "memory vids", href: "/memoryvids.html"},
            { label: "hall of messages (wip)", href: "/msgs.html" },
          ]
        },
        { label: "cliffside sunset", href: "/undertale/index.html", pauseMusic: true },
      ],
      
    },
    {
      label: "for u",
      children: [
        { label: "music", href: "/mymusic.html", badge: "" },
        { label: "recipes (wip)",   href: "/recipes.html" },
        { label: "web projects", href: "/mywebdev.html" },
      ],
    },
    {
      label: "web",
      children: [
        { label: "the indie web!", href: "/indieweb.html" },
        { label: "guestbook",   href: "/guestbook.html" , badge: "new"},
        { label: "bookmarks", href: "/bookmarks.html" },
        { label: "shrines",
          submenu: [
            { label: "outer wilds", href: "/wilds.html" },
            { label: "megpoid gumi", href: "/gumi.html" },
            { label: "deltarune (wip)", href: "/deltarune.html", pauseMusic: true  },
          ],
        },
        { label: "site archives",
          submenu: [
            { label: "archive 1 (original)", href: "/jacobonline-old/index.html" },
            { label: "archive 2 (revival)",  href: "/ofb/indexrm.html" },
            { label: "archive 3 (ship log)", href: "/ofb/indexlog.html" },
            { label: "archive 4 (dashboard)",href: "/indexold.html" },
        { label: "old update log", href: "/ofb/updates.html" },
          ]
        },
      ],
    },
    {
      label: "other",
      children: [
        { label: "starwalker",  href: "/ofb/starwalker.html" },
        { label: "admin panel",  href: "/draw-admin.html" },
        { label: "404", href: "/404.html" },
        { label: "landing", href: "/index.html" },
      ],
    },
  ];

  // apply theme
  const savedTheme = localStorage.getItem("kaia-theme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");

  // site color theme
  // EDIT ME: set to "winter", "fall", "spring", "flowery", "blossom" or "omori"
  // (body.theme-* / body.dark-mode.theme-* overrides live in
  // header.css and kaia-base.css). winter is the base :root colors.
  const SITE_THEME = "fall";
  //const SITE_THEME = "winter";
  const THEMES = ["winter", "fall", "spring", "flowery", "blossom", "omori"];
  function normalizeTheme(name) {
    if (name === "default") return "winter"; // old saved picks from before the rename
    return THEMES.includes(name) ? name : SITE_THEME;
  }
  // a visitor's own pick from the chat's /theme wins over SITE_THEME
  let savedSeason = null;
  try { savedSeason = localStorage.getItem("kaia-season"); } catch (e) {}
  const activeSeason = normalizeTheme(savedSeason || SITE_THEME);
  document.body.classList.add("theme-" + activeSeason);

  // theme helpers, shared by the nav toggle and the chat's /theme
  function updateThemeIcon() {
    const btn = document.getElementById("sb-theme-btn");
    if (btn) btn.textContent = document.body.classList.contains("dark-mode") ? "[ ☼ ]" : "[ ☾ ]";
  }
  function setDark(on) {
    document.body.classList.toggle("dark-mode", on);
    try { localStorage.setItem("kaia-theme", on ? "dark" : "light"); } catch (e) {}
    updateThemeIcon();
  }
  let updateLeaves = null; // set by the falling leaves code at the bottom
  let updateDrift  = null; // set by the drifting gif code at the bottom
  // EDIT ME: themes that flash the screen when someone switches to them.
  //   color = flash color, hold = ms it stays solid, fade = ms to fade out
  //   overlay = optional gif drawn over the flash that lingers after it
  //   overlayFade = ms for the overlay to fade out (make it longer than fade)
  const THEME_FLASH = {
    flowery: {
      color: "#f1eabf", hold: 80, fade: 700,
      overlay: "/assets/sparkleoverlay.gif", overlayFade: 700,
    },
  };
  function flashScreen(name) {
    const cfg = THEME_FLASH[name];
    if (!cfg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;pointer-events:none;" +
      "background:" + cfg.color + ";opacity:" + (reduce ? 0.35 : 1) + ";" +
      "transition:opacity " + cfg.fade + "ms ease-out;";
    document.body.appendChild(el);

    // sparkle gif on top of the flash, fading out slower so it lingers
    let over = null;
    if (cfg.overlay) {
      over = document.createElement("div");
      // ?t= makes the gif start from its first frame every time
      const src = cfg.overlay + "?t=" + Date.now();
      over.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;pointer-events:none;" +
        "background:url('" + src + "') center / cover no-repeat;" +
        "image-rendering:pixelated;opacity:1;" +
        "transition:opacity " + cfg.overlayFade + "ms ease-in;";
      document.body.appendChild(over);
    }

    // the theme swaps underneath while the screen is covered, then it fades
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), cfg.fade + 50);
      if (over) {
        over.style.opacity = "0";
        setTimeout(() => over.remove(), cfg.overlayFade + 50);
      }
    }, cfg.hold);
  }

  function setSeason(name) { // any name in THEMES
    name = normalizeTheme(name);
    flashScreen(name);
    THEMES.forEach(t => document.body.classList.remove("theme-" + t));
    document.body.classList.add("theme-" + name);
    try { localStorage.setItem("kaia-season", name); } catch (e) {}
    if (updateLeaves) updateLeaves(name);
    if (updateDrift)  updateDrift(name);
    applyTileArt(name);
    applyHangers(name);
    applyPanBg(name);
    playThemeSong(name);
  }

  // panning backgrounds. EDIT ME: themes listed here get an image that tiles
  // and slides left forever. speed = pixels per second.
  // scale = "auto" picks the smallest whole-number zoom that makes one tile at
  // least as tall as the window, or put a number (1, 2, 3...) to force one.
  // zoom is counted in real screen pixels, so it stays crisp on laptops/phones
  // with display scaling (125%, 150%, retina...) instead of going blurry.
  const PAN_BACKGROUNDS = {
    omori: { src: "/assets/whitespace.png", scale: "auto", speed: 20 },
  };
  let _panImg = null, _panCfg = null;
  function sizePanBg() {
    if (!_panImg || !_panCfg) return;
    const b   = document.body;
    const dpr = window.devicePixelRatio || 1;
    const nw  = _panImg.naturalWidth, nh = _panImg.naturalHeight;
    let k = _panCfg.scale;
    if (k === "auto") k = Math.max(1, Math.ceil((window.innerHeight * dpr) / nh));
    const devW = nw * k;          // tile width in real screen pixels
    const cssW = devW / dpr;      // same width in css pixels
    b.style.setProperty("--pan-w", cssW + "px");
    b.style.setProperty("--pan-dur", (cssW / _panCfg.speed) + "s");
    b.style.setProperty("--pan-steps", String(devW)); // move 1 screen pixel per step
  }
  function applyPanBg(name) {
    const b = document.body;
    const cfg = PAN_BACKGROUNDS[name];
    if (!cfg) { b.classList.remove("kaia-pan-bg"); _panImg = _panCfg = null; return; }
    const img = new Image();
    img.onload = () => {
      if (!b.classList.contains("theme-" + name)) return; // theme changed while loading
      _panImg = img; _panCfg = cfg;
      b.style.setProperty("--pan-image", `url("${cfg.src}")`);
      sizePanBg();
      b.classList.add("kaia-pan-bg");
    };
    img.src = cfg.src;
  }
  window.addEventListener("resize", sizePanBg); // also fires on browser zoom
  applyPanBg(activeSeason);

  // things that hang down from the bottom of the header bar, per theme.
  // EDIT ME:
  //   src       = the image
  //   scale     = how many times bigger than its real size (whole numbers stay crisp)
  //   positions = where along the bar each one hangs, from the left
  //               (add more to the list for more vines, e.g. ["12%", "78%"])
  const HEADER_HANGERS = {
    flowery: { src: "/assets/Flowery_overworld_vine.gif", scale: 2, positions: ["12%"] },
  };
  function applyHangers(name) {
    document.querySelectorAll(".kaia-hanger").forEach(el => el.remove());
    const cfg = HEADER_HANGERS[name];
    const bar = document.getElementById("kaia-single-bar");
    if (!cfg || !bar) return;
    const probe = new Image();
    probe.onload = () => {
      if (!document.body.classList.contains("theme-" + name)) return; // theme changed while loading
      if (bar.querySelector(".kaia-hanger")) return;
      cfg.positions.forEach(pos => {
        const img = document.createElement("img");
        img.src = cfg.src;
        img.alt = "";
        img.className = "kaia-hanger";
        img.style.left   = pos;
        img.style.width  = (probe.naturalWidth  * cfg.scale) + "px";
        img.style.height = (probe.naturalHeight * cfg.scale) + "px";
        bar.appendChild(img);
      });
    };
    probe.src = cfg.src;
  }

  // style
  function injectStyles() {
  if (document.getElementById("kaia-header-styles")) return;

  const link = document.createElement("link");
  link.id = "kaia-header-styles";
  link.rel = "stylesheet";
  link.href = "/header.css";

  document.head.appendChild(link);
}

  // egg room nav chance 1/1000
  const EGG_CHANCE = 0.0001;
  const EGG_HREF   = "/khdjnerdwexr78r762/egg.html";
  function maybeRedirectToEgg(e) {
    const dest = e.currentTarget.getAttribute("href");
    if (dest === EGG_HREF) return; 
    if (Math.random() < EGG_CHANCE) {
      e.preventDefault();
      window.location.href = EGG_HREF;
    }
  }

  // make header
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
        a.addEventListener("click",      maybeRedirectToEgg);
        a.addEventListener("mouseenter", () => window.kaiaSound.play("hover"));
        wrap.appendChild(a);
      } else {
        const trigger = document.createElement("span");
        trigger.className = "ds-link";
        trigger.textContent = item.label;
        wrap.appendChild(trigger);

        const menu = document.createElement("div");
        menu.className = "ds-dropdown";

        item.children.forEach((child) => {
          if (child.submenu) {
            const wrapSub = document.createElement("div");
            wrapSub.className = "ds-submenu-wrap";
            const subTrigger = document.createElement("a");
            subTrigger.href = "#";
            subTrigger.textContent = child.label.replace(/ *>$/, "");
            if (child.badge) {
              const b = document.createElement("span");
              b.className = "ds-badge ds-badge--" + child.badge;
              b.textContent = "!";
              subTrigger.appendChild(b);
            }
            const subArrow = document.createElement("span");
            subArrow.className = "ds-sub-arrow";
            subArrow.textContent = "›";
            subTrigger.appendChild(subArrow);
            wrapSub.appendChild(subTrigger);
            const subMenu = document.createElement("div");
            subMenu.className = "ds-submenu";
            child.submenu.forEach((sub) => {
              const subA = document.createElement("a");
              subA.href = sub.href;
              subA.textContent = sub.label;
              if (sub.badge) {
                const b = document.createElement("span");
                b.className = "ds-badge ds-badge--" + sub.badge;
                b.textContent = "!";
                subA.appendChild(b);
              }
              subA.addEventListener("click",      () => window.kaiaSound.play("click"));
              subA.addEventListener("click",      maybeRedirectToEgg);
              subA.addEventListener("mouseenter", () => window.kaiaSound.play("hover"));
              subMenu.appendChild(subA);
            });
            wrapSub.appendChild(subMenu);
            menu.appendChild(wrapSub);
          } else {
            const a = document.createElement("a");
            a.href = child.href;
            a.textContent = child.label;
            if (child.badge) {
              const b = document.createElement("span");
              b.className = "ds-badge ds-badge--" + child.badge;
              b.textContent = "!";
              a.appendChild(b);
            }
            a.addEventListener("click",      () => window.kaiaSound.play("click"));
            a.addEventListener("click",      maybeRedirectToEgg);
            a.addEventListener("mouseenter", () => window.kaiaSound.play("hover"));
            if (child.pauseMusic) a.addEventListener("click", pauseMusic);
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
      <div class="ksb-status-group" title="kaia's health">
        <span class="sb-stat">
          <span class="sb-stat-label">hp</span>
          <div class="sb-pill"><div class="sb-pill-fill hp" id="sb-hp" style="width:85%"></div></div>
          <span class="sb-pill-val" id="sb-hp-val">85%</span>
        </span>
        <span class="sb-stat" title="kaia's social battery">
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

    const tickerRow = document.createElement("div");
    tickerRow.id = "kaia-ticker-row";
    tickerRow.innerHTML = `
      <span id="kaia-ticker-label"></span>
      <span id="kaia-ticker-text">…</span>
    `;

    barRow.appendChild(navWrap);
    barRow.appendChild(tickerRow);
    barRow.appendChild(statWrap);
    bar.appendChild(barRow);

    // music
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

  // ---- kaia music player new and improved 100000x better than the last ---------------------------------------

  let _audio      = null;
  let _shuffleQ   = [];   // playlist makes in shuffle order
  let _qPos       = 0;       // current position in _shuffleQ
  let _history    = [];          // history of _shuffleQ positions its actually played
  let _histPos    = -1;     // pointer into _history (-1 = live / at the front)
  let _playing    = false;
  let _repeat     = false;  // loop current track when true

  // shuffle code i ripped from someone elses code
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // while a theme song is fading, _audio.volume is temporarily low, so this
  // gives the volume the player is actually set to
  let _fadeTarget = null;
  let _fadeTimer  = null;
  function curVol() {
    if (_fadeTarget !== null) return _fadeTarget;
    return _audio ? _audio.volume : DEFAULT_VOL;
  }

  function saveState() {
    const state = {
      shuffleQ:  _shuffleQ,
      qPos:      _qPos,
      history:   _history,
      histPos:   _histPos,
      time:      _audio ? _audio.currentTime : 0,
      savedAt:   Date.now(),          
      volume:    curVol(),
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

  // pause music (used by nav links flagged with pauseMusic: true)
  function pauseMusic() {
    if (!_playing || !_audio) return;
    _audio.pause();
    _playing = false;
    updateUI();
    saveState();
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
      if (track.hidden) return; // hidden songs stay off the list
      const btn = document.createElement("div");
      btn.className = "ksb-song-option";
      // always show the display name 
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

  // jump to a specific PLAYLIST index directly
  function jumpToTrack(playlistIdx, seekTo, startVol) {
    const vol = (startVol !== undefined) ? startVol : curVol();
    // find it in shuffleQ or append 
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
    // trim any forward-history branch when acted from mid-history
    if (_histPos >= 0) {
      _history = _history.slice(_histPos);
      _histPos = -1;
    }
    _history.unshift(qIdx);
    if (_history.length > 100) _history.pop(); // cap memory, this might be overkill
  }

  function loadTrack(playlistIdx, seekTo, vol) {
    if (_audio) { _audio.pause(); _audio.src = ""; }

    _audio = new Audio(PLAYLIST[playlistIdx].file);
    _audio.volume = (vol !== undefined) ? vol : DEFAULT_VOL;

    const volEl = document.getElementById("ksb-volume");
    if (volEl) volEl.value = curVol();

    // goto saved position once metadata is ready.
    // compensates for the small wall-clock gap since the state was saved
    // audio needs to resume exactly where it left off even across page loads. IMPORTANT
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

    _audio.addEventListener("timeupdate", () => {
      if (_playing) saveState();
    });

    updateUI();
  }

  function goNext() {
    const vol = curVol();
    if (_histPos > 0) {
      // we stepped back previously, go forward through history
      _histPos--;
      const trackIdx = _shuffleQ[_history[_histPos]];
      loadTrack(trackIdx, 0, vol);
    } else {
      // normal advance: push current onto history, move queue forward
      pushHistory(_qPos);
      _qPos = (_qPos + 1) % _shuffleQ.length;
      // when q exhausted, reshuffle and extend (no repeat)
      if (_qPos === 0) {
        const newShuffle = shuffle(normalTracks());
        _shuffleQ = _shuffleQ.concat(newShuffle);
        _qPos = _shuffleQ.length - newShuffle.length;
      }
      loadTrack(_shuffleQ[_qPos], 0, vol);
    }
    if (_playing) _audio.play().catch(() => {});
    saveState();
  }

  function goPrev() {
    const vol = curVol();
    // if more than 3 s into the track, restart it first
    if (_audio && _audio.currentTime > 3) {
      _audio.currentTime = 0;
      updateUI();
      saveState();
      return;
    }
    // Walk backwards through actual play history
    if (_histPos < 0) {
      // Not yet walking history, push current position so we can come back forward
      pushHistory(_qPos);
      _histPos = 1; // jump past the entry we just pushed 
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

  // ---- theme songs: fade out whatever's on, fade in a song for the theme
  function stopFade() {
    if (_fadeTimer) clearInterval(_fadeTimer);
    _fadeTimer = null;
    _fadeTarget = null;
  }

  function fadeTo(to, ms, done) {
    if (_fadeTimer) clearInterval(_fadeTimer);
    const audio = _audio;
    const from  = audio.volume;
    const start = performance.now();
    _fadeTimer = setInterval(() => {
      // song got skipped/changed mid-fade: put the volume back and stop
      if (audio !== _audio) {
        const v = curVol();
        stopFade();
        if (_audio) _audio.volume = v;
        return;
      }
      const t = Math.min(1, (performance.now() - start) / ms);
      audio.volume = from + (to - from) * t;
      if (t >= 1) {
        clearInterval(_fadeTimer);
        _fadeTimer = null;
        if (done) done();
      }
    }, 30);
  }

  function playThemeSong(theme) {
    const files = THEME_SONGS[theme];
    if (!files || !_audio || !_playing) return; // only when music is on
    const choices = files
      .map(f => PLAYLIST.findIndex(t => t.file === f))
      .filter(i => i >= 0);
    if (!choices.length) return;
    if (choices.includes(currentTrackIdx())) return; // already on one of them

    const pick   = choices[Math.floor(Math.random() * choices.length)];

    if (THEME_SONG_CUT.includes(theme)) {
      const vol = curVol();
      stopFade();                 // cancel any fade still going from another theme
      jumpToTrack(pick, 0, vol);  // old song stops, new one starts instantly
      return;
    }

    const target = curVol();
    _fadeTarget  = target;
    fadeTo(0, THEME_FADE_OUT, () => {
      jumpToTrack(pick, 0, 0);          // new song starts silent...
      fadeTo(target, THEME_FADE_IN, () => { // ...and fades up
        _fadeTarget = null;
        saveState();
      });
    });
  }

  function startMusicRuntime() {
    if (PLAYLIST.length === 0) return;

    buildSongList();

    const saved = loadState();

    // Restore or initialize the shuffle queue
    if (saved && saved.shuffleQ && saved.shuffleQ.length > 0) {
      _shuffleQ = saved.shuffleQ;
      _qPos     = saved.qPos    || 0;
      _history  = saved.history || [];
      _histPos  = (saved.histPos !== undefined) ? saved.histPos : -1;
      _repeat   = !!saved.repeat;
    } else {
      _shuffleQ = shuffle(normalTracks());
      _qPos     = 0;
      _history  = [];
      _histPos  = -1;
    }

    let startTime = (saved && saved.time) ? saved.time : 0;
    if (saved && saved.playing && saved.savedAt) {
      const driftSec = (Date.now() - saved.savedAt) / 1000;
      startTime = startTime + driftSec;
    }

    const startVol   = (saved && saved.volume) ? saved.volume : DEFAULT_VOL;
    const wasPlaying = saved ? !!saved.playing : false;
    const pageMuted  = document.body.hasAttribute("data-pause-music");
    // pages with <body data-autoplay-music> start the music on load,
    // even if it was paused before (the homepage uses this)
    const pageAutoplay = document.body.hasAttribute("data-autoplay-music");

    loadTrack(currentTrackIdx(), startTime, startVol);

    // pages with <body data-pause-music> stay silent: save as paused,
    // keeping the song's position so it picks up from the same spot later
    if (pageMuted && wasPlaying) {
      try {
        localStorage.setItem(MUSIC_KEY, JSON.stringify({
          ...saved, time: startTime, playing: false, savedAt: Date.now(),
        }));
      } catch (e) {}
    }

    // Attempt immediate resume.  Browsers permit this when the user has already
    // interacted with the origin
    let userUsedPlayer = false; // set when they press play/pause themselves
    if ((wasPlaying || pageAutoplay) && !pageMuted) {
      _playing = true;
      _audio.play().catch(() => {
        // Autoplay was blocked (first-ever visit with no prior interaction or LOSERS with autoplay off).
        // show paused, then start on their first click/tap/keypress anywhere
        _playing = false;
        updateUI();
        const events = ["pointerdown", "keydown", "touchstart"];
        const startOnFirstTouch = (e) => {
          events.forEach(ev => document.removeEventListener(ev, startOnFirstTouch, true));
          if (userUsedPlayer || _playing) return;
          // clicking the play button itself is handled by the button
          if (e.target && e.target.closest && e.target.closest("#ksb-play")) return;
          _audio.play().then(() => {
            _playing = true;
            updateUI();
            saveState();
          }).catch(() => {});
        };
        events.forEach(ev => document.addEventListener(ev, startOnFirstTouch, true));
      });
      updateUI();
    }

    // ----------------------- controls
    const playBtn = document.getElementById("ksb-play");
    const prevBtn = document.getElementById("ksb-prev");
    const nextBtn = document.getElementById("ksb-next");
    const volEl   = document.getElementById("ksb-volume");
    const selWrap = document.getElementById("ksb-song-select-wrap");
    const selBtn  = document.getElementById("ksb-song-select-btn");

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        userUsedPlayer = true;
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
        stopFade();
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

  // general navbar operations
  function startRuntime() {
    const themeBtn = document.getElementById("sb-theme-btn");
    if (themeBtn) {
      updateThemeIcon();
      themeBtn.addEventListener("click", () => {
        window.kaiaSound.play("click");
        setDark(!document.body.classList.contains("dark-mode"));
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

    let hp  = Math.floor(Math.random() * 71);
    let bat = Math.floor(Math.random() * 51);
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
    // shows "?" instead of a forever "…" if the counter fails, and says why
    // in the browser console (F12)
    const showVisitors = (v) => {
      const el  = document.getElementById("sb-visitors");
      const el2 = document.getElementById("visitor-count");
      if (el)  el.textContent  = v;
      if (el2) el2.textContent = v;
    };
    fetch(`/.netlify/functions/countVisits?visitorID=${encodeURIComponent(id)}`)
      .then(r => r.json().catch(() => ({ error: "not json (status " + r.status + ")" })))
      .then(d => {
        if (d.totalCount !== undefined) showVisitors(d.totalCount);
        else { showVisitors("?"); console.warn("visitor counter:", d.error || d); }
      })
      .catch(e => { showVisitors("?"); console.warn("visitor counter:", e); });

    startMusicRuntime();

    // random splash
    // Fetch from /splashes.json and picks one random item to show for the
    const TICKER_SRC = "/splashes.json";

    (function startTicker() {
      const textEl = document.getElementById("kaia-ticker-text");
      if (!textEl) return;

      fetch(TICKER_SRC)
        .then(r => r.json())
        .then(data => {
          const items = Array.isArray(data) ? data : (data.items || []);
          if (!items.length) return;
          textEl.textContent = items[Math.floor(Math.random() * items.length)];
          syncSpacer();
        })
        .catch(() => {
          // silently hide the row if the file can't be loaded
          const row = document.getElementById("kaia-ticker-row");
          if (row) row.style.display = "none";
          syncSpacer();
        });
    })();
  }

  // spacer
  let _spacer    = null;
  let _headerBar = null;
  function syncSpacer() {
    if (_spacer && _headerBar) _spacer.style.height = _headerBar.offsetHeight + "px";
  }

  // inject
  function inject() {
    if (document.getElementById("kaia-single-bar")) return;
    injectStyles();

    _spacer    = document.createElement("div");
    _spacer.id = "kaia-header-spacer";
    _headerBar = buildHeader();

    document.body.insertBefore(_spacer,    document.body.firstChild);
    document.body.insertBefore(_headerBar, document.body.firstChild);

    startRuntime();
    applyHangers(activeSeason);

    window.addEventListener("resize", syncSpacer);
    setTimeout(syncSpacer, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

  window.injectHeader = inject;

  // corner popups. each one shows up on its own 5% of the time, and the
  // chat's /forest, /lancer and /flowery can call them directly.
  // they return false if that popup is already on the page.

  //flower (forest orchid)
  function showOrchid() {
    if (document.getElementById('kaia-pop-orchid')) return false;

    const cornerLink = document.createElement('a');
    cornerLink.id = 'kaia-pop-orchid';
    cornerLink.href = '/ofb/forest.html';
    cornerLink.addEventListener('click', pauseMusic);

    const cornerImg = document.createElement('img');

    cornerImg.src = '/assets/orchid.gif';

    Object.assign(cornerImg.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      zIndex: '9999',
      imageRendering: 'pixelated',
      cursor: 'pointer',
      transform: 'scale(1.5)',
      transformOrigin: 'bottom left'
    });

    cornerLink.appendChild(cornerImg);
    document.body.appendChild(cornerLink);
    return true;
  }

  //lancer
  function showLancer() {
    if (document.getElementById('kaia-pop-lancer')) return false;

    const cornerLink = document.createElement('a');
    cornerLink.id = 'kaia-pop-lancer';
    cornerLink.href = 'https://deltarune.com/lancer';

    const cornerImg = document.createElement('img');

    cornerImg.src = '/assets/lancer.gif';

    Object.assign(cornerImg.style, {
      position: 'fixed',
      bottom: '0',
      right: '0',
      zIndex: '9999',
      imageRendering: 'pixelated',
      cursor: 'pointer',
      transform: 'scale(1.5)',
      transformOrigin: 'bottom right'
    });

    cornerLink.appendChild(cornerImg);
    document.body.appendChild(cornerLink);
    return true;
  }

// flowery
  function showFlowery() {
      if (document.getElementById('kaia-pop-flowery')) return false;

      const cornerImg = document.createElement('img');
      cornerImg.id = 'kaia-pop-flowery';
      cornerImg.src = '/assets/floweryidle.gif';

      Object.assign(cornerImg.style, {
          position: 'fixed',
          bottom: '0',
          right: '0',
          zIndex: '9999',
          imageRendering: 'pixelated',
          cursor: 'pointer',
          transform: 'scale(1.5)',
          transformOrigin: 'bottom right'
      });

      const sounds = [
          '/assets/flowery_voice/1.wav',
          '/assets/flowery_voice/2.wav',
          '/assets/flowery_voice/3.wav',
          '/assets/flowery_voice/4.wav',
          '/assets/flowery_voice/5.wav',
          '/assets/flowery_voice/6.wav',
          '/assets/flowery_voice/7.wav',
          '/assets/flowery_voice/8.wav',
          '/assets/flowery_voice/9.wav',
          '/assets/flowery_voice/10.wav',
          '/assets/flowery_voice/11.wav',
          '/assets/flowery_voice/14.wav',
          '/assets/flowery_voice/15.wav',
          '/assets/flowery_voice/16.wav',
          '/assets/flowery_voice/17.wav',
          '/assets/flowery_voice/18.wav',
      ];

      const audio = new Audio();
      audio.volume = 0.5; // Half volume

      cornerImg.addEventListener('click', () => {
          // stop whatever is currently playing
          audio.pause();
          audio.currentTime = 0;

          audio.src = sounds[Math.floor(Math.random() * sounds.length)];

          audio.play();
      });

      document.body.appendChild(cornerImg);
      return true;
  }

  if (Math.random() < 0.05) showOrchid();
  if (Math.random() < 0.05) showLancer();
  if (Math.random() < 0.05) showFlowery();

  // hand these to the homepage chat (/lancer, /flowery, /forest, /theme)
  window.kaiaHooks = Object.assign(window.kaiaHooks || {}, {
    lancer:  showLancer,
    flowery: showFlowery,
    forest:  showOrchid,
    theme:   { setDark, setSeason, list: THEMES }
  });


// YAM YAM
  if (Math.random() < 0.05) {

      const cornerImg = document.createElement('img');
      cornerImg.src = '/assets/YAM.png';

      Object.assign(cornerImg.style, {
          position: 'fixed',
          bottom: '0',
          right: '0',
          zIndex: '9999',
          imageRendering: 'pixelated',
          cursor: 'pointer',
          transform: 'scale(.125)',
          transformOrigin: 'bottom right'
      });

      const sounds = [
          '/assets/sneeze.wav',
      ];

      const audio = new Audio();
      audio.volume = 0.25;

      cornerImg.addEventListener('click', () => {
          audio.pause();
          audio.currentTime = 0;

          audio.src = sounds[Math.floor(Math.random() * sounds.length)];

          audio.play();
      });

      document.body.appendChild(cornerImg);
  }

  // matter.js falling particle, i ripped from a site as well...
  const LEAVES_ENABLED  = true;
  const LEAF_MAX_COUNT  = 30;
  // EDIT ME: which image falls for each theme. themes not listed here get nothing
  const LEAF_IMAGES = {
    winter: "/assets/flake.png",
    fall:   "/assets/leaf.png",
    blossom: "/assets/petal.png",
  };

  // pages with <body data-no-leaves> skip the falling leaves
  const pageNoLeaves = document.body && document.body.hasAttribute("data-no-leaves");

  if (LEAVES_ENABLED && !pageNoLeaves && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    (function initLeaves() {
      const canvas = document.createElement("canvas");
      canvas.id = "kaia-leaf-canvas";
      document.body.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      const leafImg = new Image();

      let imgReady = false;
      let running  = false;
      leafImg.addEventListener("load", () => { imgReady = true; });

      // swaps the falling image to match the theme, or stops it entirely
      function applyTheme(name) {
        const src = LEAF_IMAGES[name];
        if (!src) {
          running = false;
          imgReady = false;
          ctx.clearRect(0, 0, w, h);
          canvas.style.display = "none";
          return;
        }
        canvas.style.display = "";
        if (leafImg.getAttribute("src") !== src) {
          imgReady = false;
          leafImg.src = src;
        } else if (leafImg.complete) {
          imgReady = true;
        }
        if (!running) {
          running = true;
          lastT = performance.now();
          requestAnimationFrame(tick);
        }
      }
      updateLeaves = applyTheme;

      let w = 0, h = 0;
      function resize() {
        w = canvas.width  = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener("resize", resize);

      function rand(min, max) { return Math.random() * (max - min) + min; }

      function makeLeaf(initial) {
        const size = rand(19, 39);
        return {
          x:         rand(0, w),
          y:         initial ? rand(-h, h) : -size - rand(0, h * 0.3),
          size,
          speedY:    rand(18, 42),     // px/sec
          swayAmp:   rand(20, 60),         // px
          swaySpeed: rand(0.4, 1.1),             // rad/sec
          swayPhase: rand(0, Math.PI * 2),
          rotation:  rand(0, Math.PI * 2),
          rotSpeed:  rand(-0.6, 0.6),           // rad/sec
          opacity:   rand(0.25, 0.65),
        };
      }

      const leaves = [];
      for (let i = 0; i < LEAF_MAX_COUNT; i++) leaves.push(makeLeaf(true));

      let lastT = performance.now();
      function tick(t) {
        if (!running) return;
        const dt = Math.min((t - lastT) / 1000, 0.05); // for tab-away jumps
        lastT = t;

        ctx.clearRect(0, 0, w, h);

        if (imgReady) {
          for (const leaf of leaves) {
            leaf.y         += leaf.speedY * dt;
            leaf.swayPhase += leaf.swaySpeed * dt;
            leaf.rotation  += leaf.rotSpeed * dt;

            if (leaf.y - leaf.size > h) Object.assign(leaf, makeLeaf(false));

            const drawX = leaf.x + Math.sin(leaf.swayPhase) * leaf.swayAmp;

            ctx.save();
            ctx.globalAlpha = leaf.opacity;
            ctx.translate(drawX, leaf.y);
            ctx.rotate(leaf.rotation);
            ctx.drawImage(leafImg, -leaf.size / 2, -leaf.size / 2, leaf.size, leaf.size);
            ctx.restore();
          }
        }

        requestAnimationFrame(tick);
      }
      applyTheme(activeSeason);
    })();
  }
  // tile art: on some themes, each panel has a chance to get a faded image
  // covering its background (behind the text). re-rolled on every page load.
  // EDIT ME:
  //   images   = pictures to pick from (list every file, like the petals)
  //   chance   = 0 to 1, how likely each panel is to get one (0.3 = 30%)
  //   opacity  = how faded it is in light mode (0 invisible, 1 full)
  //   darkOpacity = same, for dark mode
  //   pixelated = true for pixel art, false for smooth pictures
  const TILE_ART = {
    flowery: {
      images: [
        "/assets/flowerytiles/tile1.png",   
        "/assets/flowerytiles/tile2.png",
        "/assets/flowerytiles/tile3.png",
      ],
      chance: 0.35, opacity: 0.18, darkOpacity: 0.12, pixelated: true,
    },
  };
  const TILE_ART_TARGETS = ".panel, .tile, .post"; // which boxes can get art

  function applyTileArt(name) {
    // clear old art first
    document.querySelectorAll(".kaia-tile-art").forEach(el => el.remove());
    document.querySelectorAll(".kaia-has-tile-art").forEach(el => el.classList.remove("kaia-has-tile-art"));

    const cfg = TILE_ART[name];
    if (!cfg || !cfg.images.length) return;
    const b = document.body;
    b.style.setProperty("--tile-art-opacity", cfg.opacity);
    b.style.setProperty("--tile-art-opacity-dark", cfg.darkOpacity);

    document.querySelectorAll(TILE_ART_TARGETS).forEach(box => {
      if (Math.random() >= cfg.chance) return;
      const art = document.createElement("div");
      art.className = "kaia-tile-art" + (cfg.pixelated ? " pixelated" : "");
      const src = cfg.images[Math.floor(Math.random() * cfg.images.length)];
      art.style.backgroundImage = `url("${src}")`;
      box.classList.add("kaia-has-tile-art");
      box.insertBefore(art, box.firstChild);
    });
  }
  applyTileArt(activeSeason);

  // drifting gifs: for themes with an animated gif (canvas only draws a gif's
  // first frame, so these are real <img>s). they fall from the top and drift
  // at an angle like they're caught in the wind: no swaying, no spinning.
  // EDIT ME:
  //   srcs   = the gifs to pick from (each petal picks one at random). websites
  //            can't look inside a folder, so every file has to be listed here
  //   count  = how many on screen at once
  //   scales = sizes to pick from, as multiples of the gif's real size
  //            (whole numbers keep pixel art crisp)
  //   wind   = 1 blows them right, -1 blows them left
  const DRIFT_PARTICLES = {
    flowery: {
      srcs: [
        "/assets/flowerypetals/flowerpetal1.gif",
        "/assets/flowerypetals/flowerpetal2.gif",
        "/assets/flowerypetals/flowerpetal3.gif",
        "/assets/flowerypetals/flowerpetal4.gif",
        "/assets/flowerypetals/flowerpetal5.gif",
        "/assets/flowerypetals/flowerpetal6.gif",
        "/assets/flowerypetals/flowerpetal7.gif",
        "/assets/flowerypetals/flowerpetal8.gif",
      ],
      count: 22, scales: [1, 2], wind: 1,
    },
  };

  if (LEAVES_ENABLED && !pageNoLeaves && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    (function initDrift() {
      const layer = document.createElement("div");
      layer.id = "kaia-drift-layer";
      layer.style.display = "none";
      document.body.appendChild(layer);

      let cfg = null;
      let sizes = {};   // src -> { w, h } real size of each gif
      let parts = [];
      let running = false;
      let w = window.innerWidth, h = window.innerHeight;
      window.addEventListener("resize", () => { w = window.innerWidth; h = window.innerHeight; });

      function rand(min, max) { return Math.random() * (max - min) + min; }

      function reset(p, initial) {
        const loaded = Object.keys(sizes);
        const src    = loaded[Math.floor(Math.random() * loaded.length)];
        if (p.el.getAttribute("src") !== src) p.el.src = src;
        const scale = cfg.scales[Math.floor(Math.random() * cfg.scales.length)];
        p.pw = Math.round(sizes[src].w * scale);
        p.ph = Math.round(sizes[src].h * scale);
        p.el.style.width  = p.pw + "px";
        p.el.style.height = p.ph + "px";
        p.vy = rand(22, 50);               // px/sec downward
        p.vx = p.vy * rand(0.3, 1.6);      // sideways push: some fall steep, some glide flat
        p.el.style.opacity = rand(0.5, 0.9).toFixed(2);
        // start far enough upwind that they cross the screen, not just the corner
        const upwind = h * 1.6;
        if (cfg.wind > 0) p.x = rand(-upwind, w);
        else              p.x = rand(0, w + upwind);
        p.y = initial ? rand(-h, h) : -p.ph - rand(0, h * 0.3);
      }

      function applyTheme(name) {
        const c = DRIFT_PARTICLES[name];
        if (!c) {
          running = false;
          layer.style.display = "none";
          layer.innerHTML = "";
          parts = [];
          cfg = null;
          return;
        }
        if (cfg === c && running) return;
        cfg = c;
        sizes = {};
        // load every gif first to learn its size; skip any that fail (typos etc)
        let pending = c.srcs.length;
        c.srcs.forEach(src => {
          const probe = new Image();
          probe.onload  = () => { sizes[src] = { w: probe.naturalWidth, h: probe.naturalHeight }; done(); };
          probe.onerror = () => { console.warn("drift gif missing:", src); done(); };
          probe.src = src;
        });
        function done() {
          if (--pending > 0) return;
          if (cfg !== c || !Object.keys(sizes).length) return; // theme changed, or nothing loaded
          layer.innerHTML = "";
          parts = [];
          for (let i = 0; i < c.count; i++) {
            const el = document.createElement("img");
            el.alt = "";
            el.className = "kaia-drift";
            layer.appendChild(el);
            const p = { el };
            reset(p, true);
            parts.push(p);
          }
          layer.style.display = "";
          if (!running) {
            running = true;
            lastT = performance.now();
            requestAnimationFrame(tick);
          }
        }
      }
      updateDrift = applyTheme;

      let lastT = performance.now();
      function tick(t) {
        if (!running) return;
        if (!isFinite(t)) t = performance.now(); // live preview quirk
        const dt = Math.min((t - lastT) / 1000, 0.05);
        lastT = t;
        for (const p of parts) {
          p.x += p.vx * cfg.wind * dt;
          p.y += p.vy * dt;
          const gone = p.y > h + p.ph ||
                       (cfg.wind > 0 ? p.x > w + p.pw : p.x < -p.pw);
          if (gone) reset(p, false);
          // whole pixels so the pixel art doesn't blur between frames
          p.el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px)`;
        }
        requestAnimationFrame(tick);
      }

      applyTheme(activeSeason);
    })();
  }
})();