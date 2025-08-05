exports.handler = async function (event, context) {
  const STEAM_API_KEY = process.env.STEAM_API_KEY;
  const STEAM_ID = process.env.STEAM_ID;

  const corsHeaders = {
  "Access-Control-Allow-Origin": "https://kaia.starscene.com",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json"
};

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`);
    const data = await response.json();
    const player = data.response.players?.[0];

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        game: player?.gameextrainfo || "None",
        status: player?.personastate?.toString() || "unknown"
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
};
