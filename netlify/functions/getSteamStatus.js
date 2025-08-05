const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const STEAM_API_KEY = process.env.STEAM_API_KEY;
  const STEAM_ID = process.env.STEAM_ID;

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const player = data.response.players[0];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game: player?.gameextrainfo || "Offline",
        status: player?.personastate || "unknown",
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch Steam data" })
    };
  }
};
