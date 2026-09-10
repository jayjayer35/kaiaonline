import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// ===== EDIT ME =====
const MAX_DRAWINGS = 200;        // oldest drawings get dropped past this count
const MAX_IMAGE_LENGTH = 200_000; // rough safety cap on the base64 image string
const MAX_NAME_LENGTH = 40;

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

  let body: { image?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { image, name } = body;

  if (!image || typeof image !== "string" || !image.startsWith("data:image/png;base64,")) {
    return new Response("Missing or invalid image", { status: 400 });
  }
  if (image.length > MAX_IMAGE_LENGTH) {
    return new Response("Image too large", { status: 400 });
  }

  const store = getStore({ name: "drawings", consistency: "strong" });
  const index = ((await store.get("index", { type: "json" })) as DrawingEntry[]) || [];

  const entry: DrawingEntry = {
    id: crypto.randomUUID(),
    name: typeof name === "string" ? name.slice(0, MAX_NAME_LENGTH) : "",
    image,
    timestamp: Date.now(),
  };

  index.push(entry);
  while (index.length > MAX_DRAWINGS) {
    index.shift();
  }

  await store.setJSON("index", index);

  return Response.json({ ok: true, id: entry.id });
};

export const config: Config = {
  path: "/.netlify/functions/save-drawing",
};
