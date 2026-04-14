const BIN_URL = 'https://api.jsonbin.io/v3/b/689937f9ae596e708fc718f9'; //your bin URL you IDIOT
const BIN_API_KEY = '$2a$10$UzWzekC9pYB.ho/FqEH7oOGidp3/9ZBv4JcsLsTFj00vfuAVbVfSy'; //JSON bin API key
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; //Netlify env vars
const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

// Random messages
function getRandomMessage() {
  const messages = [
    "Look, someone stopped by",
    "How kind of this person to check out my site!",
    "Welcome :)",
    "Hi :3",
    "Grab a snack!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// GIFs
const gifs = [
  "https://kaia.starscene.com/assets/spamton.gif",
  "https://kaia.starscene.com/assets/outtahere.gif",
  "https://kaia.starscene.com/assets/mycar.gif",
  "https://kaia.starscene.com/assets/owspin.gif",
  "https://kaia.starscene.com/assets/owdance.gif",
  "https://kaia.starscene.com/assets/owgames.gif",
  "https://kaia.starscene.com/assets/owlk.gif",
  "https://kaia.starscene.com/assets/ratsss.gif",
  "https://kaia.starscene.com/assets/garn47.gif",
  "https://kaia.starscene.com/assets/skeleton.gif",
  "https://kaia.starscene.com/assets/snailien.gif",
  "https://kaia.starscene.com/assets/franz.gif",
  "https://kaia.starscene.com/assets/.gif",
];

// Get location from IP
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
    // Get visitorID from query
    const visitorID = event.queryStringParameters?.visitorID;
    if (!visitorID) return { statusCode: 400, body: "Missing visitorID" };

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

    if (
      location &&
      location.city.toLowerCase() === 'singapore' &&
      location.region.toLowerCase() === 'singapore' &&
      location.country.toLowerCase() === 'sg' 
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({ skipped: true }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }

    // Get current data from JSONBin
    const getRes = await fetch(BIN_URL, {
      headers: { 'X-Master-Key': BIN_API_KEY }
    });
    const getData = await getRes.json();
    const record = getData.record || {};

    // Initialize if empty
    if (!record.count) record.count = 0;
    if (!record.visitors) record.visitors = {};

    const now = Date.now();
    const lastVisit = record.visitors[visitorID] || 0;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    let incremented = false;

    // Increment only if first visit or last visit > 1 month
    if (now - lastVisit > oneMonth) {
      record.count += 1;
      record.visitors[visitorID] = now;
      incremented = true;

      // Save updated record
      await fetch(BIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': BIN_API_KEY
        },
        body: JSON.stringify(record)
      });
    }

    // Send Discord webhook only if incremented
    if (incremented) {
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: getRandomMessage(),
              description: `Visitor #**${record.count}**.`,
              color: 0xffb6c1,
              fields: [
                { name: "From:", value: locationText, inline: true },
                /* { name: "IP Address", value: visitorIP, inline: true } */
              ],
              image: { url: randomGif },
              timestamp: new Date().toISOString()
            }
          ]
        })
      });
    }

    // Return total count to frontend
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ totalCount: record.count })
    };

  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};