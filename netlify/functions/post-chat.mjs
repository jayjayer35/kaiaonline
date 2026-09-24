// Adds a message to the homepage chat. Messages never expire by age;
// only the oldest drop off once there are more than MAX_MESSAGES.
// kinds: "msg" (normal), "action" (/me), "roll" (/roll, rolled here so it
// can't be faked), "announce" (/announce, kaia only)
import { getStore } from "@netlify/blobs";

const MAX_MESSAGES = 1000; // no time limit — only the oldest drop off past this count
const MAX_NAME = 20;
const MAX_TEXT = 200;
const COOLDOWN_MS = 3000; // one message every 3 seconds per visitor

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// strip control characters, trim, cap length
const clean = (s, max) =>
  typeof s === "string" ? s.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max) : "";

// any name containing "kaia", including k@ia, KA1A, k_a_i_a, etc.
const isReserved = (name) =>
  name.toLowerCase()
    .replace(/[4@]/g, "a")
    .replace(/[1!|l]/g, "i")
    .replace(/[^a-z]/g, "")
    .includes("kaia");

// must match chat-login.mjs
async function ownerToken(secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("kaia-chat-owner"));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// hash the ip so we can rate-limit (and count /who) without storing it
async function hashIp(ip) {
  const salt = process.env.CHAT_SALT || "kaia-online";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ip));
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// "2d6", "d20", "3d8+2", "1d100-5" -> "rolled 2d6: 3 + 5 = 8"
function rollDice(spec) {
  const m = /^(\d{0,2})d(\d{1,4})([+-]\d{1,4})?$/i.exec(String(spec).replace(/\s+/g, ""));
  if (!m) return null;
  const count = m[1] ? Number(m[1]) : 1;
  const sides = Number(m[2]);
  const mod = m[3] ? Number(m[3]) : 0;
  if (count < 1 || count > 20 || sides < 2 || sides > 1000) return null;
  const rolls = [];
  const buf = new Uint32Array(count);
  crypto.getRandomValues(buf);
  for (const r of buf) rolls.push((r % sides) + 1);
  const total = rolls.reduce((a, b) => a + b, 0) + mod;
  const label = `${count}d${sides}${mod ? (mod > 0 ? "+" : "") + mod : ""}`;
  const parts = rolls.join(" + ") + (mod ? (mod > 0 ? ` + ${mod}` : ` - ${-mod}`) : "");
  return rolls.length === 1 && !mod ? `rolled ${label}: ${total}` : `rolled ${label}: ${parts} = ${total}`;
}

export default async (req, context) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  // owner messages always post as "kaia", whatever name was sent
  let owner = false;
  if (typeof body.token === "string" && body.token) {
    const secret = process.env.ADMIN_PASSWORD;
    owner = !!secret && body.token === (await ownerToken(secret));
    if (!owner) return json({ error: "owner login expired" }, 401);
  }
  const name = owner ? "kaia" : clean(body.name, MAX_NAME).replace(/\s+/g, "_") || "anon";
  if (!owner && isReserved(name)) return json({ error: "that name is reserved, pick another!" }, 400);

  const kind = ["msg", "action", "roll", "announce"].includes(body.kind) ? body.kind : "msg";
  if (kind === "announce" && !owner) return json({ error: "kaia only" }, 403);

  let text;
  if (kind === "roll") {
    text = rollDice(body.roll || "1d6");
    if (!text) return json({ error: "try /roll 2d6 (up to 20 dice, 2–1000 sides)" }, 400);
  } else {
    text = clean(body.text, MAX_TEXT);
    if (!text) return json({ error: "empty message" }, 400);
  }

  const ipHash = await hashIp(context.ip || "unknown");
  const now = Date.now();

  const store = getStore("chat");
  const messages = (await store.get("messages", { type: "json" })) || [];

  const lastFromThem = [...messages].reverse().find((m) => m.ipHash === ipHash);
  if (!owner && lastFromThem && now - lastFromThem.timestamp < COOLDOWN_MS) {
    return json({ error: "slow down" }, 429);
  }

  const msg = { id: crypto.randomUUID(), name, text, timestamp: now, ipHash };
  if (kind !== "msg") msg.kind = kind;
  if (owner) msg.owner = true;
  messages.push(msg);
  await store.setJSON("messages", messages.slice(-MAX_MESSAGES));

  return json({ ok: true, id: msg.id }, 200);
};
