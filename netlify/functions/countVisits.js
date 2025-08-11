const BIN_URL = 'https://api.jsonbin.io/v3/b/689937f9ae596e708fc718f9'; // replace with your bin URL
const BIN_API_KEY = '$2a$10$UzWzekC9pYB.ho/FqEH7oOGidp3/9ZBv4JcsLsTFj00vfuAVbVfSy'; // replace with your JSON bin API key
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; // put in Netlify env vars

const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

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
    // Get visitor IP from headers
    const visitorIP = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'Unknown';

    // Get location info from IP
    const location = await getLocation(visitorIP);

    // Get current count
    const getRes = await fetch(BIN_URL, {
      headers: { 'X-Master-Key': BIN_API_KEY }
    });
    const getData = await getRes.json();
    const count = getData.record.count || 0;

    // Increment count
    const newCount = count + 1;

    // Update count in JSON bin
    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': BIN_API_KEY
      },
      body: JSON.stringify({ count: newCount })
    });

    // Prepare location text
    const locationText = location
      ? `${location.city}, ${location.region}, ${location.country}`
      : 'Unknown location';

    // Send embed to Discord webhook
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: "New Website Visit lololololol",
            description: `Visitor number **${newCount}** just visited.`,
            color: 0x00ff00,
            fields: [
              {
                name: "Location",
                value: locationText,
                inline: true
              },
              {
                name: "IP Address",
                value: visitorIP,
                inline: true
              }
            ],
            image: {
              url: "https://cdn.discordapp.com/attachments/1183670150252208208/1404282802178101329/image0.gif?ex=689a9fc6&is=68994e46&hm=ce86c6319b2d4df4b06353311d05cc83eae6560dc8344d8fff8b9f25cf4718a3&"
            },
            timestamp: new Date().toISOString()
          }
        ]
      })
    });

    // Respond to client
    return {
      statusCode: 200,
      body: JSON.stringify({ count: newCount }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
