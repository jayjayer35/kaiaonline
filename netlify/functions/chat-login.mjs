// Owner login for the homepage chat. Checks ADMIN_PASSWORD (the same one the
// drawing guestbook uses) and returns a token that post-chat.mjs accepts.
// The token is derived from the password, so changing the password logs
// every device out.

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

  let password = "";
  try {
    ({ password = "" } = await req.json());
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || typeof password !== "string" || password !== secret) {
    await new Promise((r) => setTimeout(r, 1000)); // slows down guessing
    return json({ error: "wrong password" }, 401);
  }

  return json({ ok: true, token: await ownerToken(secret) }, 200);
};
