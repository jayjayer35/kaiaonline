(function () {
  "use strict";

  // ── ALERT BAR ───────────────────────────────────────────────────────────────
  // Set to null or "" to hide the alert bar entirely.
  const ALERT_TEXT = "";

  // ── PLAYLIST ────────────────────────────────────────────────────────────────
  // { file: "/music/filename.mp3", name: "Display Name" }
  // Shuffle is on by default. A song-select dropdown lists all tracks.
  const PLAYLIST = [
    { file: "/music/again.mp3",  name: "again, someday - kaiasei" },
    { file: "/music/moonsetter.mp3",  name: "Moonsetter - Homestuck" },
    { file: "/music/ki.mp3",  name: "Ki - C418" },
    { file: "/music/alpha.mp3",  name: "Alpha - C418" },
    { file: "/music/castlefunk.mp3",  name: "Castle Funk - Toby Fox" },
    { file: "/music/castletown.mp3",  name: "My Castle Town - Toby Fox" },
    { file: "/music/story.mp3",  name: "Before the Story - Toby Fox" },
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
        { label: "#me (wip)",     href: "/blog/me.html" },
        { label: "blog",     href: "/blog/index.html" },
        { label: "my lists", href: "/lists.html" },
      ],
      
    },
    {
      label: "for u",
      children: [
        { label: "friends", badge: "new",
          submenu: [
            { label: "memory vids", href: "/memoryvids.html", badge: "new"},
            { label: "hall of messages (wip)", href: "/msgs.html" },
          ]
        },
        { label: "photo museum",   href: "/museum.html" },
        { label: "my music", href: "/mymusic.html", badge: "updated" },
        { label: "recipes (wip)",   href: "/myrecipes.html" },
        { label: "web projects", href: "/mywebdev.html" },
      ],
    },
    {
      label: "web",
      children: [
        { label: "the indie web!", href: "/indieweb.html" },
        { label: "guestbook",   href: "/guestbook.html" },
        { label: "bookmarks", href: "/bookmarks.html" },
        { label: "shrines",
          submenu: [
            { label: "outer wilds", href: "/wilds.html" },
            { label: "megpoid gumi", href: "/gumi.html" },
            { label: "gaster (WIP)", href: "/gaster.html" },
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
        { label: "stamps",   href: "stamps (WIP)" },
      ],
    },
    {
      label: "other",
      children: [
        { label: "dont forget",    href: "/dontforget.html" },
        { label: "404", href: "/404.html" },
        { label: "landing", href: "/index.html" },
      ],
    },
  ];

  // ── APPLY SAVED THEME ───────────────────────────────────────────────────────
  const savedTheme = localStorage.getItem("kaia-theme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");

  // ── STYLES ──────────────────────────────────────────────────────────────────
  function injectStyles() {
  if (document.getElementById("kaia-header-styles")) return;

  const link = document.createElement("link");
  link.id = "kaia-header-styles";
  link.rel = "stylesheet";
  link.href = "/header.css";

  document.head.appendChild(link);
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

    // rotating ticker — centred absolutely inside the bar row
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

    // ── ROTATING TICKER ───────────────────────────────────────────────────────
    // Fetches /rotating-text.json and picks one random item to show for the
    // duration of the page load — no cycling.
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

  //flower
  if (Math.random() < 0.05) {

    const cornerLink = document.createElement('a');
    cornerLink.href = '/ofb/forest.html';

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
                   
  }

  //lancer
  if (Math.random() < 0.05) {

    const cornerLink = document.createElement('a');
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
                   
  }
})();