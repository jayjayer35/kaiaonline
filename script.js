// On mobile, the site doesn't run at all -- just show a static message
// instead. Everything below this still gets defined either way (that's
// harmless), but every actual "activation" point (event listeners,
// audio autoplay, the final startNode() call, etc.) is individually
// guarded with `if (!IS_MOBILE)` further down, so none of it actually
// runs on a phone/tablet.
// Detecting "mobile" by touch capability (pointer:coarse, maxTouchPoints)
// sounds reasonable but isn't -- plenty of Windows laptops (2-in-1s,
// touchscreen convertibles) report touch support while still being used
// with a real keyboard, and Firefox in particular tends to report those
// two checks more aggressively than Chrome on identical hardware. What
// actually matters here is "does this device have a keyboard", and
// touch support doesn't answer that -- OS identity does. So this checks
// navigator.userAgentData.mobile where the browser supports it (a
// purpose-built API for exactly this, correctly telling a touchscreen
// laptop apart from an actual phone), and otherwise falls back to
// matching known mobile OS names in the user agent string -- which is
// what Firefox always uses, since it doesn't support userAgentData, and
// "Windows" never matches that pattern.
const IS_MOBILE = (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean')
  ? navigator.userAgentData.mobile
  : /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (IS_MOBILE) {
  document.body.innerHTML = `
    <div style="position:fixed;inset:0;background:#000;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;">
      <div style="max-width:480px;width:100%;border:4px solid #fff;background:#000;color:#fff;font-family:'DialogueFont',monospace;font-size:20px;line-height:1.6em;padding:22px 26px;text-align:center;box-sizing:border-box;">
        This site does not work on mobile.<br>Please use a PC.
      </div>
    </div>
  `;
}

const game = document.getElementById('game');
const NATIVE_W = 640;
const NATIVE_H = 480;

function resize() {
  const scale = Math.min(window.innerWidth / NATIVE_W, window.innerHeight / NATIVE_H);
  const offsetX = (window.innerWidth - NATIVE_W * scale) / 2;
  const offsetY = (window.innerHeight - NATIVE_H * scale) / 2;
  game.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

if (!IS_MOBILE) {
  window.addEventListener('resize', resize);
  resize();
}

// ---- dialogue system ----
//   [p:300]              -- a pause in ms
//   [c:red]word[/c]      -- colors, use css color name (hex code might word lulz)
//   [music:/path.mp3]    -- starts playing specified track
//   [hide]               -- fades the whole textbox out
//
// ---- node graph ----
// Each node is one of:
//
//   someId: { text: "...", image: "/assets/anim/x.gif", next: "otherId" }
//     -> plain page. Pressing Z after it's done typing goes to `next`.
//        Leave `next` out (or null) to end the conversation there.
//
//   someId: { text: "...", choices: [
//       { label: "Yes", next: "idA" },
//       { label: "No",  next: "idB" }
//     ] }
//     -> after typing finishes, the text is replaced by a heart-cursor
//        choice grid (see #choice-grid) instead of waiting for Z.
//        Left/Right (and Up/Down, if you add more than 2) move the
//        selection, Z confirms, clicking/tapping works too.
//
// `image` is optional on every node (omit or leave "" to keep whatever
// scene is already showing).
//
// ---- where the actual nodes live ----
// The CURRENT/newest scene's nodes are loaded via a plain <script> tag
// in index.html (above this file, since it populates window.NODES,
// which the line below just reads) -- that has to happen immediately,
// before script.js even runs, since it's what autoplay/resume needs
// right away.
//
// OLDER scenes are different: their .js files are NOT referenced in
// index.html at all, so they never download on a normal visit. They're
// only loaded the moment someone opens LOG and actually picks one --
// see loadSceneScript()/ensureSceneLoaded() further down, which does
// this by injecting a <script> tag on demand. The file itself doesn't
// need to be anything special -- it's the exact same
// `window.NODES = window.NODES || {}; Object.assign(...)` shape either
// way; the only difference is WHEN the browser fetches it.
//
// IMPORTANT: node ids must be unique across every file, loaded eagerly
// or on demand -- two files defining the same id means whichever loads
// second silently overwrites the first. Prefix each scene's ids (s1_,
// s2_, s3_, ...) to stay safe -- this is exactly what broke scene1 once
// already.
//
// To add a new scene (i.e. you're posting something new):
//   1. Copy an existing file in /dialogue/ (e.g. dialogue/scene2.js) as
//      a starting point for the file shape.
//   2. Write your new nodes in the copy, under a fresh id prefix.
//   3. In index.html, add a new <script src="dialogue/your-file.js">
//      line, above the <script src="script.js"> line -- this makes it
//      the eagerly-loaded current scene.
//   4. Add an entry to SCENES below, as the new LAST entry (no
//      `scriptFile` field), pointing `startNode` at your new scene's
//      first node id.
//
// To archive the scene that was previously current:
//   1. Delete its <script> tag from index.html -- its .js file itself
//      doesn't need to change at all.
//   2. In its SCENES entry (below), add a `scriptFile` field pointing
//      at that same .js file, e.g. `scriptFile: 'dialogue/scene1.js'`.
//      That's what tells LOG to fetch it on demand instead of expecting
//      it to already be loaded.
const NODES = window.NODES || {};

// ---- scene log (past conversations, browsable from the menu) ----
// Each entry is a "scene": a label, the node id it starts at, and
// (only for older scenes not loaded up front) a `scriptFile` pointing
// at the .js file to load on demand. The LAST entry here is always the
// current/newest scene, and it must NEVER have a scriptFile -- it has
// to already be sitting in NODES (via its <script> tag in index.html)
// for autoplay and resume-progress to work the instant the page loads.
const SCENES = [
  // older scene -- not loaded until picked in the LOG menu
  { id: 'scene-1', label: 'Aug 29 - Start', startNode: 'n1', scriptFile: 'dialogue/scene1.js' },

  // older scene -- not loaded until picked in the LOG menu
  { id: 'scene-2', label: 'Aug 30 - Arbitrary', startNode: 's2_n1', scriptFile: 'dialogue/scene2.js' },

  // current/newest scene -- loaded eagerly via dialogue/scene3.js
  { id: 'scene-3', label: 'Sep 04 - Yourself', startNode: 's3_n0' },
];

const START_NODE = SCENES[SCENES.length - 1].startNode;

// ---- custom pause menu (press C) ----
// Edit this to whatever you actually want in the menu. `action` runs when
// the entry is confirmed with Z (or clicked/tapped). Call closeMenu()
// inside an action if you want selecting it to close the menu; otherwise
// it stays open (handy for things like a mute toggle).
const MENU_ENTRIES = [
  {
    label: "ITEM",
    action: () => {
      openItemScreen();
    }
  },
  {
    label: "STAT",
    action: () => {
      openStatScreen();
    }
  },
  {
    label: "LOG",
    action: () => {
      openSceneLogScreen();
    }
  },
  {
    label: "-", //CELL
    action: () => {
      console.log("not hooked up");
    }
  },
  {
    label: "-", //SITE
    action: () => {
      console.log("not hooked up");
    }
  },
];

// ---- inventory system ----
// Catalog of every item that can exist. `label` shows in the item list,
// `info` is what the INFO action displays in the dialogue box. `slot`
// (weapon/armor) makes it equippable -- see the equip system below.
//
// `buyPrice`/`sellPrice` (in gold) control the shop: an item shows up
// under Buy only if it has a buyPrice, and shows a sell value under
// Sell (once you're actually holding one) only if it has a sellPrice.
// Leave either one out for an item that shouldn't be tradeable that
// way -- e.g. a quest item with neither never appears in the shop at
// all, regardless of what's in your inventory.
//
// `shopBuyLine`/`shopSellLine` are what the shopkeeper actually SAYS
// about the item while you're looking at it in Buy or Sell respectively
// -- separate from `info` on purpose, since a neutral INFO description
// doesn't read like something a person would say out loud, and what
// they say usually differs depending on whether you're buying from them
// or selling to them. Either can be left out for a generic fallback
// line instead.
//
// `shopLabel` is an optional SHORTER name shown only in the shop's
// Buy/Sell lists, which are narrower than the ITEM menu -- for an item
// whose real `label` is too long to read comfortably there ("Lily of
// the Valley"), set `shopLabel` to something shorter ("Lily"). Leave it
// out and the shop just falls back to `label`, same as everywhere else.
const ITEMS = {
  egg: {
    label: "Egg",
    info: "Not too important,[p:200] not too unimportant.",
    shopBuyLine: "In case you missed when I handed it out the first time.",
    shopSellLine: "Might be important.",
    buyPrice: 10,
  },
  lily: {
    label: "Lily of the Valley",
    shopLabel: "Lily",
    info: "Undeniably,[p:300] someone's favorite flower.[p:700]\nIf only you could give it to them.",
    shopBuyLine: "You shouldn't be able to buy this.",
    shopSellLine: "Save it for someone special.",
    sellPrice: 0
  },
};

const MAX_ITEMS = 8;
const INVENTORY_STORAGE_KEY = 'site-inventory';

// ids of every item currently buyable in the shop, in catalog order
function getBuyableItemIds() {
  return Object.keys(ITEMS).filter((id) => ITEMS[id].buyPrice != null);
}

const SHOP_MAIN_ENTRIES = ["Buy", "Sell", "Talk", "Exit"];

// shown in the left panel when the shop opens, and again after backing
// out of Buy/Sell -- a normal dialogue-style string, so [p:ms]/[c:color]
// tags and \n both work exactly like they do in NODES text
const SHOP_GREETING = "(snore [p:800].[p:800] .[p:800] .)[p:1000]\nHuh? [p:400]Oh,[p:500] uh,[p:500] hello.[p:800]\nNice to see you.";

// shown when Talk is picked from the main menu, before a topic is chosen
const SHOP_TALK_PROMPT = "Hm? [p:400]What's up?";

// Talk opens its own sub-menu of 4 topics -- `label` is what shows in
// the list, `response` is what actually gets said once you pick it
// (also a normal dialogue-style string, so [p:]/[c:] tags work here
// too). `image` is optional -- swap the shopkeeper's picture to react
// to what's being asked (an annoyed look for "Shop", a shy one for
// "You", etc). Left out, it just stays on SHOP_IMAGES.talk. Either way
// it reverts to SHOP_IMAGES.talk automatically once you're back to
// browsing the topic list.
const SHOP_TALK_TOPICS = [
  { label: "You", response: "Me? [p:400]Well, [p:200]I like to sit here and admire the sunset. Do you not?", image: '/assets/anim/shopkeep_bh.gif', },
  { label: "Shop?", response: 
    [
    "Yeah...[p:400] you can spend your-[p:200] wait,[p:200] MY? [p:400]money on stuff!?[p:800][img:/assets/anim/shopkeep_bh.gif]",
    "Well, [p:200]whatever I suppose.[p:800][img:/assets/anim/shopkeep.gif]\nYou are technically me here, [p:200]still, [p:200]this whole arrangement is weird." 

    ]},
  // `response` can be an ARRAY of strings instead of one -- each
  // becomes its own page: the box clears and types the next one each
  // time you press Z/X, exactly like advancing normal dialogue
  { label: "Advice", response: 
    [
    "Hah..[p:400] Isn't that what we are all here for?",
    "How's this,[p:200] if I ever stumble across something worthwhile to say, [p:200] I'll share it with you on the cliff.",
    "Not really any good at this face-to-face kinda thing. [p:200]Never was."
    ]},
  { label: "Cliff", response: 
    [
    "Lovely day, [p:200] isn't it?",
    ". [p:600]. [p:600]. [p:600]",
    "This cliff isn't too far from my usual place.",
    "[img:/assets/anim/shopkeep_lh.gif]I came from just past these trees,[p:200] and up onto this cliff to have some time to myself.",
    "[img:/assets/anim/shopkeep_bh.gif]I'd love to bring you around some time.[p:800]\nMaybe you could meet my friends!",
    "[img:/assets/anim/shopkeep.gif]. [p:600]. [p:600]. [p:600]",
    "[img:/assets/anim/shopkeep_looking.gif]From a [c:gold]meta[/c] perspective,[p:200] this place is a place that exists in my mind.",
    "[img:/assets/anim/shopkeep_lh.gif]A place I come to mentally when things are a little rocky.",
    "[img:/assets/anim/shopkeep_looking.gif]I've just spent the time to make it a little bit of a reality here."
    ]},
];


function loadInventory() {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // drop anything that doesn't match a known item, in case ITEMS
    // changes later and an old save has stale ids in it
    return Array.isArray(parsed) ? parsed.filter((id) => ITEMS[id]) : [];
  } catch (err) {
    console.warn('inventory load failed:', err);
    return [];
  }
}

function saveInventory() {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  } catch (err) {
    console.warn('inventory save failed:', err);
  }
}

let inventory = loadInventory();

// ---- equipment (the WEAPON/ARMOR lines on the STAT screen) ----
// An item equips by having a `slot` of "weapon" or "armor" in ITEMS --
// see useSelectedItem() below, which is what actually equips/unequips
// when USE is pressed on one.
const EQUIPPED_STORAGE_KEY = 'site-equipped';

function loadEquipped() {
  try {
    const raw = localStorage.getItem(EQUIPPED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      weapon: (parsed && ITEMS[parsed.weapon]) ? parsed.weapon : null,
      armor: (parsed && ITEMS[parsed.armor]) ? parsed.armor : null
    };
  } catch (err) {
    console.warn('equipped load failed:', err);
    return { weapon: null, armor: null };
  }
}

function saveEquipped() {
  try {
    localStorage.setItem(EQUIPPED_STORAGE_KEY, JSON.stringify(equipped));
  } catch (err) {
    console.warn('equipped save failed:', err);
  }
}

let equipped = loadEquipped();

// ---- gold ----
const GOLD_STORAGE_KEY = 'site-gold';
const DEFAULT_GOLD = 13; // starting amount for a fresh visitor

function loadGold() {
  try {
    const raw = localStorage.getItem(GOLD_STORAGE_KEY);
    const n = raw !== null ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) ? n : DEFAULT_GOLD;
  } catch (err) {
    console.warn('gold load failed:', err);
    return DEFAULT_GOLD;
  }
}

function saveGold() {
  try {
    localStorage.setItem(GOLD_STORAGE_KEY, String(gold));
  } catch (err) {
    console.warn('gold save failed:', err);
  }
}

let gold = loadGold();

// updates every place gold is displayed -- call this any time gold
// actually changes
function renderGoldDisplays() {
  if (statsGoldEl) statsGoldEl.textContent = String(gold);
  if (statScreenGoldEl) statScreenGoldEl.textContent = String(gold);
  if (shopGoldEl) shopGoldEl.textContent = gold + 'G';
}

function addGold(amount) {
  gold += amount;
  saveGold();
  renderGoldDisplays();
}

// returns true if there was enough gold to spend, false (and spends
// nothing) otherwise
function spendGold(amount) {
  if (gold < amount) return false;
  gold -= amount;
  saveGold();
  renderGoldDisplays();
  return true;
}

// ---- dialogue progress (so returning visitors resume instead of
// replaying everything from the start) ----
const DIALOGUE_PROGRESS_KEY = 'site-dialogue-progress';
// tracks which nodes' `giveItem` has already fired, so resuming on a
// giveItem node doesn't hand out a duplicate every time the page reloads
const GRANTED_ITEM_NODES_KEY = 'site-granted-item-nodes';

function loadDialogueProgress() {
  try {
    const raw = localStorage.getItem(DIALOGUE_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed.nodeId === 'string') ? parsed : null;
  } catch (err) {
    console.warn('dialogue progress load failed:', err);
    return null;
  }
}

function saveDialogueProgress(nodeId) {
  try {
    localStorage.setItem(DIALOGUE_PROGRESS_KEY, JSON.stringify({
      nodeId,
      musicSrc: currentMusicSrc
    }));
  } catch (err) {
    console.warn('dialogue progress save failed:', err);
  }
}

function loadGrantedItemNodes() {
  try {
    const raw = localStorage.getItem(GRANTED_ITEM_NODES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.warn('granted-item-nodes load failed:', err);
    return new Set();
  }
}

function saveGrantedItemNodes() {
  try {
    localStorage.setItem(GRANTED_ITEM_NODES_KEY, JSON.stringify([...grantedItemNodes]));
  } catch (err) {
    console.warn('granted-item-nodes save failed:', err);
  }
}

let grantedItemNodes = loadGrantedItemNodes();

// Call this from anywhere -- a NODES entry, a choice, a click handler --
// to grant an item. Returns false (and does nothing) if the id isn't in
// ITEMS, or the inventory is already full (MAX_ITEMS). Duplicates are
// allowed on purpose -- you can hold more than one Crab Apple.
function addItem(id) {
  if (!ITEMS[id]) {
    console.warn('addItem: unknown item id', id);
    return false;
  }
  if (inventory.length >= MAX_ITEMS) {
    console.warn('addItem: inventory full, could not add', id);
    return false;
  }
  inventory.push(id);
  saveInventory();
  if (itemScreenOpen) renderItemList();
  return true;
}

function removeItemAt(index) {
  if (index < 0 || index >= inventory.length) return;
  inventory.splice(index, 1);
  saveInventory();
}

// path to the heart/soul cursor sprite
const CURSOR_SRC = '/assets/soul_select.png';

// choices render in a grid this many columns wide
const CHOICE_COLS = 2;

// big = slower
const TYPE_SPEED_MS = 45;

const textEl = document.getElementById('dialogue-text');
const textboxEl = document.getElementById('textbox');
const choiceGridEl = document.getElementById('choice-grid');
const menuBoxEl = document.getElementById('menu-box');
const menuListEl = document.getElementById('menu-list');
const itemBoxEl = document.getElementById('item-box');
const itemListEl = document.getElementById('item-list');
const itemActionsEl = document.getElementById('item-actions');
const sceneLogBoxEl = document.getElementById('scene-log-box');
const sceneLogListEl = document.getElementById('scene-log-list');
const statScreenEl = document.getElementById('stat-screen');
const statScreenWeaponEl = document.getElementById('stat-screen-weapon');
const statScreenArmorEl = document.getElementById('stat-screen-armor');
const statsGoldEl = document.getElementById('stats-gold');const statScreenGoldEl = document.getElementById('stat-screen-gold');
const shopBoxEl = document.getElementById('shop-box');
const fadeOverlayEl = document.getElementById('fade-overlay');

// ---- fade-to-black (entering/leaving the shop) ----
// Both resolve once the fade has visually finished, so callers can
// await them and know it's safe to either change what's on screen
// (fadeToBlack) or let the new content actually be seen (fadeFromBlack).
const FADE_MS = 300;

function fadeToBlack() {
  return new Promise((resolve) => {
    fadeOverlayEl.style.transition = `opacity ${FADE_MS}ms ease`;
    fadeOverlayEl.style.opacity = '1';
    setTimeout(resolve, FADE_MS);
  });
}

function fadeFromBlack() {
  return new Promise((resolve) => {
    fadeOverlayEl.style.transition = `opacity ${FADE_MS}ms ease`;
    fadeOverlayEl.style.opacity = '0';
    setTimeout(resolve, FADE_MS);
  });
}
const shopDialogueTextEl = document.getElementById('shop-dialogue-text');
const shopNavListEl = document.getElementById('shop-nav-list');
const shopGoldEl = document.getElementById('shop-gold');
const shopInventoryCountEl = document.getElementById('shop-inventory-count');
renderGoldDisplays(); // reflect the real persisted value immediately, not the static placeholder in the HTML

const sceneLayers = [
  document.getElementById('scene-layer-0'),
  document.getElementById('scene-layer-1')
];
const shopHotspotEl = document.getElementById('shop-hotspot');
let activeLayer = 0;
let currentImageSrc = '';

function hideTextbox() {
  textboxEl.style.opacity = '0';
}

function showTextbox() {
  textboxEl.style.opacity = '1';
}

// preload every image referenced anywhere in the node graph
const preloadedSrcs = new Set();
if (!IS_MOBILE) {
  Object.values(NODES).forEach((node) => {
    const src = node.image;
    if (src && !preloadedSrcs.has(src)) {
      preloadedSrcs.add(src);
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    }
  });
}

function setSceneImage(src) {
  if (!src || src === currentImageSrc) return;
  const isFirstImage = currentImageSrc === '';
  currentImageSrc = src;

  const incomingLayer = 1 - activeLayer;
  const incomingEl = sceneLayers[incomingLayer];
  const outgoingEl = sceneLayers[activeLayer];

  if (isFirstImage) {
    incomingEl.style.transition = '';
    incomingEl.src = src;
    incomingEl.style.zIndex = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        incomingEl.style.opacity = '1';
      });
    });
  } else {
    incomingEl.style.transition = 'none';
    incomingEl.src = src;
    incomingEl.style.zIndex = '0';
    incomingEl.style.opacity = '1';

    outgoingEl.style.transition = 'none';
    outgoingEl.style.zIndex = '0';
    outgoingEl.style.opacity = '0';

    void incomingEl.offsetHeight; //
    incomingEl.style.transition = '';
    outgoingEl.style.transition = '';
  }

  activeLayer = incomingLayer;
}

// setSceneImage() intentionally does nothing when given an empty/falsy
// src (that's what lets a node with image:"" mean "keep whatever's
// already showing"). Restoring the shop's background needs the OPPOSITE
// behavior -- explicitly clear back to blank if that's genuinely what
// was showing before the shop opened (e.g. the very first node, before
// any image has been set yet) -- so it gets its own function instead of
// changing setSceneImage()'s behavior for everything else.
function clearSceneImage() {
  if (!currentImageSrc) return; // already blank
  currentImageSrc = '';
  sceneLayers[activeLayer].style.opacity = '0';
}
//blip
const TYPE_SOUND_SRC = '/assets/blipmain.wav';
const TYPE_SOUND_VOLUME = 0.4;

// A single Audio element restarted on every character cuts off the tail
// of the previous blip as soon as a new one fires (typewriter runs
// every ~45ms, which is usually shorter than the blip itself) -- that's
// the "cutting over each other" stutter. A small round-robin pool of
// Audio instances fixes it: each character gets the next instance in
// rotation, so a still-ringing blip is never abruptly stomped by the
// next one. The explicit pause() below also guards the case where the
// pool wraps back around to a slot that's STILL playing (very fast
// typing, or a clip longer than the pool can cover) -- without it,
// that slot would briefly play two overlapping copies of itself.
function createBlipPlayer(src, volume, poolSize = 6) {
  const pool = [];
  for (let i = 0; i < poolSize; i++) {
    const a = new Audio(src);
    a.volume = volume;
    pool.push(a);
  }
  let next = 0;
  return function playBlip() {
    const a = pool[next];
    next = (next + 1) % pool.length;
    a.pause();
    a.currentTime = 0;
    a.play().catch(() => {});
  };
}

const playTypeSound = createBlipPlayer(TYPE_SOUND_SRC, TYPE_SOUND_VOLUME);

// alternate typing blips a NODE can opt into via a `blip: "..."` field
// in its definition (e.g. `blip: "none"`) -- reuses playItemInfoBlip
// (blip_none.wav), defined further down, since it's the exact same
// sound already used for item INFO text; no separate Audio pool
// needed for it. Leaving `blip` out of a node entirely (the normal
// case) always falls back to the regular blip, playTypeSound.
const BLIP_PRESETS = {
  none: () => playItemInfoBlip
};

function pickBlipPlayerForNode(node) {
  const preset = node && node.blip && BLIP_PRESETS[node.blip];
  return preset ? preset() : playTypeSound;
}

// menu/choice cursor sounds -- "select" plays whenever the cursor moves to
// a new entry, "confirm" plays when Z activates one (menu only -- dialogue
// choices only get the select sound, never confirm)
const MENU_SELECT_SRC = '/assets/menu_sound/menu_select.wav';
const MENU_CONFIRM_SRC = '/assets/menu_sound/menu_confirm.wav';
const MENU_SOUND_VOLUME = 0.1;

const playMenuSelectSound = createBlipPlayer(MENU_SELECT_SRC, MENU_SOUND_VOLUME, 3);
const playMenuConfirmSound = createBlipPlayer(MENU_CONFIRM_SRC, MENU_SOUND_VOLUME, 3);

// egg item's USE sound effect -- see useSelectedItem() below
const EGG_USE_SRC = '/assets/egg-use.mp3';
const EGG_USE_VOLUME = 0.2;
const playEggUseSound = createBlipPlayer(EGG_USE_SRC, EGG_USE_VOLUME, 3);

// VOLUMES!!!!
const MUSIC_VOLUME = 0.03;
const MUSIC_FADE_MS = 1500;

// ---- cued music (the [music:] system) ----
// This uses the Web Audio API instead of a plain <audio loop> element on
// purpose: <audio loop> restarts the element when it reaches the end,
// and that restart is not sample-accurate in most browsers -- for MP3s
// especially (which almost always have a few ms of silence baked in at
// the start/end by the encoder) that shows up as an audible click or
// gap every time the track loops. Decoding the whole file into an
// AudioBuffer up front and looping it with an AudioBufferSourceNode
// loops at the exact sample instead, with no seam.
//
// The tradeoff: decoding needs the raw file bytes via fetch(), which
// (like the on-demand scene loading) doesn't work over a bare file://
// URL -- it needs a real server. Doesn't affect anything else on the
// site, just this.
const musicCtx = new (window.AudioContext || window.webkitAudioContext)();

// two gain nodes to crossfade between, same idea as the old two-<audio>-
// element approach -- whichever track is coming in fades one up while
// the outgoing one fades down
const musicGains = [musicCtx.createGain(), musicCtx.createGain()];
musicGains.forEach((g) => {
  g.gain.value = 0;
  g.connect(musicCtx.destination);
});
const musicSources = [null, null]; // currently-playing AudioBufferSourceNode per slot
let activeMusicLayer = 0;
let currentMusicSrc = '';

// decoded buffers are cached by src, so replaying a track already heard
// this session (e.g. resuming, or a scene that reuses a cue) doesn't
// re-fetch/re-decode it
const musicBufferCache = {};

async function loadMusicBuffer(src) {
  if (musicBufferCache[src]) return musicBufferCache[src];
  const res = await fetch(src);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = await musicCtx.decodeAudioData(arrayBuffer);
  musicBufferCache[src] = buffer;
  return buffer;
}

function fadeGain(gainNode, targetVolume, durationMs, onComplete) {
  const startVolume = gainNode.gain.value;
  const startTime = performance.now();
  function step(now) {
    if (typeof now !== 'number' || !isFinite(now)) {
      now = performance.now();
    }
    const t = Math.min(Math.max((now - startTime) / durationMs, 0), 1);
    const nextVolume = startVolume + (targetVolume - startVolume) * t;
    gainNode.gain.value = isFinite(nextVolume) ? Math.max(0, nextVolume) : targetVolume;
    if (t < 1) {
      requestAnimationFrame(step);
    } else if (onComplete) {
      onComplete();
    }
  }
  requestAnimationFrame(step);
}

// AudioContext starts "suspended" until a user gesture, same idea as
// the ambience-autoplay retry -- call this from the same interaction
// handlers that unlock everything else
function resumeMusicContext() {
  if (musicCtx.state === 'suspended') {
    musicCtx.resume().catch(() => {});
  }
}

async function playMusic(src) {
  if (!src || src === currentMusicSrc) return;
  currentMusicSrc = src;
  resumeMusicContext();

  let buffer;
  try {
    buffer = await loadMusicBuffer(src);
  } catch (err) {
    console.warn('music failed to load:', src, err);
    if (currentMusicSrc === src) currentMusicSrc = ''; // allow retrying later
    return;
  }
  // if something else got cued while this one was loading, don't step
  // on it
  if (currentMusicSrc !== src) return;

  const nextLayer = 1 - activeMusicLayer;
  const nextGain = musicGains[nextLayer];
  const curGain = musicGains[activeMusicLayer];

  if (musicSources[nextLayer]) {
    musicSources[nextLayer].stop();
    musicSources[nextLayer] = null;
  }

  const source = musicCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(nextGain);
  source.start(0);
  musicSources[nextLayer] = source;

  fadeGain(nextGain, MUSIC_VOLUME, MUSIC_FADE_MS);

  const outgoingLayer = activeMusicLayer;
  fadeGain(curGain, 0, MUSIC_FADE_MS, () => {
    if (musicSources[outgoingLayer]) {
      musicSources[outgoingLayer].stop();
      musicSources[outgoingLayer] = null;
    }
  });

  activeMusicLayer = nextLayer;
}

// fades whatever's currently playing down to silence and stops it --
// for going back to "no music", which playMusic() itself can't express
// (an empty src just no-ops there)
function stopMusic() {
  if (!currentMusicSrc) return;
  currentMusicSrc = '';
  const curLayer = activeMusicLayer;
  const curGain = musicGains[curLayer];
  fadeGain(curGain, 0, MUSIC_FADE_MS, () => {
    if (musicSources[curLayer]) {
      musicSources[curLayer].stop();
      musicSources[curLayer] = null;
    }
  });
}

// background ambience: one track, looping, on from the start -- separate
// from the cued [music:] system above. EDIT ME to point at your file
// and set how loud it plays.
const AMBIENCE_SRC = '/assets/ambience.mp3';
const AMBIENCE_VOLUME = 0.08;
const ambience = new Audio(AMBIENCE_SRC);
ambience.loop = true;
ambience.volume = AMBIENCE_VOLUME;

let ambienceStarted = false;
function startAmbience() {
  if (ambienceStarted) return;
  // only lock this in once play() actually succeeds -- setting it
  // beforehand meant the very first attempt (always blocked, since it
  // happens on page load before any real interaction) permanently
  // stopped every later retry from keydown/touchend, even though those
  // ARE genuine user gestures and should unlock it
  ambience.play().then(() => {
    ambienceStarted = true;
  }).catch((err) => {
    console.warn('ambience playback blocked, will retry on next interaction:', err);
  });
}

// try right away -- works if the browser already allows it (e.g. the
// site has enough "media engagement" history). if that's blocked by
// autoplay policy, the keydown/touchend listeners below retry it on
// the first real interaction, same as the type-blip/music pattern.
if (!IS_MOBILE) {
  startAmbience();
}

function parseDialogueMarkup(rawStr) {
  const str = '* ' + rawStr.replace(/\n/g, '\n* ');
  const tokens = [];
  const colorStack = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === '[') {
      const close = str.indexOf(']', i);
      if (close !== -1) {
        const tag = str.slice(i + 1, close);
        if (tag.startsWith('p:')) {
          tokens.push({ type: 'pause', ms: parseInt(tag.slice(2), 10) || 0 });
          i = close + 1;
          continue;
        }
        if (tag.startsWith('c:')) {
          colorStack.push(tag.slice(2));
          i = close + 1;
          continue;
        }
        if (tag === '/c') {
          colorStack.pop();
          i = close + 1;
          continue;
        }
        if (tag === 'hide') {
          tokens.push({ type: 'hide' });
          i = close + 1;
          continue;
        }
        if (tag.startsWith('music:')) {
          tokens.push({ type: 'music', src: tag.slice(6) });
          i = close + 1;
          continue;
        }
        if (tag.startsWith('img:')) {
          tokens.push({ type: 'image', src: tag.slice(4) });
          i = close + 1;
          continue;
        }
      }
    }
    tokens.push({ type: 'char', ch, color: colorStack[colorStack.length - 1] || null });
    i++;
  }
  return tokens;
}

function escapeHtml(ch) {
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  if (ch === '&') return '&amp;';
  if (ch === '"') return '&quot;';
  return ch;
}

// spaces get wrapped in their own span (see .wide-space in style.css) so
// they can be made wider than a normal space glyph, independent of
// letter spacing -- matches how Undertale's font renders word gaps
function charsToHtml(chars) {
  let html = '';
  for (const t of chars) {
    const safe = escapeHtml(t.ch);
    const wrapped = t.ch === ' ' ? `<span class="wide-space">${safe}</span>` : safe;
    html += t.color ? `<span style="color:${t.color}">${wrapped}</span>` : wrapped;
  }
  return html;
}

function renderRevealed(revealed) {
  textEl.innerHTML = charsToHtml(revealed);
}

function cursorImgHtml() {
  return `<img class="cursor-icon" src="${CURSOR_SRC}" alt="">`;
}

let currentNodeId = null;
let currentTokens = [];
let tokenIndex = 0;
let revealed = [];
let typing = false;
let typeTimer = null;
let currentBlipPlayer = playTypeSound; // set per-node in startNode(), based on node.blip

// ---- choice grid state ----
let choiceActive = false;
let currentChoices = [];
let choiceIndex = 0;

// ---- menu state ----
let menuOpen = false;
let menuIndex = 0;
let wasTypingBeforeMenu = false;
let wasTextboxVisibleBeforeMenu = true;

// ---- item screen state (nested inside the menu) ----
let itemScreenOpen = false;
let itemIndex = 0;
let itemFocus = 'list'; // 'list' or 'actions'
let itemActionIndex = 0; // 0 = USE, 1 = INFO, 2 = DROP
let itemInfoOpen = false; // showing an item's info text in the dialogue box

// ---- STAT screen state ----
let statScreenOpen = false;

// ---- shop state (opened by clicking the character) ----
let shopOpen = false;
let shopTransitioning = false; // fading to/from black -- input is held off
let shopMode = 'main'; // 'main' | 'buy' | 'sell' | 'confirm' | 'talk'
let shopNavIndex = 0;  // index into SHOP_MAIN_ENTRIES, while in 'main'
let shopListIndex = 0; // index into the current Buy/Sell list, while in 'buy'/'sell'
let shopTalkIndex = 0; // index into SHOP_TALK_TOPICS, while in 'talk'

// true while showing LOCKED, must-finish-reading dialogue (currently
// only Talk responses use this) -- while true, the shop behaves like
// normal dialogue (Z/X only advance/finish, don't ALSO jump to a
// different topic or leave in the same press) instead of the "always
// interruptible" rule everywhere else in the shop. Unlike a simpler
// on/off flag, this also supports MULTIPLE PAGES -- see
// startShopReadingText() below -- so a response can be longer than
// fits in the box: the box clears and types the next page each time,
// and only once the LAST page is finished does normal navigation
// become available again, automatically, with no extra dedicated
// "done reading" press needed.
let shopReading = false;
let shopReadingPages = [];
let shopReadingPageIndex = 0;

// what's being confirmed while shopMode === 'confirm'
let shopConfirmAction = null; // 'buy' | 'sell'
let shopConfirmId = null;     // item id being bought (sell uses shopListIndex instead, since duplicates are allowed)
let shopConfirmChoice = 0;    // 0 = Yes, 1 = No

// ---- shop dialogue typewriter ----
// Separate from the main dialogue typewriter (same reasoning as the
// item-info one: this way opening the shop can never interfere with
// currentNodeId or the live conversation's state) but uses the SAME
// blip sound as normal dialogue, per request -- not a different one.
let shopDialogueTokens = [];
let shopDialogueTokenIndex = 0;
let shopDialogueRevealed = [];
let shopDialogueTyping = false;
let shopDialogueTypeTimer = null;

// ---- scene log state ----
let sceneLogScreenOpen = false;
let sceneLogIndex = 0;
let scenePlaybackActive = false; // currently replaying an old scene
let liveReturnNodeId = null;     // where to snap back to once playback ends
let liveReturnMusicSrc = '';

// ---- scene 3 ending: warm sunset glow on the background bars ----
// 20 seconds after reaching the very last node of scene 3, the black
// bars outside the 640x480 game canvas (visible on the sides when the
// browser window is wider than the game's 4:3-ish shape) toggle on a
// slowly-shifting warm sunset gradient (see the .bar-glow class and its
// keyframes in style.css). After glowing for BAR_GLOW_DURATION_MS, it
// toggles back off (black) and waits BAR_GLOW_DELAY_MS again -- the
// SAME delay as the initial one -- before toggling on again, repeating
// that wait/glow loop indefinitely. Reaching any OTHER node (moving on
// in live dialogue, or leaving via LOG back to somewhere else) cancels
// it and reverts the bars back to black for good. Opening the shop or
// pause menu PAUSES it exactly where it was (whichever phase, however
// far in) and resumes with the real remaining time once closed, rather
// than letting a real timer tick along in the background regardless of
// what's on screen. Edit the node id, delay, or glow duration freely --
// the gradient/animation itself lives in style.css.
const BAR_GLOW_NODE_ID = 's3_n23';
const BAR_GLOW_DELAY_MS = 19903;    // how long the black "waiting" phase lasts, both the first time and between every glow burst
const BAR_GLOW_DURATION_MS = 9999999; // how long the glow stays on before going back to black and waiting again

let barGlowTimer = null;
let barGlowPhase = 'idle'; // 'idle' | 'waiting' (black) | 'glowing'
let barGlowDeadline = 0;      // timestamp (Date.now()) the current phase is due to fire
let barGlowRemainingMs = 0;   // set while paused, used to resume with the correct time left

function setBarGlow(on) {
  document.body.classList.toggle('bar-glow', on);
}

function armBarGlowTimer(delay) {
  barGlowDeadline = Date.now() + delay;
  barGlowTimer = setTimeout(onBarGlowTick, delay);
}

function onBarGlowTick() {
  if (barGlowPhase === 'waiting') {
    // the black "waiting" phase just ended -- toggle the glow on
    barGlowPhase = 'glowing';
    setBarGlow(true);
    armBarGlowTimer(BAR_GLOW_DURATION_MS);
    return;
  }
  if (barGlowPhase === 'glowing') {
    // this burst is done -- toggle off, then wait the same delay as
    // before, and the whole loop repeats
    barGlowPhase = 'waiting';
    setBarGlow(false);
    armBarGlowTimer(BAR_GLOW_DELAY_MS);
  }
}

function stopBarGlow() {
  clearTimeout(barGlowTimer);
  barGlowTimer = null;
  barGlowPhase = 'idle';
  setBarGlow(false);
}

function scheduleBarGlow() {
  stopBarGlow(); // clear out any previous schedule first
  barGlowPhase = 'waiting';
  armBarGlowTimer(BAR_GLOW_DELAY_MS);
}

// called when the shop or pause menu opens -- freezes the countdown
// exactly where it is without losing progress, and immediately turns
// the glow off instead of leaving it showing -- the effect should only
// ever be visible while genuinely looking at this node with nothing
// else open
function pauseBarGlow() {
  if (barGlowPhase === 'idle') return;
  clearTimeout(barGlowTimer);
  barGlowTimer = null;
  barGlowRemainingMs = Math.max(0, barGlowDeadline - Date.now());
  setBarGlow(false);
}

// called when the shop or pause menu closes -- restores the glow if it
// was on before pausing (so it doesn't look like the effect silently
// reset), then keeps going with the exact time that was left, not a
// fresh delay
function resumeBarGlow() {
  if (barGlowPhase === 'idle') return;
  if (barGlowPhase === 'glowing') {
    setBarGlow(true);
  }
  armBarGlowTimer(barGlowRemainingMs);
}

function startNode(id) {
  const node = NODES[id];
  if (!node) return;

  if (id === BAR_GLOW_NODE_ID) {
    scheduleBarGlow();
  } else {
    stopBarGlow();
  }

  currentNodeId = id;

  // scene playback is a passive rewatch -- it shouldn't overwrite where
  // the visitor actually is, and shouldn't hand out items a second time
  if (!scenePlaybackActive) {
    saveDialogueProgress(id);
    if (node.giveItem && !grantedItemNodes.has(id)) {
      addItem(node.giveItem);
      grantedItemNodes.add(id);
      saveGrantedItemNodes();
    }
  }

  currentTokens = parseDialogueMarkup(node.text);
  tokenIndex = 0;
  revealed = [];
  typing = true;
  currentBlipPlayer = pickBlipPlayerForNode(node);
  textEl.innerHTML = '';
  clearTimeout(typeTimer);

  hideChoiceGrid();
  showTextbox();
  setSceneImage(node.image || '');

  if (IS_MOBILE) {
    finishTyping();
  } else {
    typeStep();
  }
}

function onNodeTypingDone() {
  const node = NODES[currentNodeId];
  if (node && node.choices && node.choices.length) {
    showChoiceGrid(node.choices);
  }
}

function typeStep() {
  if (tokenIndex >= currentTokens.length) {
    typing = false;
    onNodeTypingDone();
    return;
  }

  const token = currentTokens[tokenIndex];
  tokenIndex++;

  if (token.type === 'pause') {
    typeTimer = setTimeout(typeStep, token.ms);
    return;
  }

  if (token.type === 'hide') {
    hideTextbox();
    typeTimer = setTimeout(typeStep, 0);
    return;
  }

  if (token.type === 'music') {
    playMusic(token.src);
    typeTimer = setTimeout(typeStep, 0);
    return;
  }

  if (token.type === 'image') {
    setSceneImage(token.src);
    typeTimer = setTimeout(typeStep, 0);
    return;
  }

  revealed.push(token);
  renderRevealed(revealed);
  if (!/\s/.test(token.ch)) {
    currentBlipPlayer();
  }

  if (tokenIndex >= currentTokens.length) {
    typing = false;
    onNodeTypingDone();
    return;
  }
  typeTimer = setTimeout(typeStep, TYPE_SPEED_MS);
}

function finishTyping() {
  clearTimeout(typeTimer);
  revealed = currentTokens.filter((t) => t.type === 'char');
  renderRevealed(revealed);
  if (currentTokens.some((t) => t.type === 'hide')) {
    hideTextbox();
  }
  currentTokens
    .filter((t) => t.type === 'music')
    .forEach((t) => playMusic(t.src));
  currentTokens
    .filter((t) => t.type === 'image')
    .forEach((t) => setSceneImage(t.src));
  tokenIndex = currentTokens.length;
  typing = false;
  onNodeTypingDone();
}

// ---- choice grid (dialogue branches) ----
// shown INSIDE the textbox, replacing the text -- not a separate box.

function showChoiceGrid(choices) {
  currentChoices = choices;
  choiceIndex = 0;
  choiceActive = true;
  textEl.style.display = 'none';
  choiceGridEl.style.display = 'grid';
  renderChoiceGrid();
}

function hideChoiceGrid() {
  choiceActive = false;
  currentChoices = [];
  choiceGridEl.style.display = 'none';
  choiceGridEl.innerHTML = '';
  textEl.style.display = '';
}

function renderChoiceGrid() {
  let html = '';
  currentChoices.forEach((choice, i) => {
    const cursor = i === choiceIndex ? cursorImgHtml() : '';
    html += `<div class="choice-cell" data-index="${i}">${cursor}${escapeHtml(choice.label)}</div>`;
  });
  choiceGridEl.innerHTML = html;
  choiceGridEl.querySelectorAll('.choice-cell').forEach((el) => {
    el.addEventListener('click', () => {
      choiceIndex = parseInt(el.dataset.index, 10);
      confirmChoice();
    });
  });
}

// dRow/dCol let arrow keys move spatially through the grid rather than
// just linearly -- Left/Right shift column, Up/Down shift row
function moveChoiceGrid(dRow, dCol) {
  if (!currentChoices.length) return;
  const total = currentChoices.length;
  const rows = Math.ceil(total / CHOICE_COLS);
  let row = Math.floor(choiceIndex / CHOICE_COLS);
  let col = choiceIndex % CHOICE_COLS;
  row = (row + dRow + rows) % rows;
  col = (col + dCol + CHOICE_COLS) % CHOICE_COLS;
  let newIndex = row * CHOICE_COLS + col;
  if (newIndex >= total) newIndex = total - 1;
  if (newIndex !== choiceIndex) {
    choiceIndex = newIndex;
    renderChoiceGrid();
    playMenuSelectSound();
  }
}

function confirmChoice() {
  const choice = currentChoices[choiceIndex];
  hideChoiceGrid();
  // same rule as startNode()'s giveItem guard -- rewatching an old scene
  // shouldn't hand out another copy of whatever that choice granted
  if (choice && choice.giveItem && !scenePlaybackActive) addItem(choice.giveItem);
  if (choice && choice.next) {
    startNode(choice.next);
  }
}

// ---- custom pause menu (press C) ----

function renderMenu() {
  let html = '';
  // hide the nav-box cursor while a sub-screen (item/log) is open --
  // visually the heart has "moved" into that screen instead
  const navFocused = !itemScreenOpen && !sceneLogScreenOpen && !statScreenOpen;
  MENU_ENTRIES.forEach((entry, i) => {
    const cursor = (navFocused && i === menuIndex) ? cursorImgHtml() : '';
    html += `<div class="menu-entry" data-index="${i}">${cursor}${escapeHtml(entry.label)}</div>`;
  });
  menuListEl.innerHTML = html;
  // click navigation intentionally disabled -- keyboard only (Z/X/C and
  // arrows)
}

function activateMenuEntry() {
  playMenuConfirmSound();
  const entry = MENU_ENTRIES[menuIndex];
  if (entry && typeof entry.action === 'function') {
    entry.action();
  }
}

function openMenu() {
  // don't let the menu interrupt a forced dialogue choice, and don't
  // stack on top of the shop -- they're mutually exclusive
  if (menuOpen || choiceActive || shopOpen || !MENU_ENTRIES.length) return;
  wasTypingBeforeMenu = typing;
  // remember whether the dialogue box was actually showing (a finished
  // scene may have already hidden itself via [hide]) -- otherwise
  // closing the menu would always bring it back, even over an ended
  // conversation that was never meant to reappear
  wasTextboxVisibleBeforeMenu = textboxEl.style.opacity !== '0';
  if (typing) clearTimeout(typeTimer);
  pauseBarGlow();
  menuOpen = true;
  menuIndex = 0;
  hideTextbox();
  renderMenu();
  menuBoxEl.style.display = 'flex';
  playMenuConfirmSound();
}

function closeMenu() {
  if (itemScreenOpen) closeItemScreen();
  if (sceneLogScreenOpen) closeSceneLogScreen();
  if (statScreenOpen) closeStatScreen();
  menuOpen = false;
  menuBoxEl.style.display = 'none';
  resumeBarGlow();
  if (wasTextboxVisibleBeforeMenu) {
    showTextbox();
  }
  playMenuConfirmSound();
  if (wasTypingBeforeMenu) {
    wasTypingBeforeMenu = false;
    typeStep(); // resume typing exactly where it was paused
  }
}

function toggleMenu() {
  if (itemInfoOpen || shopTransitioning) return; // back out with X/Z first
  // C now works normally during scene playback too -- it opens the
  // real menu (which pauses the scene's typewriter the same way it
  // pauses live dialogue), not a shortcut to leave the scene.
  menuOpen ? closeMenu() : openMenu();
}

// ---- item screen (ITEM entry inside the menu) ----
// A second box that appears next to menu-box, showing up to MAX_ITEMS
// items with a USE/INFO/DROP action row -- navigated the same
// list-then-actions way as the top-level menu.

const ITEM_BOX_GAP = 16;

function openItemScreen() {
  itemScreenOpen = true;
  itemIndex = 0;
  itemFocus = 'list';
  itemActionIndex = 0;
  renderMenu(); // hide the nav-box cursor now that focus has moved here
  // positioned relative to menu-box's actual rendered size, since its
  // width changes depending on what's in MENU_ENTRIES
  itemBoxEl.style.left = (menuBoxEl.offsetLeft + menuBoxEl.offsetWidth + ITEM_BOX_GAP) + 'px';
  itemBoxEl.style.top = menuBoxEl.offsetTop + 'px';
  itemBoxEl.style.display = 'flex';
  renderItemList();
}

function closeItemScreen() {
  itemScreenOpen = false;
  itemBoxEl.style.display = 'none';
  renderMenu(); // restore the nav-box cursor now that focus is back here
}

function renderItemList() {
  if (!inventory.length) {
    itemListEl.innerHTML = '<div class="item-empty"></div>';
  } else {
    let html = '';
    inventory.forEach((id, i) => {
      const item = ITEMS[id];
      const label = item ? item.label : id;
      const isEquipped = item && item.slot && equipped[item.slot] === id;
      const showCursor = itemFocus === 'list' && i === itemIndex;
      const cursor = showCursor ? cursorImgHtml() : '';
      const equippedTag = isEquipped ? ' <span class="item-equipped-tag">(E)</span>' : '';
      html += `<div class="item-entry" data-index="${i}">${cursor}${escapeHtml(label)}${equippedTag}</div>`;
    });
    itemListEl.innerHTML = html;
    // click navigation intentionally disabled -- keyboard only
  }
  renderItemActions();
}

function renderItemActions() {
  const hasItems = inventory.length > 0;
  const labels = ['USE', 'INFO', 'DROP'];
  let html = '';
  labels.forEach((label, i) => {
    const disabled = hasItems ? '' : ' disabled';
    const showCursor = itemFocus === 'actions' && i === itemActionIndex;
    const cursor = showCursor ? cursorImgHtml() : '';
    html += `<span class="item-action${disabled}" data-index="${i}">${cursor}${label}</span>`;
  });
  itemActionsEl.innerHTML = html;
  // click navigation intentionally disabled -- keyboard only
}

function itemHandleUp() {
  if (itemFocus === 'actions') {
    if (inventory.length) {
      itemFocus = 'list';
      renderItemList();
      playMenuSelectSound();
    }
    return;
  }
  if (itemIndex > 0) {
    itemIndex--;
    renderItemList();
    playMenuSelectSound();
  }
}

function itemHandleDown() {
  if (itemFocus !== 'list' || !inventory.length) return;
  if (itemIndex < inventory.length - 1) {
    itemIndex++;
    renderItemList();
    playMenuSelectSound();
  }
  // clamped at the last item -- Down does nothing further here. The
  // USE/INFO/DROP row is only reachable by pressing Z to actually
  // select an item, not by scrolling the cursor past the list.
}

function itemHandleLeft() {
  if (itemFocus !== 'actions') return;
  itemActionIndex = (itemActionIndex - 1 + 3) % 3;
  renderItemActions();
  playMenuSelectSound();
}

function itemHandleRight() {
  if (itemFocus !== 'actions') return;
  itemActionIndex = (itemActionIndex + 1) % 3;
  renderItemActions();
  playMenuSelectSound();
}

function itemHandleZ() {
  if (itemFocus === 'list') {
    if (!inventory.length) return;
    itemFocus = 'actions';
    itemActionIndex = 0;
    renderItemList();
    playMenuSelectSound();
    return;
  }
  activateItemAction();
}

function itemHandleX() {
  if (itemFocus === 'actions') {
    itemFocus = 'list';
    renderItemList();
    return;
  }
  closeItemScreen();
}

function activateItemAction() {
  if (!inventory.length) return;
  playMenuConfirmSound();
  if (itemActionIndex === 0) {
    useSelectedItem();
  } else if (itemActionIndex === 1) {
    infoSelectedItem();
  } else {
    dropSelectedItem();
  }
}

// doesn't do much yet -- hook up real per-item effects here (e.g. a
// switch on the item id) whenever you're ready
// equips/unequips items that have a `slot` (weapon or armor) -- pressing
// USE on an already-equipped item takes it back off. Anything else still
// just logs, same as before -- hook up other item effects here.
function useSelectedItem() {
  const id = inventory[itemIndex];
  const item = ITEMS[id];
  if (item && item.slot) {
    equipped[item.slot] = (equipped[item.slot] === id) ? null : id;
    saveEquipped();
    renderItemList(); // refresh so the equipped marker updates
    return;
  }
  if (id === 'egg') {
    // just a sound effect -- never removed from inventory, use it as
    // many times as you want
    playEggUseSound();
    closeMenu();
  }
  console.log('TODO: use item', id);
}

// ---- item info typewriter ----
// A second, separate typewriter from the main dialogue one above --
// keeping it separate means opening an item's INFO can never mess with
// currentNodeId or accidentally trigger that node's own choice grid.
// Uses its own blip sound too.
const ITEM_INFO_BLIP_SRC = '/assets/blip_none.wav';
const playItemInfoBlip = createBlipPlayer(ITEM_INFO_BLIP_SRC, TYPE_SOUND_VOLUME);

let itemInfoTokens = [];
let itemInfoTokenIndex = 0;
let itemInfoRevealed = [];
let itemInfoTyping = false;
let itemInfoTypeTimer = null;

function renderItemInfoRevealed() {
  textEl.innerHTML = charsToHtml(itemInfoRevealed);
}

function itemInfoTypeStep() {
  if (itemInfoTokenIndex >= itemInfoTokens.length) {
    itemInfoTyping = false;
    return;
  }

  const token = itemInfoTokens[itemInfoTokenIndex];
  itemInfoTokenIndex++;

  if (token.type === 'pause') {
    itemInfoTypeTimer = setTimeout(itemInfoTypeStep, token.ms);
    return;
  }
  if (token.type === 'hide' || token.type === 'music') {
    // not meaningful for item info text -- just skip over it
    itemInfoTypeTimer = setTimeout(itemInfoTypeStep, 0);
    return;
  }

  itemInfoRevealed.push(token);
  renderItemInfoRevealed();
  if (!/\s/.test(token.ch)) {
    playItemInfoBlip();
  }

  if (itemInfoTokenIndex >= itemInfoTokens.length) {
    itemInfoTyping = false;
    return;
  }
  itemInfoTypeTimer = setTimeout(itemInfoTypeStep, TYPE_SPEED_MS);
}

function finishItemInfoTyping() {
  clearTimeout(itemInfoTypeTimer);
  itemInfoRevealed = itemInfoTokens.filter((t) => t.type === 'char');
  renderItemInfoRevealed();
  itemInfoTokenIndex = itemInfoTokens.length;
  itemInfoTyping = false;
}

function infoSelectedItem() {
  const id = inventory[itemIndex];
  const item = ITEMS[id];
  if (!item) return;
  itemInfoOpen = true;
  itemBoxEl.style.display = 'none';
  menuBoxEl.style.display = 'none';
  choiceGridEl.style.display = 'none';
  textEl.style.display = '';
  showTextbox();

  itemInfoTokens = parseDialogueMarkup(item.info);
  itemInfoTokenIndex = 0;
  itemInfoRevealed = [];
  itemInfoTyping = true;
  textEl.innerHTML = '';
  clearTimeout(itemInfoTypeTimer);

  if (IS_MOBILE) {
    finishItemInfoTyping();
  } else {
    itemInfoTypeStep();
  }
}

function closeItemInfo() {
  clearTimeout(itemInfoTypeTimer);
  itemInfoOpen = false;
  itemInfoTyping = false;
  hideTextbox();
  menuBoxEl.style.display = 'flex';
  itemBoxEl.style.display = 'flex';
  renderItemList();
}

function dropSelectedItem() {
  removeItemAt(itemIndex);
  if (itemIndex >= inventory.length) {
    itemIndex = Math.max(0, inventory.length - 1);
  }
  itemFocus = inventory.length ? 'list' : 'actions';
  itemActionIndex = 0;
  renderItemList();
}

// ---- STAT screen (STAT entry inside the menu) ----
// Purely informational -- no list, no cursor. WEAPON/ARMOR reflect
// whatever's currently equipped; everything else is the static markup
// in index.html, edited by hand.

function openStatScreen() {
  statScreenOpen = true;
  renderMenu(); // hide the nav-box cursor now that focus has moved here
  statScreenEl.style.left = (menuBoxEl.offsetLeft + menuBoxEl.offsetWidth + ITEM_BOX_GAP) + 'px';
  statScreenEl.style.top = menuBoxEl.offsetTop + 'px';
  statScreenEl.style.display = 'flex';
  renderStatScreen();
}

function closeStatScreen() {
  statScreenOpen = false;
  statScreenEl.style.display = 'none';
  renderMenu(); // restore the nav-box cursor now that focus is back here
}

function renderStatScreen() {
  const weaponItem = equipped.weapon && ITEMS[equipped.weapon];
  const armorItem = equipped.armor && ITEMS[equipped.armor];
  statScreenWeaponEl.textContent = weaponItem ? weaponItem.label : 'None';
  statScreenArmorEl.textContent = armorItem ? armorItem.label : 'None';
}

// ---- shop (opened by clicking the character) ----
// Two panels sitting where the main textbox does, replacing it while
// open (same pause/resume mechanism as the pause menu, via
// wasTypingBeforeMenu/wasTextboxVisibleBeforeMenu). Left panel is
// flavor text, right panel is a nav list that starts as Buy/Sell/Talk/
// Exit and swaps to a Buy or Sell item list once you pick one.

// shopkeeper images for different parts of the shop -- swapped in
// automatically as you move around (see updateShopImage() below), and
// all restored to whatever the scene was actually showing once the
// shop closes. Anything left out just falls back to `default`. All
// three point at the same file right now -- swap in different poses/
// expressions for `buy`/`sell`/`talk` whenever you have them.
const SHOP_IMAGES = {
  default: '/assets/anim/shopkeep_default.gif',
  buy: '/assets/anim/shopkeep_looking.gif',
  sell: '/assets/anim/shopkeep_looking.gif',
  talk: '/assets/anim/shopkeep_looking.gif'
};
const SHOP_MUSIC_SRC = '/music/clockwork.wav';
let preShopImageSrc = '';
let preShopMusicSrc = '';

// picks the right SHOP_IMAGES entry for whatever's currently going on
// and swaps to it -- call this any time shopMode (or, in 'confirm',
// shopConfirmAction) changes
function updateShopImage() {
  let key = 'default';
  if (shopMode === 'buy') key = 'buy';
  else if (shopMode === 'sell') key = 'sell';
  else if (shopMode === 'talk') key = 'talk';
  else if (shopMode === 'confirm') key = shopConfirmAction === 'buy' ? 'buy' : shopConfirmAction === 'sell' ? 'sell' : 'default';
  setSceneImage(SHOP_IMAGES[key] || SHOP_IMAGES.default);
}

async function openShop() {
  // don't let the shop interrupt the menu, a forced choice, or scene
  // playback -- and don't let a second click re-trigger this while
  // already fading in/out
  if (shopOpen || shopTransitioning || menuOpen || choiceActive || scenePlaybackActive) return;
  shopTransitioning = true;
  await fadeToBlack();

  wasTypingBeforeMenu = typing;
  wasTextboxVisibleBeforeMenu = textboxEl.style.opacity !== '0';
  if (typing) clearTimeout(typeTimer);
  hideTextbox();
  pauseBarGlow();

  preShopImageSrc = currentImageSrc;

  preShopMusicSrc = currentMusicSrc;
  playMusic(SHOP_MUSIC_SRC);

  shopOpen = true;
  shopMode = 'main';
  shopNavIndex = 0;
  shopListIndex = 0;
  updateShopImage();
  startShopDialogueText(SHOP_GREETING);
  renderShopNav();
  renderShopFooter();
  shopBoxEl.style.display = 'block';
  shopHotspotEl.style.display = 'none'; // nothing to click while already in the shop
  playMenuConfirmSound();

  await fadeFromBlack();
  shopTransitioning = false;
}

async function closeShop() {
  if (shopTransitioning) return;
  shopTransitioning = true;
  await fadeToBlack();

  clearTimeout(shopDialogueTypeTimer);
  shopDialogueTyping = false;
  shopReading = false;
  shopOpen = false;
  shopBoxEl.style.display = 'none';
  shopHotspotEl.style.display = ''; // clickable again now that the shop's closed
  resumeBarGlow();
  if (preShopImageSrc) {
    setSceneImage(preShopImageSrc);
  } else {
    clearSceneImage();
  }
  if (preShopMusicSrc) {
    playMusic(preShopMusicSrc);
  } else {
    stopMusic();
  }
  if (wasTextboxVisibleBeforeMenu) {
    showTextbox();
  }
  playMenuConfirmSound();
  if (wasTypingBeforeMenu) {
    wasTypingBeforeMenu = false;
    typeStep(); // resume typing exactly where it was paused
  }

  await fadeFromBlack();
  shopTransitioning = false;
}

function renderShopDialogueRevealed() {
  shopDialogueTextEl.innerHTML = charsToHtml(shopDialogueRevealed);
}

function shopDialogueTypeStep() {
  if (shopDialogueTokenIndex >= shopDialogueTokens.length) {
    shopDialogueTyping = false;
    return;
  }

  const token = shopDialogueTokens[shopDialogueTokenIndex];
  shopDialogueTokenIndex++;

  if (token.type === 'pause') {
    shopDialogueTypeTimer = setTimeout(shopDialogueTypeStep, token.ms);
    return;
  }
  if (token.type === 'hide' || token.type === 'music') {
    // not meaningful for shop flavor text -- just skip over it
    shopDialogueTypeTimer = setTimeout(shopDialogueTypeStep, 0);
    return;
  }
  if (token.type === 'image') {
    setSceneImage(token.src);
    shopDialogueTypeTimer = setTimeout(shopDialogueTypeStep, 0);
    return;
  }

  shopDialogueRevealed.push(token);
  renderShopDialogueRevealed();
  if (!/\s/.test(token.ch)) {
    playTypeSound(); // the same blip normal dialogue uses
  }

  if (shopDialogueTokenIndex >= shopDialogueTokens.length) {
    shopDialogueTyping = false;
    return;
  }
  shopDialogueTypeTimer = setTimeout(shopDialogueTypeStep, TYPE_SPEED_MS);
}

function finishShopDialogueTyping() {
  clearTimeout(shopDialogueTypeTimer);
  // apply whichever [img:] tags are still ahead, so skipping straight to
  // the end still lands on the right picture -- same as if you'd
  // watched it type out one character at a time
  for (let i = shopDialogueTokenIndex; i < shopDialogueTokens.length; i++) {
    if (shopDialogueTokens[i].type === 'image') {
      setSceneImage(shopDialogueTokens[i].src);
    }
  }
  shopDialogueRevealed = shopDialogueTokens.filter((t) => t.type === 'char');
  renderShopDialogueRevealed();
  shopDialogueTokenIndex = shopDialogueTokens.length;
  shopDialogueTyping = false;
}

// starts (or restarts) the shop dialogue panel typing out `rawText` --
// a normal dialogue-style string, so [p:ms]/[c:color] tags and \n all
// work exactly like they do in NODES text
function startShopDialogueText(rawText) {
  clearTimeout(shopDialogueTypeTimer);
  shopDialogueTokens = parseDialogueMarkup(rawText);
  shopDialogueTokenIndex = 0;
  shopDialogueRevealed = [];
  shopDialogueTyping = true;
  shopDialogueTextEl.innerHTML = '';

  if (IS_MOBILE) {
    finishShopDialogueTyping();
  } else {
    shopDialogueTypeStep();
  }
}

// Starts a LOCKED, possibly multi-page piece of dialogue. Pass a single
// string for one page, or an array of strings to write more than fits
// in the box -- Z or X (once the current page is done typing) clears
// the box and shows the next one, exactly like advancing normal
// dialogue. After the LAST page, normal shop navigation becomes
// available again immediately -- no separate "done reading" press
// needed beyond the one that finished that last page.
function startShopReadingText(rawTextOrPages) {
  shopReadingPages = Array.isArray(rawTextOrPages) ? rawTextOrPages : [rawTextOrPages];
  shopReadingPageIndex = 0;
  shopReading = true;
  renderShopNav(); // hides the cursor immediately -- the list isn't selectable now
  startShopDialogueText(shopReadingPages[0]);
}

// call once the CURRENT page has finished typing (from Z/X) -- moves to
// the next queued page, or ends the reading session if that was the
// last one
// call once there's nothing left to read (last page dismissed, or the
// player moved on before finishing a not-yet-started page) -- reverts
// to the generic per-mode image (e.g. 'talk') now that a specific
// topic's reactive image, if any, no longer applies
function endShopReading() {
  shopReading = false;
  updateShopImage();
  renderShopNav();
}

function advanceShopReadingPage() {
  shopReadingPageIndex++;
  if (shopReadingPageIndex < shopReadingPages.length) {
    startShopDialogueText(shopReadingPages[shopReadingPageIndex]);
  } else {
    endShopReading();
  }
}

// updates the left panel to describe whatever item the cursor is
// currently on in Buy/Sell -- the "hovering" request. Does nothing on
// an empty list (the "Nothing for sale."/"Nothing to sell." row in the
// nav panel already covers that).
function updateShopHoverInfo() {
  let id = null;
  if (shopMode === 'buy') {
    id = getBuyableItemIds()[shopListIndex];
  } else if (shopMode === 'sell') {
    id = inventory[shopListIndex];
  }
  if (!id) return;
  const item = ITEMS[id];
  const line = item && (shopMode === 'buy' ? item.shopBuyLine : item.shopSellLine);
  startShopDialogueText(line || `A ${item ? item.label : id}.`);
}

function renderShopFooter() {
  shopGoldEl.textContent = gold + 'G';
  // "1/8" here is how many of your MAX_ITEMS inventory slots are
  // filled -- not a count of what's for sale
  shopInventoryCountEl.textContent = inventory.length + '/' + MAX_ITEMS;
}

function renderShopNav() {
  let html = '';
  if (shopMode === 'main') {
    SHOP_MAIN_ENTRIES.forEach((label, i) => {
      const cursor = i === shopNavIndex ? cursorImgHtml() : '';
      html += `<div class="shop-nav-entry" data-index="${i}">${cursor}${escapeHtml(label)}</div>`;
    });
  } else if (shopMode === 'buy') {
    const buyableIds = getBuyableItemIds();
    if (!buyableIds.length) {
      html = '<div class="item-empty">Nothing for sale.</div>';
    } else {
      buyableIds.forEach((id, i) => {
        const item = ITEMS[id];
        const label = item.shopLabel || item.label;
        const cursor = i === shopListIndex ? cursorImgHtml() : '';
        html += `<div class="shop-nav-entry" data-index="${i}">${cursor}${escapeHtml(label)} - ${item.buyPrice}G</div>`;
      });
    }
  } else if (shopMode === 'sell') {
    if (!inventory.length) {
      html = '<div class="item-empty">Nothing to sell.</div>';
    } else {
      inventory.forEach((id, i) => {
        const item = ITEMS[id];
        const label = item ? (item.shopLabel || item.label) : id;
        const price = (item && item.sellPrice != null) ? item.sellPrice : 0;
        const cursor = i === shopListIndex ? cursorImgHtml() : '';
        html += `<div class="shop-nav-entry" data-index="${i}">${cursor}${escapeHtml(label)} - ${price}G</div>`;
      });
    }
  } else if (shopMode === 'confirm') {
    ['Yes', 'No'].forEach((label, i) => {
      const cursor = i === shopConfirmChoice ? cursorImgHtml() : '';
      html += `<div class="shop-nav-entry" data-index="${i}">${cursor}${escapeHtml(label)}</div>`;
    });
  } else if (shopMode === 'talk') {
    SHOP_TALK_TOPICS.forEach((topic, i) => {
      // hidden while shopReading -- the list isn't actually selectable
      // right now (you're reading a response), so showing a cursor
      // would misleadingly suggest otherwise
      const cursor = (i === shopTalkIndex && !shopReading) ? cursorImgHtml() : '';
      html += `<div class="shop-nav-entry" data-index="${i}">${cursor}${escapeHtml(topic.label)}</div>`;
    });
  }
  shopNavListEl.innerHTML = html;

  // the list can now scroll (a full Sell list won't always fit in the
  // box), so make sure the selected row is actually visible instead of
  // potentially scrolled off -- same manual approach used elsewhere in
  // this file, since relying on the browser's own scrollIntoView proved
  // unreliable for this exact kind of list
  const selectedIndex = shopMode === 'main' ? shopNavIndex
    : shopMode === 'confirm' ? shopConfirmChoice
    : shopMode === 'talk' ? shopTalkIndex
    : shopListIndex;
  const selectedEl = shopNavListEl.querySelector(`.shop-nav-entry[data-index="${selectedIndex}"]`);
  if (selectedEl) {
    const listRect = shopNavListEl.getBoundingClientRect();
    const rowRect = selectedEl.getBoundingClientRect();
    if (rowRect.top < listRect.top) {
      shopNavListEl.scrollTop -= (listRect.top - rowRect.top);
    } else if (rowRect.bottom > listRect.bottom) {
      shopNavListEl.scrollTop += (rowRect.bottom - listRect.bottom);
    }
  }
}

function shopCurrentListLength() {
  if (shopMode === 'buy') return getBuyableItemIds().length;
  if (shopMode === 'sell') return inventory.length;
  if (shopMode === 'confirm') return 2;
  if (shopMode === 'talk') return SHOP_TALK_TOPICS.length;
  return 0;
}

function shopHandleUp() {
  // unlike the rest of the site, moving the cursor here works even
  // while the shop's dialogue is still typing -- selecting/confirming
  // (Z) still waits for it, same as everywhere else. The one exception
  // is while shopReading is active (a Talk response, possibly
  // multi-page) -- there's no list to move through while a page is
  // still typing. Once it's done, though, trying to move the cursor
  // (like this) ends the reading session right then and proceeds with
  // the move in the same press -- no separate Z/X needed first.
  if (shopReading) {
    if (shopDialogueTyping) return;
    // if more pages are still queued, Up/Down stay locked too -- only
    // Z/X advance through pages, so a mid-reading Up/Down press doesn't
    // accidentally abandon a page you haven't seen yet
    if (shopReadingPageIndex < shopReadingPages.length - 1) return;
    endShopReading();
  }
  if (shopMode === 'main') {
    if (shopNavIndex > 0) {
      shopNavIndex--;
      renderShopNav();
      playMenuSelectSound();
    }
    return;
  }
  if (shopMode === 'confirm') {
    if (shopConfirmChoice > 0) {
      shopConfirmChoice--;
      renderShopNav();
      playMenuSelectSound();
    }
    return;
  }
  if (shopMode === 'talk') {
    if (shopTalkIndex > 0) {
      shopTalkIndex--;
      renderShopNav();
      playMenuSelectSound();
    }
    return;
  }
  if (shopListIndex > 0) {
    shopListIndex--;
    renderShopNav();
    updateShopHoverInfo();
    playMenuSelectSound();
  }
}

function shopHandleDown() {
  if (shopReading) {
    if (shopDialogueTyping) return;
    if (shopReadingPageIndex < shopReadingPages.length - 1) return;
    endShopReading();
  }
  if (shopMode === 'main') {
    if (shopNavIndex < SHOP_MAIN_ENTRIES.length - 1) {
      shopNavIndex++;
      renderShopNav();
      playMenuSelectSound();
    }
    return;
  }
  if (shopMode === 'confirm') {
    if (shopConfirmChoice < 1) {
      shopConfirmChoice++;
      renderShopNav();
      playMenuSelectSound();
    }
    return;
  }
  if (shopMode === 'talk') {
    if (shopTalkIndex < SHOP_TALK_TOPICS.length - 1) {
      shopTalkIndex++;
      renderShopNav();
      playMenuSelectSound();
    }
    return;
  }
  if (shopListIndex < shopCurrentListLength() - 1) {
    shopListIndex++;
    renderShopNav();
    updateShopHoverInfo();
    playMenuSelectSound();
  }
}

function shopHandleZ() {
  if (shopMode === 'main') {
    const choice = SHOP_MAIN_ENTRIES[shopNavIndex];
    playMenuConfirmSound();
    if (choice === 'Buy') {
      shopMode = 'buy';
      shopListIndex = 0;
      updateShopImage();
      renderShopNav();
      updateShopHoverInfo();
    } else if (choice === 'Sell') {
      shopMode = 'sell';
      shopListIndex = 0;
      updateShopImage();
      renderShopNav();
      updateShopHoverInfo();
    } else if (choice === 'Talk') {
      shopMode = 'talk';
      shopTalkIndex = 0;
      shopReading = false;
      updateShopImage();
      renderShopNav();
      startShopDialogueText(SHOP_TALK_PROMPT);
    } else if (choice === 'Exit') {
      closeShop();
    }
    return;
  }

  if (shopMode === 'talk') {
    if (shopReading) {
      // reading a (possibly multi-page) response -- Z does nothing
      // until the current page finishes typing, same as normal
      // dialogue. Once it has, Z either shows the next page or, if that
      // was the last one, returns to the topic list automatically --
      // you can't jump to a different topic mid-response.
      if (shopDialogueTyping) return;
      advanceShopReadingPage();
      return;
    }
    const topic = SHOP_TALK_TOPICS[shopTalkIndex];
    if (!topic) return;
    playMenuConfirmSound();
    if (topic.image) setSceneImage(topic.image);
    startShopReadingText(topic.response);
    return;
  }

  if (shopMode === 'buy') {
    const id = getBuyableItemIds()[shopListIndex];
    if (!id) return;
    const item = ITEMS[id];
    playMenuConfirmSound();
    shopConfirmAction = 'buy';
    shopConfirmId = id;
    shopConfirmChoice = 0;
    shopMode = 'confirm';
    renderShopNav();
    startShopDialogueText(`Buy the ${item.label} for ${item.buyPrice}G?`);
    return;
  }

  if (shopMode === 'sell') {
    const id = inventory[shopListIndex];
    if (!id) return;
    const item = ITEMS[id];
    const price = (item && item.sellPrice != null) ? item.sellPrice : 0;
    playMenuConfirmSound();
    shopConfirmAction = 'sell';
    shopConfirmChoice = 0;
    shopMode = 'confirm';
    renderShopNav();
    startShopDialogueText(`Sell the ${item ? item.label : id} for ${price}G?`);
    return;
  }

  if (shopMode === 'confirm') {
    playMenuConfirmSound();
    if (shopConfirmChoice === 0) {
      executeShopConfirm();
    } else {
      // No -- cancel back to whichever list we were confirming from
      shopMode = shopConfirmAction;
      renderShopNav();
      updateShopHoverInfo();
    }
    return;
  }
}

// actually performs whatever shopConfirmAction/shopConfirmId describe,
// once the player has said Yes -- returns to the Buy/Sell list either
// way afterward
function executeShopConfirm() {
  if (shopConfirmAction === 'buy') {
    const item = ITEMS[shopConfirmId];
    shopMode = 'buy';
    if (!item) {
      renderShopNav();
      return;
    }
    if (inventory.length >= MAX_ITEMS) {
      renderShopNav();
      startShopDialogueText("You can't carry any more.");
      return;
    }
    if (!spendGold(item.buyPrice)) {
      renderShopNav();
      startShopDialogueText("You don't have enough gold.");
      return;
    }
    addItem(shopConfirmId);
    renderShopNav();
    renderShopFooter();
    startShopDialogueText(`Got the ${item.label}!`);
    return;
  }

  if (shopConfirmAction === 'sell') {
    shopMode = 'sell';
    const id = inventory[shopListIndex];
    if (!id) {
      renderShopNav();
      return;
    }
    const item = ITEMS[id];
    const price = (item && item.sellPrice != null) ? item.sellPrice : 0;
    removeItemAt(shopListIndex);
    addGold(price);
    if (shopListIndex >= inventory.length) {
      shopListIndex = Math.max(0, inventory.length - 1);
    }
    renderShopNav();
    renderShopFooter();
    startShopDialogueText(`Sold the ${item ? item.label : id}.`);
    return;
  }
}

function shopHandleX() {
  // reading a Talk response is the one exception to "always
  // interruptible": a press only finishes the CURRENT page's typing
  // (matching normal dialogue) -- once it's done, X advances to the
  // next page or, on the last one, ends the reading session
  // automatically. You can't skip straight to a different topic or
  // leave mid-response.
  if (shopReading) {
    if (shopDialogueTyping) {
      finishShopDialogueTyping();
      return;
    }
    advanceShopReadingPage();
    return;
  }

  // everything else backs out immediately and cuts the current line
  // off, same philosophy as Z
  if (shopMode === 'confirm') {
    // same as choosing No
    shopMode = shopConfirmAction;
    renderShopNav();
    updateShopHoverInfo();
    return;
  }
  if (shopMode !== 'main') {
    shopMode = 'main';
    shopNavIndex = 0;
    updateShopImage();
    startShopDialogueText(SHOP_GREETING);
    renderShopNav();
    return;
  }
  closeShop();
}

// ---- scene log screen (LOG entry inside the menu) ----
// A simple browsable list of past scenes, positioned next to menu-box
// the same way the item screen is. Picking one plays it back using the
// normal dialogue engine (so typing, choices, images all just work) --
// startNode()'s scenePlaybackActive check keeps that from touching the
// visitor's real progress or granting items a second time.
//
// Scenes with a `scriptFile` aren't loaded until someone actually picks
// them here -- see ensureSceneLoaded() below. The current/newest scene
// (the last entry in SCENES) never has one; it's already sitting in
// NODES from its <script> tag in index.html, since it has to be ready
// immediately for autoplay/resume.

let sceneLoading = false; // a JSON fetch is in flight -- input is held off

function openSceneLogScreen() {
  sceneLogScreenOpen = true;
  sceneLogIndex = SCENES.length - 1; // always default to the newest
  renderMenu(); // hide the nav-box cursor now that focus has moved here
  sceneLogBoxEl.style.left = (menuBoxEl.offsetLeft + menuBoxEl.offsetWidth + ITEM_BOX_GAP) + 'px';
  sceneLogBoxEl.style.top = menuBoxEl.offsetTop + 'px';
  sceneLogBoxEl.style.display = 'flex';
  renderSceneLogScreen();
}

function closeSceneLogScreen() {
  sceneLogScreenOpen = false;
  sceneLogBoxEl.style.display = 'none';
  renderMenu(); // restore the nav-box cursor now that focus is back here
}

function renderSceneLogScreen() {
  let html = '';
  SCENES.forEach((scene, i) => {
    const cursor = i === sceneLogIndex ? cursorImgHtml() : '';
    html += `<div class="scene-log-entry" data-index="${i}">${cursor}${escapeHtml(scene.label)}</div>`;
  });
  sceneLogListEl.innerHTML = html;
  // click navigation intentionally disabled -- keyboard only
}

function sceneLogHandleUp() {
  if (sceneLoading) return;
  if (sceneLogIndex > 0) {
    sceneLogIndex--;
    renderSceneLogScreen();
    playMenuSelectSound();
  }
}

function sceneLogHandleDown() {
  if (sceneLoading) return;
  if (sceneLogIndex < SCENES.length - 1) {
    sceneLogIndex++;
    renderSceneLogScreen();
    playMenuSelectSound();
  }
}

function sceneLogHandleZ() {
  if (sceneLoading) return;
  playMenuConfirmSound();
  playScene(SCENES[sceneLogIndex]);
}

function sceneLogHandleX() {
  if (sceneLoading) return;
  closeSceneLogScreen();
}

// scenes that have already been loaded this session, keyed by
// scriptFile path, so picking the same archived scene twice doesn't
// inject its <script> tag a second time
const loadedScenes = new Set();

// loads a .js file by injecting a <script> tag for it -- the file
// itself does `Object.assign(window.NODES, {...})` when it runs, same
// as every scene file does, which is what actually merges its nodes in
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('failed to load ' + src));
    document.head.appendChild(script);
  });
}

// loads an archived scene's .js file on demand. no-op (and instant) for
// the current/newest scene, which doesn't have a scriptFile because
// it's already loaded. Returns true on success.
async function ensureSceneLoaded(scene) {
  if (!scene.scriptFile || loadedScenes.has(scene.scriptFile)) return true;
  try {
    await loadScriptOnce(scene.scriptFile);
    loadedScenes.add(scene.scriptFile);
    return true;
  } catch (err) {
    console.warn('failed to load archived scene:', scene.scriptFile, err);
    return false;
  }
}

async function playScene(scene) {
  if (!scene || sceneLoading) return;

  if (scene.scriptFile && !loadedScenes.has(scene.scriptFile)) {
    sceneLoading = true;
    sceneLogListEl.innerHTML = '<div class="item-empty">Loading...</div>';
    const ok = await ensureSceneLoaded(scene);
    sceneLoading = false;
    if (!ok) {
      sceneLogListEl.innerHTML = '<div class="item-empty">Couldn\'t load that scene.</div>';
      return;
    }
  }

  if (!NODES[scene.startNode]) {
    console.warn('scene startNode missing:', scene);
    renderSceneLogScreen();
    return;
  }

  // only remember the true live position the FIRST time playback
  // starts -- if a scene is already playing and the visitor picks a
  // DIFFERENT one from LOG (overriding what's currently showing), we
  // still want to return to the real live conversation afterward, not
  // to whatever scene was playing a moment ago
  if (!scenePlaybackActive) {
    liveReturnNodeId = currentNodeId;
    liveReturnMusicSrc = currentMusicSrc;
  }
  scenePlaybackActive = true;
  menuOpen = false; // the menu is about to be fully replaced by the scene
  closeSceneLogScreen();
  menuBoxEl.style.display = 'none';
  startNode(scene.startNode);
}

function exitScenePlayback() {
  scenePlaybackActive = false;
  if (liveReturnNodeId) {
    startNode(liveReturnNodeId);
    if (liveReturnMusicSrc) playMusic(liveReturnMusicSrc);
  }
  // startNode() above already kicked off (or, on mobile, finished) the
  // live node's own typewriter -- closeMenu()'s "resume where it was
  // paused" logic must NOT also try to advance it, or it'll double up
  wasTypingBeforeMenu = false;
  wasTextboxVisibleBeforeMenu = true;
  menuOpen = true;
  menuBoxEl.style.display = 'flex';
  openSceneLogScreen(); // back to the list so another scene can be picked
}

// ---- input ----

function handleZ() {
  if (shopTransitioning) return;
  if (itemInfoOpen) {
    if (itemInfoTyping) {
      finishItemInfoTyping();
    } else {
      closeItemInfo();
    }
    return;
  }
  if (shopOpen) {
    shopHandleZ();
    return;
  }
  if (itemScreenOpen) {
    itemHandleZ();
    return;
  }
  if (statScreenOpen) {
    closeStatScreen(); // purely informational -- Z just backs out
    return;
  }
  if (sceneLogScreenOpen) {
    sceneLogHandleZ();
    return;
  }
  if (menuOpen) {
    activateMenuEntry();
    return;
  }
  if (scenePlaybackActive) {
    if (typing) return; // Z doesn't skip typing anymore -- press X for that
    if (choiceActive) {
      confirmChoice();
      return;
    }
    const playbackNode = NODES[currentNodeId];
    if (playbackNode && playbackNode.next) {
      startNode(playbackNode.next);
    } else {
      hideTextbox();
      exitScenePlayback();
    }
    return;
  }
  if (typing) return; // Z doesn't skip typing anymore -- press X for that
  if (choiceActive) {
    confirmChoice();
    return;
  }
  const node = NODES[currentNodeId];
  if (node && node.next) {
    startNode(node.next);
  } else {
    hideTextbox();
  }
}

function handleX() {
  if (shopTransitioning) return;
  if (itemInfoOpen) {
    if (itemInfoTyping) {
      finishItemInfoTyping();
    } else {
      closeItemInfo();
    }
    return;
  }
  if (shopOpen) {
    shopHandleX();
    return;
  }
  if (itemScreenOpen) {
    itemHandleX();
    return;
  }
  if (statScreenOpen) {
    closeStatScreen();
    return;
  }
  if (sceneLogScreenOpen) {
    sceneLogHandleX();
    return;
  }
  if (menuOpen) {
    closeMenu();
    return;
  }
  // No more "X exits scene playback" shortcut -- while watching a
  // scene, X only ever skips its typewriter, exactly like live
  // dialogue. The only ways out are letting the scene reach its own
  // natural end, or opening the menu (C) and picking a different scene
  // from LOG.
  if (typing) {
    finishTyping();
  }
}

function handleUp() {
  if (shopTransitioning) return;
  if (itemInfoOpen) return;
  if (shopOpen) {
    shopHandleUp();
    return;
  }
  if (itemScreenOpen) {
    itemHandleUp();
    return;
  }
  if (statScreenOpen) return; // nothing to navigate
  if (sceneLogScreenOpen) {
    sceneLogHandleUp();
    return;
  }
  if (menuOpen) {
    const newIndex = (menuIndex - 1 + MENU_ENTRIES.length) % MENU_ENTRIES.length;
    if (newIndex !== menuIndex) {
      menuIndex = newIndex;
      renderMenu();
      playMenuSelectSound();
    }
    return;
  }
  if (scenePlaybackActive) {
    if (choiceActive) moveChoiceGrid(-1, 0);
    return;
  }
  if (choiceActive) moveChoiceGrid(-1, 0);
}

function handleDown() {
  if (shopTransitioning) return;
  if (itemInfoOpen) return;
  if (shopOpen) {
    shopHandleDown();
    return;
  }
  if (itemScreenOpen) {
    itemHandleDown();
    return;
  }
  if (statScreenOpen) return; // nothing to navigate
  if (sceneLogScreenOpen) {
    sceneLogHandleDown();
    return;
  }
  if (menuOpen) {
    const newIndex = (menuIndex + 1) % MENU_ENTRIES.length;
    if (newIndex !== menuIndex) {
      menuIndex = newIndex;
      renderMenu();
      playMenuSelectSound();
    }
    return;
  }
  if (scenePlaybackActive) {
    if (choiceActive) moveChoiceGrid(1, 0);
    return;
  }
  if (choiceActive) moveChoiceGrid(1, 0);
}

function handleLeft() {
  if (itemInfoOpen) return;
  if (itemScreenOpen) {
    itemHandleLeft();
    return;
  }
  if (choiceActive) moveChoiceGrid(0, -1);
}

function handleRight() {
  if (itemInfoOpen) return;
  if (itemScreenOpen) {
    itemHandleRight();
    return;
  }
  if (choiceActive) moveChoiceGrid(0, 1);
}

// Nothing below this point runs on mobile -- keyboard input, touch
// input, the scene-click item demo, and the initial resume/autoplay
// are all part of the game itself, which mobile visitors never see.
if (!IS_MOBILE) {
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'z') {
      e.preventDefault();
      startAmbience();
      resumeMusicContext();
      handleZ();
    } else if (k === 'x' || k === 'escape') {
      e.preventDefault();
      startAmbience();
      resumeMusicContext();
      handleX();
    } else if (k === 'arrowup' || k === 'w') {
      e.preventDefault();
      handleUp();
    } else if (k === 'arrowdown' || k === 's') {
      e.preventDefault();
      handleDown();
    } else if (k === 'arrowleft' || k === 'a') {
      e.preventDefault();
      handleLeft();
    } else if (k === 'arrowright' || k === 'd') {
      e.preventDefault();
      handleRight();
    } else if (k === 'c') {
      e.preventDefault();
      toggleMenu();
    }
  });

  window.addEventListener('touchend', (e) => {
    if (e.target && e.target.closest && e.target.closest('#choice-grid, #menu-box, #item-box, #scene-log-box, #stat-screen, #shop-box, #shop-hotspot')) {
      return;
    }
    e.preventDefault();
    startAmbience();
    resumeMusicContext();
    handleZ();
  }, { passive: false });

  // clicking the small hotspot over the character opens the shop --
  // position/size it in style.css (#shop-hotspot). To see exactly
  // where it currently sits while you're tuning it, temporarily add
  // "background: rgba(255,0,0,0.4) !important;" to that same rule.
  shopHotspotEl.addEventListener('click', () => {
    openShop();
  });

  // Resume wherever they left off instead of replaying dialogue they've
  // already seen. If you ever want to force a visitor back to the very
  // start (e.g. after a big content update), clear the
  // 'site-dialogue-progress' key from localStorage.
  const savedProgress = loadDialogueProgress();
  const resumeNodeId = (savedProgress && NODES[savedProgress.nodeId]) ? savedProgress.nodeId : START_NODE;
  startNode(resumeNodeId);
  if (savedProgress && savedProgress.musicSrc) {
    playMusic(savedProgress.musicSrc);
  }
}