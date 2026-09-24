// Returns the chat messages, the pinned message, and who's chatted today.
import { getStore } from "@netlify/blobs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const DAY = 24 * 60 * 60 * 1000;

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const store = getStore("chat");
  const messages = (await store.get("messages", { type: "json" })) || [];
  const pin = (await store.get("pin", { type: "text" })) || "";

  // /who: people who chatted in the last 24 hours. counted by (hashed) ip,
  // names listed newest first
  const since = Date.now() - DAY;
  const people = new Set();
  const names = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.timestamp < since) break;
    people.add(m.owner ? "kaia" : m.ipHash);
    const shown = (m.owner ? "★" : "") + m.name;
    if (!names.includes(shown) && names.length < 15) names.push(shown);
  }

  // never send the ip hash back out
  const safe = messages.map(({ id, name, text, timestamp, owner, kind }) =>
    ({ id, name, text, timestamp, owner: !!owner, kind: kind || "msg" }));

  return new Response(JSON.stringify({ messages: safe, pin, who: { count: people.size, names } }), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};
