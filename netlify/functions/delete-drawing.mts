import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

interface DrawingEntry {
  id: string;
  name: string;
  image: string;
  timestamp: number;
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { id?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { id, password } = body;

  // ===== EDIT ME: set ADMIN_PASSWORD in Netlify site settings → Environment variables =====
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const store = getStore({ name: "drawings", consistency: "strong" });
  const index = ((await store.get("index", { type: "json" })) as DrawingEntry[]) || [];
  const filtered = index.filter((entry) => entry.id !== id);

  await store.setJSON("index", filtered);

  return Response.json({ ok: true, removed: index.length !== filtered.length });
};

export const config: Config = {
  path: "/.netlify/functions/delete-drawing",
};
