// ---- scene: newest ----
// One chunk of the node graph -- see the "node graph" comment near the
// top of script.js for what a node's shape means (text/image/next,
// or text/choices). This file just needs to attach its nodes onto the
// shared window.NODES object; index.html loads every dialogue file with
// a plain <script> tag, in order, BEFORE script.js, so by the time
// script.js runs, window.NODES already has everything merged into it.
//
// IMPORTANT: node ids must be unique across every file in /dialogue/ --
// two files defining the same id means whichever loads second silently
// overwrites the first (this is exactly what broke scene1's playback).
// This file's ids are prefixed s2_ for that reason; keep doing that
// (s3_, s4_, ...) for future scenes.
//
// This file is "done" -- once a scene's been posted, leave it alone.
// That's what keeps it intact and watchable from the LOG menu later.
window.NODES = window.NODES || {};
Object.assign(window.NODES, {
  s2_n1: {
    text: "Hi! [p:600]It's nice to see you here!",
    image: "/assets/anim/kicks.gif",
    next: "s2_n2"
  },
  s2_n2: {
    text: "Hi! [p:600]It's nice to see you here!",
    image: "/assets/anim/kicks.gif",
    next: null
  }
});