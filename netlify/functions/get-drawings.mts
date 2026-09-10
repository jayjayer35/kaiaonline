import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

interface DrawingEntry {
  id: string;
  name: string;
  image: string;
  timestamp: number;
}

export default async (req: Request, context: Context) => {
  const store = getStore({ name: "drawings", consistency: "strong" });
  const index = ((await store.get("index", { type: "json" })) as DrawingEntry[]) || [];

  // Newest first
  const drawings = [...index].reverse();

  return Response.json({ drawings });
};

export const config: Config = {
  path: "/.netlify/functions/get-drawings",
};
