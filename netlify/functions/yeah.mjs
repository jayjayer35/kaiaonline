/* ============================================================
   netlify/functions/yeah.mjs — shared yeah! counts for kaia's diary
   ------------------------------------------------------------
   lives at /api/yeah on your own site (no outside services).

   storage: Netlify Blobs. every yeah is its own tiny entry:
       yeah/<post-id>/<visitor-id>
   a post's count = how many entries sit under yeah/<post-id>/.
   because nobody ever edits a shared number, two people yeahing
   at the same moment can't overwrite each other, and one visitor
   can only ever count once per post.

   GET  /api/yeah?visitor=<id>              -> { ok, counts, mine }
   POST /api/yeah  { id, visitor, yeah }    -> { ok, id, count, yeahed }
   ============================================================ */

import { getStore } from "@netlify/blobs";

const POST_ID = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]{1,60}$/; // matches data-yeah-id
const VISITOR = /^[a-z0-9-]{8,64}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const store = () => getStore({ name: "yeahs", consistency: "strong" });

async function allKeys(prefix = "yeah/") {
  const { blobs } = await store().list({ prefix });
  return blobs.map((b) => b.key);
}

export default async (req) => {
  try {
    if (req.method === "GET") {
      const visitor = new URL(req.url).searchParams.get("visitor") || "";
      const counts = {};
      const mine = [];
      for (const key of await allKeys()) {
        const [, id, who] = key.split("/");
        if (!id || !who) continue;
        counts[id] = (counts[id] || 0) + 1;
        if (who === visitor) mine.push(id);
      }
      return json({ ok: true, counts, mine });
    }

    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ ok: false, error: "bad json" }, 400); }
      const { id, visitor, yeah } = body || {};
      if (!POST_ID.test(String(id))) return json({ ok: false, error: "bad post id" }, 400);
      if (!VISITOR.test(String(visitor))) return json({ ok: false, error: "bad visitor id" }, 400);

      const key = `yeah/${id}/${visitor}`;
      if (yeah) {
        await store().set(key, String(Date.now()), { onlyIfNew: true });
      } else {
        await store().delete(key);
      }
      const count = (await allKeys(`yeah/${id}/`)).length;
      return json({ ok: true, id, count, yeahed: !!yeah });
    }

    return json({ ok: false, error: "method not allowed" }, 405);
  } catch (err) {
    console.error("[yeah]", err);
    return json({ ok: false, error: "server error" }, 500);
  }
};

export const config = { path: "/api/yeah" };
