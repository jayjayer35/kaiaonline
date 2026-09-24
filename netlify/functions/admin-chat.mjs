// kaia-only chat tools: delete one message, clear everything, pin/unpin.
// needs the owner token from chat-login.mjs.
import { getStore } from "@netlify/blobs";

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

// must match chat-login.mjs
async function ownerToken(secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("kaia-chat-owner"));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || typeof body.token !== "string" || body.token !== (await ownerToken(secret))) {
    return json({ error: "owner login expired" }, 401);
  }

  const store = getStore("chat");

  if (body.action === "delete") {
    const messages = (await store.get("messages", { type: "json" })) || [];
    const kept = messages.filter((m) => m.id !== body.id);
    if (kept.length === messages.length) return json({ error: "message not found" }, 404);
    await store.setJSON("messages", kept);
    return json({ ok: true }, 200);
  }

  if (body.action === "clear") {
    await store.setJSON("messages", []);
    return json({ ok: true }, 200);
  }

  if (body.action === "pin") {
    const text = typeof body.text === "string"
      ? body.text.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 200)
      : "";
    if (text) await store.set("pin", text);
    else await store.delete("pin");
    return json({ ok: true }, 200);
  }

  return json({ error: "unknown action" }, 400);
};
