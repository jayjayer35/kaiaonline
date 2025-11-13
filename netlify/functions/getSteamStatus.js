exports.handler = async function (event, context) {
  const STEAM_API_KEY = process.env.STEAM_API_KEY;
  const STEAM_ID = process.env.STEAM_ID;

  if (!STEAM_API_KEY || !STEAM_ID) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing STEAM_API_KEY or STEAM_ID in environment variables" }),
    };
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`;

  try {
    // Node 18+ has global fetch
    const response = await fetch(url);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Steam API responded with status ${response.status}` }),
      };
    }

    const json = await response.json();
    const player = json.response.players?.[0];

    if (!player) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Player not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game: player.gameextrainfo || "Nothing",
        status: player.personastate?.toString() || "unknown",
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch Steam data",
        detail: err.message,
      }),
    };
  }
};
