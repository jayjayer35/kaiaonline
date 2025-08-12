const BIN_URL = 'https://api.jsonbin.io/v3/b/689937f9ae596e708fc718f9'; // replace with your bin URL
const BIN_API_KEY = '$2a$10$UzWzekC9pYB.ho/FqEH7oOGidp3/9ZBv4JcsLsTFj00vfuAVbVfSy'; // replace with your JSON bin API key
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; // put in Netlify env vars
const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

// Example messages
function getRandomMessage() {
  const messages = [
    "A new traveler has arrived.",
    "Welcome! Someone new is here.",
    "THAT'S RIGHT!! NOW'S YOUR CHANCE TO BE A [[BIG SHOT]]!!",
    "New Website Visit lololololol",
    "New visitor detected!",
    "Someone just stopped by!",
    "Frequency spike! A new signal has been found.",
    "A new traveler has entered the solar system!",
    "The Fountain ripples... a visitor appears.",
    "A strange light fills the room...",
    "A mysterious figure is across the horizon",
    "Welcome home!",
    "gay person located",


  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Direct GIF URLs (so Discord shows them properly)
const gifs = [
  "https://kaia.starscene.com/assets/spamton.gif",
  "https://kaia.starscene.com/assets/outtahere.gif",
  "https://kaia.starscene.com/assets/mycar.gif",
  "https://kaia.starscene.com/assets/owspin.gif",
  "https://kaia.starscene.com/assets/owdance.gif",
  "https://kaia.starscene.com/assets/owgames.gif",
  "https://kaia.starscene.com/assets/owlk.gif",
  "https://kaia.starscene.com/assets/ratsss.gif",
];

async function getLocation(ip) {
  if (ip === 'Unknown') return null;
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.city || 'Unknown city',
      region: data.region || 'Unknown region',
      country: data.country || 'Unknown country'
    };
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  try {
    // Get visitor IP
    const visitorIP =
      event.headers['x-nf-client-connection-ip'] ||
      event.headers['x-forwarded-for'] ||
      'Unknown';

    // Get location
    const location = await getLocation(visitorIP);
    const locationText = location
      ? `${location.city}, ${location.region}, ${location.country}`
      : 'Unknown location';

    // Skip Ashburn VA bots
    if (
      location &&
      location.city.toLowerCase() === 'ashburn' &&
      location.region.toLowerCase() === 'virginia' &&
      location.country.toLowerCase() === 'us'
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({ skipped: true }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }

    // Get current count from JSONBin
    const getRes = await fetch(BIN_URL, {
      headers: { 'X-Master-Key': BIN_API_KEY }
    });
    const getData = await getRes.json();
    const count = getData.record.count || 0;

    // Increment
    const newCount = count + 1;

    // Save new count to JSONBin
    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': BIN_API_KEY
      },
      body: JSON.stringify({ count: newCount })
    });

    // Pick a random GIF
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    // Send to Discord
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: getRandomMessage(),
            description: `Visitor #**${newCount}** just visited.`,
            color: 0xffb6c1,
            fields: [
              { name: "Location", value: locationText, inline: true }
            ],
            image: { url: randomGif },
            timestamp: new Date().toISOString()
          }
        ]
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ count: newCount }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

